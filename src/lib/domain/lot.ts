import type { LotStatus } from './status';

export type LinieLot = {
  subcategorieCod: string;
  codDeseu: string;
  kg: number;
  buc: number;
};

export type Lot = {
  /** LOT-AAAA-NNNN */
  id: string;
  organizatieId: string;
  status: LotStatus;
  punctLucru: string;
  /** Data la care colectorul a preluat deșeurile (ISO, zi). */
  dataPreluarii: string;
  linii: LinieLot[];
  creatLa: string;
  trimisLa?: string;
  /** Momentul deciziei administratorului (acceptat / respins / completări). */
  decisLa?: string;
  /** Motivul trimis colectorului la „Necesită completări” sau „Respins”. */
  motiv?: string;
  /** Lotul a trecut prin „Necesită completări” înainte de decizia finală. */
  aFostCompletat?: boolean;
};

export const totalKg = (lot: Pick<Lot, 'linii'>) => lot.linii.reduce((s, l) => s + l.kg, 0);
export const totalBuc = (lot: Pick<Lot, 'linii'>) => lot.linii.reduce((s, l) => s + l.buc, 0);

export type DocumentOrganizatie = {
  id: string;
  organizatieId: string;
  tip: string;
  denumire: string;
  /** Data de expirare (ISO, zi); lipsește la documentele fără valabilitate. */
  valabilPana?: string;
  status: 'LIPSA' | 'INCARCAT' | 'DE_VERIFICAT' | 'APROBAT' | 'RESPINS';
  motivRespingere?: string;
};

/** Ultima modificare vizibilă a lotului. */
export const actualizatLa = (lot: Lot) => lot.decisLa ?? lot.trimisLa ?? lot.creatLa;

export type CodDeseu = {
  cod: string;
  denumire: string;
  periculos: boolean;
  /** Codurile dezactivate nu mai pot fi alese în loturi noi. */
  activ?: boolean;
};

export type TipSursa = 'GENERATOR' | 'COLECTOR_PLATFORMA' | 'PERSOANA_FIZICA';

export type Sursa = {
  id: string;
  tip: TipSursa;
  denumire: string;
  /** CUI pentru persoane juridice; la persoane fizice se afișează mascat. */
  cui?: string;
  cuiVerificatAnaf?: boolean;
  adresaRidicare: string;
  contract?: string;
  documentProvenienta?: string;
  /** Codurile de subcategorie acoperite de sursă. */
  linii: string[];
  kg: number;
};

export type StatusDocumentLot = 'LIPSA' | 'INCARCAT' | 'DE_VERIFICAT' | 'DE_INLOCUIT';

export type DocumentLot = {
  id: string;
  tip: string;
  denumire: string;
  /** Explicația în limbaj de om (BRAND.md, principiul 5). */
  explicatie: string;
  status: StatusDocumentLot;
  fisier?: { nume: string; marime: string };
  /** Rezumatul valorilor extrase de AI, dacă există. */
  extras?: string;
  /** De ce e cerut documentul, când nu e evident (ex. cod periculos). */
  motivCerere?: string;
};

export type FisierMedia = {
  id: string;
  eticheta: string;
  tip: 'FOTO' | 'VIDEO';
  nume: string;
  marime: string;
  durata?: string;
};

export type EvenimentIstoric = {
  la: string;
  autor: string;
  actiune: string;
  detaliu?: string;
};

export type Semafor = 'VERDE' | 'GALBEN' | 'ROSU' | 'NA';

export type RezultatRegula = {
  cod: string;
  nume: string;
  rezultat: Semafor;
  rezumat: string;
};

export type Verificare = {
  regulament: string;
  verdictPropus: 'ACCEPTAT' | 'NECESITA_COMPLETARI' | 'RESPINS';
  rezultate: RezultatRegula[];
  /** Completat după decizia administratorului. */
  decizie?: { status: 'ACCEPTAT' | 'NECESITA_COMPLETARI' | 'RESPINS'; de: string; la: string };
};

export type LotDetaliu = Lot & {
  surse: Sursa[];
  documente: DocumentLot[];
  media: FisierMedia[];
  istoric: EvenimentIstoric[];
  verificare?: Verificare;
  /** Documentele pe care administratorul a cerut să le înlocuiești. */
  deInlocuit: string[];
};
