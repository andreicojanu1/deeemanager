import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Cont' };

export default function Page() {
  return (
    <>
      <PageHeader title="Cont" subtitle="Datele tale de autentificare și preferințele." />
      <InLucru pas={10} descriere="Nume, email și schimbarea parolei." />
    </>
  );
}
