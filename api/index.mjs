// Vercel serverless entry — exposes the MidnightTrace Express API.
// Vercel serves the built frontend from dist/ and routes /api/* here.
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../server/index.mjs';

// Vercel function filesystems are read-only except /tmp.
const dataFile =
  process.env.MIDNIGHTTRACE_DATA_FILE ?? join(tmpdir(), 'midnighttrace-cases.json');

export default createApp({ dataFile, distDir: 'no-dist' });