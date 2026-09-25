'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { parolaAcceptata } from '@/lib/domain/parola';
import { PAROLA_DEMO, SESSION_COOKIE } from '@/lib/session/personas';
import { schimbaNume } from '@/lib/session/profil';
import { requireSession } from '@/lib/session/server';

export type Rezultat = { ok: true } | { ok: false; eroare: string; campuri?: Record<string, string> };

export async function salveazaNume(nume: string): Promise<Rezultat> {
  const p = z.string().trim().min(3, 'Scrie numele și prenumele.').max(80).safeParse(nume);
  if (!p.success)
    return { ok: false, eroare: p.error.issues[0].message, campuri: { nume: p.error.issues[0].message } };
  const s = await requireSession();
  schimbaNume(s.utilizator.id, p.data);
  revalidatePath('/', 'layout');
  return { ok: true };
}

const ParolaSchema = z
  .object({
    curenta: z.string().min(1, 'Scrie parola actuală.'),
    parola: z
      .string()
      .refine(
        parolaAcceptata,
        'Parola trebuie să aibă cel puțin 10 caractere, litere mari și mici, o cifră și un simbol.',
      ),
    confirmare: z.string(),
  })
  .refine((d) => d.parola === d.confirmare, {
    message: 'Parolele nu coincid. Scrie aceeași parolă de două ori.',
    path: ['confirmare'],
  })
  .refine((d) => d.parola !== d.curenta, {
    message: 'Alege o parolă diferită de cea actuală.',
    path: ['parola'],
  });

export async function schimbaParola(input: {
  curenta: string;
  parola: string;
  confirmare: string;
}): Promise<Rezultat> {
  const p = ParolaSchema.safeParse(input);
  if (!p.success) {
    const campuri: Record<string, string> = {};
    for (const i of p.error.issues) campuri[String(i.path[0])] ??= i.message;
    return { ok: false, eroare: 'Verifică câmpurile marcate.', campuri };
  }
  await requireSession();
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value ?? '';
  // Faza A: conturile de test au parola comună; conturile noi nu au parola salvată.
  if (!cookie.startsWith('nou.') && p.data.curenta !== PAROLA_DEMO) {
    return {
      ok: false,
      eroare: 'Parola actuală nu e corectă.',
      campuri: { curenta: 'Parola actuală nu e corectă.' },
    };
  }
  return { ok: true };
}
