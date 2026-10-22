import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPreload = path.join(__dirname, '../src/preload/preload.cjs');
const distDir = path.join(__dirname, '../dist/preload');
const distPreload = path.join(distDir, 'preload.cjs');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(srcPreload, distPreload);
console.log('✓ Successfully copied preload.cjs to dist/preload/preload.cjs');
