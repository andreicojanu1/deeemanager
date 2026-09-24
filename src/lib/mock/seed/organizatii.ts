import { ORG_ALT, ORG_DEMO } from './loturi';

export type AutorizatieMock = {
  numar: string;
  valabilPana: string;
  coduriAutorizate: string[];
  puncteLucru: string[];
};

/** Autorizațiile de mediu ale colectorilor demo. */
export const AUTORIZATII: Record<string, AutorizatieMock> = {
  [ORG_DEMO]: {
    numar: '214/2024',
    valabilPana: '2029-03-31',
    // Fără 20 01 21* (lămpi cu mercur) și 16 02 11*, ca să se vadă codurile neautorizate.
    coduriAutorizate: ['20 01 23*', '20 01 35*', '20 01 36', '16 02 13*', '16 02 14'],
    puncteLucru: ['Chiajna', 'Bragadiru'],
  },
  [ORG_ALT]: {
    numar: '88/2025',
    valabilPana: '2030-01-31',
    coduriAutorizate: ['20 01 23*', '20 01 35*', '20 01 36'],
    puncteLucru: ['Suceava'],
  },
};

/** Răspunsuri simulate ale serviciului ANAF (Faza B: apel real). */
export const ANAF: Record<string, { denumire: string; adresa: string }> = {
  '18244571': { denumire: 'Hotel Parc Central SRL', adresa: 'Str. Fabricii 12, Chiajna, Ilfov' },
  '30118904': { denumire: 'EcoRec Ilfov SRL', adresa: 'Șos. Olteniței 208, Popești-Leordeni' },
};
