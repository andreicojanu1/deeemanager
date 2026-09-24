'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import {
  DOCUMENTE_ONBOARDING,
  DateFirmaSchema,
  type DateFirma,
  type Onboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import { requireSession } from '@/lib/session/server';

type R<T> = { ok: true; valoare: T } | { ok: false; eroare: string };

async function ruleaza<T>(fn: () => Promise<T>, implicit: string): Promise<R<T>> {
  try {
    return { ok: true, valoare: await fn() };
  } catch (e) {
    return { ok: false, eroare: e instanceof Error && !(e instanceof z.ZodError) ? e.message : implicit };
  }
}

const ctx = async () => {
  const s = await requireSession();
  if (s.rol !== 'COLECTOR') throw new Error('Doar colectorii își activează contul.');
  return contextDin(s);
};

export async function salveazaFirma(firma: DateFirma): Promise<R<{ salvatLa: string }>> {
  return ruleaza(
    async () => data.onboarding.salveazaFirma(await ctx(), DateFirmaSchema.parse(firma)),
    'Datele nu s-au salvat.',
  );
}

const TipDoc = z.enum(
  DOCUMENTE_ONBOARDING.map((d) => d.tip) as [TipDocumentOnboarding, ...TipDocumentOnboarding[]],
);

export async function incarcaDocument(
  tip: TipDocumentOnboarding,
  fisier: { nume: string; marime: string },
): Promise<R<Onboarding>> {
  return ruleaza(async () => {
    const f = z.object({ nume: z.string().min(1).max(200), marime: z.string().max(20) }).parse(fisier);
    return data.onboarding.incarcaDocument(await ctx(), TipDoc.parse(tip), f);
  }, 'Fișierul nu s-a încărcat. Încearcă din nou.');
}

export async function confirmaAutorizatie(extras: {
  numar: string;
  emitent: string;
  valabilPana: string;
  coduri: string[];
}): Promise<R<Onboarding>> {
  return ruleaza(
    async () => data.onboarding.confirmaAutorizatie(await ctx(), extras),
    'Verifică datele autorizației.',
  );
}

export async function trimiteOnboarding(): Promise<R<Onboarding>> {
  const r = await ruleaza(async () => data.onboarding.trimite(await ctx()), 'Dosarul nu s-a trimis.');
  if (r.ok) revalidatePath('/onboarding');
  return r;
}

export async function cautaFirma(cui: string): Promise<{ denumire: string; adresa: string } | null> {
  const parsed = z.string().max(20).safeParse(cui);
  if (!parsed.success) return null;
  await requireSession();
  return data.anaf.cauta(parsed.data);
}
