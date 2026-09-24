import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export default async function Page({ params }: PageProps<'/admin/verificari/[lotId]'>) {
  const { lotId } = await params;
  return (
    <>
      <PageHeader title={decodeURIComponent(lotId)} subtitle="Raportul de verificare al lotului." />
      <InLucru
        pas={8}
        descriere="Split view: regulile R01–R13 și documentul cu zona sursă evidențiată (mockup 03)."
      />
    </>
  );
}
