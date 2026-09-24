import type { LotStatus } from './status';

/**
 * Ce poate face colectorul cu un lot, în funcție de status (SPEC-ECRANE §6).
 * Aceeași funcție decide ce butoane apar și ce acțiuni acceptă serverul.
 */
export const poateEdita = (s: LotStatus) => s === 'CIORNA' || s === 'NECESITA_COMPLETARI';
export const poateAnula = (s: LotStatus) =>
  s === 'CIORNA' || s === 'IN_VERIFICARE' || s === 'NECESITA_COMPLETARI';
export const poateRetrimite = (s: LotStatus) => s === 'NECESITA_COMPLETARI';
export const areDosar = (s: LotStatus) => s === 'ACCEPTAT';
