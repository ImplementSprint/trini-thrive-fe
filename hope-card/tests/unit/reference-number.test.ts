import { generateTxnRef, generateWdRef } from '../../src/beneficiary-lib/reference-number';

describe('generateTxnRef', () => {
  it('matches TXN-YYYYMMDD-XXXXX format', () => {
    expect(generateTxnRef()).toMatch(/^TXN-\d{8}-[A-Z0-9]{5}$/);
  });

  it('includes today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(generateTxnRef()).toContain(`TXN-${today}-`);
  });

  it('generates unique values', () => {
    const refs = new Set(Array.from({ length: 10 }, generateTxnRef));
    expect(refs.size).toBeGreaterThan(1);
  });
});

describe('generateWdRef', () => {
  it('matches WD-YYYYMMDD-XXXXX format', () => {
    expect(generateWdRef()).toMatch(/^WD-\d{8}-[A-Z0-9]{5}$/);
  });

  it('includes today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(generateWdRef()).toContain(`WD-${today}-`);
  });

  it('generates unique values', () => {
    const refs = new Set(Array.from({ length: 10 }, generateWdRef));
    expect(refs.size).toBeGreaterThan(1);
  });
});
