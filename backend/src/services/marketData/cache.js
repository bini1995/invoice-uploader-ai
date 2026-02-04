const cache = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

const buildCacheKey = (symbol, interval, limit) => `${symbol}|${interval}|${limit}`;

const getCached = (symbol, interval, limit) => {
  const key = buildCacheKey(symbol, interval, limit);
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = (symbol, interval, limit, value, ttlMs = DEFAULT_TTL_MS) => {
  const key = buildCacheKey(symbol, interval, limit);
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export { getCached, setCached, DEFAULT_TTL_MS };
