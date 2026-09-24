import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RaportVerificare from '@/features/verificare/RaportVerificare';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export async function generateMetadata({
  params,
}: PageProps<'/admin/verificari/[lotId]'>): Promise<Metadata> {
  const { lotId } = await params;
  return { title: `Raport ${decodeURIComponent(lotId)}` };
}

export default async function RaportPage({ params }: PageProps<'/admin/verificari/[lotId]'>) {
  const { lotId } = await params;
  const session = await requireSession();
  const ctx = contextDin(session);
  const raport = await data.verificari.raport(ctx, decodeURIComponent(lotId));
  if (!raport) notFound();
  const subcategorii = new Map((await data.taxonomie.subcategorii()).map((s) => [s.cod, s.denumire]));
  const linii = raport.lot.linii;
  const continut = `${linii.length === 1 ? '1 linie' : `${linii.length} linii`} (${linii
    .map((l) => `${l.subcategorieCod} ${subcategorii.get(l.subcategorieCod) ?? ''}`)
    .join(', ')})`;
  return (
    <RaportVerificare
      key={raport.lot.id}
      lot={raport.lot}
      colector={raport.colector}
      reguli={raport.reguli}
      documente={raport.documente}
      urmatorul={raport.urmatorul}
      continut={continut}
    />
  );
}
