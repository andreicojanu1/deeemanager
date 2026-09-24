import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export default async function Page({ params }: PageProps<'/loturi/[id]'>) {
  const { id } = await params;
  return (
    <>
      <PageHeader title={decodeURIComponent(id)} subtitle="Rezumat, documente, verificare și istoric." />
      <InLucru pas={5} descriere="Detaliul lotului cu tab-uri și bannerul pentru completări." />
    </>
  );
}
