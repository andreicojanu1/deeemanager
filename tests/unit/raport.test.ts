import { describe, expect, it } from 'vitest';
import { PAGINA, regulaInitiala, zonaRand, type RegulaRaport } from '@/lib/domain/raport';
import { mockData } from '@/lib/mock';

const admin = { organizatieId: 'org-electronic-waste-collect', rol: 'ADMIN' as const };

describe('raportul de verificare', () => {
  it('zona unui rând cade pe rândul din pagină', () => {
    const doc = {
      randuri: [
        { cheie: 'A', eticheta: '', valoare: '' },
        { cheie: 'NET', eticheta: '', valoare: '' },
      ],
    };
    const z = zonaRand(doc, 'NET')!;
    expect(z.y).toBeCloseTo(PAGINA.sus + PAGINA.rand - 0.012);
    expect(z.h).toBe(PAGINA.rand);
    expect(zonaRand(doc, 'LIPSA')).toBeUndefined();
  });

  it('se deschide pe prima regulă roșie, apoi galbenă', () => {
    const r = (cod: string, rezultat: 'VERDE' | 'GALBEN' | 'ROSU'): RegulaRaport => ({
      cod,
      rezultat,
      nume: '',
      rezumat: '',
      severitate: 'BLOCANT',
      valori: [],
      documenteImplicate: [],
    });
    expect(regulaInitiala([r('R01', 'VERDE'), r('R08', 'GALBEN'), r('R02', 'ROSU')])).toBe('R02');
    expect(regulaInitiala([r('R01', 'VERDE'), r('R08', 'GALBEN')])).toBe('R08');
    expect(regulaInitiala([r('R01', 'VERDE')])).toBe('R01');
  });

  it('R02 pune față în față tichetul, avizul și declarația, cu zona din tichet', async () => {
    const raport = await mockData.verificari.raport(admin, 'LOT-2026-0418');
    const r02 = raport!.reguli.find((r) => r.cod === 'R02')!;
    expect(r02.valori.map((v) => v.valoare)).toEqual(['1.310 kg', '1.240 kg', '1.240 kg']);
    expect(r02.mesaj).toBe('Diferență 70 kg (5,6%) — peste toleranța de ±1%.');
    const tichet = raport!.documente.find((d) => d.id === r02.valori[0].documentId)!;
    expect(tichet.tip).toBe('TICHET_CANTAR');
    expect(r02.valori[0].zona).toEqual(zonaRand(tichet, 'NET'));
    expect(r02.documenteImplicate).toContain(tichet.id);
  });

  it('raportul e doar pentru admin', async () => {
    await expect(
      mockData.verificari.raport({ organizatieId: 'org-colector-demo', rol: 'COLECTOR' }, 'LOT-2026-0418'),
    ).rejects.toThrow();
  });
});
