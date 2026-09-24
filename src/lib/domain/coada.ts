import { totalKg, type Lot, type Semafor, type Verificare } from './lot';

/** Coada de verificare a administratorului (SPEC-ECRANE §7). */

export type Prioritate = 'RIDICATA' | 'MEDIE' | 'NORMALA';
export const ETICHETA_PRIORITATE: Record<Prioritate, string> = {
  RIDICATA: 'Ridicată',
  MEDIE: 'Medie',
  NORMALA: 'Normală',
};

export type Decizie = 'ACCEPTAT' | 'NECESITA_COMPLETARI' | 'RESPINS';

export type ContoareReguli = Record<Semafor, number>;

export type RandCoada = {
  id: string;
  colector: string;
  status: Lot['status'];
  trimisLa: string;
  decisLa?: string;
  kg: number;
  coduriPericuloase: string[];
  reguli: ContoareReguli;
  verdict: Decizie | null;
  prioritate: Prioritate;
  /** Motivul redactat de AI din regulile roșii și galbene; editabil de admin. */
  motivPropus: string;
};

export function contoare(v: Verificare | undefined): ContoareReguli {
  const c: ContoareReguli = { VERDE: 0, GALBEN: 0, ROSU: 0, NA: 0 };
  for (const r of v?.rezultate ?? []) c[r.rezultat]++;
  return c;
}

/** Un roșu blocant urcă lotul; un avertisment îl pune la mijloc. */
export function prioritate(c: ContoareReguli): Prioritate {
  if (c.ROSU > 0) return 'RIDICATA';
  if (c.GALBEN > 0) return 'MEDIE';
  return 'NORMALA';
}

const RANG: Record<Prioritate, number> = { RIDICATA: 0, MEDIE: 1, NORMALA: 2 };

/** Sortarea implicită: prioritatea, apoi vechimea în coadă (cele mai vechi întâi). */
export function sorteazaCoada(randuri: RandCoada[]): RandCoada[] {
  return [...randuri].sort(
    (a, b) => RANG[a.prioritate] - RANG[b.prioritate] || a.trimisLa.localeCompare(b.trimisLa),
  );
}

export function motivPropus(v: Verificare | undefined): string {
  const probleme = (v?.rezultate ?? []).filter((r) => r.rezultat === 'ROSU' || r.rezultat === 'GALBEN');
  if (!probleme.length) return '';
  return probleme.map((r) => `${r.nume}: ${r.rezumat}.`).join(' ');
}

export function randCoada(lot: Lot, colector: string, v: Verificare | undefined): RandCoada {
  const c = contoare(v);
  return {
    id: lot.id,
    colector,
    status: lot.status,
    trimisLa: lot.trimisLa ?? lot.creatLa,
    decisLa: lot.decisLa,
    kg: totalKg(lot),
    coduriPericuloase: [...new Set(lot.linii.map((l) => l.codDeseu).filter((x) => x.endsWith('*')))],
    reguli: c,
    verdict: v?.verdictPropus ?? null,
    prioritate: prioritate(c),
    motivPropus: motivPropus(v),
  };
}

/** „2 h 14 min”, „1 zi 5 h”, „18 min”. */
export function durata(minute: number): string {
  const m = Math.max(0, Math.round(minute));
  const zile = Math.floor(m / 1440);
  const ore = Math.floor((m % 1440) / 60);
  const min = m % 60;
  if (zile) return `${zile} ${zile === 1 ? 'zi' : 'zile'}${ore ? ` ${ore} h` : ''}`;
  if (ore) return `${ore} h ${String(min).padStart(2, '0')} min`;
  return `${min} min`;
}
