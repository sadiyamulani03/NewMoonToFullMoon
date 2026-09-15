// Vercel serverless entry — exposes the MidnightTrace Express API.
// Vercel serves the built frontend from dist/ and routes /api/* here.
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../server/index.mjs';

// Vercel function filesystems are read-only except /tmp.
// If BLOB_READ_WRITE_TOKEN is set (Vercel Blob store linked), cases are
// persisted durably in Blob at MIDNIGHTTRACE_BLOB_KEY (default: midnighttrace/cases.json).
// Otherwise we fall back to /tmp (ephemeral, reseeds on cold start) and
// on-chain proofs remain verifiable via /audit.
// Setup: Vercel Dashboard → Storage → Create Blob Store → Connect to project
// → redeploy. No code change needed beyond env var.
//
// Optional overrides:
//   BLOB_READ_WRITE_TOKEN — auto-injected by Vercel when store is linked
//   MIDNIGHTTRACE_BLOB_KEY — custom blob pathname (default: midnighttrace/cases.json)
//   MIDNIGHTTRACE_DATA_FILE — custom file path (default: /tmp/midnighttrace-cases.json)
const dataFile =
  process.env.MIDNIGHTTRACE_DATA_FILE ?? join(tmpdir(), 'midnighttrace-cases.json');

// createApp() is Blob-aware: when BLOB_READ_WRITE_TOKEN exists it uses
// server/blobStore.mjs as primary storage (loadFromBlob/saveToBlob) with
// file as secondary cache. No extra wiring needed here beyond the env.
export default createApp({ dataFile, distDir: 'no-dist' });