import { z } from 'zod';
import { documenteCerute, type DocumentCerut, type Provenienta } from './documente-cerute';
import { cnpValid, cuiValid } from './identificatori';
import type { Subcategorie } from './taxonomie';

/**
 * Ciorna unui lot, așa cum o editează wizard-ul (SPEC-ECRANE §5).
 * Aceeași structură se salvează automat pe server și se validează pe pași.
 */

export const DESTINATII = {
  STOCARE: 'Stocare temporară',
  TRATATOR: 'Predare la tratator',
  OTR: 'Propunere de vânzare către OTR',
} as const;
export type Destinatie = keyof typeof DESTINATII;

export const STARI_LINIE = { COMPLET: 'Complet', INCOMPLET: 'Incomplet', AMESTEC: 'Amestec' } as const;
export type StareLinie = keyof typeof STARI_LINIE;

export const PROVENIENTE: Record<Provenienta, string> = {
  PJ: 'Persoane juridice',
  PF: 'Persoane fizice',
  MIXT: 'Mixt',
};

export type TipSursaCiorna = 'GENERATOR' | 'COLECTOR_PLATFORMA' | 'PERSOANA_FIZICA';
export const TIPURI_SURSA: Record<TipSursaCiorna, string> = {
  GENERATOR: 'Generator',
  COLECTOR_PLATFORMA: 'Colector de pe platformă',
  PERSOANA_FIZICA: 'Persoană fizică',
};

/** Tipurile de sursă permise pentru fiecare proveniență. */
export const SURSE_PERMISE: Record<Provenienta, TipSursaCiorna[]> = {
  PJ: ['GENERATOR', 'COLECTOR_PLATFORMA'],
  PF: ['PERSOANA_FIZICA'],
  MIXT: ['GENERATOR', 'COLECTOR_PLATFORMA', 'PERSOANA_FIZICA'],
};

/** Sloturile de media: cele 3 unghiuri cerute și filmarea cântarului. */
export const SLOTURI_FOTO = [
  { cheie: 'FOTO_FATA', eticheta: 'Față' },
  { cheie: 'FOTO_LATERAL', eticheta: 'Lateral' },
  { cheie: 'FOTO_SPATE', eticheta: 'Spate' },
] as const;
export const SLOT_VIDEO = { cheie: 'FILMARE_CANTAR', eticheta: 'Cântar plin / gol' } as const;

const text = (max: number) => z.string().max(max);
const numar = z.number().min(0).max(1_000_000);

export const FisierSchema = z.object({
  nume: text(200),
  marime: text(20),
  tip: z.enum(['FOTO', 'VIDEO', 'DOCUMENT']),
});
export type FisierCiorna = z.infer<typeof FisierSchema>;

export const LinieSchema = z.object({
  cheie: text(40),
  subcategorieCod: text(8),
  codDeseu: text(12),
  buc: numar.nullable(),
  kg: numar.nullable(),
  stare: z.enum(['COMPLET', 'INCOMPLET', 'AMESTEC']),
});
export type LinieCiorna = z.infer<typeof LinieSchema>;

export const SursaSchema = z.object({
  cheie: text(40),
  tip: z.enum(['GENERATOR', 'COLECTOR_PLATFORMA', 'PERSOANA_FIZICA']),
  denumire: text(160),
  cui: text(20),
  cuiVerificatAnaf: z.boolean(),
  cnp: text(13),
  actIdentitate: text(20),
  adresaRidicare: text(200),
  contract: text(80),
  documentProvenienta: text(80),
  linii: z.array(text(40)).max(50),
  kg: numar.nullable(),
});
export type SursaCiorna = z.infer<typeof SursaSchema>;

/** Schema „largă”: orice ciornă parțială trece, doar limitele de mărime sunt verificate. */
export const CiornaSchema = z.object({
  id: z
    .string()
    .regex(/^LOT-\d{4}-\d{4}$/)
    .optional(),
  dataPreluarii: text(10),
  punctLucru: text(60),
  destinatie: z.enum(['STOCARE', 'TRATATOR', 'OTR']).nullable(),
  linii: z.array(LinieSchema).max(50),
  provenienta: z.enum(['PJ', 'PF', 'MIXT']).nullable(),
  surse: z.array(SursaSchema).max(30),
  fisiere: z.record(text(80), z.array(FisierSchema).max(10)),
  declaratie: z.boolean(),
});
export type Ciorna = z.infer<typeof CiornaSchema>;

let seq = 0;
export const cheieNoua = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const linieNoua = (): LinieCiorna => ({
  cheie: cheieNoua('l'),
  subcategorieCod: '',
  codDeseu: '',
  buc: null,
  kg: null,
  stare: 'COMPLET',
});

export const sursaNoua = (tip: TipSursaCiorna): SursaCiorna => ({
  cheie: cheieNoua('s'),
  tip,
  denumire: '',
  cui: '',
  cuiVerificatAnaf: false,
  cnp: '',
  actIdentitate: '',
  adresaRidicare: '',
  contract: '',
  documentProvenienta: '',
  linii: [],
  kg: null,
});

export function ciornaNoua(azi: string, punctLucru: string): Ciorna {
  return {
    dataPreluarii: azi,
    punctLucru,
    destinatie: null,
    linii: [linieNoua()],
    provenienta: null,
    surse: [],
    fisiere: {},
    declaratie: false,
  };
}

// ── Totaluri ──────────────────────────────────────────────────────────────────────

export const totalKgCiorna = (c: Pick<Ciorna, 'linii'>) => c.linii.reduce((s, l) => s + (l.kg ?? 0), 0);
export const totalBucCiorna = (c: Pick<Ciorna, 'linii'>) => c.linii.reduce((s, l) => s + (l.buc ?? 0), 0);
export const kgAcoperitSurse = (c: Pick<Ciorna, 'surse'>) => c.surse.reduce((s, x) => s + (x.kg ?? 0), 0);

// ── Validare pe câmpuri (mesajele spun ce e de făcut) ─────────────────────────────

export type Erori = Record<string, string>;

export type ContextValidare = {
  subcategorie: (cod: string) => Subcategorie | undefined;
  /** Codurile permise pentru subcategorie (lista din taxonomie). */
  coduriPermise: (subcategorieCod: string) => string[];
  coduriAutorizate: string[];
};

export function valideazaPas1(c: Ciorna, ctx: ContextValidare): Erori {
  const e: Erori = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.dataPreluarii))
    e.dataPreluarii = 'Alege data la care ai preluat deșeurile.';
  if (!c.punctLucru) e.punctLucru = 'Alege punctul de lucru.';
  if (!c.destinatie) e.destinatie = 'Alege destinația declarată.';
  if (c.linii.length === 0) e.linii = 'Adaugă cel puțin o linie.';

  c.linii.forEach((l, i) => {
    const p = `linii.${i}`;
    const sub = ctx.subcategorie(l.subcategorieCod);
    if (!sub) {
      e[`${p}.subcategorieCod`] = 'Alege subcategoria.';
      return;
    }
    if (!l.codDeseu) e[`${p}.codDeseu`] = 'Alege codul de deșeu.';
    else if (!ctx.coduriPermise(l.subcategorieCod).includes(l.codDeseu)) {
      e[`${p}.codDeseu`] = 'Codul nu corespunde subcategoriei. Alege altul din listă.';
    } else if (!ctx.coduriAutorizate.includes(l.codDeseu)) {
      e[`${p}.codDeseu`] = 'Codul nu e în autorizația ta de mediu.';
    }
    const buc = l.buc ?? 0;
    const kg = l.kg ?? 0;
    if (buc <= 0 && kg <= 0) e[`${p}.cantitate`] = 'Completează bucățile sau kilogramele.';
    else if (sub.unitateTarif === 'PER_BUCATA' && buc <= 0) e[`${p}.buc`] = 'Completează numărul de bucăți.';
    else if (sub.unitateTarif === 'PER_KG' && kg <= 0) e[`${p}.kg`] = 'Completează greutatea în kg.';
    if (l.buc !== null && !Number.isInteger(l.buc)) e[`${p}.buc`] = 'Bucățile sunt un număr întreg.';
  });

  if (!c.provenienta) e.provenienta = 'Alege de la cine ai preluat deșeurile.';
  else if (c.surse.length === 0) e.surse = 'Adaugă cel puțin o sursă.';

  c.surse.forEach((s, i) => {
    const p = `surse.${i}`;
    if (c.provenienta && !SURSE_PERMISE[c.provenienta].includes(s.tip)) {
      e[`${p}.tip`] = 'Tipul sursei nu se potrivește cu proveniența aleasă.';
    }
    if (s.tip === 'PERSOANA_FIZICA') {
      if (!s.denumire.trim()) e[`${p}.denumire`] = 'Completează numele persoanei.';
      if (!cnpValid(s.cnp)) e[`${p}.cnp`] = 'CNP-ul nu e valid. Verifică cele 13 cifre.';
      if (!/^[A-Z]{2}\s?\d{6}$/i.test(s.actIdentitate.trim())) {
        e[`${p}.actIdentitate`] = 'Scrie seria și numărul actului, de exemplu IF 123456.';
      }
    } else {
      if (!s.denumire.trim()) e[`${p}.denumire`] = 'Completează denumirea firmei.';
      if (!cuiValid(s.cui)) e[`${p}.cui`] = 'CUI-ul nu e valid. Verifică cifrele.';
      if (!s.documentProvenienta.trim())
        e[`${p}.documentProvenienta`] = 'Completează documentul de proveniență.';
    }
    if (!s.adresaRidicare.trim()) e[`${p}.adresaRidicare`] = 'Completează adresa de ridicare.';
    if (s.linii.length === 0) e[`${p}.linii`] = 'Alege liniile pe care le acoperă sursa.';
    if ((s.kg ?? 0) <= 0) e[`${p}.kg`] = 'Completează câte kg vin de la această sursă.';
  });
  return e;
}

// ── Documente cerute și progres ───────────────────────────────────────────────────

export function documenteCiorna(c: Ciorna): DocumentCerut[] {
  if (!c.provenienta) return [];
  return documenteCerute({
    provenienta: c.provenienta,
    surse: c.surse.map((s) => ({
      id: s.cheie,
      tip: s.tip === 'PERSOANA_FIZICA' ? 'PF' : 'PJ',
      denumire: s.denumire || 'persoană fizică',
    })),
    coduri: c.linii.map((l) => l.codDeseu).filter(Boolean),
  });
}

export type StareElement = 'COMPLET' | 'PARTIAL' | 'LIPSA';

export type ElementLista = DocumentCerut & { stare: StareElement; detaliu: string };

export function progresDocumente(c: Ciorna): ElementLista[] {
  return documenteCiorna(c).map((d) => {
    if (d.tip === 'FOTO_INCARCATURA') {
      const lipsa = SLOTURI_FOTO.filter((s) => !c.fisiere[s.cheie]?.length);
      const are = SLOTURI_FOTO.length - lipsa.length;
      return {
        ...d,
        stare: lipsa.length === 0 ? 'COMPLET' : are > 0 ? 'PARTIAL' : 'LIPSA',
        detaliu:
          lipsa.length === 0
            ? `${are} din ${SLOTURI_FOTO.length}`
            : `${are} din ${SLOTURI_FOTO.length} · lipsește ${lipsa.map((s) => s.eticheta.toLowerCase()).join(', ')}`,
      };
    }
    const f = c.fisiere[d.cheie]?.[0];
    return { ...d, stare: f ? 'COMPLET' : 'LIPSA', detaliu: f ? f.nume : 'Lipsește' };
  });
}

export function documenteLipsa(c: Ciorna): number {
  return progresDocumente(c).filter((d) => d.stare !== 'COMPLET').length;
}

export type Pas = 1 | 2 | 3;

/** Ce lipsește ca să poți continua de la pasul curent; null când pasul e complet. */
export function ceLipseste(c: Ciorna, pas: Pas, ctx: ContextValidare): string | null {
  if (pas === 1) {
    const n = Object.keys(valideazaPas1(c, ctx)).length;
    if (n === 0) return null;
    return n === 1 ? 'Mai ai un câmp de completat' : `Mai ai ${n} câmpuri de completat`;
  }
  if (pas === 2) {
    const n = documenteLipsa(c);
    if (n === 0) return null;
    return n === 1 ? 'Mai lipsește un document' : `Mai lipsesc ${n} documente`;
  }
  return c.declaratie ? null : 'Bifează declarația pe propria răspundere';
}

/** Validarea completă, rulată pe server la trimitere. */
export function poateFiTrimisa(c: Ciorna, ctx: ContextValidare): string | null {
  for (const pas of [1, 2, 3] as const) {
    const lipsa = ceLipseste(c, pas, ctx);
    if (lipsa) return `${lipsa} (pasul ${pas}).`;
  }
  return null;
}
