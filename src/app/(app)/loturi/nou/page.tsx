import type { Metadata } from 'next';
import { taxonomieWizard } from '@/features/wizard/incarca';
import Wizard from '@/features/wizard/Wizard';
import { contextDin } from '@/lib/data';
import { ciornaNoua } from '@/lib/domain/ciorna';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Lot nou' };

export default async function LotNouPage() {
  const session = await requireSession();
  const tx = await taxonomieWizard(contextDin(session));
  const azi = new Date().toISOString().slice(0, 10);
  return <Wizard initial={ciornaNoua(azi, tx.puncteLucru[0] ?? '')} tx={tx} />;
}
