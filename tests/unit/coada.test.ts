import { describe, expect, it } from 'vitest';
import { durata, prioritate } from '@/lib/domain/coada';
import { mockData } from '@/lib/mock';
import { ORG_DEMO } from '@/lib/mock/seed/loturi';

const admin = { organizatieId: 'org-electronic-waste-collect', rol: 'ADMIN' as const };
const colector = { organizatieId: ORG_DEMO, rol: 'COLECTOR' as const };

describe('prioritatea în coadă', () => {
  it('roșu → ridicată, galben → medie, altfel normală', () => {
    expect(prioritate({ VERDE: 10, GALBEN: 1, ROSU: 1, NA: 1 })).toBe('RIDICATA');
    expect(prioritate({ VERDE: 11, GALBEN: 2, ROSU: 0, NA: 0 })).toBe('MEDIE');
    expect(prioritate({ VERDE: 13, GALBEN: 0, ROSU: 0, NA: 0 })).toBe('NORMALA');
  });

  it('durate în format românesc', () => {
    expect(durata(18)).toBe('18 min');
    expect(durata(134)).toBe('2 h 14 min');
    expect(durata(60 * 29)).toBe('1 zi 5 h');
    expect(durata(60 * 48)).toBe('2 zile');
  });
});

describe('coada în stratul de date', () => {
  it('sortează după prioritate, apoi după vechime', async () => {
    const { deVerificat } = await mockData.verificari.coada(admin);
    const rang = { RIDICATA: 0, MEDIE: 1, NORMALA: 2 };
    for (let i = 1; i < deVerificat.length; i++) {
      const a = deVerificat[i - 1];
      const b = deVerificat[i];
      expect(
        rang[a.prioritate] < rang[b.prioritate] ||
          (a.prioritate === b.prioritate && a.trimisLa <= b.trimisLa),
      ).toBe(true);
    }
    expect(deVerificat[0].prioritate).toBe('RIDICATA');
  });

  it('colectorul nu are acces la coadă și nu poate decide', async () => {
    await expect(mockData.verificari.coada(colector)).rejects.toThrow('Acces interzis');
    await expect(
      mockData.verificari.decide(colector, 'LOT-2026-0418', 'ACCEPTAT', '', 'x'),
    ).rejects.toThrow();
  });

  it('decizia salvează adminul, ora și motivul; lotul iese din coadă', async () => {
    await mockData.verificari.decide(
      admin,
      'LOT-2026-0418',
      'NECESITA_COMPLETARI',
      'Tichetul diferă de aviz.',
      'Elena Wagner',
    );
    const { deVerificat, asteaptaColectorul } = await mockData.verificari.coada(admin);
    expect(deVerificat.map((r) => r.id)).not.toContain('LOT-2026-0418');
    expect(asteaptaColectorul.map((r) => r.id)).toContain('LOT-2026-0418');
    const lot = await mockData.loturi.get(colector, 'LOT-2026-0418');
    expect(lot?.status).toBe('NECESITA_COMPLETARI');
    expect(lot?.motiv).toBe('Tichetul diferă de aviz.');
    expect(lot?.verificare?.decizie?.de).toBe('Elena Wagner');
    expect(lot?.deInlocuit.length).toBeGreaterThan(0);
    await expect(mockData.verificari.decide(admin, 'LOT-2026-0418', 'ACCEPTAT', '', 'x')).rejects.toThrow(
      'deja decis',
    );
  });

  it('respingerea cere motiv', async () => {
    await expect(mockData.verificari.decide(admin, 'LOT-2026-0413', 'RESPINS', ' ', 'x')).rejects.toThrow(
      'motivul',
    );
  });
});
