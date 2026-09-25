import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import ArboreCategorii from '@/features/loturi/ArboreCategorii';
import FiltreLoturiBar from '@/features/loturi/FiltreLoturi';
import ListaLoturi from '@/features/loturi/ListaLoturi';
import { contextDin, data } from '@/lib/data';
import { filtreActive, parseFiltre } from '@/lib/domain/filtre';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Loturi' };

export default async function Page({ searchParams }: PageProps<'/admin/loturi'>) {
  const ctx = contextDin(await requireSession());
  const filtre = parseFiltre(await searchParams);
  const [categorii, subcategorii, coduri, optiuni] = await Promise.all([
    data.taxonomie.categorii(),
    data.taxonomie.subcategorii(),
    data.taxonomie.coduri(),
    data.loturi.optiuni(ctx),
  ]);
  const colectori = Object.fromEntries(optiuni.colectori.map((c) => [c.id, c.denumire]));

  return (
    <>
      <PageHeader title="Loturi" subtitle="Loturile trimise de toți colectorii. Ciornele rămân private." />
      <FiltreLoturiBar
        filtre={filtre}
        categorii={categorii}
        subcategorii={subcategorii}
        coduri={coduri}
        puncteLucru={optiuni.puncteLucru}
        colectori={optiuni.colectori}
      />
      {filtre.vedere === 'categorii' ? (
        <ArboreCategorii noduri={await data.loturi.arbore(ctx, filtre)} />
      ) : (
        <ListaLoturi
          pagina={await data.loturi.list(ctx, filtre)}
          filtrate={filtreActive(filtre)}
          colectori={colectori}
          hrefBaza="/admin/verificari/"
        />
      )}
    </>
  );
}
