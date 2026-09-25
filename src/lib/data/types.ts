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
import type {
  DateFirma,
  ExtrasAutorizatie,
  Onboarding,
  TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import type { FiltreColectori, RandColector, Utilizator } from '@/lib/domain/colectori';
import type { ConfigRegula, ModificareRegula } from '@/lib/domain/reguli';
import type { ModificareSubcategorie } from '@/lib/domain/taxonomie';
import type { Rol } from '@/lib/session/types';

/**
 * Contextul oricărui apel către stratul de date. Vine din sesiune și decide
 * ce date vede apelantul (izolare multi-tenant).
 */
export type DataContext = { organizatieId: string; rol: Rol };

export type PanouAdmin = {
  colectoriActivi: number;
  inCoada: number;
  deciseAzi: number;
  timpMediuDecizieMin: number | null;
  intrari: IntrareLuna[];
  conturiDeVerificat: RandColector[];
};

export type DetaliuColector = {
  rand: RandColector;
  onboarding: Onboarding;
  utilizatori: Utilizator[];
  /** Ora curentă a stratului de date (ex. data implicită a vizitei). */
  acum: string;
};

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
    /** Doar admin: editare inline; dezactivare în loc de ștergere. */
    modificaSubcategorie(ctx: DataContext, cod: string, modificare: ModificareSubcategorie): Promise<void>;
    modificaCod(ctx: DataContext, cod: string, modificare: { activ: boolean }): Promise<void>;
    /** Regulile de verificare, cu severitatea și toleranța configurabile. */
    reguli(ctx: DataContext): Promise<ConfigRegula[]>;
    modificaRegula(ctx: DataContext, cod: string, modificare: ModificareRegula): Promise<void>;
  };
  colectori: {
    /** Doar admin. */
    list(ctx: DataContext, filtre: FiltreColectori): Promise<RandColector[]>;
    /** Admin: orice colector; colector: doar organizația proprie. */
    get(ctx: DataContext, id: string): Promise<DetaliuColector | null>;
    /** Doar admin: aprobă un document de onboarding sau cere reîncărcarea lui, cu motiv. */
    decideDocument(
      ctx: DataContext,
      id: string,
      tip: TipDocumentOnboarding,
      decizie: 'APROBAT' | 'RESPINS',
      motiv?: string,
    ): Promise<void>;
    programeazaVizita(ctx: DataContext, id: string, data: string): Promise<void>;
    /** Marchează vizita ca efectuată și activează contul. */
    finalizeazaVizita(
      ctx: DataContext,
      id: string,
      vizita: { data: string; observatii: string },
      de: string,
    ): Promise<void>;
    /** Doar admin: creează firma și trimite invitația administratorului ei. */
    invita(
      ctx: DataContext,
      date: { denumire: string; cui: string; nume: string; email: string },
    ): Promise<{ id: string }>;
  };
  admin: {
    panou(ctx: DataContext): Promise<PanouAdmin>;
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
    /** Un document al firmei active (ex. visa anuală reînnoită) merge la verificare. */
    inlocuiesteDocument(
      ctx: DataContext,
      tip: TipDocumentOnboarding,
      fisier: { nume: string; marime: string },
    ): Promise<void>;
  };
  onboarding: {
    /** Dosarul de activare al organizației din sesiune. */
    get(ctx: DataContext): Promise<Onboarding>;
    /** Autosalvarea datelor firmei (doar în etapa Documente). */
    salveazaFirma(ctx: DataContext, firma: DateFirma): Promise<{ salvatLa: string }>;
    /** Înregistrează fișierul încărcat; la autorizația de mediu pornește extragerea. */
    incarcaDocument(
      ctx: DataContext,
      tip: TipDocumentOnboarding,
      fisier: { nume: string; marime: string },
    ): Promise<Onboarding>;
    /** Colectorul confirmă sau corectează datele extrase din autorizație. */
    confirmaAutorizatie(
      ctx: DataContext,
      extras: Omit<ExtrasAutorizatie, 'confirmat' | 'corectat'>,
    ): Promise<Onboarding>;
    /** Trimite dosarul complet la verificare. */
    trimite(ctx: DataContext): Promise<Onboarding>;
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
