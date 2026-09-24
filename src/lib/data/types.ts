import type { FiltreLoturi } from '@/lib/domain/filtre';
import type { CodDeseu, LotDetaliu } from '@/lib/domain/lot';
import type { NodArbore, PaginaLoturi } from '@/lib/domain/loturi';
import type { Categorie, Subcategorie } from '@/lib/domain/taxonomie';
import type {
  ElementDeRezolvat,
  IntrareLuna,
  LoturiPeStatus,
  RandLot,
  StocCategorie,
} from '@/lib/domain/panou';
import type { Rol } from '@/lib/session/types';

/**
 * Contextul oricărui apel către stratul de date. Vine din sesiune și decide
 * ce date vede apelantul (izolare multi-tenant).
 */
export type DataContext = { organizatieId: string; rol: Rol };

export type PanouColector = {
  deRezolvat: ElementDeRezolvat[];
  stoc: { categorii: StocCategorie[]; totalKg: number; totalLoturi: number };
  intrari: IntrareLuna[];
  statusuri: LoturiPeStatus;
  ultimeleLoturi: RandLot[];
};

/**
 * Contractul stratului de date. Faza A: implementarea mock din `lib/mock`.
 * Faza B: aceeași interfață peste Prisma; ecranele nu se schimbă.
 */
export interface DataLayer {
  taxonomie: {
    categorii(): Promise<Categorie[]>;
    subcategorii(): Promise<Subcategorie[]>;
    coduri(): Promise<CodDeseu[]>;
  };
  loturi: {
    list(ctx: DataContext, filtre: FiltreLoturi): Promise<PaginaLoturi>;
    arbore(ctx: DataContext, filtre: FiltreLoturi): Promise<NodArbore[]>;
    optiuni(
      ctx: DataContext,
    ): Promise<{ puncteLucru: string[]; colectori: { id: string; denumire: string }[] }>;
    /** null dacă lotul nu există sau nu e vizibil pentru apelant. */
    get(ctx: DataContext, id: string): Promise<LotDetaliu | null>;
    anuleaza(ctx: DataContext, id: string, motiv: string): Promise<void>;
    inlocuiesteDocument(ctx: DataContext, id: string, documentId: string, numeFisier: string): Promise<void>;
    retrimite(ctx: DataContext, id: string): Promise<void>;
  };
  panou: {
    colector(ctx: DataContext): Promise<PanouColector>;
  };
  verificari: {
    numarInCoada(ctx: DataContext): Promise<number>;
  };
}
