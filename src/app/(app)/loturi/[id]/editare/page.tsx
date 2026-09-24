import PageHeader from '@/components/layout/PageHeader';
import InLucru from '@/components/ui/InLucru';

export default async function Page({ params }: PageProps<'/loturi/[id]/editare'>) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        title={decodeURIComponent(id)}
        subtitle="Același wizard, pe o ciornă sau pe un lot cu completări cerute."
      />
      <InLucru pas={6} descriere="Wizard-ul de lot în modul editare." />
    </>
  );
}
