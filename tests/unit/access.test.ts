import { describe, expect, it } from 'vitest';
import { breadcrumbsFor, navFor } from '@/components/layout/nav';
import { decideAccess } from '@/lib/session/access';
import { PERSONAS } from '@/lib/session/personas';
import type { Session } from '@/lib/session/types';

const colector = PERSONAS['colector-activ'];
const neactivat = PERSONAS['colector-neactivat'];
const admin = PERSONAS.admin;

describe('reguli de acces pe rute', () => {
  it('fără sesiune: doar autentificarea și paginile publice', () => {
    expect(decideAccess('/panou', null)).toEqual({ type: 'redirect', to: '/autentificare' });
    expect(decideAccess('/admin/verificari', null)).toEqual({ type: 'redirect', to: '/autentificare' });
    expect(decideAccess('/autentificare', null)).toEqual({ type: 'allow' });
    expect(decideAccess('/resetare-parola/abc', null)).toEqual({ type: 'allow' });
    expect(decideAccess('/acces-interzis', null)).toEqual({ type: 'allow' });
  });

  it('rădăcina și autentificarea trimit la pagina de start a rolului', () => {
    expect(decideAccess('/', colector)).toEqual({ type: 'redirect', to: '/panou' });
    expect(decideAccess('/', neactivat)).toEqual({ type: 'redirect', to: '/onboarding' });
    expect(decideAccess('/', admin)).toEqual({ type: 'redirect', to: '/admin' });
    expect(decideAccess('/autentificare', admin)).toEqual({ type: 'redirect', to: '/admin' });
  });

  it('colectorul nu intră pe rutele de admin', () => {
    expect(decideAccess('/admin', colector)).toEqual({ type: 'redirect', to: '/acces-interzis' });
    expect(decideAccess('/admin/verificari/LOT-1', colector)).toEqual({
      type: 'redirect',
      to: '/acces-interzis',
    });
    expect(decideAccess('/loturi/nou', colector)).toEqual({ type: 'allow' });
  });

  it('adminul nu intră pe rutele colectorului, dar are acces la Cont', () => {
    expect(decideAccess('/panou', admin)).toEqual({ type: 'redirect', to: '/acces-interzis' });
    expect(decideAccess('/admin/taxonomie', admin)).toEqual({ type: 'allow' });
    expect(decideAccess('/cont', admin)).toEqual({ type: 'allow' });
  });

  it('colectorul neactivat e trimis la onboarding', () => {
    expect(decideAccess('/panou', neactivat)).toEqual({ type: 'redirect', to: '/onboarding' });
    expect(decideAccess('/loturi/nou', neactivat)).toEqual({ type: 'redirect', to: '/onboarding' });
    expect(decideAccess('/onboarding', neactivat)).toEqual({ type: 'allow' });
    expect(decideAccess('/cont', neactivat)).toEqual({ type: 'allow' });
  });

  it('nu confundă prefixele (ex. /administrare nu e /admin)', () => {
    expect(decideAccess('/administrare', colector)).toEqual({ type: 'allow' });
  });
});

describe('breadcrumb', () => {
  it('urmează mockup-urile', () => {
    expect(breadcrumbsFor('/panou').map((c) => c.label)).toEqual(['Panou']);
    expect(breadcrumbsFor('/loturi/nou').map((c) => c.label)).toEqual(['Loturi', 'Lot nou']);
    expect(breadcrumbsFor('/admin/verificari/LOT-2026-0418').map((c) => c.label)).toEqual([
      'Coada de verificare',
      'LOT-2026-0418',
    ]);
    expect(breadcrumbsFor('/admin').map((c) => c.label)).toEqual(['Panou']);
  });
});

describe('documentația', () => {
  it('e deschisă colectorilor, inclusiv celor care își activează contul, și închisă adminului', () => {
    expect(decideAccess('/documentatie', colector)).toEqual({ type: 'allow' });
    expect(decideAccess('/documentatie', neactivat)).toEqual({ type: 'allow' });
    expect(decideAccess('/documentatie', admin)).toEqual({ type: 'redirect', to: '/acces-interzis' });
  });

  it('apare jos în meniul colectorului, nu și la admin', () => {
    const jos = (s: Session) => navFor(s, { verificariInCoada: 0 }).filter((i) => i.jos);
    expect(jos(colector).map((i) => i.href)).toEqual(['/documentatie']);
    expect(jos(neactivat).map((i) => i.href)).toEqual(['/documentatie']);
    expect(jos(admin)).toEqual([]);
  });
});
