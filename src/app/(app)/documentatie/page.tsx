import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Documentatie from '@/features/documentatie/Documentatie';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Documentație' };

export default async function Page() {
  const session = await requireSession();
  // Deocamdată documentația e scrisă pentru colectori.
  if (session.rol !== 'COLECTOR') redirect('/acces-interzis');
  return (
    <>
      <PageHeader
        title="Documentație"
        subtitle="Cum folosești DEEE Manager, pas cu pas: de la activarea contului până la lotul acceptat în stoc."
      />
      <Documentatie />
    </>
  );
}
