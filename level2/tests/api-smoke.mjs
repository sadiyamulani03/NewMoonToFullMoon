// Post-release API smoke test: boots the Express server on an ephemeral port
// with an isolated temp data file and exercises the REST surface the React dApp depends on.
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { createApp } from '../server/index.mjs';

async function main() {
  const tmpDir = mkdtempSync(join(tmpdir(), 'midnighttrace-api-smoke-'));
  const dataFile = join(tmpDir, 'cases.json');
  const app = createApp({ dataFile, distDir: join(tmpDir, 'no-dist') });
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const base = `http://127.0.0.1:${addr.port}`;

  let failures = 0;
  async function check(label, fn) {
    try {
      await fn();
      console.log(`✓ ${label}`);
    } catch (e) {
      console.error(`✗ ${label}: ${e.message}`);
      failures++;
    }
  }

  await check('GET /api/health', async () => {
    const res = await fetch(`${base}/api/health`);
    if (res.status !== 200) throw new Error(`status ${res.status}`);
  });

  await check('GET /api/cases (seeded)', async () => {
    const res = await fetch(`${base}/api/cases`);
    const body = await res.json();
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    if (!Array.isArray(body)) throw new Error('not an array');
    if (body.length === 0) throw new Error('no seeded cases');
  });

  await check('POST /api/cases', async () => {
    const res = await fetch(`${base}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'CI test case', description: 'created by api-smoke', owner: 'ci' }),
    });
    const body = await res.json();
    if (res.status !== 201) throw new Error(`status ${res.status}`);
    if (!body.id) throw new Error('no id returned');
    globalThis.__ciCaseId = body.id;
  });

  await check('GET /api/cases/:id (created case)', async () => {
    const id = globalThis.__ciCaseId;
    const res = await fetch(`${base}/api/cases/${id}`);
    const body = await res.json();
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    if (body.title !== 'CI test case') throw new Error('title mismatch');
  });

  await check('POST /api/cases/:id/receipts', async () => {
    const id = globalThis.__ciCaseId;
    const res = await fetch(`${base}/api/cases/${id}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId: 'tx-sim-123', blockHeight: 42, total: '7', network: 'preprod' }),
    });
    const body = await res.json();
    if (res.status !== 201) throw new Error(`status ${res.status}`);
    if (body.txId !== 'tx-sim-123') throw new Error('txId mismatch');
  });

  await check('GET /api/stats reflects new proof', async () => {
    const res = await fetch(`${base}/api/stats`);
    const body = await res.json();
    if (body.totalProofs < 1) throw new Error('totalProofs not incremented');
  });

  await check('GET /api/cases/:id 404', async () => {
    const res = await fetch(`${base}/api/cases/does-not-exist`);
    if (res.status !== 404) throw new Error(`status ${res.status}`);
  });

  server.close();
  rmSync(tmpDir, { recursive: true, force: true });

  if (failures > 0) {
    console.error(`\n${failures} API failure(s).`);
    process.exit(1);
  }
  console.log('\nOK — API healthy.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});