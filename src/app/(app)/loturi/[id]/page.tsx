import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import BannerCompletari from '@/features/loturi/BannerCompletari';
import LotActiuni from '@/features/loturi/LotActiuni';
import LotTabs from '@/features/loturi/LotTabs';
import { contextDin, data } from '@/lib/data';
import { totalKg } from '@/lib/domain/lot';
import { formatDate, formatKg } from '@/lib/format';
import { requireSession } from '@/lib/session/server';

export async function generateMetadata({ params }: PageProps<'/loturi/[id]'>): Promise<Metadata> {
  const { id } = await params;
  return { title: decodeURIComponent(id) };
}

export default async function LotPage({ params }: PageProps<'/loturi/[id]'>) {
  const { id } = await params;
  const session = await requireSession();
  const lot = await data.loturi.get(contextDin(session), decodeURIComponent(id));
  // Un lot al altei organizații arată la fel ca unul inexistent.
  if (!lot) notFound();

  const subcategorii = Object.fromEntries(
    (await data.taxonomie.subcategorii()).map((s) => [s.cod, { denumire: s.denumire }]),
  );
  const linii = lot.linii.length === 1 ? '1 linie' : `${lot.linii.length} linii`;
  const continut = lot.linii
    .map((l) => `${l.subcategorieCod} ${subcategorii[l.subcategorieCod]?.denumire}`)
    .join(', ');
  const deInlocuit = lot.documente.filter((d) => lot.deInlocuit.includes(d.id));

  return (
    <>
      <PageHeader
        title={lot.id}
        badge={<StatusBadge status={lot.status} />}
        subtitle={`${linii} (${continut}) · ${formatKg(totalKg(lot))} · Punct de lucru ${lot.punctLucru} · preluat ${formatDate(lot.dataPreluarii)}`}
        action={<LotActiuni id={lot.id} status={lot.status} deInlocuit={deInlocuit.length} />}
      />
      {lot.status === 'NECESITA_COMPLETARI' ? (
        <BannerCompletari id={lot.id} motiv={lot.motiv} documente={deInlocuit} />
      ) : null}
      {lot.status === 'RESPINS' || lot.status === 'ANULAT' ? (
        <StatusMotiv status={lot.status} motiv={lot.motiv} />
      ) : null}
      <LotTabs lot={lot} subcategorii={subcategorii} />
    </>
  );
}

function StatusMotiv({ status, motiv }: { status: 'RESPINS' | 'ANULAT'; motiv?: string }) {
  if (!motiv) return null;
  return (
    <p style={{ margin: 0 }}>
      <strong>{status === 'RESPINS' ? 'Motivul respingerii: ' : 'Motivul anulării: '}</strong>
      {motiv}
    </p>
  );
}
