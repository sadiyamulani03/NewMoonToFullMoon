import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const DATA_FILE = join(__dirname, 'data', 'cases.json');
const DIST_DIR = join(__dirname, '..', 'dist');
const API_PORT = Number(process.env.PORT ?? 4000);

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
  if (!existsSync(join(__dirname, 'data'))) {
    mkdirSync(join(__dirname, 'data'), { recursive: true });
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
}

export function createApp(options = {}) {
  const dataFile = options.dataFile ?? DATA_FILE;
  const distDir = options.distDir ?? DIST_DIR;

  const loadCases = () => {
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

  const persist = (cases) => writeJson(dataFile, cases);

  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'midnighttrace-api' });
  });

  app.get('/api/cases', (_req, res) => {
    const cases = loadCases();
    res.json(cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.get('/api/cases/:id', (req, res) => {
    const cases = loadCases();
    const found = cases.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'case not found' });
      return;
    }
    res.json(found);
  });

  app.post('/api/cases', (req, res) => {
    const { title, description, owner } = req.body ?? {};
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const cases = loadCases();
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
    persist(cases);
    res.status(201).json(created);
  });

  app.post('/api/cases/:id/receipts', (req, res) => {
    const cases = loadCases();
    const found = cases.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'case not found' });
      return;
    }
    const { txId, blockHeight, total, network } = req.body ?? {};
    if (!txId || !total) {
      res.status(400).json({ error: 'txId and total are required' });
      return;
    }
    const receipt = {
      txId,
      blockHeight: Number(blockHeight ?? 0),
      total: String(total),
      network: network ?? 'preprod',
      createdAt: new Date().toISOString(),
    };
    found.receipts.push(receipt);
    persist(cases);
    res.status(201).json(receipt);
  });

  app.get('/api/stats', (_req, res) => {
    const cases = loadCases();
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