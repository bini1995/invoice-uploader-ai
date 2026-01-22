import hl7 from 'hl7';
import { X12Parser } from 'node-x12';
import logger from './logger.js';

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

function parseHl7(payload) {
  return hl7.parseString(payload);
}

function parseEdi(payload) {
  const parser = new X12Parser(true);
  const interchange = parser.parse(payload);
  return typeof interchange?.toJSON === 'function' ? interchange.toJSON() : interchange;
}

export function parseIntegrationPayload({ payload, format }) {
  const normalizedFormat = normalizeFormat(format) || detectFormat(payload);
  if (!normalizedFormat) {
    throw new Error('Unable to detect payload format. Provide format=hl7 or format=edi.');
  }

  if (normalizedFormat === 'hl7') {
    return {
      format: 'hl7',
      parsed: parseHl7(payload),
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
