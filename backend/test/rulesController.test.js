
import rulesController from '../controllers/rulesController.js';
import { getRules, setRules } from '../utils/rulesEngine.js';
function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.body = data;
    return this;
  };
  return res;
}

describe('rulesController validation', () => {
  let baseRules;

  beforeAll(() => {
    baseRules = getRules().map(({ triggered, ...rest }) => ({ ...rest }));
  });

  beforeEach(() => {
    setRules(baseRules.map(r => ({ ...r })));
  });

  afterAll(() => {
    setRules(baseRules);
  });

  test('addRule rejects non-numeric deductibleGreaterThan', () => {
    const initialCount = getRules().length;
    const req = { body: { vendor: 'A', flagReason: 'x', deductibleGreaterThan: 'abc' } };
    const res = mockRes();
    rulesController.addRule(req, res);
    expect(res.statusCode).toBe(400);
    expect(getRules().length).toBe(initialCount);
  });

  test('updateRule rejects non-numeric benefitMax', () => {
    const idx = 0;
    const before = getRules()[idx];
    const req = { params: { idx: String(idx) }, body: { vendor: 'B', benefitMax: 'oops' } };
    const res = mockRes();
    rulesController.updateRule(req, res);
    expect(res.statusCode).toBe(400);
    expect(getRules()[idx]).toEqual(before);
  });
});

