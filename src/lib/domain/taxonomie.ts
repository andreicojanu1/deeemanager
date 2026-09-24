export type UnitateTarif = 'PER_BUCATA' | 'PER_KG';

export type Categorie = {
  id: number;
  cod: string;
  denumire: string;
  /** Denumirea scurtă din cardurile de stoc. */
  denumireScurta: string;
};

export type Subcategorie = {
  cod: string;
  categorieId: number;
  denumire: string;
  unitateTarif: UnitateTarif;
  /** Tarif fără TVA, în lei, pe unitatea de tarifare. */
  valoareTarif: number;
};
