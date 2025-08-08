const { getClaimMetrics } = require('../controllers/claimController');
const pool = require('../config/db');

jest.mock('../config/db', () => ({ query: jest.fn() }));

describe('getClaimMetrics', () => {
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    set: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('aggregates metrics and echoes window', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: '2', flagged: '1' }] })
      .mockResolvedValueOnce({ rows: [{ status: 'Pending', count: 5 }] })
      .mockResolvedValueOnce({
        rows: [{ avg: 1, p50: 0.5, p90: 2, p99: 3 }],
      });
    await getClaimMetrics({ query: { from: '2024-01-01', to: '2024-01-02' }, headers: {} }, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        window: { from: '2024-01-01', to: '2024-01-02', timezone: 'UTC' },
        total: 2,
        flagged_rate: 0.5,
        p99_processing_hours: 3,
      })
    );
  });

  test('handles empty window', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: '0', flagged: '0' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ avg: null, p50: null, p90: null, p99: null }] });
    await getClaimMetrics({ query: {}, headers: {} }, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 0, flagged_rate: 0 })
    );
  });

  test('queries only closed statuses for duration', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: '1', flagged: '0' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ avg: 0, p50: 0, p90: 0, p99: 0 }] });
    await getClaimMetrics({ query: {}, headers: {} }, res);
    const sql = pool.query.mock.calls[2][0];
    expect(sql).toMatch(/status IN \('Approved','Rejected','Closed'\)/);
  });
});
