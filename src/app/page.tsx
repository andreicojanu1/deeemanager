import { redirect } from 'next/navigation';
import { homeFor } from '@/lib/session/personas';
import { getSession } from '@/lib/session/server';

// Proxy-ul redirecționează deja „/”; aici e doar plasa de siguranță.
export default async function Home() {
  const session = await getSession();
  redirect(session ? homeFor(session) : '/autentificare');
}
