import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Panou' };

export default function Page() {
  return (
    <>
      <PageHeader title="Panou" subtitle="Stoc actual și ce ai de făcut azi." />
      <InLucru
        pas={4}
        descriere="Blocul „De rezolvat”, stocul pe cele 6 categorii, graficele și ultimele loturi (mockup 01)."
      />
    </>
  );
}
