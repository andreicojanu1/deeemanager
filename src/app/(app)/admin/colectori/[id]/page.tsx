import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ColectorTabs from '@/features/admin/ColectorTabs';
import { contextDin, data } from '@/lib/data';
import { ETICHETA_STATUS_CONT, TON_STATUS_CONT } from '@/lib/domain/colectori';
import { parseFiltre } from '@/lib/domain/filtre';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session/server';

const INCARCA = async (id: string) => {
  const ctx = contextDin(await requireSession());
  return data.colectori.get(ctx, decodeURIComponent(id));
};

export async function generateMetadata({ params }: PageProps<'/admin/colectori/[id]'>): Promise<Metadata> {
  const c = await INCARCA((await params).id);
  return { title: c?.rand.denumire ?? 'Colector' };
}

export default async function Page({ params }: PageProps<'/admin/colectori/[id]'>) {
  const { id } = await params;
  const colector = await INCARCA(id);
  if (!colector) notFound();
  const ctx = contextDin(await requireSession());
  const pagina = await data.loturi.list(ctx, parseFiltre({ colector: colector.rand.id }));
  const { rand } = colector;
  return (
    <>
      <PageHeader
        title={rand.denumire}
        badge={<StatusBadge tone={TON_STATUS_CONT[rand.status]} label={ETICHETA_STATUS_CONT[rand.status]} />}
        subtitle={
          <span className="num">
            CUI {rand.cui} · {rand.localitate} · înregistrat {formatDate(rand.inregistratLa)}
          </span>
        }
      />
      <ColectorTabs
        colector={colector}
        loturi={{ randuri: pagina.randuri.slice(0, 10), total: pagina.total }}
        azi={colector.acum.slice(0, 10)}
      />
    </>
  );
}
