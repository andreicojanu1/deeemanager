import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import DialogColectorNou from '@/features/admin/DialogColectorNou';
import ListaColectori from '@/features/admin/ListaColectori';
import { contextDin, data } from '@/lib/data';
import { ETICHETA_STATUS_CONT, type FiltreColectori, type StatusCont } from '@/lib/domain/colectori';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Colectori' };

export default async function Page({ searchParams }: PageProps<'/admin/colectori'>) {
  const sp = await searchParams;
  const unu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = unu(sp.status);
  const filtre: FiltreColectori = {
    q: unu(sp.q)?.slice(0, 80) || undefined,
    status: status && Object.hasOwn(ETICHETA_STATUS_CONT, status) ? (status as StatusCont) : undefined,
  };
  const session = await requireSession();
  const randuri = await data.colectori.list(contextDin(session), filtre);
  return (
    <>
      <PageHeader
        title="Colectori"
        subtitle="Firmele colectoare, statusul contului și loturile lor."
        action={<DialogColectorNou />}
      />
      <ListaColectori key={`${filtre.status ?? ''}`} randuri={randuri} filtre={filtre} />
    </>
  );
}
