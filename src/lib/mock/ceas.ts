import { MOCK_NOW } from './seed/loturi';

/**
 * Ceasul datelor mock: pornește la MOCK_NOW (24.09.2026, 10:00) și avansează în timp
 * real, ca vechimea în coadă și deciziile să fie coerente cu datele seed.
 */
const PORNIRE = Date.now();
export const now = () => new Date(new Date(MOCK_NOW).getTime() + (Date.now() - PORNIRE));

export const acumIso = () => {
  const d = now();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
