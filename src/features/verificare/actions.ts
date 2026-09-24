'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

const DecizieSchema = z
  .object({
    id: z.string().regex(/^LOT-\d{4}-\d{4}$/),
    decizie: z.enum(['ACCEPTAT', 'NECESITA_COMPLETARI', 'RESPINS']),
    motiv: z.string().trim().max(1000),
  })
  .refine((d) => d.decizie === 'ACCEPTAT' || d.motiv.length >= 10, {
    message: 'Scrie colectorului ce are de făcut (cel puțin 10 caractere).',
    path: ['motiv'],
  });

export async function decideLot(input: {
  id: string;
  decizie: 'ACCEPTAT' | 'NECESITA_COMPLETARI' | 'RESPINS';
  motiv: string;
}): Promise<{ ok: true } | { ok: false; eroare: string }> {
  const parsed = DecizieSchema.safeParse(input);
  if (!parsed.success) return { ok: false, eroare: parsed.error.issues[0].message };
  const session = await requireSession();
  if (session.rol !== 'ADMIN') return { ok: false, eroare: 'Doar administratorul poate decide.' };
  try {
    await data.verificari.decide(
      contextDin(session),
      parsed.data.id,
      parsed.data.decizie,
      parsed.data.motiv,
      session.utilizator.nume,
    );
  } catch (e) {
    return { ok: false, eroare: e instanceof Error ? e.message : 'Decizia nu s-a salvat.' };
  }
  revalidatePath('/admin/verificari');
  revalidatePath(`/admin/verificari/${parsed.data.id}`);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
