/** Formatare în convenția românească: 1.234,50 kg · 24 buc · 24.09.2026. */

const LOCALE = 'ro-RO';

const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

/** Număr cu separatorii românești. `decimals` fixează numărul de zecimale. */
export function formatNumber(value: number, decimals?: number): string {
  if (decimals === undefined)
    return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 }).format(value);
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatKg(value: number, decimals?: number): string {
  return `${formatNumber(value, decimals)} kg`;
}

export function formatBuc(value: number): string {
  return `${intFmt.format(value)} buc`;
}

/** 0.056 → „5,6%”. */
export function formatPercent(ratio: number): string {
  return `${pctFmt.format(ratio * 100)}%`;
}

export function formatDate(value: Date | string): string {
  return dateFmt.format(typeof value === 'string' ? new Date(value) : value);
}

export function formatTime(value: Date | string): string {
  return timeFmt.format(typeof value === 'string' ? new Date(value) : value);
}
