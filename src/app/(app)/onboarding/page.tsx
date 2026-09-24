import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Activează-ți contul' };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Activează-ți contul"
        subtitle="Încarcă documentele firmei ca să poți trimite loturi."
      />
      <InLucru
        pas={9}
        descriere="Stepper-ul de activare, datele firmei din ANAF și documentele de onboarding."
      />
    </>
  );
}
