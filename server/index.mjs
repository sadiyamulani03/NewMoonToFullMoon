import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const DATA_FILE = process.env.MIDNIGHTTRACE_DATA_FILE ?? join(__dirname, 'data', 'cases.json');
const DIST_DIR = join(__dirname, '..', 'dist');
const API_PORT = Number(process.env.PORT ?? 4000);
// Persistence: local file by default. On Vercel, /tmp is ephemeral —
// if BLOB_READ_WRITE_TOKEN is set (Vercel Blob store linked), Blob is used
// as the durable primary store with file as fallback. See server/blobStore.mjs
// and api/index.mjs. On-chain proofs remain permanent either way (/audit).

function seedCases() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'case-alpine-root',
      title: 'Alpine Root Investigation',
      description:
        'Cross-border fund-tracing drill. Each hidden organisation transfer is one counter step; proof only shows the running total.',
      owner: 'acc-labs',
      status: 'open',
      createdAt: new Date(now - 2 * day).toISOString(),
      receipts: [],
    },
    {
      id: 'case-nebula-batch',
      title: 'Nebula Batch Verification',
      description:
        'Prove a fixed-size evidence batch was processed without disclosing the batch contents.',
      owner: 'acc-labs',
      status: 'open',
      createdAt: new Date(now - 1 * day).toISOString(),
      receipts: [],
    },
  ];
}

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
}

export function createApp(options = {}) {
  const dataFile = options.dataFile ?? DATA_FILE;
  const distDir = options.distDir ?? DIST_DIR;

  // --- file helpers (sync) ---
  const loadFromFile = () => {
    if (!existsSync(dataFile)) {
      const seeded = seedCases();
      writeJson(dataFile, seeded);
      return seeded;
    }
    try {
      const parsed = JSON.parse(readFileSync(dataFile, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const saveToFile = (cases) => writeJson(dataFile, cases);

  // --- unified async storage: Blob primary if enabled, else file ---
  const loadCases = async () => {
    // Try Blob first (Vercel production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { loadFromBlob } = await import('./blobStore.mjs');
        const blobCases = await loadFromBlob();
        if (blobCases !== null) {
          // Keep file cache in sync for fast fallback reads
          try { saveToFile(blobCases); } catch { /* ignore */ }
          return blobCases;
        }
        // Blob empty — seed and persist to Blob for next invocation
        const seeded = seedCases();
        try {
          const { saveToBlob } = await import('./blobStore.mjs');
          await saveToBlob(seeded);
        } catch { /* ignore */ }
        try { saveToFile(seeded); } catch { /* ignore */ }
        return seeded;
      } catch {
        // fall through to file
      }
    }
    return loadFromFile();
  };

  const persist = async (cases) => {
    // Save to Blob if available (fire-and-forget resilience: also save to file)
    let blobOk = false;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { saveToBlob } = await import('./blobStore.mjs');
        blobOk = await saveToBlob(cases);
      } catch { blobOk = false; }
    }
    try { saveToFile(cases); } catch { /* ignore */ }
    return blobOk;
  };

  const app = express();
  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    let storage = 'file';
    if (process.env.BLOB_READ_WRITE_TOKEN) storage = 'vercel-blob';
    else if (process.env.MIDNIGHTTRACE_DATA_FILE) storage = 'file:custom';
    res.json({ ok: true, service: 'midnighttrace-api', storage, blobKey: process.env.MIDNIGHTTRACE_BLOB_KEY ?? 'midnighttrace/cases.json' });
  });

  app.get('/api/cases', async (_req, res) => {
    const cases = await loadCases();
    res.json(cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.get('/api/cases/:id', async (req, res) => {
    const cases = await loadCases();
    const found = cases.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'case not found' });
      return;
    }
    res.json(found);
  });

  app.post('/api/cases', async (req, res) => {
    const { title, description, owner } = req.body ?? {};
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const cases = await loadCases();
    const created = {
      id: randomUUID(),
      title,
      description: typeof description === 'string' ? description : '',
      owner: typeof owner === 'string' ? owner : 'anonymous',
      status: 'open',
      createdAt: new Date().toISOString(),
      receipts: [],
    };
    cases.push(created);
    await persist(cases);
    res.status(201).json(created);
  });

  app.post('/api/cases/:id/receipts', async (req, res) => {
    const cases = await loadCases();
    const found = cases.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'case not found' });
      return;
    }
    const { txId, blockHeight, total, network, stepType, caseIndex } = req.body ?? {};
    if (!txId || !total) {
      res.status(400).json({ error: 'txId and total are required' });
      return;
    }
    const receipt = {
      txId,
      blockHeight: Number(blockHeight ?? 0),
      total: String(total),
      network: network ?? 'preprod',
      stepType: stepType ?? 'logStep',
      caseIndex: Number(caseIndex ?? 0),
      createdAt: new Date().toISOString(),
    };
    found.receipts.push(receipt);
    await persist(cases);
    res.status(201).json(receipt);
  });

  app.patch('/api/cases/:id/status', async (req, res) => {
    const cases = await loadCases();
    const found = cases.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'case not found' });
      return;
    }
    const { status } = req.body ?? {};
    if (status !== 'open' && status !== 'closed') {
      res.status(400).json({ error: 'status must be "open" or "closed"' });
      return;
    }
    found.status = status;
    await persist(cases);
    res.json(found);
  });

  app.get('/api/stats', async (_req, res) => {
    const cases = await loadCases();
    const receipts = cases.flatMap((c) => c.receipts);
    const last = receipts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
    res.json({
      totalCases: cases.length,
      openCases: cases.filter((c) => c.status === 'open').length,
      totalProofs: receipts.length,
      lastReceipt: last,
    });
  });

  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(join(distDir, 'index.html'));
    });
  }

  return app;
}

export function startServer() {
  const app = createApp();
  app.listen(API_PORT, () => {
    console.log(`MidnightTrace API listening on http://localhost:${API_PORT}`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}