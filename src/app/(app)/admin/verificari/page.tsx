import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Coada de verificare' };

export default function Page() {
  return (
    <>
      <PageHeader title="Coada de verificare" subtitle="Loturile care așteaptă decizia ta." />
      <InLucru pas={7} descriere="Tabelul cozii cu scurtături de tastatură (mockup 04)." />
    </>
  );
}
