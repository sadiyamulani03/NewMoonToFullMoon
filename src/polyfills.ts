import { Buffer } from 'buffer';
import process from 'process';

// Setup global polyfills for the Midnight.js SDK in the browser
globalThis.Buffer = Buffer;
globalThis.process = process;
globalThis.global = globalThis;

// Initialize process.env if it doesn't exist
// Assign a fresh object rather than relying on the process shim default.
process.env = process.env ?? {}