jest.mock('../config/db', () => ({ query: jest.fn() }));

const { applyRules, setRules } = require('../utils/rulesEngine');

describe('applyRules claim field handling', () => {
  beforeEach(() => {
    setRules([
      { deductibleGreaterThan: 1000, flagReason: 'Deductible over $1000' },
      { benefitMax: 10000, flagReason: 'Benefit exceeds $10000' },
      { vendor: 'Google', category: 'Marketing' },
    ]);
  });

  test('uses invoice-level deductible/benefit fields', async () => {
    const invoice = {
      vendor: 'Google',
      amount: 100,
      deductible: 1500,
      benefit_amount: 5000,
    };

    const result = await applyRules(invoice);
    expect(result.flagged).toBe(true);
    expect(result.flag_reason).toBe('Deductible over $1000');
    expect(result.tags).toContain('Marketing');
  });

  test('uses claim-level deductible/benefit fields', async () => {
    const invoice = {
      vendor: 'Google',
      amount: 100,
      claim: {
        deductible: 500,
        benefit_amount: 15000,
      },
    };

    const result = await applyRules(invoice);
    expect(result.flagged).toBe(true);
    expect(result.flag_reason).toBe('Benefit exceeds $10000');
    expect(result.tags).toContain('Marketing');
  });

  test('invoice-level values take precedence over claim-level', async () => {
    const invoice = {
      vendor: 'Google',
      amount: 100,
      deductible: 500,
      benefit_amount: 9000,
      claim: {
        deductible: 1500,
        benefit_amount: 15000,
      },
    };

    const result = await applyRules(invoice);
    expect(result.flagged).toBe(false);
    expect(result.flag_reason).toBeNull();
    expect(result.tags).toContain('Marketing');
  });

  test('defaults to zero when deductible and benefit missing in both invoice and claim', async () => {
    const invoice = {
      vendor: 'Google',
      amount: 100,
      claim: {},
    };

    const result = await applyRules(invoice);
    expect(result.flagged).toBe(false);
    expect(result.flag_reason).toBeNull();
    expect(result.tags).toContain('Marketing');
  });

  test('no deductible or benefit fields present', async () => {
    const invoice = {
      vendor: 'Google',
      amount: 100,
    };

    const result = await applyRules(invoice);
    expect(result.flagged).toBe(false);
    expect(result.flag_reason).toBeNull();
    expect(result.tags).toContain('Marketing');
  });
});

