// Post-build smoke test: verifies the production bundle contains the ZK
// contract assets required for in-browser proof generation, plus the app
// entry HTML. Run:  node tests/smoke.mjs  (after `npm run build`)
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const requiredFiles = [
  'index.html',
  'contract/compiled/counter/keys/increment.prover',
  'contract/compiled/counter/keys/increment.verifier',
  'contract/compiled/counter/zkir/increment.bzkir',
  'contract/compiled/counter/keys/incrementAndReveal.prover',
  'contract/compiled/counter/keys/incrementAndReveal.verifier',
  'contract/compiled/counter/zkir/incrementAndReveal.bzkir',
  // Level 4 — midnighttrace contract assets (shipped for in-browser proving)
  'contract/compiled/midnighttrace/keys/openCase.prover',
  'contract/compiled/midnighttrace/keys/openCase.verifier',
  'contract/compiled/midnighttrace/keys/grantAccess.prover',
  'contract/compiled/midnighttrace/keys/grantAccess.verifier',
  'contract/compiled/midnighttrace/keys/logStep.prover',
  'contract/compiled/midnighttrace/keys/logStep.verifier',
  'contract/compiled/midnighttrace/keys/discloseFinding.prover',
  'contract/compiled/midnighttrace/keys/discloseFinding.verifier',
  'contract/compiled/midnighttrace/keys/closeCase.prover',
  'contract/compiled/midnighttrace/keys/closeCase.verifier',
  'contract/compiled/midnighttrace/zkir/logStep.bzkir',
  'contract/compiled/midnighttrace/zkir/discloseFinding.bzkir',
];

let failures = 0;
for (const rel of requiredFiles) {
  const abs = join(dist, rel);
  if (!existsSync(abs)) {
    console.error(`✗ missing: ${rel}`);
    failures++;
  } else {
    console.log(`✓ ${rel} (${readFileSync(abs).length} bytes)`);
  }
}

const indexHtml = join(dist, 'index.html');
if (existsSync(indexHtml) && !readFileSync(indexHtml, 'utf-8').includes('<div id="root"></div>')) {
  console.error('✗ index.html does not mount #root');
  failures++;
}

if (failures > 0) {
  console.error(`\n${failures} failure(s) — build output is incomplete.`);
  process.exit(1);
}
console.log('\nOK — build output complete.');