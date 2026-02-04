import logger from '../../../utils/logger.js';
import { getCached, setCached } from './cache.js';
import { fetchCandles as fetchStooqCandles, SUPPORTED_INTERVALS } from './providers/stooqProvider.js';
import { fetchCandles as fetchStubCandles } from './providers/stubProvider.js';

const PROVIDERS = [
  { name: 'stooq', fetch: fetchStooqCandles },
  { name: 'stub', fetch: fetchStubCandles },
];

const getMarketCandles = async ({ symbol, interval, limit }) => {
  const cached = getCached(symbol, interval, limit);
  if (cached) {
    return cached;
  }

  let candles = [];
  for (const provider of PROVIDERS) {
    try {
      candles = await provider.fetch({ symbol, interval, limit });
      logger.info('Market data provider used', { provider: provider.name, symbol, interval, limit });
      break;
    } catch (error) {
      logger.warn('Market data provider failed', {
        provider: provider.name,
        symbol,
        interval,
        limit,
        error: error.message,
      });
    }
  }

  const payload = {
    symbol,
    interval,
    candles,
  };

  setCached(symbol, interval, limit, payload);
  return payload;
};

const isSupportedInterval = (interval) => SUPPORTED_INTERVALS.has(interval);

export { getMarketCandles, isSupportedInterval };
