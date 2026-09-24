import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { taxonomieWizard } from '@/features/wizard/incarca';
import Wizard from '@/features/wizard/Wizard';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export async function generateMetadata({ params }: PageProps<'/loturi/[id]/editare'>): Promise<Metadata> {
  const { id } = await params;
  return { title: `Editează ${decodeURIComponent(id)}` };
}

export default async function EditarePage({ params }: PageProps<'/loturi/[id]/editare'>) {
  const { id } = await params;
  const lotId = decodeURIComponent(id);
  const ctx = contextDin(await requireSession());
  const ciorna = await data.loturi.ciorna(ctx, lotId);
  // Doar ciornele și loturile cu completări cerute se pot edita.
  if (!ciorna) redirect(`/loturi/${lotId}`);
  return <Wizard key={lotId} initial={ciorna} tx={await taxonomieWizard(ctx)} />;
}
