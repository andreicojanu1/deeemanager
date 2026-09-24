import { PE_PAGINA, type FiltreLoturi } from './filtre';
import { actualizatLa, totalBuc, totalKg, type Lot } from './lot';
import type { Categorie, Subcategorie } from './taxonomie';

type Taxonomie = { categorii: Categorie[]; subcategorie: (cod: string) => Subcategorie };

/** Aplică filtrele din URL pe loturile deja filtrate pe organizație. */
export function filtreaza(
  loturi: Lot[],
  f: FiltreLoturi,
  tx: Taxonomie,
  numeColector?: (orgId: string) => string,
): Lot[] {
  const q = f.q?.toLocaleLowerCase('ro');
  return loturi.filter((lot) => {
    if (f.status?.length && !f.status.includes(lot.status)) return false;
    if (f.punct && lot.punctLucru !== f.punct) return false;
    if (f.colector && lot.organizatieId !== f.colector) return false;
    if (f.de && lot.dataPreluarii < f.de) return false;
    if (f.pana && lot.dataPreluarii > f.pana) return false;
    if (
      f.categorie &&
      !lot.linii.some((l) => tx.subcategorie(l.subcategorieCod).categorieId === f.categorie)
    ) {
      return false;
    }
    if (f.subcategorie && !lot.linii.some((l) => l.subcategorieCod === f.subcategorie)) return false;
    if (f.cod && !lot.linii.some((l) => l.codDeseu === f.cod)) return false;
    if (q) {
      const text = [
        lot.id,
        numeColector?.(lot.organizatieId) ?? '',
        ...lot.linii.flatMap((l) => [
          l.subcategorieCod,
          tx.subcategorie(l.subcategorieCod).denumire,
          l.codDeseu,
        ]),
      ]
        .join(' ')
        .toLocaleLowerCase('ro');
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

export type RandListaLot = {
  id: string;
  organizatieId: string;
  continut: string;
  kg: number;
  buc: number;
  dataPreluarii: string;
  status: Lot['status'];
  actualizatLa: string;
};

export type PaginaLoturi = {
  randuri: RandListaLot[];
  total: number;
  pagina: number;
  pagini: number;
};

/** Cele mai noi întâi; 25 pe pagină (SPEC-ECRANE §0). */
export function pagineaza(loturi: Lot[], pagina: number, tx: Taxonomie): PaginaLoturi {
  const sortate = [...loturi].sort(
    (a, b) => b.dataPreluarii.localeCompare(a.dataPreluarii) || b.id.localeCompare(a.id),
  );
  const pagini = Math.max(1, Math.ceil(sortate.length / PE_PAGINA));
  const p = Math.min(pagina, pagini);
  return {
    total: sortate.length,
    pagina: p,
    pagini,
    randuri: sortate.slice((p - 1) * PE_PAGINA, p * PE_PAGINA).map((lot) => ({
      id: lot.id,
      organizatieId: lot.organizatieId,
      continut: lot.linii
        .map((l) => `${l.subcategorieCod} ${tx.subcategorie(l.subcategorieCod).denumire}`)
        .join(' · '),
      kg: totalKg(lot),
      buc: totalBuc(lot),
      dataPreluarii: lot.dataPreluarii,
      status: lot.status,
      actualizatLa: actualizatLa(lot),
    })),
  };
}

export type NodArbore = {
  cheie: string;
  eticheta: string;
  kg: number;
  buc: number;
  loturi: number;
  /** Filtrele aplicate la click pe nod. */
  filtru: Partial<Pick<FiltreLoturi, 'categorie' | 'subcategorie' | 'cod'>>;
  copii: NodArbore[];
};

/** Arborele categorie → subcategorie → cod deșeu, cu totaluri pe linii de lot. */
export function arbore(loturi: Lot[], tx: Taxonomie): NodArbore[] {
  type Acc = { kg: number; buc: number; loturi: Set<string> };
  const nou = (): Acc => ({ kg: 0, buc: 0, loturi: new Set() });
  const add = (a: Acc, kg: number, buc: number, id: string) => {
    a.kg += kg;
    a.buc += buc;
    a.loturi.add(id);
  };
  const cat = new Map<number, Acc>();
  const sub = new Map<string, Acc>();
  const cod = new Map<string, Acc>();
  for (const lot of loturi) {
    for (const l of lot.linii) {
      const s = tx.subcategorie(l.subcategorieCod);
      if (!cat.has(s.categorieId)) cat.set(s.categorieId, nou());
      if (!sub.has(s.cod)) sub.set(s.cod, nou());
      const kc = `${s.cod}|${l.codDeseu}`;
      if (!cod.has(kc)) cod.set(kc, nou());
      add(cat.get(s.categorieId)!, l.kg, l.buc, lot.id);
      add(sub.get(s.cod)!, l.kg, l.buc, lot.id);
      add(cod.get(kc)!, l.kg, l.buc, lot.id);
    }
  }
  const nod = (a: Acc) => ({ kg: a.kg, buc: a.buc, loturi: a.loturi.size });
  const ordineCod = (a: string, b: string) => a.localeCompare(b, 'ro', { numeric: true });

  return tx.categorii
    .filter((c) => cat.has(c.id))
    .map((c) => ({
      cheie: `c${c.id}`,
      eticheta: `${c.cod}. ${c.denumire}`,
      ...nod(cat.get(c.id)!),
      filtru: { categorie: c.id },
      copii: [...sub.keys()]
        .filter((k) => tx.subcategorie(k).categorieId === c.id)
        .sort(ordineCod)
        .map((k) => ({
          cheie: `s${k}`,
          eticheta: `${k} ${tx.subcategorie(k).denumire}`,
          ...nod(sub.get(k)!),
          filtru: { subcategorie: k },
          copii: [...cod.keys()]
            .filter((kc) => kc.startsWith(`${k}|`))
            .sort()
            .map((kc) => {
              const codDeseu = kc.split('|')[1];
              return {
                cheie: `d${kc}`,
                eticheta: codDeseu,
                ...nod(cod.get(kc)!),
                filtru: { subcategorie: k, cod: codDeseu },
                copii: [],
              };
            }),
        })),
    }));
}
