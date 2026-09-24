import type { Metadata } from 'next';
import AuthShell from '@/components/layout/AuthShell';
import ButtonLink from '@/components/ui/ButtonLink';
import FormParolaNoua from '@/features/auth/FormParolaNoua';
import { Alerta } from '@/features/auth/campuri';
import { tokenResetareValid } from '@/features/auth/demo';

export const metadata: Metadata = { title: 'Alege o parolă nouă' };

export default async function Page({ params }: PageProps<'/resetare-parola/[token]'>) {
  const { token } = await params;
  if (!tokenResetareValid(token)) {
    return (
      <AuthShell
        title="Linkul nu mai e valid"
        subtitle="Linkurile de resetare sunt valabile o oră și se pot folosi o singură dată."
      >
        <Alerta tip="eroare">Linkul a expirat sau nu e valid. Cere unul nou.</Alerta>
        <ButtonLink href="/recuperare-parola" variant="contained" size="large" sx={{ minHeight: 44 }}>
          Cere un link nou
        </ButtonLink>
        <ButtonLink href="/autentificare" variant="text" sx={{ alignSelf: 'center' }}>
          Înapoi la autentificare
        </ButtonLink>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="Alege o parolă nouă"
      subtitle="Cel puțin 10 caractere, cu litere mari și mici, o cifră și un simbol."
    >
      <FormParolaNoua mod="resetare" token={token} />
    </AuthShell>
  );
}
