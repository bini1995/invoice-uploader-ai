import logger from '../../../../utils/logger.js';

const SUPPORTED_INTERVALS = new Set(['1d', '1h']);

const toStooqSymbol = (symbol) => {
  const normalized = symbol.trim().toLowerCase();
  if (normalized.includes('.')) {
    return normalized;
  }
  return `${normalized}.us`;
};

const toStooqInterval = (interval) => {
  if (interval === '1d') {
    return 'd';
  }
  if (interval === '1h') {
    return '60';
  }
  return null;
};

const parseCsv = (csvText, limit) => {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(','));

  const candles = rows.map((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index]]));
    const date = record.date?.trim();
    const time = record.time?.trim();

    if (!date) {
      return null;
    }

    const timeValue = time ? `${date}T${time}Z` : `${date}T00:00:00Z`;
    const timestamp = new Date(timeValue);

    const open = Number(record.open);
    const high = Number(record.high);
    const low = Number(record.low);
    const close = Number(record.close);
    const volume = Number(record.volume);

    if (Number.isNaN(open) || Number.isNaN(high) || Number.isNaN(low) || Number.isNaN(close)) {
      return null;
    }

    return {
      time: timestamp.toISOString(),
      open,
      high,
      low,
      close,
      volume: Number.isNaN(volume) ? 0 : volume,
    };
  }).filter(Boolean);

  if (limit && candles.length > limit) {
    return candles.slice(-limit);
  }

  return candles;
};

const fetchCandles = async ({ symbol, interval, limit }) => {
  if (!SUPPORTED_INTERVALS.has(interval)) {
    throw new Error('Unsupported interval for Stooq');
  }

  const stooqInterval = toStooqInterval(interval);
  const stooqSymbol = toStooqSymbol(symbol);
  const url = `https://stooq.com/q/d/l/?s=${stooqSymbol}&i=${stooqInterval}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Stooq request failed with status ${response.status}`);
    }
    const csvText = await response.text();
    const candles = parseCsv(csvText, limit);
    if (!candles.length) {
      logger.warn('Stooq returned no candles', { symbol, interval, url });
    }
    return candles;
  } finally {
    clearTimeout(timeout);
  }
};

export { fetchCandles, SUPPORTED_INTERVALS };
