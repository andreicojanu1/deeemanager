import { describe, expect, it } from 'vitest';
import {
  ceLipseste,
  ciornaNoua,
  poateFiTrimisa,
  progresDocumente,
  sursaNoua,
  valideazaPas1,
  type Ciorna,
} from '@/lib/domain/ciorna';
import { cnpValid, cuiValid, mascheaza } from '@/lib/domain/identificatori';
import { contextValidare } from '@/lib/mock/ciorne';
import { mockData } from '@/lib/mock';
import { ORG_ALT, ORG_DEMO } from '@/lib/mock/seed/loturi';

const ctxV = contextValidare(ORG_DEMO);

function ciornaCompleta(): Ciorna {
  const c = ciornaNoua('2026-09-24', 'Chiajna');
  c.destinatie = 'STOCARE';
  Object.assign(c.linii[0], { subcategorieCod: '4.2', codDeseu: '20 01 36', buc: 18, kg: 930 });
  c.provenienta = 'PJ';
  c.surse = [
    {
      ...sursaNoua('GENERATOR'),
      denumire: 'Hotel Parc Central SRL',
      cui: 'RO 18244571',
      adresaRidicare: 'Str. Fabricii 12',
      documentProvenienta: 'Aviz EWC 0457',
      linii: [c.linii[0].cheie],
      kg: 930,
    },
  ];
  const f = { nume: 'x.pdf', marime: '1 KB', tip: 'DOCUMENT' as const };
  for (const k of [
    'FOTO_FATA',
    'FOTO_LATERAL',
    'FOTO_SPATE',
    'FILMARE_CANTAR',
    'TICHET_CANTAR',
    'AVIZ',
    'ANEXA_3',
    'CENTRALIZATOR',
    'PV_RECEPTIE',
  ]) {
    c.fisiere[k] = [f];
  }
  c.declaratie = true;
  return c;
}

describe('identificatori', () => {
  it('CUI cu cifra de control', () => {
    expect(cuiValid('RO 18244571')).toBe(true);
    expect(cuiValid('30118904')).toBe(true);
    expect(cuiValid('30118902')).toBe(false);
    expect(cuiValid('abc')).toBe(false);
  });
  it('CNP cu cifra de control, afișat mascat', () => {
    expect(cnpValid('1800101221144')).toBe(true);
    expect(cnpValid('1800101221145')).toBe(false);
    expect(mascheaza('1800101221144')).toBe('•••• 1144');
  });
});

describe('validarea pasului 1', () => {
  it('ciorna nouă spune ce lipsește', () => {
    const e = valideazaPas1(ciornaNoua('2026-09-24', 'Chiajna'), ctxV);
    expect(e.destinatie).toBe('Alege destinația declarată.');
    expect(e['linii.0.subcategorieCod']).toBe('Alege subcategoria.');
    expect(e.provenienta).toBe('Alege de la cine ai preluat deșeurile.');
  });

  it('codul trebuie să fie permis pentru subcategorie și în autorizație', () => {
    const c = ciornaCompleta();
    c.linii[0].codDeseu = '20 01 21*';
    expect(valideazaPas1(c, ctxV)['linii.0.codDeseu']).toBe(
      'Codul nu corespunde subcategoriei. Alege altul din listă.',
    );
    Object.assign(c.linii[0], { subcategorieCod: '3.2', codDeseu: '20 01 21*' });
    expect(valideazaPas1(c, ctxV)['linii.0.codDeseu']).toBe('Codul nu e în autorizația ta de mediu.');
  });

  it('unitatea de tarif cere bucăți sau kg', () => {
    const c = ciornaCompleta();
    c.linii[0].buc = null;
    expect(valideazaPas1(c, ctxV)['linii.0.buc']).toBe('Completează numărul de bucăți.');
  });

  it('persoana fizică cere CNP valid și act de identitate', () => {
    const c = ciornaCompleta();
    c.provenienta = 'PF';
    c.surse = [
      {
        ...sursaNoua('PERSOANA_FIZICA'),
        denumire: 'Ion Popescu',
        cnp: '123',
        adresaRidicare: 'x',
        linii: ['a'],
        kg: 1,
      },
    ];
    const e = valideazaPas1(c, ctxV);
    expect(e['surse.0.cnp']).toBe('CNP-ul nu e valid. Verifică cele 13 cifre.');
    expect(e['surse.0.actIdentitate']).toMatch(/seria și numărul/);
  });

  it('ciorna completă trece toți pașii', () => {
    const c = ciornaCompleta();
    expect(valideazaPas1(c, ctxV)).toEqual({});
    expect(ceLipseste(c, 2, ctxV)).toBeNull();
    expect(poateFiTrimisa(c, ctxV)).toBeNull();
  });
});

describe('progresul documentelor', () => {
  it('fotografiile sunt parțiale până la 3 unghiuri', () => {
    const c = ciornaCompleta();
    delete c.fisiere.FOTO_SPATE;
    const foto = progresDocumente(c).find((e) => e.tip === 'FOTO_INCARCATURA')!;
    expect(foto.stare).toBe('PARTIAL');
    expect(foto.detaliu).toBe('2 din 3 · lipsește spate');
    expect(ceLipseste(c, 2, ctxV)).toBe('Mai lipsește un document');
  });

  it('codul periculos adaugă cele 3 documente', () => {
    const c = ciornaCompleta();
    c.linii[0].codDeseu = '20 01 35*';
    expect(ceLipseste(c, 2, ctxV)).toBe('Mai lipsesc 3 documente');
  });
});

describe('ciornele în stratul de date', () => {
  const colector = { organizatieId: ORG_DEMO, rol: 'COLECTOR' as const };

  it('prima salvare dă un ID nou; trimiterea validează și mută lotul în verificare', async () => {
    const incompleta = ciornaNoua('2026-09-24', 'Chiajna');
    const { id } = await mockData.loturi.salveazaCiorna(colector, incompleta);
    expect(id).toMatch(/^LOT-2026-\d{4}$/);
    await expect(mockData.loturi.trimite(colector, id)).rejects.toThrow(/pasul 1/);

    await mockData.loturi.salveazaCiorna(colector, { ...ciornaCompleta(), id });
    await mockData.loturi.trimite(colector, id);
    const lot = await mockData.loturi.get(colector, id);
    expect(lot?.status).toBe('IN_VERIFICARE');
    expect(lot?.surse[0].denumire).toBe('Hotel Parc Central SRL');
    expect(await mockData.loturi.ciorna(colector, id)).toBeNull();
  });

  it('un colector nu poate salva peste ciorna altuia', async () => {
    const { id } = await mockData.loturi.salveazaCiorna(colector, ciornaNoua('2026-09-24', 'Chiajna'));
    const alt = { organizatieId: ORG_ALT, rol: 'COLECTOR' as const };
    await expect(
      mockData.loturi.salveazaCiorna(alt, { ...ciornaNoua('2026-09-24', 'Suceava'), id }),
    ).rejects.toThrow();
    expect(await mockData.loturi.ciorna(alt, id)).toBeNull();
  });
});
