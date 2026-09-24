import type { Categorie, Subcategorie, UnitateTarif } from '@/lib/domain/taxonomie';

/** Brief tehnic v1.0, Anexa A — seed-ul inițial al taxonomiei. */
export const CATEGORII: Categorie[] = [
  { id: 1, cod: '1', denumire: 'Echipamente de transfer termic', denumireScurta: 'Transfer termic' },
  {
    id: 2,
    cod: '2',
    denumire: 'Ecrane, monitoare și echipamente cu ecrane',
    denumireScurta: 'Ecrane și monitoare',
  },
  { id: 3, cod: '3', denumire: 'Lămpi', denumireScurta: 'Lămpi' },
  { id: 4, cod: '4', denumire: 'Echipamente de mari dimensiuni', denumireScurta: 'Mari dimensiuni' },
  { id: 5, cod: '5', denumire: 'Echipamente de mici dimensiuni', denumireScurta: 'Mici dimensiuni' },
  { id: 6, cod: '6', denumire: 'Echipamente IT&C mici', denumireScurta: 'IT&C mici' },
];

const B: UnitateTarif = 'PER_BUCATA';
const K: UnitateTarif = 'PER_KG';

const rows: [string, number, string, number, UnitateTarif][] = [
  ['1.1', 1, 'Frigidere / congelatoare', 73, B],
  ['1.2', 1, 'Echipamente de aer condiționat ≤ 50 kg', 40, B],
  ['1.3', 1, 'Alte echipamente de transfer termic ≤ 10 kg', 6.5, B],
  ['1.4', 1, 'Alte echipamente de transfer termic > 10 kg ≤ 50 kg', 13, B],
  ['1.5', 1, 'Alte echipamente de transfer termic > 50 kg ≤ 100 kg', 75, B],
  ['1.6', 1, 'Alte echipamente de transfer termic > 100 kg ≤ 150 kg', 130, B],
  ['1.7', 1, 'Alte echipamente de transfer termic > 150 kg', 1.3, K],
  ['1.8', 1, 'Distribuitoare automate', 1.3, K],
  ['2.1', 2, 'Tablete, eReader', 0.4, B],
  ['2.2', 2, 'Calculatoare portabile', 2.5, B],
  ['2.3', 2, 'Monitoare pentru calculatoare', 3, B],
  ['2.4', 2, 'Televizoare cu ecrane ≤ 32″', 6.5, B],
  ['2.5', 2, 'Televizoare cu ecrane > 32″ < 40″', 14, B],
  ['2.6', 2, 'Televizoare și alte echipamente cu ecrane > 40″', 1.3, K],
  ['3.1', 3, 'Lămpi LED', 0.35, B],
  ['3.2', 3, 'Alte lămpi', 0.7, B],
  ['4.1', 4, 'Mașini de spălat rufe', 84, B],
  ['4.2', 4, 'Mașini de gătit', 65, B],
  ['4.3', 4, 'Mașini de spălat vesela', 50, B],
  ['4.4', 4, 'Uscătoare de rufe', 55, B],
  ['4.5', 4, 'Sobe electrice, cuptoare', 40, B],
  ['4.6', 4, 'Hote', 14, B],
  ['4.7', 4, 'Plite electrice', 15, B],
  ['4.8', 4, 'Echipamente IT&C de mari dimensiuni ≤ 25 kg', 15, B],
  ['4.9', 4, 'Echipamente IT&C mari și servere > 25 kg ≤ 100 kg', 34, B],
  ['4.10', 4, 'Echipamente IT&C mari > 100 kg ≤ 200 kg', 1.3, K],
  ['4.11', 4, 'Alte echipamente mari ≤ 4 kg', 4, B],
  ['4.12', 4, 'Alte echipamente mari > 4 kg ≤ 10 kg', 6.5, B],
  ['4.13', 4, 'Alte echipamente mari > 10 kg ≤ 50 kg', 13, B],
  ['4.14', 4, 'Alte echipamente mari > 50 kg ≤ 100 kg', 65, B],
  ['4.15', 4, 'Alte echipamente mari > 100 kg', 1.3, K],
  ['4.17', 4, 'Echipamente medicale, distribuitoare automate', 1.3, K],
  ['4B', 4, 'Panouri fotovoltaice', 0.9, K],
  ['5.1', 5, 'Cuptoare cu microunde', 15, B],
  ['5.2', 5, 'Aspiratoare', 9, B],
  ['5.3', 5, 'Roboți de bucătărie', 4, B],
  ['5.4', 5, 'Ventilatoare', 7.5, B],
  ['5.5', 5, 'Alte echipamente mici ≤ 0,2 kg', 0.1, B],
  ['5.6', 5, 'Alte echipamente mici > 0,2 kg ≤ 1 kg', 0.15, B],
  ['5.7', 5, 'Alte echipamente mici > 1 kg ≤ 2 kg', 0.75, B],
  ['5.8', 5, 'Alte echipamente mici > 2 kg ≤ 4 kg', 2.6, B],
  ['5.9', 5, 'Alte echipamente mici > 4 kg ≤ 20 kg', 6.5, B],
  ['5.10', 5, 'Alte echipamente mici > 20 kg', 1.3, K],
  ['6.1', 6, 'Telefoane mobile, GPS', 0.1, B],
  ['6.2', 6, 'Echipamente imprimare ≤ 4 kg', 1.8, B],
  ['6.3', 6, 'Echipamente imprimare > 4 kg', 5.5, B],
  ['6.4', 6, 'Alte echipamente IT&C ≤ 0,02 kg', 0.02, B],
  ['6.5', 6, 'Alte echipamente IT&C > 0,02 kg ≤ 0,2 kg', 0.2, B],
  ['6.6', 6, 'Alte echipamente IT&C > 0,2 kg ≤ 1 kg', 0.3, B],
  ['6.7', 6, 'Alte echipamente IT&C > 1 kg ≤ 2 kg', 1.3, B],
  ['6.8', 6, 'Alte echipamente IT&C > 2 kg ≤ 4 kg', 2.6, B],
  ['6.9', 6, 'Alte echipamente IT&C > 4 kg ≤ 20 kg', 6.5, B],
  ['6.10', 6, 'Alte echipamente IT&C > 20 kg', 1, K],
];

export const SUBCATEGORII: Subcategorie[] = rows.map(
  ([cod, categorieId, denumire, valoareTarif, unitateTarif]) => ({
    cod,
    categorieId,
    denumire,
    valoareTarif,
    unitateTarif,
  }),
);

const byCod = new Map(SUBCATEGORII.map((s) => [s.cod, s]));

export function subcategorie(cod: string): Subcategorie {
  const s = byCod.get(cod);
  if (!s) throw new Error(`Subcategorie necunoscută: ${cod}`);
  return s;
}
