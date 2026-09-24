import { describe, expect, it } from 'vitest';
import { documenteCerute } from '@/lib/domain/documente-cerute';
import { parseFiltre } from '@/lib/domain/filtre';
import { mockData } from '@/lib/mock';
import { ORG_ALT, ORG_DEMO } from '@/lib/mock/seed/loturi';

const colector = { organizatieId: ORG_DEMO, rol: 'COLECTOR' as const };
const alt = { organizatieId: ORG_ALT, rol: 'COLECTOR' as const };

describe('filtrele din URL', () => {
  it('parsează valorile valide și ignoră restul', () => {
    expect(
      parseFiltre({ categorie: '4', status: 'ACCEPTAT,XYZ,RESPINS', pagina: '2', de: '2026-09-01' }),
    ).toEqual({
      categorie: 4,
      status: ['ACCEPTAT', 'RESPINS'],
      pagina: 2,
      de: '2026-09-01',
    });
    expect(parseFiltre({ categorie: '99', de: 'ieri', vedere: 'grila' })).toEqual({});
  });
});

describe('lista de loturi', () => {
  it('paginează câte 25, cele mai noi întâi', async () => {
    const p1 = await mockData.loturi.list(colector, {});
    expect(p1.total).toBe(46);
    expect(p1.pagini).toBe(2);
    expect(p1.randuri).toHaveLength(25);
    expect(p1.randuri[0].id).toBe('LOT-2026-0418');
    const p2 = await mockData.loturi.list(colector, { pagina: 2 });
    expect(p2.randuri).toHaveLength(21);
  });

  it('filtrează după categorie, status, cod și căutare', async () => {
    const cat1 = await mockData.loturi.list(colector, { categorie: 1, status: ['ACCEPTAT'] });
    expect(cat1.total).toBe(6);
    const periculos = await mockData.loturi.list(colector, { cod: '20 01 35*' });
    expect(periculos.randuri.map((r) => r.id)).toContain('LOT-2026-0418');
    const cautare = await mockData.loturi.list(colector, { q: 'aspirat' });
    expect(cautare.randuri.every((r) => r.continut.includes('Aspiratoare'))).toBe(true);
  });

  it('arborele are totalurile stocului pe categorii când filtrezi pe Acceptat', async () => {
    const noduri = await mockData.loturi.arbore(colector, { status: ['ACCEPTAT'] });
    expect(noduri.map((n) => n.kg)).toEqual([4860, 2315, 186, 7940, 1128, 342]);
    const frunze = noduri.flatMap((n) => n.copii.flatMap((s) => s.copii));
    expect(frunze.every((f) => f.filtru.cod && f.filtru.subcategorie)).toBe(true);
  });
});

describe('izolarea la detaliu și acțiuni', () => {
  it('un colector nu poate deschide lotul altuia', async () => {
    expect(await mockData.loturi.get(colector, 'LOT-2026-0417')).toBeNull();
    expect(await mockData.loturi.get(alt, 'LOT-2026-0417')).not.toBeNull();
    await expect(mockData.loturi.anuleaza(alt, 'LOT-2026-0416', 'test de izolare')).rejects.toThrow();
  });

  it('retrimiterea cere înlocuirea documentelor, apoi mută lotul în verificare', async () => {
    const lot = await mockData.loturi.get(colector, 'LOT-2026-0412');
    expect(lot?.deInlocuit).toHaveLength(1);
    await expect(mockData.loturi.retrimite(colector, 'LOT-2026-0412')).rejects.toThrow(
      'Mai ai documente de înlocuit.',
    );
    await mockData.loturi.inlocuiesteDocument(
      colector,
      'LOT-2026-0412',
      lot!.deInlocuit[0],
      'tichet_nou.jpg',
    );
    await mockData.loturi.retrimite(colector, 'LOT-2026-0412');
    expect((await mockData.loturi.get(colector, 'LOT-2026-0412'))?.status).toBe('IN_VERIFICARE');
  });

  it('un lot acceptat nu mai poate fi anulat', async () => {
    await expect(mockData.loturi.anuleaza(colector, 'LOT-2026-0415', 'nu se poate')).rejects.toThrow();
  });
});

describe('documentele cerute', () => {
  it('PJ fără cod periculos: baza + PJ', () => {
    const d = documenteCerute({
      provenienta: 'PJ',
      surse: [{ id: 's1', tip: 'PJ', denumire: 'A' }],
      coduri: ['20 01 36'],
    });
    expect(d.map((x) => x.tip)).toEqual([
      'TICHET_CANTAR',
      'FOTO_INCARCATURA',
      'FILMARE_CANTAR',
      'AVIZ',
      'ANEXA_3',
      'CENTRALIZATOR',
      'PV_RECEPTIE',
    ]);
  });

  it('cod periculos pe linia 2: setul suplimentar, cu motivul', () => {
    const d = documenteCerute({
      provenienta: 'PJ',
      surse: [],
      coduri: ['20 01 36', '20 01 35*'],
    });
    const anexa2 = d.find((x) => x.tip === 'ANEXA_2');
    expect(anexa2?.motiv).toBe('Cerut pentru că linia 2 are un cod periculos (20 01 35*)');
    expect(d.filter((x) => x.grup === 'PERICULOS')).toHaveLength(3);
  });

  it('mixt: un borderou pentru fiecare sursă persoană fizică', () => {
    const d = documenteCerute({
      provenienta: 'MIXT',
      surse: [
        { id: 'a', tip: 'PJ', denumire: 'Firma' },
        { id: 'b', tip: 'PF', denumire: 'Ion P.' },
        { id: 'c', tip: 'PF', denumire: 'Ana M.' },
      ],
      coduri: ['20 01 36'],
    });
    expect(d.filter((x) => x.tip === 'BORDEROU_ACHIZITIE').map((x) => x.sursaId)).toEqual(['b', 'c']);
    expect(d.some((x) => x.tip === 'AVIZ')).toBe(true);
  });
});
