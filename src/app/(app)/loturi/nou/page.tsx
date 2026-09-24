import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Lot nou' };

export default function Page() {
  return (
    <>
      <PageHeader title="Lot nou" subtitle="Încarcă un lot în 3 pași: informații, documente, confirmare." />
      <InLucru
        pas={6}
        descriere="Wizard-ul de lot cu autosalvare și lista de documente cerute (mockup 02 și 02b)."
      />
    </>
  );
}
