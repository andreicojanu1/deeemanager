/**
 * Validarea identificatorilor românești: CUI (cifră de control, cheia 753217532)
 * și CNP (cifră de control, cheia 279146358279). Algoritmi publici, deterministici.
 */

/** „RO 18244571” → „18244571”; null dacă nu arată a CUI. */
export function normalizeazaCui(input: string): string | null {
  const s = input.replace(/\s+/g, '').toUpperCase().replace(/^RO/, '');
  return /^\d{2,10}$/.test(s) ? s : null;
}

export function cuiValid(input: string): boolean {
  const cui = normalizeazaCui(input);
  if (!cui) return false;
  const cheie = '753217532';
  const corp = cui.slice(0, -1).padStart(9, '0');
  let suma = 0;
  for (let i = 0; i < 9; i++) suma += Number(corp[i]) * Number(cheie[i]);
  let control = (suma * 10) % 11;
  if (control === 10) control = 0;
  return control === Number(cui.at(-1));
}

export function cnpValid(input: string): boolean {
  const cnp = input.replace(/\s+/g, '');
  if (!/^[1-9]\d{12}$/.test(cnp)) return false;
  const cheie = '279146358279';
  let suma = 0;
  for (let i = 0; i < 12; i++) suma += Number(cnp[i]) * Number(cheie[i]);
  let control = suma % 11;
  if (control === 10) control = 1;
  return control === Number(cnp[12]);
}

/** Datele personale se afișează mascat după introducere: „•••• 0012”. */
export function mascheaza(valoare: string): string {
  const v = valoare.replace(/\s+/g, '');
  return v.length <= 4 ? v : `•••• ${v.slice(-4)}`;
}
