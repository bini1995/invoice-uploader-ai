import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import hl7 from 'hl7-standard';
import { X12Parser } from 'node-x12';
import logger from './logger.js';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hl7apyScriptPath = path.join(__dirname, 'hl7apy_parser.py');

const formatMap = new Map([
  ['hl7', 'hl7'],
  ['hl7v2', 'hl7'],
  ['edi', 'edi'],
  ['x12', 'edi'],
  ['837', 'edi'],
]);

function normalizeFormat(format) {
  if (!format) return null;
  const normalized = format.toString().trim().toLowerCase();
  return formatMap.get(normalized) || null;
}

function detectFormat(payload) {
  if (!payload) return null;
  const trimmed = payload.trim();
  if (trimmed.startsWith('MSH|')) return 'hl7';
  if (trimmed.startsWith('ISA')) return 'edi';
  if (trimmed.includes('\nMSH|')) return 'hl7';
  if (trimmed.includes('ISA*')) return 'edi';
  return null;
}

async function parseHl7WithHl7apy(payload) {
  const { stdout } = await execFileAsync('python3', [hl7apyScriptPath], {
    input: payload,
    maxBuffer: 5 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

async function parseHl7(payload) {
  try {
    return await parseHl7WithHl7apy(payload);
  } catch (error) {
    logger.warn('hl7apy parse failed, falling back to node parser', { error: error.message });
    return hl7.parseString(payload);
  }
}

function parseEdi(payload) {
  const parser = new X12Parser(true);
  const interchange = parser.parse(payload);
  return typeof interchange?.toJSON === 'function' ? interchange.toJSON() : interchange;
}

export function detectEdiTransaction(payload) {
  if (!payload) return null;
  const match = payload.match(/ST[*~]?(837|835|276|277|999)/);
  return match ? match[1] : null;
}

export async function parseIntegrationPayload({ payload, format }) {
  const normalizedFormat = normalizeFormat(format) || detectFormat(payload);
  if (!normalizedFormat) {
    throw new Error('Unable to detect payload format. Provide format=hl7 or format=edi.');
  }

  if (normalizedFormat === 'hl7') {
    return {
      format: 'hl7',
      parsed: await parseHl7(payload),
    };
  }

  try {
    return {
      format: 'edi',
      parsed: parseEdi(payload),
    };
  } catch (error) {
    logger.warn('EDI parse error', { error: error.message });
    throw error;
  }
}
