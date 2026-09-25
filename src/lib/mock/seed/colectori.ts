import type { Utilizator } from '@/lib/domain/colectori';
import { ORG_ALT, ORG_DEMO, ORG_ECOTRANS, ORG_GREENPOINT } from './loturi';

export const ORG_ECOREC = 'org-ecorec-ilfov';
export const ORG_PRAHOVA = 'org-recycle-prahova';
export const ORG_DUNAREA = 'org-eco-dunarea';

/** Datele firmelor colectoare din demo (în Faza B: tabelele Organizatie și Utilizator). */
export type ColectorSeed = {
  id: string;
  denumire: string;
  cui: string;
  localitate: string;
  adresaSediu: string;
  punctLucru: string;
  banca: string;
  iban: string;
  inregistratLa: string;
  emitentAutorizatie: string;
  utilizatori: Utilizator[];
};

const u = (
  id: string,
  nume: string,
  email: string,
  rol: Utilizator['rol'],
  ultimaAutentificare: string | null,
): Utilizator => ({ id, nume, email, rol, ultimaAutentificare });

export const COLECTORI: ColectorSeed[] = [
  {
    id: ORG_DEMO,
    denumire: 'Colector Demo SRL',
    cui: '24518736',
    localitate: 'Chiajna, Ilfov',
    adresaSediu: 'Str. Industriilor 9, Chiajna, Ilfov',
    punctLucru: 'Str. Industriilor 9, Chiajna, Ilfov',
    banca: 'Banca Transilvania',
    iban: 'RO22BTRL0501202R12345678',
    inregistratLa: '2025-11-03T09:20:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Ilfov',
    utilizatori: [
      u(
        'u-colector-1',
        'Andrei Constantin',
        'andrei@colectordemo.ro',
        'ADMINISTRATOR_FIRMA',
        '2026-09-24T08:10:00',
      ),
      u('u-colector-3', 'Mihai Dobre', 'mihai@colectordemo.ro', 'OPERATOR', '2026-09-23T15:42:00'),
    ],
  },
  {
    id: ORG_ALT,
    denumire: 'Reciclare Nord SRL',
    cui: '33987120',
    localitate: 'Suceava',
    adresaSediu: 'Calea Unirii 40, Suceava',
    punctLucru: 'Str. Depozitelor 2, Suceava',
    banca: 'BRD',
    iban: 'RO22BTRL0501202R12345678',
    inregistratLa: '2025-12-15T11:00:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Suceava',
    utilizatori: [
      u('u-alt-1', 'Radu Onu', 'radu@reciclarenord.ro', 'ADMINISTRATOR_FIRMA', '2026-09-22T10:05:00'),
    ],
  },
  {
    id: ORG_GREENPOINT,
    denumire: 'GreenPoint SRL',
    cui: '41277638',
    localitate: 'Brașov',
    adresaSediu: 'Str. Zizinului 110, Brașov',
    punctLucru: 'Str. Zizinului 110, Brașov',
    banca: 'ING Bank',
    iban: 'RO21INGB0000999901234567',
    inregistratLa: '2026-02-02T13:30:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Brașov',
    utilizatori: [
      u('u-gp-1', 'Ana Munteanu', 'ana@greenpoint.ro', 'ADMINISTRATOR_FIRMA', '2026-09-24T07:55:00'),
    ],
  },
  {
    id: ORG_ECOTRANS,
    denumire: 'EcoTrans Vest SRL',
    cui: '39502177',
    localitate: 'Timișoara',
    adresaSediu: 'Calea Aradului 72, Timișoara',
    punctLucru: 'Calea Aradului 72, Timișoara',
    banca: 'Banca Transilvania',
    iban: 'RO22BTRL0501202R12345678',
    inregistratLa: '2026-03-18T10:10:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Timiș',
    utilizatori: [
      u('u-et-1', 'Bogdan Lazăr', 'bogdan@ecotransvest.ro', 'ADMINISTRATOR_FIRMA', '2026-09-23T12:20:00'),
    ],
  },
  {
    id: ORG_ECOREC,
    denumire: 'EcoRec Ilfov SRL',
    cui: '30118904',
    localitate: 'Popești-Leordeni, Ilfov',
    adresaSediu: 'Șos. Olteniței 208, Popești-Leordeni',
    punctLucru: 'Str. Depozitelor 4, Popești-Leordeni, Ilfov',
    banca: 'ING Bank',
    iban: 'RO21INGB0000999901234567',
    inregistratLa: '2026-09-18T16:40:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Ilfov',
    utilizatori: [
      u(
        'u-colector-2',
        'Maria Ionescu',
        'maria@ecorecilfov.ro',
        'ADMINISTRATOR_FIRMA',
        '2026-09-22T14:02:00',
      ),
    ],
  },
  {
    id: ORG_PRAHOVA,
    denumire: 'Recycle Prahova SRL',
    cui: '42016541',
    localitate: 'Ploiești, Prahova',
    adresaSediu: 'Str. Găgeni 118, Ploiești',
    punctLucru: 'Str. Găgeni 118, Ploiești',
    banca: 'Banca Transilvania',
    iban: 'RO22BTRL0501202R12345678',
    inregistratLa: '2026-09-20T09:00:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Prahova',
    utilizatori: [
      u(
        'u-ph-1',
        'Cristina Vlad',
        'cristina@recycleprahova.ro',
        'ADMINISTRATOR_FIRMA',
        '2026-09-23T17:30:00',
      ),
    ],
  },
  {
    id: ORG_DUNAREA,
    denumire: 'Eco Dunărea SRL',
    cui: '44551206',
    localitate: 'Galați',
    adresaSediu: 'Str. Portului 31, Galați',
    punctLucru: 'Str. Portului 31, Galați',
    banca: 'ING Bank',
    iban: 'RO21INGB0000999901234567',
    inregistratLa: '2026-09-08T12:15:00',
    emitentAutorizatie: 'Agenția pentru Protecția Mediului Galați',
    utilizatori: [
      u('u-gl-1', 'Sorin Neagu', 'sorin@ecodunarea.ro', 'ADMINISTRATOR_FIRMA', '2026-09-21T09:45:00'),
    ],
  },
];

export const colectorSeed = (id: string) => COLECTORI.find((c) => c.id === id);
