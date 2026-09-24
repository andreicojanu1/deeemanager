import 'server-only';
import type { DataContext } from '@/lib/data/types';
import { data } from '@/lib/data';
import type { Taxonomie } from './context';

/** Tot ce are nevoie wizard-ul din taxonomie și din autorizația colectorului. */
export async function taxonomieWizard(ctx: DataContext): Promise<Taxonomie> {
  const [categorii, subcategorii, coduri, coduriPeCategorie, autorizatie] = await Promise.all([
    data.taxonomie.categorii(),
    data.taxonomie.subcategorii(),
    data.taxonomie.coduri(),
    data.organizatie.coduriPeCategorie(),
    data.organizatie.autorizatie(ctx),
  ]);
  return {
    categorii,
    subcategorii,
    coduri,
    coduriPeCategorie,
    coduriAutorizate: autorizatie.coduriAutorizate,
    numarAutorizatie: autorizatie.numar,
    puncteLucru: autorizatie.puncteLucru,
  };
}
