import type { RezultatRegula } from './lot';

/**
 * Raportul de verificare (SPEC-ECRANE §8): fiecare regulă are valorile comparate,
 * cu sursa lor (documentul și zona din document, salvate la extracție).
 */

/** Zonă dintr-o pagină, în fracțiuni din lățimea / înălțimea paginii (0–1). */
export type Zona = { x: number; y: number; w: number; h: number };

export type ValoareComparata = {
  eticheta: string;
  valoare: string;
  /** Documentul din care vine valoarea; lipsește la valorile declarate de colector. */
  documentId?: string;
  zona?: Zona;
  incredere?: number;
};

export type Severitate = 'BLOCANT' | 'AVERTISMENT';

export type RegulaRaport = RezultatRegula & {
  severitate: Severitate;
  valori: ValoareComparata[];
  /** Explicația abaterii (diferență și toleranță), când regula nu trece. */
  mesaj?: string;
  /** Documentele pe care colectorul ar trebui să le înlocuiască dacă regula pică. */
  documenteImplicate: string[];
};

export type RandDocument = { cheie: string; eticheta: string; valoare: string; accent?: boolean };

/** Documentul redat în vizualizator (Faza A: reconstituit din datele extrase). */
export type DocumentVizual = {
  id: string;
  tip: string;
  denumire: string;
  fisier: string;
  titlu: string;
  subsol?: string;
  randuri: RandDocument[];
};

/**
 * Geometria paginii din vizualizator. Aceleași constante poziționează rândurile
 * și calculează zonele, deci dreptunghiul evidențiat cade exact pe valoare.
 */
export const PAGINA = { latime: 520, inaltime: 640, sus: 0.19, rand: 0.066, margine: 0.07 } as const;

export function zonaRand(doc: Pick<DocumentVizual, 'randuri'>, cheie: string): Zona | undefined {
  const i = doc.randuri.findIndex((r) => r.cheie === cheie);
  if (i < 0) return undefined;
  return {
    x: PAGINA.margine - 0.02,
    y: PAGINA.sus + i * PAGINA.rand - 0.012,
    w: 1 - 2 * PAGINA.margine + 0.04,
    h: PAGINA.rand,
  };
}

/** Regula care se deschide prima: prima roșie, apoi prima galbenă, altfel prima din listă. */
export function regulaInitiala(reguli: RegulaRaport[]): string | undefined {
  return (
    reguli.find((r) => r.rezultat === 'ROSU')?.cod ??
    reguli.find((r) => r.rezultat === 'GALBEN')?.cod ??
    reguli[0]?.cod
  );
}
