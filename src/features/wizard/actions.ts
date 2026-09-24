'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import { CiornaSchema, type Ciorna } from '@/lib/domain/ciorna';
import { requireSession } from '@/lib/session/server';

export type RezultatSalvare = { ok: true; id: string; salvatLa: string } | { ok: false; eroare: string };

export async function salveazaCiorna(ciorna: Ciorna): Promise<RezultatSalvare> {
  const parsed = CiornaSchema.safeParse(ciorna);
  if (!parsed.success)
    return { ok: false, eroare: 'Ciorna are valori prea lungi. Scurtează textul și încearcă din nou.' };
  try {
    const ctx = contextDin(await requireSession());
    const r = await data.loturi.salveazaCiorna(ctx, parsed.data);
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, eroare: e instanceof Error ? e.message : 'Ciorna nu s-a salvat.' };
  }
}

export async function trimiteLot(id: string): Promise<{ ok: true } | { ok: false; eroare: string }> {
  if (!/^LOT-\d{4}-\d{4}$/.test(id)) return { ok: false, eroare: 'Lotul nu există.' };
  try {
    const ctx = contextDin(await requireSession());
    await data.loturi.trimite(ctx, id);
    revalidatePath('/loturi');
    revalidatePath('/panou');
    revalidatePath(`/loturi/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, eroare: e instanceof Error ? e.message : 'Lotul nu a putut fi trimis.' };
  }
}

export async function cautaCui(cui: string): Promise<{ denumire: string; adresa: string } | null> {
  const parsed = z.string().max(20).safeParse(cui);
  if (!parsed.success) return null;
  await requireSession();
  return data.anaf.cauta(parsed.data);
}
