import { describe, expect, it } from 'vitest';
import { mockData } from '@/lib/mock';
import { ORG_ALT, ORG_DEMO } from '@/lib/mock/seed/loturi';

const colector = { organizatieId: ORG_DEMO, rol: 'COLECTOR' as const };

describe('panoul colectorului pe datele mock', () => {
  it('reproduce stocul din mockup-ul 01', async () => {
    const p = await mockData.panou.colector(colector);
    expect(p.stoc.totalKg).toBe(16771);
    expect(p.stoc.totalLoturi).toBe(41);
    expect(p.stoc.categorii.map((c) => c.kg)).toEqual([4860, 2315, 186, 7940, 1128, 342]);
    expect(p.stoc.categorii.map((c) => c.buc)).toEqual([38, 112, 1240, 96, 430, 860]);
    expect(p.stoc.categorii.map((c) => c.loturi)).toEqual([6, 9, 3, 11, 7, 5]);
  });

  it('reproduce intrările lunare', async () => {
    const p = await mockData.panou.colector(colector);
    expect(p.intrari.map((i) => i.eticheta)).toEqual(['apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sep.']);
    expect(p.intrari.map((i) => i.kg)).toEqual([1920, 2480, 2150, 3060, 2870, 3410]);
    expect(p.intrari.at(-1)?.curenta).toBe(true);
  });

  it('„De rezolvat”: lotul cu completări și visa care expiră', async () => {
    const p = await mockData.panou.colector(colector);
    expect(p.deRezolvat.map((d) => d.titlu)).toEqual([
      'LOT-2026-0412 · Necesită completări',
      'Visa anuală a autorizației de mediu expiră în 18 zile',
    ]);
  });

  it('ultimele loturi, ca în mockup', async () => {
    const p = await mockData.panou.colector(colector);
    expect(p.ultimeleLoturi.map((l) => l.id)).toEqual([
      'LOT-2026-0418',
      'LOT-2026-0415',
      'LOT-2026-0412',
      'LOT-2026-0409',
      'LOT-2026-0406',
    ]);
  });
});

describe('izolarea datelor între organizații', () => {
  it('un colector nu vede loturile altuia', async () => {
    const demo = await mockData.panou.colector(colector);
    const alt = await mockData.panou.colector({ organizatieId: ORG_ALT, rol: 'COLECTOR' });
    expect(demo.ultimeleLoturi.map((l) => l.id)).not.toContain('LOT-2026-0417');
    expect(alt.ultimeleLoturi.map((l) => l.id)).toEqual(['LOT-2026-0417', 'LOT-2026-0402']);
    expect(alt.stoc.totalKg).toBe(1150);
  });

  it('o organizație necunoscută nu vede nimic', async () => {
    const p = await mockData.panou.colector({ organizatieId: 'org-inexistenta', rol: 'COLECTOR' });
    expect(p.stoc.totalLoturi).toBe(0);
    expect(p.ultimeleLoturi).toEqual([]);
    expect(p.deRezolvat).toEqual([]);
  });

  it('coada de verificare e doar pentru admin', async () => {
    await expect(mockData.verificari.numarInCoada(colector)).rejects.toThrow('Acces interzis');
    await expect(mockData.verificari.numarInCoada({ organizatieId: 'x', rol: 'ADMIN' })).resolves.toBe(2);
  });
});
