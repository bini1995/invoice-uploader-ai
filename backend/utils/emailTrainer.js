
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTrainingSamples() {
  try {
    const file = path.join(__dirname, '..', 'data', 'email_samples.txt');
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
  } catch (err) {
    console.error('Email training load error:', err);
  }
  return '';
}

export { getTrainingSamples };
