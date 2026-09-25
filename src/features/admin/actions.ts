'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contextDin, data } from '@/lib/data';
import { cuiValid } from '@/lib/domain/identificatori';
import { DOCUMENTE_ONBOARDING, type TipDocumentOnboarding } from '@/lib/domain/onboarding';
import { ModificareRegulaSchema, type ModificareRegula } from '@/lib/domain/reguli';
import { ModificareSubcategorieSchema, type ModificareSubcategorie } from '@/lib/domain/taxonomie';
import { requireSession } from '@/lib/session/server';

export type Rezultat<T = undefined> =
  { ok: true; valoare: T } | { ok: false; eroare: string; campuri?: Record<string, string> };

async function admin() {
  const s = await requireSession();
  if (s.rol !== 'ADMIN') throw new Error('Doar administratorii pot face această acțiune.');
  return { ctx: contextDin(s), nume: s.utilizator.nume };
}

async function ruleaza<T>(fn: () => Promise<T>, implicit: string): Promise<Rezultat<T>> {
  try {
    return { ok: true, valoare: await fn() };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, eroare: e.issues[0]?.message ?? implicit };
    return { ok: false, eroare: e instanceof Error ? e.message : implicit };
  }
}

const IdColector = z.string().min(1).max(80);
const TipDoc = z.enum(
  DOCUMENTE_ONBOARDING.map((d) => d.tip) as [TipDocumentOnboarding, ...TipDocumentOnboarding[]],
);
const Data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege data.');

const revalideazaColector = (id: string) => {
  revalidatePath('/admin');
  revalidatePath('/admin/colectori');
  revalidatePath(`/admin/colectori/${id}`);
};

export async function decideDocument(
  id: string,
  tip: TipDocumentOnboarding,
  decizie: 'APROBAT' | 'RESPINS',
  motiv?: string,
): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    await data.colectori.decideDocument(
      ctx,
      IdColector.parse(id),
      TipDoc.parse(tip),
      z.enum(['APROBAT', 'RESPINS']).parse(decizie),
      z.string().max(300).optional().parse(motiv),
    );
    revalideazaColector(id);
    return undefined;
  }, 'Decizia nu s-a salvat.');
}

/** Aprobă toate documentele care așteaptă verificarea. */
export async function aprobaToate(id: string): Promise<Rezultat<number>> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    const c = await data.colectori.get(ctx, IdColector.parse(id));
    if (!c) throw new Error('Colectorul nu există.');
    const de = c.onboarding.documente.filter((d) => d.stare === 'DE_VERIFICAT');
    for (const d of de) await data.colectori.decideDocument(ctx, id, d.tip, 'APROBAT');
    revalideazaColector(id);
    return de.length;
  }, 'Documentele nu s-au aprobat.');
}

export async function programeazaVizita(id: string, dataVizitei: string): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    await data.colectori.programeazaVizita(ctx, IdColector.parse(id), Data.parse(dataVizitei));
    revalideazaColector(id);
    return undefined;
  }, 'Vizita nu s-a programat.');
}

export async function finalizeazaVizita(
  id: string,
  vizita: { data: string; observatii: string },
): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx, nume } = await admin();
    const v = z.object({ data: Data, observatii: z.string().max(500) }).parse(vizita);
    await data.colectori.finalizeazaVizita(ctx, IdColector.parse(id), v, nume);
    revalideazaColector(id);
    return undefined;
  }, 'Vizita nu s-a salvat.');
}

const InvitatieSchema = z.object({
  denumire: z.string().trim().min(3, 'Scrie denumirea firmei.').max(200),
  cui: z.string().trim().refine(cuiValid, 'CUI-ul nu e valid. Verifică cifrele.'),
  nume: z.string().trim().min(3, 'Scrie numele administratorului firmei.').max(80),
  email: z.string().trim().toLowerCase().email('Scrie o adresă de email validă, de exemplu nume@firma.ro.'),
});

export async function invitaColector(input: {
  denumire: string;
  cui: string;
  nume: string;
  email: string;
}): Promise<Rezultat<{ id: string }>> {
  const p = InvitatieSchema.safeParse(input);
  if (!p.success) {
    const campuri: Record<string, string> = {};
    for (const i of p.error.issues) campuri[String(i.path[0])] ??= i.message;
    return { ok: false, eroare: 'Verifică câmpurile marcate.', campuri };
  }
  return ruleaza(async () => {
    const { ctx } = await admin();
    const r = await data.colectori.invita(ctx, p.data);
    revalidatePath('/admin/colectori');
    return r;
  }, 'Invitația nu s-a trimis.');
}

export async function modificaSubcategorie(
  cod: string,
  modificare: ModificareSubcategorie,
): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    await data.taxonomie.modificaSubcategorie(
      ctx,
      z.string().max(10).parse(cod),
      ModificareSubcategorieSchema.parse(modificare),
    );
    revalidatePath('/admin/taxonomie');
    return undefined;
  }, 'Modificarea nu s-a salvat.');
}

export async function modificaCod(cod: string, activ: boolean): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    await data.taxonomie.modificaCod(ctx, z.string().max(12).parse(cod), { activ: z.boolean().parse(activ) });
    revalidatePath('/admin/taxonomie');
    return undefined;
  }, 'Modificarea nu s-a salvat.');
}

export async function modificaRegula(cod: string, modificare: ModificareRegula): Promise<Rezultat> {
  return ruleaza(async () => {
    const { ctx } = await admin();
    await data.taxonomie.modificaRegula(
      ctx,
      z.string().max(4).parse(cod),
      ModificareRegulaSchema.parse(modificare),
    );
    revalidatePath('/admin/taxonomie');
    return undefined;
  }, 'Modificarea nu s-a salvat.');
}
