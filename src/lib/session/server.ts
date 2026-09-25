import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, sessionFromCookie } from './personas';
import { initiale, numeSchimbat } from './profil';
import type { Session } from './types';

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const s = sessionFromCookie(store.get(SESSION_COOKIE)?.value);
  const nume = s && numeSchimbat(s.utilizator.id);
  return s && nume ? { ...s, utilizator: { ...s.utilizator, nume, initiale: initiale(nume) } } : s;
}

/** Pentru paginile din aplicație: proxy-ul garantează deja sesiunea, aici doar o citim tipat. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/autentificare');
  return session;
}
