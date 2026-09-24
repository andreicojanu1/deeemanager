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
