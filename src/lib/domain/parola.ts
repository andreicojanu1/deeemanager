/** Complexitatea parolei: un indicator simplu, cu mesaje care spun ce lipsește. */

export type NivelParola = 0 | 1 | 2 | 3 | 4;

export const ETICHETA_NIVEL: Record<NivelParola, string> = {
  0: 'Prea scurtă',
  1: 'Slabă',
  2: 'Medie',
  3: 'Bună',
  4: 'Puternică',
};

export const LUNGIME_MINIMA = 10;

export function evalueazaParola(p: string): { nivel: NivelParola; lipsa: string[] } {
  const lipsa: string[] = [];
  if (p.length < LUNGIME_MINIMA) lipsa.push(`cel puțin ${LUNGIME_MINIMA} caractere`);
  if (!/[a-zăâîșț]/.test(p) || !/[A-ZĂÂÎȘȚ]/.test(p)) lipsa.push('litere mari și mici');
  if (!/\d/.test(p)) lipsa.push('o cifră');
  if (!/[^A-Za-z0-9ăâîșțĂÂÎȘȚ]/.test(p)) lipsa.push('un simbol');
  if (p.length < LUNGIME_MINIMA) return { nivel: 0, lipsa };
  return { nivel: (4 - (lipsa.length > 3 ? 3 : lipsa.length)) as NivelParola, lipsa };
}

/** Acceptăm parola de la nivelul „Bună” în sus. */
export const parolaAcceptata = (p: string) => evalueazaParola(p).nivel >= 3;
