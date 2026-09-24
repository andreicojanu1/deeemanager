import type { Categorie } from '@/lib/domain/taxonomie';
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
  };
  panou: {
    colector(ctx: DataContext): Promise<PanouColector>;
  };
  verificari: {
    numarInCoada(ctx: DataContext): Promise<number>;
  };
}
