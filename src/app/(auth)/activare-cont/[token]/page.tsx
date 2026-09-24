import type { Metadata } from 'next';
import AuthShell from '@/components/layout/AuthShell';
import ButtonLink from '@/components/ui/ButtonLink';
import FormParolaNoua from '@/features/auth/FormParolaNoua';
import { Alerta } from '@/features/auth/campuri';
import { INVITATII } from '@/features/auth/demo';

export const metadata: Metadata = { title: 'Activează invitația' };

export default async function Page({ params }: PageProps<'/activare-cont/[token]'>) {
  const { token } = await params;
  const invitatie = Object.hasOwn(INVITATII, token) ? INVITATII[token] : null;
  if (!invitatie) {
    return (
      <AuthShell title="Invitația nu mai e validă" subtitle="Invitațiile sunt valabile 7 zile.">
        <Alerta tip="eroare">
          Invitația a expirat sau nu e validă. Cere administratorului firmei una nouă.
        </Alerta>
        <ButtonLink href="/autentificare" variant="contained" size="large" sx={{ minHeight: 44 }}>
          Mergi la autentificare
        </ButtonLink>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="Activează invitația"
      subtitle={
        <>
          Ai fost invitat în <strong>{invitatie.organizatie}</strong>. Alege o parolă ca să intri în cont.
        </>
      }
    >
      <FormParolaNoua mod="activare" token={token} emailInvitat={invitatie.email} />
    </AuthShell>
  );
}
