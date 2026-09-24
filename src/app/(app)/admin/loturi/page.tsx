import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Loturi' };

export default function Page() {
  return (
    <>
      <PageHeader title="Loturi" subtitle="Loturile tuturor colectorilor." />
      <InLucru pas={10} descriere="Aceeași listă ca la colector, plus coloana și filtrul Colector." />
    </>
  );
}
