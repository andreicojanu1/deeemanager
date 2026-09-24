import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Panou' };

export default function Page() {
  return (
    <>
      <PageHeader title="Panou" subtitle="Situația platformei azi." />
      <InLucru pas={10} descriere="Contoare, intrările pe platformă și conturile de verificat." />
    </>
  );
}
