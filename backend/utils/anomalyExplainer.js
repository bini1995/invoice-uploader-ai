import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, 'pythonAnomalyExplain.py');

function runPythonExplain({ points, contamination = 0.12 }) {
  return new Promise((resolve, reject) => {
    const process = spawn('python3', [SCRIPT_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python exited with ${code}`));
      }
      try {
        const parsed = JSON.parse(stdout || '{}');
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });

    process.stdin.write(JSON.stringify({ points, contamination }));
    process.stdin.end();
  });
}

export { runPythonExplain };
