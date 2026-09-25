'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { homeFor, PERSONAS, SESSION_COOKIE, type PersonaKey } from './personas';

export async function intraCaPersona(formData: FormData) {
  const key = formData.get('persona');
  if (typeof key !== 'string' || !Object.hasOwn(PERSONAS, key)) redirect('/autentificare');
  const store = await cookies();
  store.set(SESSION_COOKIE, key, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
  redirect(homeFor(PERSONAS[key as PersonaKey]));
}

export async function delogare() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/autentificare');
}
