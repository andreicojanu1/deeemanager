import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import TaxonomieTabs from '@/features/admin/TaxonomieTabs';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Taxonomie' };

export default async function Page() {
  const ctx = contextDin(await requireSession());
  const [categorii, subcategorii, coduri, reguli] = await Promise.all([
    data.taxonomie.categorii(),
    data.taxonomie.subcategorii(),
    data.taxonomie.coduri(),
    data.taxonomie.reguli(ctx),
  ]);
  return (
    <>
      <PageHeader
        title="Taxonomie"
        subtitle="Categorii, subcategorii și tarife, codurile de deșeu și regulile de verificare."
      />
      <TaxonomieTabs
        categorii={categorii}
        subcategorii={structuredClone(subcategorii)}
        coduri={structuredClone(coduri)}
        reguli={reguli}
      />
    </>
  );
}
