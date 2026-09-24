import type { Categorie, Subcategorie } from './taxonomie';
import { totalBuc, totalKg, type DocumentOrganizatie, type Lot } from './lot';

/** Calculele panoului colectorului, pe loturile deja filtrate pe organizație. */

export type StocCategorie = {
  categorie: Categorie;
  kg: number;
  buc: number;
  loturi: number;
  /** Procent din totalul de kg, 0–1. */
  pondere: number;
};

export function stocPeCategorii(
  loturi: Lot[],
  categorii: Categorie[],
  subcategorie: (cod: string) => Subcategorie,
): { categorii: StocCategorie[]; totalKg: number; totalLoturi: number } {
  const acceptate = loturi.filter((l) => l.status === 'ACCEPTAT');
  const map = new Map(categorii.map((c) => [c.id, { kg: 0, buc: 0, loturi: new Set<string>() }]));
  for (const lot of acceptate) {
    for (const linie of lot.linii) {
      const acc = map.get(subcategorie(linie.subcategorieCod).categorieId);
      if (!acc) continue;
      acc.kg += linie.kg;
      acc.buc += linie.buc;
      acc.loturi.add(lot.id);
    }
  }
  const total = acceptate.reduce((s, l) => s + totalKg(l), 0);
  return {
    totalKg: total,
    totalLoturi: acceptate.length,
    categorii: categorii.map((categorie) => {
      const acc = map.get(categorie.id)!;
      return {
        categorie,
        kg: acc.kg,
        buc: acc.buc,
        loturi: acc.loturi.size,
        pondere: total ? acc.kg / total : 0,
      };
    }),
  };
}

const LUNA_SCURT = [
  'ian.',
  'feb.',
  'mar.',
  'apr.',
  'mai',
  'iun.',
  'iul.',
  'aug.',
  'sep.',
  'oct.',
  'nov.',
  'dec.',
];
const LUNA_LUNG = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];

export type IntrareLuna = {
  /** AAAA-LL */
  luna: string;
  eticheta: string;
  numeLung: string;
  kg: number;
  loturi: number;
  curenta: boolean;
};

/** Kg acceptate pe lună (după data deciziei), ultimele `n` luni inclusiv luna curentă. */
export function intrariPeLuna(loturi: Lot[], now: Date, n = 6): IntrareLuna[] {
  const rez: IntrareLuna[] = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const luna = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const ale = loturi.filter((l) => l.status === 'ACCEPTAT' && l.decisLa?.startsWith(luna));
    rez.push({
      luna,
      eticheta: LUNA_SCURT[d.getMonth()],
      numeLung: LUNA_LUNG[d.getMonth()],
      kg: ale.reduce((s, l) => s + totalKg(l), 0),
      loturi: ale.length,
      curenta: k === 0,
    });
  }
  return rez;
}

export type StatusGrup = 'ACCEPTAT' | 'IN_VERIFICARE' | 'NECESITA_COMPLETARI' | 'RESPINS';

export type LoturiPeStatus = {
  total: number;
  grupuri: { status: StatusGrup; numar: number; pondere: number }[];
  /** Minute, media pe loturile decise în interval; null dacă nu există. */
  timpMediuVerificareMin: number | null;
  /** 0–1: loturi acceptate fără cerere de completări, din cele decise. */
  acceptateDinPrima: number | null;
};

const ORDINE: StatusGrup[] = ['ACCEPTAT', 'IN_VERIFICARE', 'NECESITA_COMPLETARI', 'RESPINS'];

/** Loturile trimise în ultimele `zile` zile, grupate pe status. */
export function loturiPeStatus(loturi: Lot[], now: Date, zile = 30): LoturiPeStatus {
  const de = now.getTime() - zile * 86_400_000;
  const trimise = loturi.filter(
    (l) => l.trimisLa && new Date(l.trimisLa).getTime() >= de && (ORDINE as string[]).includes(l.status),
  );
  const total = trimise.length;
  const decise = trimise.filter((l) => l.decisLa);
  const durate = decise.map(
    (l) => (new Date(l.decisLa!).getTime() - new Date(l.trimisLa!).getTime()) / 60_000,
  );
  const finale = decise.filter((l) => l.status === 'ACCEPTAT' || l.status === 'RESPINS');
  return {
    total,
    grupuri: ORDINE.map((status) => {
      const numar = trimise.filter((l) => l.status === status).length;
      return { status, numar, pondere: total ? numar / total : 0 };
    }),
    timpMediuVerificareMin: durate.length
      ? Math.round(durate.reduce((a, b) => a + b, 0) / durate.length)
      : null,
    acceptateDinPrima: finale.length
      ? finale.filter((l) => l.status === 'ACCEPTAT' && !l.aFostCompletat).length / finale.length
      : null,
  };
}

export type ElementDeRezolvat = {
  id: string;
  ton: 'danger' | 'warning';
  titlu: string;
  descriere: string;
  actiune: { eticheta: string; href: string };
};

const ACTIUNE_DOCUMENT: Record<string, string> = {
  VISA_ANUALA: 'Încarcă visa',
  AUTORIZATIE_MEDIU: 'Încarcă autorizația',
};

const zileIntre = (a: Date, b: Date) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86_400_000,
  );

const dataRo = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');

/** SPEC-ECRANE §3.2: loturi cu completări, documente care expiră în < 30 de zile, documente respinse. */
export function deRezolvat(loturi: Lot[], documente: DocumentOrganizatie[], now: Date): ElementDeRezolvat[] {
  const rez: ElementDeRezolvat[] = [];
  for (const lot of loturi.filter((l) => l.status === 'NECESITA_COMPLETARI')) {
    rez.push({
      id: lot.id,
      ton: 'danger',
      titlu: `${lot.id} · Necesită completări`,
      descriere: lot.motiv ?? 'Administratorul a cerut completări.',
      actiune: { eticheta: 'Completează lotul', href: `/loturi/${lot.id}` },
    });
  }
  for (const doc of documente) {
    if (doc.status === 'RESPINS') {
      rez.push({
        id: doc.id,
        ton: 'danger',
        titlu: `${doc.denumire} a fost respins`,
        descriere: doc.motivRespingere ?? 'Încarcă din nou documentul.',
        actiune: { eticheta: 'Încarcă din nou', href: '/organizatie' },
      });
      continue;
    }
    if (!doc.valabilPana) continue;
    const zile = zileIntre(now, new Date(doc.valabilPana));
    if (zile < 0 || zile >= 30) continue;
    rez.push({
      id: doc.id,
      ton: 'warning',
      titlu: `${doc.denumire} expiră în ${zile === 1 ? 'o zi' : `${zile} zile`}`,
      descriere: `Încarcă documentul nou până pe ${dataRo(doc.valabilPana)}, altfel nu vei mai putea trimite loturi.`,
      actiune: { eticheta: ACTIUNE_DOCUMENT[doc.tip] ?? 'Încarcă documentul', href: '/organizatie' },
    });
  }
  return rez;
}

export type RandLot = {
  id: string;
  continut: string;
  kg: number;
  buc: number;
  dataPreluarii: string;
  status: Lot['status'];
};

export function randLot(lot: Lot, subcategorie: (cod: string) => Subcategorie): RandLot {
  return {
    id: lot.id,
    continut: lot.linii
      .map((l) => `${l.subcategorieCod} ${subcategorie(l.subcategorieCod).denumire}`)
      .join(' · '),
    kg: totalKg(lot),
    buc: totalBuc(lot),
    dataPreluarii: lot.dataPreluarii,
    status: lot.status,
  };
}

/** Ultimele loturi trimise (fără ciorne și anulate), după data preluării. */
export function ultimeleLoturi(loturi: Lot[], n = 5): Lot[] {
  return loturi
    .filter((l) => l.status !== 'CIORNA' && l.status !== 'ANULAT')
    .sort((a, b) => b.dataPreluarii.localeCompare(a.dataPreluarii) || b.id.localeCompare(a.id))
    .slice(0, n);
}
