import type { CodDeseu } from '@/lib/domain/lot';

/**
 * Codurile de deșeu DEEE din lista de deșeuri (HG 856/2002, capitolele 16 02 și 20 01).
 * Asteriscul marchează deșeurile periculoase.
 * TODO(validare-client): lista de coduri permise per subcategorie trebuie validată.
 */
export const CODURI_DESEU: CodDeseu[] = [
  { cod: '16 02 11*', denumire: 'Echipamente casate cu conținut de CFC, HCFC, HFC', periculos: true },
  { cod: '16 02 13*', denumire: 'Echipamente casate cu componente periculoase', periculos: true },
  {
    cod: '16 02 14',
    denumire: 'Echipamente casate, altele decât cele de la 16 02 09–16 02 13',
    periculos: false,
  },
  {
    cod: '20 01 21*',
    denumire: 'Tuburi fluorescente și alte deșeuri cu conținut de mercur',
    periculos: true,
  },
  {
    cod: '20 01 23*',
    denumire: 'Echipamente scoase din uz cu conținut de clorofluorocarburi',
    periculos: true,
  },
  {
    cod: '20 01 35*',
    denumire: 'Echipamente electrice și electronice casate cu componente periculoase',
    periculos: true,
  },
  {
    cod: '20 01 36',
    denumire: 'Echipamente electrice și electronice casate, altele decât 20 01 21, 20 01 23 și 20 01 35',
    periculos: false,
  },
];

export const esteCodPericulos = (cod: string) => cod.trim().endsWith('*');

/**
 * Codurile care au sens pentru fiecare categorie. Aproximare pentru date demo.
 * TODO(validare-client): maparea subcategorie → coduri permise o stabilește clientul
 * sau consultantul de mediu (vezi docs/NOTE-MATERIALE-CLIENT.md).
 */
export const CODURI_PE_CATEGORIE: Record<number, string[]> = {
  1: ['20 01 23*', '16 02 11*', '20 01 35*', '20 01 36'],
  2: ['20 01 35*', '16 02 13*', '20 01 36', '16 02 14'],
  3: ['20 01 21*', '20 01 36'],
  4: ['20 01 35*', '16 02 13*', '20 01 36', '16 02 14'],
  5: ['20 01 35*', '20 01 36', '16 02 14'],
  6: ['20 01 35*', '20 01 36', '16 02 14'],
};
