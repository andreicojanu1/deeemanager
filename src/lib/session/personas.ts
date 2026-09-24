import type { Session } from './types';

/**
 * Conturile de test din Faza A. În Faza B sesiunea vine din Auth.js,
 * iar acest fișier dispare.
 */
export const PERSONAS = {
  'colector-activ': {
    utilizator: {
      id: 'u-colector-1',
      nume: 'Andrei Constantin',
      email: 'andrei@colectordemo.ro',
      initiale: 'AC',
    },
    organizatie: { id: 'org-colector-demo', denumire: 'Colector Demo SRL', eticheta: 'Colector' },
    rol: 'COLECTOR',
    statusCont: 'ACTIV',
  },
  'colector-neactivat': {
    utilizator: { id: 'u-colector-2', nume: 'Maria Ionescu', email: 'maria@ecorecilfov.ro', initiale: 'MI' },
    organizatie: {
      id: 'org-ecorec-ilfov',
      denumire: 'EcoRec Ilfov SRL',
      eticheta: 'Colector · cont neactivat',
    },
    rol: 'COLECTOR',
    statusCont: 'NEACTIVAT',
  },
  admin: {
    utilizator: { id: 'u-admin-1', nume: 'Elena Wagner', email: 'elena@ewastecollect.ro', initiale: 'EW' },
    organizatie: {
      id: 'org-electronic-waste-collect',
      denumire: 'Electronic Waste Collect',
      eticheta: 'Administrator platformă',
    },
    rol: 'ADMIN',
    statusCont: 'ACTIV',
  },
} as const satisfies Record<string, Session>;

export type PersonaKey = keyof typeof PERSONAS;

export const SESSION_COOKIE = 'deee_sesiune_test';

/** Parola comună a conturilor de test din Faza A. */
export const PAROLA_DEMO = 'DeeeDemo2026!';

export function personaDupaEmail(email: string): PersonaKey | null {
  const e = email.trim().toLowerCase();
  const gasit = (Object.keys(PERSONAS) as PersonaKey[]).find((k) => PERSONAS[k].utilizator.email === e);
  return gasit ?? null;
}

export const TIPURI_CONT = {
  COLECTOR: 'Colector',
  COLECTOR_TRATATOR: 'Colector / Tratator',
  TRATATOR: 'Tratator',
} as const;
export type TipCont = keyof typeof TIPURI_CONT;

/** Un cont creat prin /inregistrare. Faza A: datele stau în cookie (nesemnat, doar demo). */
export type ContNou = { n: string; e: string; t: TipCont };

const PREFIX_NOU = 'nou.';

export function codificaContNou(c: ContNou): string {
  const bytes = new TextEncoder().encode(JSON.stringify(c));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return PREFIX_NOU + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodificaContNou(v: string): ContNou | null {
  if (!v.startsWith(PREFIX_NOU)) return null;
  try {
    const b64 = v.slice(PREFIX_NOU.length).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const c = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))) as ContNou;
    if (typeof c.n !== 'string' || typeof c.e !== 'string' || !(c.t in TIPURI_CONT)) return null;
    return c;
  } catch {
    return null;
  }
}

const hash = (s: string) => {
  let h = 5381;
  for (const ch of s) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
};

export function sessionFromCookie(value: string | undefined): Session | null {
  if (!value) return null;
  if (value in PERSONAS) return PERSONAS[value as PersonaKey];
  const nou = decodificaContNou(value);
  if (!nou) return null;
  const id = hash(nou.e.toLowerCase());
  const initiale = nou.n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return {
    utilizator: { id: `u-nou-${id}`, nume: nou.n, email: nou.e, initiale: initiale || '?' },
    organizatie: {
      id: `org-nou-${id}`,
      denumire: 'Firmă nouă',
      eticheta: `${TIPURI_CONT[nou.t]} · cont neactivat`,
    },
    rol: 'COLECTOR',
    statusCont: 'NEACTIVAT',
  };
}

/** Pagina de start după autentificare, în funcție de rol și de statusul contului. */
export function homeFor(session: Session): string {
  if (session.rol === 'ADMIN') return '/admin';
  return session.statusCont === 'ACTIV' ? '/panou' : '/onboarding';
}
