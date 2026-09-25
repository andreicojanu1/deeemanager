import { describe, expect, it } from 'vitest';
import type { DataContext } from '@/lib/data/types';
import { conturiDeVerificat } from '@/lib/domain/colectori';
import { cuiValid } from '@/lib/domain/identificatori';
import { parseFiltre } from '@/lib/domain/filtre';
import { mockData } from '@/lib/mock';
import { COLECTORI, ORG_DUNAREA, ORG_ECOREC, ORG_PRAHOVA } from '@/lib/mock/seed/colectori';
import { ORG_ALT, ORG_DEMO } from '@/lib/mock/seed/loturi';

const ADMIN: DataContext = { organizatieId: 'org-ewc', rol: 'ADMIN' };
const DEMO: DataContext = { organizatieId: ORG_DEMO, rol: 'COLECTOR' };

describe('colectorii din demo', () => {
  it('au CUI-uri valide și unice', () => {
    for (const c of COLECTORI) expect(cuiValid(c.cui), c.denumire).toBe(true);
    expect(new Set(COLECTORI.map((c) => c.cui)).size).toBe(COLECTORI.length);
  });
});

describe('lista colectorilor', () => {
  it('e doar pentru admin', async () => {
    await expect(mockData.colectori.list(DEMO, {})).rejects.toThrow();
  });

  it('filtrează după status și după text', async () => {
    const activi = await mockData.colectori.list(ADMIN, { status: 'ACTIV' });
    expect(activi.map((c) => c.id)).toContain(ORG_DEMO);
    expect(activi.every((c) => c.status === 'ACTIV')).toBe(true);
    const galati = await mockData.colectori.list(ADMIN, { q: 'galați' });
    expect(galati.map((c) => c.id)).toEqual([ORG_DUNAREA]);
    const dupaCui = await mockData.colectori.list(ADMIN, { q: 'RO30118904' });
    expect(dupaCui.map((c) => c.id)).toEqual([ORG_ECOREC]);
  });

  it('„Conturi de verificat” pune întâi dosarele trimise, apoi vizitele', async () => {
    const toti = await mockData.colectori.list(ADMIN, {});
    expect(conturiDeVerificat(toti).map((c) => c.id)).toEqual([ORG_PRAHOVA, ORG_DUNAREA]);
  });
});

describe('izolare: detaliul colectorului', () => {
  it('colectorul își vede doar organizația proprie', async () => {
    expect((await mockData.colectori.get(DEMO, ORG_DEMO))?.rand.denumire).toBe('Colector Demo SRL');
    await expect(mockData.colectori.get(DEMO, ORG_ALT)).rejects.toThrow();
  });

  it('un colector nu poate decide documente', async () => {
    await expect(
      mockData.colectori.decideDocument(DEMO, ORG_PRAHOVA, 'EXTRAS_ONRC', 'APROBAT'),
    ).rejects.toThrow();
  });
});

describe('verificarea dosarului de activare', () => {
  it('reîncărcarea cere motiv; după ultima decizie dosarul se întoarce la colector', async () => {
    await expect(
      mockData.colectori.decideDocument(ADMIN, ORG_PRAHOVA, 'EXTRAS_ONRC', 'RESPINS', ' '),
    ).rejects.toThrow(/motivul/);
    const docs = (await mockData.colectori.get(ADMIN, ORG_PRAHOVA))!.onboarding.documente;
    for (const d of docs.slice(0, -1))
      await mockData.colectori.decideDocument(ADMIN, ORG_PRAHOVA, d.tip, 'APROBAT');
    expect((await mockData.colectori.get(ADMIN, ORG_PRAHOVA))!.rand.status).toBe('IN_VERIFICARE');
    await mockData.colectori.decideDocument(
      ADMIN,
      ORG_PRAHOVA,
      docs.at(-1)!.tip,
      'RESPINS',
      'Declarația nu e semnată.',
    );
    const dupa = (await mockData.colectori.get(ADMIN, ORG_PRAHOVA))!;
    expect(dupa.rand.status).toBe('DOCUMENTE');
    expect(dupa.onboarding.documente.at(-1)).toMatchObject({
      stare: 'RESPINS',
      motiv: 'Declarația nu e semnată.',
    });
  });

  it('vizita marcată activează contul; nu se acceptă o dată din viitor', async () => {
    await expect(
      mockData.colectori.finalizeazaVizita(
        ADMIN,
        ORG_DUNAREA,
        { data: '2030-01-01', observatii: '' },
        'Elena Wagner',
      ),
    ).rejects.toThrow(/viitor/);
    await mockData.colectori.finalizeazaVizita(
      ADMIN,
      ORG_DUNAREA,
      { data: '2026-09-24', observatii: 'Depozit conform.' },
      'Elena Wagner',
    );
    const c = (await mockData.colectori.get(ADMIN, ORG_DUNAREA))!;
    expect(c.rand.status).toBe('ACTIV');
    expect(c.onboarding.vizita).toMatchObject({ efectuataLa: '2026-09-24', de: 'Elena Wagner' });
  });
});

describe('invitarea unui colector nou', () => {
  it('validează CUI-ul și nu dublează firmele', async () => {
    const date = { denumire: 'Test Invitat SRL', cui: '12345678', nume: 'Ion Pop', email: 'ion@invitat.ro' };
    await expect(mockData.colectori.invita(ADMIN, date)).rejects.toThrow(/CUI/);
    await expect(mockData.colectori.invita(ADMIN, { ...date, cui: '30118904' })).rejects.toThrow(
      /Există deja/,
    );
    const { id } = await mockData.colectori.invita(ADMIN, { ...date, cui: '10000008' });
    const r = (await mockData.colectori.list(ADMIN, { status: 'INVITAT' })).find((c) => c.id === id);
    expect(r).toMatchObject({ denumire: 'Test Invitat SRL', status: 'INVITAT' });
    const detaliu = (await mockData.colectori.get(ADMIN, id))!;
    expect(detaliu.utilizatori[0]).toMatchObject({ email: 'ion@invitat.ro', ultimaAutentificare: null });
  });
});

describe('taxonomia editabilă', () => {
  it('doar adminul modifică tarifele; dezactivarea nu șterge', async () => {
    await expect(mockData.taxonomie.modificaSubcategorie(DEMO, '3.1', { valoareTarif: 1 })).rejects.toThrow();
    await mockData.taxonomie.modificaSubcategorie(ADMIN, '3.1', { valoareTarif: 0.45, activa: false });
    const sc = (await mockData.taxonomie.subcategorii()).find((s) => s.cod === '3.1')!;
    expect(sc).toMatchObject({ valoareTarif: 0.45, activa: false });
    await expect(
      mockData.taxonomie.modificaSubcategorie(ADMIN, '3.1', { valoareTarif: -1 }),
    ).rejects.toThrow();
  });

  it('toleranța se schimbă doar la regulile cu prag numeric', async () => {
    await expect(mockData.taxonomie.modificaRegula(ADMIN, 'R01', { toleranta: 0.05 })).rejects.toThrow(
      /prag/,
    );
    await mockData.taxonomie.modificaRegula(ADMIN, 'R02', { toleranta: 0.02 });
    const r02 = (await mockData.taxonomie.reguli(ADMIN)).find((r) => r.cod === 'R02')!;
    expect(r02.toleranta).toBe(0.02);
  });

  it('o regulă dezactivată nu mai apare în raport', async () => {
    await mockData.taxonomie.modificaRegula(ADMIN, 'R13', { activa: false });
    const raport = await mockData.verificari.raport(ADMIN, 'LOT-2026-0418');
    expect(raport!.reguli.map((r) => r.cod)).not.toContain('R13');
    await mockData.taxonomie.modificaRegula(ADMIN, 'R13', { activa: true });
  });
});

describe('organizația colectorului', () => {
  it('visa reînnoită merge la verificare și dispare din „De rezolvat”', async () => {
    const inainte = await mockData.panou.colector(DEMO);
    expect(inainte.deRezolvat.some((d) => d.titlu.startsWith('Visa anuală'))).toBe(true);
    await mockData.organizatie.inlocuiesteDocument(DEMO, 'VISA_ANUALA', {
      nume: 'visa-2027.pdf',
      marime: '300 KB',
    });
    const c = (await mockData.colectori.get(DEMO, ORG_DEMO))!;
    expect(c.onboarding.documente.find((d) => d.tip === 'VISA_ANUALA')!.stare).toBe('DE_VERIFICAT');
    const dupa = await mockData.panou.colector(DEMO);
    expect(dupa.deRezolvat.some((d) => d.titlu.startsWith('Visa anuală'))).toBe(false);
  });

  it('un colector neactivat nu folosește /organizatie pentru documente', async () => {
    await expect(
      mockData.organizatie.inlocuiesteDocument(
        { organizatieId: ORG_ECOREC, rol: 'COLECTOR' },
        'VISA_ANUALA',
        {
          nume: 'x.pdf',
          marime: '1 KB',
        },
      ),
    ).rejects.toThrow(/activare/);
  });
});

describe('loturile văzute de admin', () => {
  it('nu includ ciornele colectorilor', async () => {
    const admin = await mockData.loturi.list(ADMIN, parseFiltre({ status: 'CIORNA' }));
    expect(admin.total).toBe(0);
    const colector = await mockData.loturi.list(DEMO, parseFiltre({ status: 'CIORNA' }));
    expect(colector.total).toBeGreaterThan(0);
  });
});
