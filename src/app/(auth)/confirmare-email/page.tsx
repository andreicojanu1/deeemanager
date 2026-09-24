import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthShell from '@/components/layout/AuthShell';
import ButtonLink from '@/components/ui/ButtonLink';
import FormConfirmare from '@/features/auth/FormConfirmare';
import { COD_CONFIRMARE_DEMO, COOKIE_INREGISTRARE } from '@/features/auth/demo';
import { decodificaContNou } from '@/lib/session/personas';

export const metadata: Metadata = { title: 'Confirmă adresa de email' };

/** a***@firma.ro: arată doar prima literă din partea locală. */
function mascheazaEmail(email: string) {
  const [local, domeniu] = email.split('@');
  return `${local.slice(0, 1)}${'*'.repeat(Math.max(local.length - 1, 2))}@${domeniu}`;
}

export default async function Page() {
  const valoare = (await cookies()).get(COOKIE_INREGISTRARE)?.value;
  const cont = valoare ? decodificaContNou(valoare) : null;
  if (!cont) redirect('/inregistrare');

  return (
    <AuthShell
      title="Confirmă adresa de email"
      subtitle={
        <>
          Ți-am trimis un cod de 6 cifre la <strong>{mascheazaEmail(cont.e)}</strong>. Codul e valabil 15
          minute.
        </>
      }
    >
      <FormConfirmare codDemo={COD_CONFIRMARE_DEMO} />
      <ButtonLink href="/inregistrare" variant="text" sx={{ alignSelf: 'center' }}>
        Ai greșit adresa? Creează contul din nou
      </ButtonLink>
    </AuthShell>
  );
}
