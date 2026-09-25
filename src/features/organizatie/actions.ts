'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import { DOCUMENTE_ONBOARDING, type TipDocumentOnboarding } from '@/lib/domain/onboarding';
import { requireSession } from '@/lib/session/server';

const TipDoc = z.enum(
  DOCUMENTE_ONBOARDING.map((d) => d.tip) as [TipDocumentOnboarding, ...TipDocumentOnboarding[]],
);

export async function inlocuiesteDocument(
  tip: TipDocumentOnboarding,
  fisier: { nume: string; marime: string },
): Promise<{ ok: true } | { ok: false; eroare: string }> {
  try {
    const s = await requireSession();
    if (s.rol !== 'COLECTOR') throw new Error('Doar colectorii își încarcă documentele firmei.');
    const f = z.object({ nume: z.string().min(1).max(200), marime: z.string().max(20) }).parse(fisier);
    await data.organizatie.inlocuiesteDocument(contextDin(s), TipDoc.parse(tip), f);
    revalidatePath('/organizatie');
    revalidatePath('/panou');
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      eroare: e instanceof Error && !(e instanceof z.ZodError) ? e.message : 'Fișierul nu s-a încărcat.',
    };
  }
}
