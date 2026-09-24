import type { Metadata } from 'next';
import { IconPlus } from '@tabler/icons-react';
import PageHeader from '@/components/layout/PageHeader';
import ButtonLink from '@/components/ui/ButtonLink';
import ArboreCategorii from '@/features/loturi/ArboreCategorii';
import FiltreLoturiBar from '@/features/loturi/FiltreLoturi';
import ListaLoturi from '@/features/loturi/ListaLoturi';
import { contextDin, data } from '@/lib/data';
import { filtreActive, parseFiltre } from '@/lib/domain/filtre';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Loturi' };

export default async function LoturiPage({ searchParams }: PageProps<'/loturi'>) {
  const session = await requireSession();
  const ctx = contextDin(session);
  const filtre = parseFiltre(await searchParams);
  const [categorii, subcategorii, coduri, optiuni] = await Promise.all([
    data.taxonomie.categorii(),
    data.taxonomie.subcategorii(),
    data.taxonomie.coduri(),
    data.loturi.optiuni(ctx),
  ]);
  const vedere = filtre.vedere ?? 'lista';

  return (
    <>
      <PageHeader
        title="Loturi"
        subtitle="Toate loturile tale, cu filtre și vedere pe categorii."
        action={
          <ButtonLink href="/loturi/nou" variant="contained" startIcon={<IconPlus size={18} stroke={1.5} />}>
            Lot nou
          </ButtonLink>
        }
      />
      <FiltreLoturiBar
        filtre={filtre}
        categorii={categorii}
        subcategorii={subcategorii}
        coduri={coduri}
        puncteLucru={optiuni.puncteLucru}
        colectori={optiuni.colectori}
      />
      {vedere === 'categorii' ? (
        <ArboreCategorii noduri={await data.loturi.arbore(ctx, filtre)} />
      ) : (
        <ListaLoturi
          pagina={await data.loturi.list(ctx, filtre)}
          filtrate={filtreActive(filtre)}
          hrefBaza="/loturi/"
          hrefLotNou="/loturi/nou"
        />
      )}
    </>
  );
}
