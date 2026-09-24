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

export function sessionFromCookie(value: string | undefined): Session | null {
  if (!value || !(value in PERSONAS)) return null;
  return PERSONAS[value as PersonaKey];
}

/** Pagina de start după autentificare, în funcție de rol și de statusul contului. */
export function homeFor(session: Session): string {
  if (session.rol === 'ADMIN') return '/admin';
  return session.statusCont === 'ACTIV' ? '/panou' : '/onboarding';
}
