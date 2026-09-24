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

/** IBAN românesc: RO + 2 cifre de control + 4 litere bancă + 16 caractere; verificare mod 97. */
export function ibanValid(input: string): boolean {
  const iban = input.replace(/\s+/g, '').toUpperCase();
  if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(iban)) return false;
  const mutat = iban.slice(4) + iban.slice(0, 4);
  const cifre = mutat.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ch of cifre) rest = (rest * 10 + Number(ch)) % 97;
  return rest === 1;
}
