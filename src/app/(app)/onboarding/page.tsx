import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Onboarding from '@/features/onboarding/Onboarding';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Activează-ți contul' };

export default async function Page() {
  const session = await requireSession();
  if (session.rol !== 'COLECTOR') redirect('/admin');
  if (session.statusCont === 'ACTIV') redirect('/panou');
  const initial = await data.onboarding.get(contextDin(session));
  return <Onboarding initial={initial} />;
}
