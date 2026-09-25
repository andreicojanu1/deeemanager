import { z } from 'zod';

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
  /** Subcategoriile dezactivate nu mai apar la loturi noi; nu se șterg. */
  activa?: boolean;
};

export const ModificareSubcategorieSchema = z.object({
  denumire: z.string().trim().min(3, 'Scrie denumirea subcategoriei.').max(120).optional(),
  unitateTarif: z.enum(['PER_BUCATA', 'PER_KG']).optional(),
  valoareTarif: z
    .number({ error: 'Scrie tariful ca număr, de exemplu 12,50.' })
    .min(0, 'Tariful nu poate fi negativ.')
    .max(100_000)
    .optional(),
  activa: z.boolean().optional(),
});

export type ModificareSubcategorie = z.infer<typeof ModificareSubcategorieSchema>;

export const ETICHETA_UNITATE: Record<UnitateTarif, string> = {
  PER_BUCATA: 'lei / buc',
  PER_KG: 'lei / kg',
};
