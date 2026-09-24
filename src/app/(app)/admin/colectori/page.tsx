import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Colectori' };

export default function Page() {
  return (
    <>
      <PageHeader title="Colectori" subtitle="Conturile colectorilor și statusul lor." />
      <InLucru pas={10} descriere="Tabelul colectorilor cu filtre." />
    </>
  );
}
