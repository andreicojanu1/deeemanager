import 'server-only';

/**
 * Faza A: numele schimbat din /cont se păstrează în memorie, peste datele conturilor de test.
 * În Faza B se salvează în tabelul Utilizator.
 */
const nume = new Map<string, string>();

export const numeSchimbat = (utilizatorId: string) => nume.get(utilizatorId);

export function schimbaNume(utilizatorId: string, valoare: string) {
  nume.set(utilizatorId, valoare);
}

export const initiale = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
