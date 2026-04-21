import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../data/db.json');

export async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(item => Number(item.id) || 0)) + 1;
}