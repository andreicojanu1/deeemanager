import { describe, expect, it } from 'vitest';
import { formatBuc, formatDate, formatKg, formatNumber, formatPercent } from '@/lib/format';

describe('formatare ro-RO', () => {
  it('kilograme cu separatori românești', () => {
    expect(formatKg(1234.5, 2)).toBe('1.234,50 kg');
    expect(formatKg(12480)).toBe('12.480 kg');
    expect(formatKg(186)).toBe('186 kg');
  });

  it('numere și bucăți', () => {
    expect(formatNumber(51.7)).toBe('51,7');
    expect(formatBuc(1240)).toBe('1.240 buc');
  });

  it('procente', () => {
    expect(formatPercent(0.056)).toBe('5,6%');
    expect(formatPercent(0.85)).toBe('85%');
  });

  it('date zz.ll.aaaa', () => {
    expect(formatDate(new Date(2026, 8, 24))).toBe('24.09.2026');
  });
});
