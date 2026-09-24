import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export default async function Page({ params }: PageProps<'/admin/colectori/[id]'>) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        title={decodeURIComponent(id)}
        subtitle="Date, documente de onboarding, vizită în teren, loturi, utilizatori."
      />
      <InLucru pas={10} descriere="Detaliul colectorului cu tab-uri." />
    </>
  );
}
