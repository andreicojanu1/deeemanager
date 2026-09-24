import { describe, expect, it } from 'vitest';
import { evalueazaParola, parolaAcceptata } from '@/lib/domain/parola';
import { ibanValid } from '@/lib/domain/identificatori';
import {
  PAROLA_DEMO,
  codificaContNou,
  decodificaContNou,
  homeFor,
  personaDupaEmail,
  sessionFromCookie,
} from '@/lib/session/personas';

describe('parola', () => {
  it('cere lungime, litere mari și mici, cifră și simbol', () => {
    expect(evalueazaParola('abc').nivel).toBe(0);
    expect(parolaAcceptata('parolalunga')).toBe(false);
    expect(parolaAcceptata('Parola2026')).toBe(true);
    expect(evalueazaParola('Parola2026!').nivel).toBe(4);
    expect(evalueazaParola('parolalunga').lipsa.length).toBeGreaterThan(0);
  });

  it('parola conturilor de test e acceptată de propriile reguli', () => {
    expect(parolaAcceptata(PAROLA_DEMO)).toBe(true);
  });
});

describe('IBAN', () => {
  it('validează IBAN-uri românești cu cifra de control', () => {
    expect(ibanValid('RO22BTRL0501202R12345678')).toBe(true);
    expect(ibanValid('RO21INGB0000999901234567')).toBe(true);
    expect(ibanValid('RO21INGB0000999901234568')).toBe(false);
    expect(ibanValid('RO21INGB00009999')).toBe(false);
    expect(ibanValid('')).toBe(false);
  });
});

describe('sesiunea unui cont nou', () => {
  it('cookie-ul codifică și decodifică numele cu diacritice', () => {
    const v = codificaContNou({ n: 'Ștefan Țurcanu', e: 'stefan@firma.ro', t: 'COLECTOR' });
    expect(v.startsWith('nou.')).toBe(true);
    expect(decodificaContNou(v)).toEqual({ n: 'Ștefan Țurcanu', e: 'stefan@firma.ro', t: 'COLECTOR' });
  });

  it('respinge valori alterate', () => {
    expect(decodificaContNou('nou.nu-e-json')).toBeNull();
    expect(decodificaContNou('altceva')).toBeNull();
    expect(sessionFromCookie('nou.xyz')).toBeNull();
  });

  it('un cont nou e colector neactivat, cu organizație proprie, și ajunge pe onboarding', () => {
    const s = sessionFromCookie(codificaContNou({ n: 'Ion Pop', e: 'ion@firma.ro', t: 'COLECTOR' }))!;
    expect(s.rol).toBe('COLECTOR');
    expect(s.statusCont).toBe('NEACTIVAT');
    expect(s.organizatie.id).toMatch(/^org-nou-/);
    expect(homeFor(s)).toBe('/onboarding');
    const alt = sessionFromCookie(codificaContNou({ n: 'Ana', e: 'ana@alta.ro', t: 'COLECTOR' }))!;
    expect(alt.organizatie.id).not.toBe(s.organizatie.id);
  });

  it('găsește conturile de test după email, fără diferență de majuscule', () => {
    expect(personaDupaEmail(' Andrei@ColectorDemo.ro ')).toBe('colector-activ');
    expect(personaDupaEmail('nimeni@firma.ro')).toBeNull();
  });
});
