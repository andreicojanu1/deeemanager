import { z } from 'zod';
import { LOT_STATUSES, type LotStatus } from './status';

/**
 * Filtrele listei de loturi. Starea stă în URL (SPEC-ECRANE §4), așa că
 * schema parsează și validează `searchParams`; orice valoare invalidă e ignorată.
 */
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const FiltreLoturiSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  categorie: z.coerce.number().int().min(1).max(6).optional().catch(undefined),
  subcategorie: z.string().max(8).optional().catch(undefined),
  cod: z.string().max(12).optional().catch(undefined),
  status: z
    .string()
    .transform((s) =>
      s.split(',').filter((x): x is LotStatus => (LOT_STATUSES as readonly string[]).includes(x)),
    )
    .optional()
    .catch(undefined),
  de: data.optional().catch(undefined),
  pana: data.optional().catch(undefined),
  punct: z.string().max(60).optional().catch(undefined),
  colector: z.string().max(60).optional().catch(undefined),
  vedere: z.enum(['lista', 'categorii']).optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type FiltreLoturi = z.infer<typeof FiltreLoturiSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

export function parseFiltre(sp: SearchParams): FiltreLoturi {
  const plat = Object.fromEntries(
    Object.entries(sp)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      .filter(([, v]) => v !== undefined && v !== ''),
  );
  return FiltreLoturiSchema.parse(plat);
}

/** Filtrele care restrâng rezultatele (fără vedere și pagină). */
export function filtreActive(f: FiltreLoturi): boolean {
  return Boolean(
    f.q ||
    f.categorie ||
    f.subcategorie ||
    f.cod ||
    f.status?.length ||
    f.de ||
    f.pana ||
    f.punct ||
    f.colector,
  );
}

export const PE_PAGINA = 25;
