
import fs from 'fs';
import { extractEntities } from '../ai/entityExtractor.js';
export default async function processInvoice(path) {
  const text = fs.readFileSync(path, 'utf8').slice(0, 4000);
  const fields = await extractEntities(text);
  return { fields };
}
