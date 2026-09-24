export const LOT_STATUSES = [
  'CIORNA',
  'IN_VERIFICARE',
  'NECESITA_COMPLETARI',
  'ACCEPTAT',
  'RESPINS',
  'ANULAT',
] as const;

export type LotStatus = (typeof LOT_STATUSES)[number];

export const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  CIORNA: 'Ciornă',
  IN_VERIFICARE: 'În verificare',
  NECESITA_COMPLETARI: 'Necesită completări',
  ACCEPTAT: 'Acceptat',
  RESPINS: 'Respins',
  ANULAT: 'Anulat',
};

/** Tonul vizual al fiecărui status (SPEC-ECRANE §0). */
export type StatusTone = 'neutral' | 'petrol' | 'warning' | 'success' | 'danger' | 'cancelled';

export const LOT_STATUS_TONE: Record<LotStatus, StatusTone> = {
  CIORNA: 'neutral',
  IN_VERIFICARE: 'petrol',
  NECESITA_COMPLETARI: 'warning',
  ACCEPTAT: 'success',
  RESPINS: 'danger',
  ANULAT: 'cancelled',
};
