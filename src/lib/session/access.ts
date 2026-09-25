import { homeFor } from './personas';
import type { Session } from './types';

/** Paginile de autentificare: accesibile fără sesiune. */
const AUTH_PREFIXES = [
  '/autentificare',
  '/inregistrare',
  '/confirmare-email',
  '/recuperare-parola',
  '/resetare-parola',
  '/activare-cont',
];

/** Pagini accesibile oricui, cu sau fără sesiune. */
const PUBLIC_PREFIXES = ['/acces-interzis', '/eroare'];

/** Pagini pe care le poate vedea un colector cu contul neactivat. */
const NEACTIVAT_ALLOWED = ['/onboarding', '/cont', '/documentatie'];

/** Pagini comune ambelor roluri. */
const SHARED = ['/cont'];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

export type AccessDecision = { type: 'allow' } | { type: 'redirect'; to: string };

/**
 * Regulile de acces pe rute (SPEC-ECRANE §10). Funcție pură, testată separat;
 * `proxy.ts` doar o aplică.
 */
export function decideAccess(path: string, session: Session | null): AccessDecision {
  if (matches(path, PUBLIC_PREFIXES)) return { type: 'allow' };

  if (matches(path, AUTH_PREFIXES)) {
    return session ? { type: 'redirect', to: homeFor(session) } : { type: 'allow' };
  }

  if (!session) return { type: 'redirect', to: '/autentificare' };

  if (path === '/') return { type: 'redirect', to: homeFor(session) };

  if (matches(path, SHARED)) return { type: 'allow' };

  const isAdminRoute = matches(path, ['/admin']);
  if (session.rol === 'ADMIN') {
    return isAdminRoute ? { type: 'allow' } : { type: 'redirect', to: '/acces-interzis' };
  }

  if (isAdminRoute) return { type: 'redirect', to: '/acces-interzis' };
  if (session.statusCont === 'NEACTIVAT' && !matches(path, NEACTIVAT_ALLOWED)) {
    return { type: 'redirect', to: '/onboarding' };
  }
  return { type: 'allow' };
}
