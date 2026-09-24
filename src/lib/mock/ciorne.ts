import {
  SLOTURI_FOTO,
  SLOT_VIDEO,
  documenteCiorna,
  linieNoua,
  type Ciorna,
  type ContextValidare,
} from '@/lib/domain/ciorna';
import { DOCUMENT_INFO } from '@/lib/domain/documente-cerute';
import type { DocumentLot, FisierMedia, LinieLot, Lot, LotDetaliu, Sursa } from '@/lib/domain/lot';
import { CODURI_PE_CATEGORIE } from './seed/coduri';
import { AUTORIZATII } from './seed/organizatii';
import { SUBCATEGORII, subcategorie } from './seed/taxonomie';

const subMap = new Map(SUBCATEGORII.map((s) => [s.cod, s]));

export function contextValidare(organizatieId: string): ContextValidare {
  return {
    subcategorie: (cod) => subMap.get(cod),
    coduriPermise: (cod) => {
      const s = subMap.get(cod);
      return s ? (CODURI_PE_CATEGORIE[s.categorieId] ?? []) : [];
    },
    coduriAutorizate: AUTORIZATII[organizatieId]?.coduriAutorizate ?? [],
  };
}

/** Liniile complete ale ciornei, ca linii de lot. */
export function liniiDinCiorna(c: Ciorna): LinieLot[] {
  return c.linii
    .filter((l) => subMap.has(l.subcategorieCod))
    .map((l) => ({
      subcategorieCod: l.subcategorieCod,
      codDeseu: l.codDeseu,
      kg: l.kg ?? 0,
      buc: l.buc ?? 0,
    }));
}

/** Pentru loturile create înainte de wizard (seed): o ciornă echivalentă. */
export function ciornaDinDetaliu(d: LotDetaliu): Ciorna {
  const linii = d.linii.map((l) => ({
    ...linieNoua(),
    subcategorieCod: l.subcategorieCod,
    codDeseu: l.codDeseu,
    kg: l.kg,
    buc: l.buc,
  }));
  const fisiere: Ciorna['fisiere'] = {};
  for (const doc of d.documente) {
    if (doc.fisier && doc.status !== 'DE_INLOCUIT') {
      fisiere[doc.tip] = [{ nume: doc.fisier.nume, marime: doc.fisier.marime, tip: 'DOCUMENT' }];
    }
  }
  const sloturi = [...SLOTURI_FOTO, SLOT_VIDEO];
  d.media.forEach((m, i) => {
    const slot = sloturi[i];
    if (slot) fisiere[slot.cheie] = [{ nume: m.nume, marime: m.marime, tip: m.tip }];
  });
  return {
    id: d.id,
    dataPreluarii: d.dataPreluarii,
    punctLucru: d.punctLucru,
    destinatie: 'STOCARE',
    linii: linii.length ? linii : [linieNoua()],
    provenienta: d.surse.length ? 'PJ' : null,
    surse: d.surse.map((s) => ({
      cheie: s.id,
      tip: s.tip,
      denumire: s.denumire,
      cui: s.cui ?? '',
      cuiVerificatAnaf: Boolean(s.cuiVerificatAnaf),
      cnp: '',
      actIdentitate: '',
      adresaRidicare: s.adresaRidicare,
      contract: s.contract ?? '',
      documentProvenienta: s.documentProvenienta ?? '',
      linii: s.linii.flatMap((cod) => linii.filter((l) => l.subcategorieCod === cod).map((l) => l.cheie)),
      kg: s.kg,
    })),
    fisiere,
    declaratie: false,
  };
}

/** Detaliul lotului construit din ciorna trimisă prin wizard. */
export function detaliuDinCiorna(lot: Lot, c: Ciorna, istoric: LotDetaliu['istoric']): LotDetaliu {
  const cheiLinie = new Map(c.linii.map((l) => [l.cheie, l.subcategorieCod]));
  const surse: Sursa[] = c.surse.map((s) => ({
    id: s.cheie,
    tip: s.tip,
    denumire: s.denumire,
    cui: s.tip === 'PERSOANA_FIZICA' ? undefined : s.cui,
    cuiVerificatAnaf: s.cuiVerificatAnaf,
    adresaRidicare: s.adresaRidicare,
    contract: s.contract || undefined,
    documentProvenienta: s.documentProvenienta || undefined,
    linii: s.linii.map((k) => cheiLinie.get(k) ?? '').filter(Boolean),
    kg: s.kg ?? 0,
  }));
  const documente: DocumentLot[] = documenteCiorna(c)
    .filter((d) => !DOCUMENT_INFO[d.tip].media)
    .map((d) => {
      const f = c.fisiere[d.cheie]?.[0];
      return {
        id: `${lot.id}-${d.cheie}`,
        tip: d.tip,
        denumire: d.denumire,
        explicatie: d.explicatie,
        motivCerere: d.motiv,
        status: f ? 'INCARCAT' : 'LIPSA',
        fisier: f ? { nume: f.nume, marime: f.marime } : undefined,
      };
    });
  const media: FisierMedia[] = [...SLOTURI_FOTO, SLOT_VIDEO].flatMap((slot) => {
    const f = c.fisiere[slot.cheie]?.[0];
    return f
      ? [
          {
            id: `${lot.id}-${slot.cheie}`,
            eticheta: slot.eticheta,
            tip: f.tip === 'VIDEO' ? 'VIDEO' : 'FOTO',
            nume: f.nume,
            marime: f.marime,
          },
        ]
      : [];
  });
  return { ...lot, surse, documente, media, istoric, verificare: undefined, deInlocuit: [] };
}

export const subcategorieSigura = (cod: string) => (subMap.has(cod) ? subcategorie(cod) : undefined);
