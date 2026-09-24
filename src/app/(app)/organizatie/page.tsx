import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Organizație' };

export default function Page() {
  return (
    <>
      <PageHeader title="Organizație" subtitle="Datele firmei, autorizația de mediu și documentele." />
      <InLucru pas={10} descriere="Datele organizației și documentele care expiră." />
    </>
  );
}
