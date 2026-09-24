/**
 * Datele de test ale fluxurilor de autentificare din Faza A.
 * În Faza B: Auth.js, coduri trimise pe email, tokenuri cu expirare în baza de date.
 */
export const COD_CONFIRMARE_DEMO = '246810';

/** Invitațiile trimise de administrator: token → email invitat. */
export const INVITATII: Record<string, { email: string; organizatie: string }> = {
  demo: { email: 'andrei@colectordemo.ro', organizatie: 'Colector Demo SRL' },
};

/** Tokenuri de resetare: „demo” e valid, „expirat” arată starea de link expirat. */
export const tokenResetareValid = (token: string) => token === 'demo';

export const COOKIE_INREGISTRARE = 'deee_inregistrare_test';
