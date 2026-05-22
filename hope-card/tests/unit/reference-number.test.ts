import { generateTxnRef, generateWdRef } from '../../src/beneficiary-lib/reference-number';

describe('generateTxnRef', () => {
  it('starts with TXN-', () => {
    expect(generateTxnRef()).toMatch(/^TXN-/);
  });

  it('includes today\'s date in YYYYMMDD format', () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(generateTxnRef()).toContain(dateStr);
  });

  it('has the expected format TXN-YYYYMMDD-SUFFIX', () => {
    expect(generateTxnRef()).toMatch(/^TXN-\d{8}-[A-Z0-9]+$/);
  });

  it('generates unique values', () => {
    const refs = new Set(Array.from({ length: 20 }, generateTxnRef));
    expect(refs.size).toBeGreaterThan(1);
  });
});

describe('generateWdRef', () => {
  it('starts with WD-', () => {
    expect(generateWdRef()).toMatch(/^WD-/);
  });

  it('includes today\'s date in YYYYMMDD format', () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    expect(generateWdRef()).toContain(dateStr);
  });

  it('has the expected format WD-YYYYMMDD-SUFFIX', () => {
    expect(generateWdRef()).toMatch(/^WD-\d{8}-[A-Z0-9]+$/);
  });

  it('generates unique values', () => {
    const refs = new Set(Array.from({ length: 20 }, generateWdRef));
    expect(refs.size).toBeGreaterThan(1);
  });
});
