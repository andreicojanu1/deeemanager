import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Loturi' };

export default function Page() {
  return (
    <>
      <PageHeader title="Loturi" subtitle="Toate loturile tale, cu filtre și vedere pe categorii." />
      <InLucru
        pas={5}
        descriere="Tabelul de loturi, filtrele păstrate în URL și arborele categorie → subcategorie → cod."
      />
    </>
  );
}
