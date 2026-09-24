import type { Ciorna } from '@/lib/domain/ciorna';
import type { Decizie, RandCoada } from '@/lib/domain/coada';
import type { FiltreLoturi } from '@/lib/domain/filtre';
import type { CodDeseu, LotDetaliu } from '@/lib/domain/lot';
import type { NodArbore, PaginaLoturi } from '@/lib/domain/loturi';
import type { DocumentVizual, RegulaRaport } from '@/lib/domain/raport';
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
    /** Ciorna editabilă a unui lot (Ciornă sau Necesită completări); null altfel. */
    ciorna(ctx: DataContext, id: string): Promise<Ciorna | null>;
    /** Salvează ciorna; la prima salvare lotul primește ID-ul LOT-AAAA-NNNN. */
    salveazaCiorna(ctx: DataContext, ciorna: Ciorna): Promise<{ id: string; salvatLa: string }>;
    /** Validează ciorna completă și trimite lotul la verificare. */
    trimite(ctx: DataContext, id: string): Promise<void>;
  };
  organizatie: {
    autorizatie(
      ctx: DataContext,
    ): Promise<{ numar: string; coduriAutorizate: string[]; puncteLucru: string[] }>;
    /** Codurile de deșeu permise pe categorie (din taxonomie). */
    coduriPeCategorie(): Promise<Record<number, string[]>>;
  };
  anaf: {
    /** Datele firmei după CUI; null dacă nu există. */
    cauta(cui: string): Promise<{ denumire: string; adresa: string } | null>;
  };
  panou: {
    colector(ctx: DataContext): Promise<PanouColector>;
  };
  verificari: {
    numarInCoada(ctx: DataContext): Promise<number>;
    /** Doar admin: cele trei tab-uri ale cozii și timpul mediu până la decizie azi. */
    coada(ctx: DataContext): Promise<{
      deVerificat: RandCoada[];
      asteaptaColectorul: RandCoada[];
      deciseAzi: RandCoada[];
      /** Ora curentă a stratului de date, pentru vechimea în coadă. */
      acum: string;
      timpMediuDecizieMin: number | null;
    }>;
    /** Doar admin: decizia pe un lot în verificare. Salvează adminul, ora și regulamentul. */
    decide(
      ctx: DataContext,
      lotId: string,
      decizie: Decizie,
      motiv: string,
      deciziaDe: string,
      /** La „Necesită completări”: documentele bifate; implicit cele lipsă sau de verificat. */
      documenteDeInlocuit?: string[],
    ): Promise<void>;
    /** Doar admin: raportul de verificare al lotului; null dacă lotul nu există. */
    raport(
      ctx: DataContext,
      lotId: string,
    ): Promise<{
      lot: LotDetaliu;
      colector: string;
      reguli: RegulaRaport[];
      documente: DocumentVizual[];
      /** Următorul lot din coadă, pentru trecerea automată după decizie. */
      urmatorul: string | null;
    } | null>;
  };
}
