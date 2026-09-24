import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Taxonomie' };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Taxonomie"
        subtitle="Categorii, subcategorii, coduri de deșeu și reguli de verificare."
      />
      <InLucru pas={10} descriere="Arborele editabil, codurile de deșeu și regulile cu toleranțe." />
    </>
  );
}
