'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { parolaAcceptata } from '@/lib/domain/parola';
import {
  PAROLA_DEMO,
  SESSION_COOKIE,
  TIPURI_CONT,
  codificaContNou,
  decodificaContNou,
  homeFor,
  personaDupaEmail,
  PERSONAS,
  type TipCont,
} from '@/lib/session/personas';
import { COD_CONFIRMARE_DEMO, COOKIE_INREGISTRARE, INVITATII, tokenResetareValid } from './demo';

export type Rezultat =
  { ok: true; redirect: string } | { ok: false; eroare: string; campuri?: Record<string, string> };

const OPT_COOKIE = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 8 };

function eroriCampuri(e: z.ZodError): Record<string, string> {
  const r: Record<string, string> = {};
  for (const i of e.issues) {
    const k = String(i.path[0] ?? '');
    if (!r[k]) r[k] = i.message;
  }
  return r;
}

const Email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Scrie o adresă de email validă, de exemplu nume@firma.ro.');
const Parola = z
  .string()
  .refine(
    parolaAcceptata,
    'Parola trebuie să aibă cel puțin 10 caractere, litere mari și mici, o cifră și un simbol.',
  );

export async function autentificare(input: { email: string; parola: string }): Promise<Rezultat> {
  const parsed = z.object({ email: Email, parola: z.string().min(1, 'Scrie parola.') }).safeParse(input);
  if (!parsed.success)
    return { ok: false, eroare: 'Completează emailul și parola.', campuri: eroriCampuri(parsed.error) };
  const persona = personaDupaEmail(parsed.data.email);
  // Mesaj neutru: nu spunem dacă emailul sau parola e greșită.
  if (!persona || parsed.data.parola !== PAROLA_DEMO)
    return { ok: false, eroare: 'Emailul sau parola nu sunt corecte.' };
  (await cookies()).set(SESSION_COOKIE, persona, OPT_COOKIE);
  return { ok: true, redirect: homeFor(PERSONAS[persona]) };
}

const InregistrareSchema = z.object({
  nume: z.string().trim().min(3, 'Scrie numele și prenumele.').max(80),
  email: Email,
  parola: Parola,
  tip: z.enum(Object.keys(TIPURI_CONT) as [TipCont, ...TipCont[]]),
  termeni: z.literal(true, { error: 'Bifează acordul cu termenii ca să poți continua.' }),
});

export async function inregistrare(input: {
  nume: string;
  email: string;
  parola: string;
  tip: string;
  termeni: boolean;
}): Promise<Rezultat> {
  const parsed = InregistrareSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, eroare: 'Verifică câmpurile marcate.', campuri: eroriCampuri(parsed.error) };
  if (personaDupaEmail(parsed.data.email)) {
    return {
      ok: false,
      eroare: 'Există deja un cont cu acest email.',
      campuri: { email: 'Există deja un cont cu acest email. Intră în cont sau recuperează parola.' },
    };
  }
  const { nume, email, tip } = parsed.data;
  (await cookies()).set(COOKIE_INREGISTRARE, codificaContNou({ n: nume, e: email, t: tip }), {
    ...OPT_COOKIE,
    maxAge: 60 * 60,
  });
  return { ok: true, redirect: '/confirmare-email' };
}

export async function confirmaEmail(input: { cod: string }): Promise<Rezultat> {
  const store = await cookies();
  const pending = store.get(COOKIE_INREGISTRARE)?.value;
  if (!pending || !decodificaContNou(pending)) {
    return { ok: false, eroare: 'Sesiunea de înregistrare a expirat. Creează contul din nou.' };
  }
  if (!/^\d{6}$/.test(input.cod)) return { ok: false, eroare: 'Scrie toate cele 6 cifre ale codului.' };
  if (input.cod !== COD_CONFIRMARE_DEMO)
    return { ok: false, eroare: 'Codul nu e corect. Verifică emailul și încearcă din nou.' };
  store.set(SESSION_COOKIE, pending, OPT_COOKIE);
  store.delete(COOKIE_INREGISTRARE);
  return { ok: true, redirect: '/onboarding' };
}

export async function retrimiteCod(): Promise<{ ok: true }> {
  return { ok: true };
}

export async function recuperareParola(input: { email: string }): Promise<Rezultat> {
  const parsed = z.object({ email: Email }).safeParse(input);
  if (!parsed.success)
    return { ok: false, eroare: parsed.error.issues[0].message, campuri: eroriCampuri(parsed.error) };
  // Același răspuns, indiferent dacă adresa există.
  return { ok: true, redirect: '' };
}

const ParolaNouaSchema = z
  .object({ token: z.string().max(80), parola: Parola, confirmare: z.string() })
  .refine((d) => d.parola === d.confirmare, {
    message: 'Parolele nu coincid. Scrie aceeași parolă de două ori.',
    path: ['confirmare'],
  });

export async function reseteazaParola(input: {
  token: string;
  parola: string;
  confirmare: string;
}): Promise<Rezultat> {
  if (!tokenResetareValid(input.token))
    return { ok: false, eroare: 'Linkul a expirat sau nu e valid. Cere unul nou.' };
  const parsed = ParolaNouaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, eroare: 'Verifică parola.', campuri: eroriCampuri(parsed.error) };
  return { ok: true, redirect: '/autentificare?parola=schimbata' };
}

export async function activeazaCont(input: {
  token: string;
  parola: string;
  confirmare: string;
  termeni: boolean;
}): Promise<Rezultat> {
  const invitatie = Object.hasOwn(INVITATII, input.token) ? INVITATII[input.token] : null;
  if (!invitatie)
    return { ok: false, eroare: 'Invitația a expirat sau nu e validă. Cere administratorului una nouă.' };
  const parsed = ParolaNouaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, eroare: 'Verifică parola.', campuri: eroriCampuri(parsed.error) };
  if (!input.termeni)
    return {
      ok: false,
      eroare: 'Bifează acordul cu termenii.',
      campuri: { termeni: 'Bifează acordul cu termenii ca să poți continua.' },
    };
  const persona = personaDupaEmail(invitatie.email);
  if (!persona) return { ok: false, eroare: 'Contul invitat nu mai există.' };
  (await cookies()).set(SESSION_COOKIE, persona, OPT_COOKIE);
  return { ok: true, redirect: homeFor(PERSONAS[persona]) };
}
