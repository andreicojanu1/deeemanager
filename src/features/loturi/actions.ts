'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export type RezultatActiune = { ok: true; mesaj: string } | { ok: false; eroare: string };

const IdLot = z.string().regex(/^LOT-\d{4}-\d{4}$/);

const AnulareSchema = z.object({
  id: IdLot,
  motiv: z.string().trim().min(5, 'Scrie pe scurt de ce anulezi lotul (cel puțin 5 caractere).').max(500),
});

const InlocuireSchema = z.object({
  id: IdLot,
  documentId: z.string().min(1).max(80),
  numeFisier: z.string().trim().min(1, 'Alege un fișier.').max(200),
});

async function ruleaza(fn: () => Promise<string>, id: string): Promise<RezultatActiune> {
  try {
    const mesaj = await fn();
    revalidatePath(`/loturi/${id}`);
    revalidatePath('/loturi');
    revalidatePath('/panou');
    return { ok: true, mesaj };
  } catch (e) {
    return { ok: false, eroare: e instanceof Error ? e.message : 'Acțiunea nu a reușit. Încearcă din nou.' };
  }
}

export async function anuleazaLot(input: { id: string; motiv: string }): Promise<RezultatActiune> {
  const parsed = AnulareSchema.safeParse(input);
  if (!parsed.success) return { ok: false, eroare: parsed.error.issues[0].message };
  const ctx = contextDin(await requireSession());
  return ruleaza(async () => {
    await data.loturi.anuleaza(ctx, parsed.data.id, parsed.data.motiv);
    return 'Lotul a fost anulat.';
  }, parsed.data.id);
}

export async function inlocuiesteDocument(input: {
  id: string;
  documentId: string;
  numeFisier: string;
}): Promise<RezultatActiune> {
  const parsed = InlocuireSchema.safeParse(input);
  if (!parsed.success) return { ok: false, eroare: parsed.error.issues[0].message };
  const ctx = contextDin(await requireSession());
  return ruleaza(async () => {
    await data.loturi.inlocuiesteDocument(
      ctx,
      parsed.data.id,
      parsed.data.documentId,
      parsed.data.numeFisier,
    );
    return 'Documentul a fost înlocuit.';
  }, parsed.data.id);
}

export async function retrimiteLot(input: { id: string }): Promise<RezultatActiune> {
  const parsed = z.object({ id: IdLot }).safeParse(input);
  if (!parsed.success) return { ok: false, eroare: 'Lotul nu există.' };
  const ctx = contextDin(await requireSession());
  return ruleaza(async () => {
    await data.loturi.retrimite(ctx, parsed.data.id);
    return 'Lotul a fost trimis din nou la verificare.';
  }, parsed.data.id);
}
