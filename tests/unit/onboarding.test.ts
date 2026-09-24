import { describe, expect, it } from 'vitest';
import { mockData } from '@/lib/mock';
import {
  ceLipseste,
  grupeazaIban,
  onboardingNou,
  poateTrimite,
  valideazaFirma,
  FIRMA_GOALA,
} from '@/lib/domain/onboarding';
import { ORG_ECOREC } from '@/lib/mock/onboarding';
import type { DataContext } from '@/lib/data/types';

const ctxNou = (id: string): DataContext => ({ organizatieId: id, rol: 'COLECTOR' });

describe('validarea datelor firmei', () => {
  it('cere CUI verificat la ANAF, punct de lucru, bancă și IBAN valid', () => {
    const e = valideazaFirma(FIRMA_GOALA);
    expect(Object.keys(e).sort()).toEqual(['banca', 'cui', 'iban', 'punctLucru']);
    const ok = valideazaFirma({
      cui: '30118904',
      cuiVerificatAnaf: true,
      denumire: 'EcoRec Ilfov SRL',
      adresaSediu: '',
      punctLucru: 'Str. Depozitelor 4',
      banca: 'ING Bank',
      iban: 'ro21 ingb 0000 9999 0123 4567',
    });
    expect(ok).toEqual({});
  });

  it('CUI valid, dar neverificat încă la ANAF, nu e suficient', () => {
    expect(valideazaFirma({ ...FIRMA_GOALA, cui: '30118904' }).cui).toMatch(/ANAF/);
  });

  it('grupează IBAN-ul câte 4 caractere', () => {
    expect(grupeazaIban('RO21INGB0000999901234567')).toBe('RO21 INGB 0000 9999 0123 4567');
  });
});

describe('ce lipsește din dosar', () => {
  it('un dosar nou are nevoie de date, 9 documente și confirmarea autorizației', () => {
    const o = onboardingNou('x');
    expect(ceLipseste(o)).toHaveLength(10);
    expect(poateTrimite(o)).toBe(false);
  });
});

describe('onboarding în stratul mock', () => {
  it('colectorul demo neactivat are extrasul ONRC respins, cu motiv', async () => {
    const o = await mockData.onboarding.get(ctxNou(ORG_ECOREC));
    const onrc = o.documente.find((d) => d.tip === 'EXTRAS_ONRC')!;
    expect(onrc.stare).toBe('RESPINS');
    expect(onrc.motiv).toMatch(/30 de zile/);
    expect(ceLipseste(o)).toContain('Extras ONRC (respins)');
  });

  it('fluxul complet: date firmă, documente, confirmare autorizație, trimitere', async () => {
    const ctx = ctxNou('org-test-flux');
    await expect(mockData.onboarding.trimite(ctx)).rejects.toThrow(/Mai ai de completat/);

    await mockData.onboarding.salveazaFirma(ctx, {
      cui: 'RO30118904',
      cuiVerificatAnaf: true,
      denumire: 'orice, se ignoră',
      adresaSediu: '',
      punctLucru: 'Str. Depozitelor 4',
      banca: 'ING Bank',
      iban: 'RO21 INGB 0000 9999 0123 4567',
    });
    let o = await mockData.onboarding.get(ctx);
    expect(o.firma.denumire).toBe('EcoRec Ilfov SRL');
    expect(o.firma.iban).toBe('RO21INGB0000999901234567');

    for (const d of o.documente) {
      o = await mockData.onboarding.incarcaDocument(ctx, d.tip, { nume: `${d.tip}.pdf`, marime: '200 KB' });
    }
    expect(o.autorizatie?.confirmat).toBe(false);
    expect(ceLipseste(o)).toEqual(['Confirmarea datelor din autorizația de mediu']);

    const a = o.autorizatie!;
    o = await mockData.onboarding.confirmaAutorizatie(ctx, { ...a, coduri: [...a.coduri, '20 01 21*'] });
    expect(o.autorizatie).toMatchObject({ confirmat: true, corectat: true });

    o = await mockData.onboarding.trimite(ctx);
    expect(o.etapa).toBe('IN_VERIFICARE');
    expect(o.documente.every((d) => d.stare === 'DE_VERIFICAT')).toBe(true);
    await expect(
      mockData.onboarding.incarcaDocument(ctx, 'DECLARATIE_GDPR', { nume: 'x.pdf', marime: '1 KB' }),
    ).rejects.toThrow(/trimis/);
  });

  it('coduri de deșeu în format greșit sunt respinse', async () => {
    const ctx = ctxNou('org-test-coduri');
    const o = await mockData.onboarding.incarcaDocument(ctx, 'AUTORIZATIE_MEDIU', {
      nume: 'a.pdf',
      marime: '1 MB',
    });
    await expect(
      mockData.onboarding.confirmaAutorizatie(ctx, { ...o.autorizatie!, coduri: ['200136'] }),
    ).rejects.toThrow();
  });

  it('fiecare organizație își vede doar propriul dosar', async () => {
    const a = ctxNou('org-izolare-a');
    const b = ctxNou('org-izolare-b');
    await mockData.onboarding.incarcaDocument(a, 'DECLARATIE_GDPR', { nume: 'gdpr-a.pdf', marime: '1 KB' });
    const ob = await mockData.onboarding.get(b);
    expect(ob.documente.find((d) => d.tip === 'DECLARATIE_GDPR')!.stare).toBe('LIPSA');
  });
});
