const toMonthKey = (date) => {
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 7);
};

const buildSeasonalityMap = (series) => {
  const seasonBuckets = new Map();
  series.forEach((point, index) => {
    const monthIndex = index % 12;
    if (!seasonBuckets.has(monthIndex)) seasonBuckets.set(monthIndex, []);
    seasonBuckets.get(monthIndex).push(point.total);
  });
  const seasonalAverages = new Map();
  seasonBuckets.forEach((values, key) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    seasonalAverages.set(key, avg);
  });
  return seasonalAverages;
};

const linearRegression = (values) => {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };
  const xs = values.map((_, i) => i + 1);
  const sumX = xs.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = values.reduce((sum, y, i) => sum + y * xs[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const buildProphetForecast = (series, periods = 3) => {
  if (!Array.isArray(series) || series.length === 0) return [];
  const totals = series.map((point) => point.total);
  const { slope, intercept } = linearRegression(totals);
  const seasonality = buildSeasonalityMap(series);
  const lastMonth = new Date(`${series[series.length - 1].month}-01T00:00:00Z`);
  const forecast = [];
  for (let i = 1; i <= periods; i += 1) {
    const idx = totals.length + i;
    const trend = slope * idx + intercept;
    const monthIdx = (idx - 1) % 12;
    const seasonal = seasonality.get(monthIdx) ?? 0;
    const total = Math.max(0, trend + seasonal * 0.15);
    forecast.push({
      month: toMonthKey(addMonths(lastMonth, i)),
      total: Number(total.toFixed(2)),
    });
  }
  return forecast;
};
