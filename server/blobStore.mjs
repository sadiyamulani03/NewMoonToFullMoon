// server/blobStore.mjs — Vercel Blob persistence for MidnightTrace cases
// Used only when BLOB_READ_WRITE_TOKEN is present (Vercel Blob store linked).
// Falls back gracefully to local file storage if Blob is unavailable.

const BLOB_KEY = process.env.MIDNIGHTTRACE_BLOB_KEY ?? 'midnighttrace/cases.json';

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobEnabled() {
  return hasBlobToken();
}

export function getBlobKey() {
  return BLOB_KEY;
}

// Try to load cases from Blob. Returns array | null if not available.
export async function loadFromBlob() {
  if (!hasBlobToken()) return null;
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (!blobs || blobs.length === 0) return null;
    // Exact match first, otherwise first prefix match
    const match = blobs.find((b) => b.pathname === BLOB_KEY) ?? blobs[0];
    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// Persist cases array to Blob. Returns true on success.
export async function saveToBlob(cases) {
  if (!hasBlobToken()) return false;
  try {
    const { put } = await import('@vercel/blob');
    await put(BLOB_KEY, JSON.stringify(cases, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return true;
  } catch {
    return false;
  }
}
