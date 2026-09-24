import type { Metadata } from 'next';
import ButtonLink from '@/components/ui/ButtonLink';
import AuthShell from '@/components/layout/AuthShell';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Alege o parolă nouă' };

export default function Page() {
  return (
    <AuthShell title="Alege o parolă nouă" subtitle="Parola trebuie să aibă cel puțin 10 caractere.">
      <InLucru pas={9} descriere="Formularul complet, cu validare, se construiește la pasul 9." />
      <ButtonLink href="/autentificare" variant="text" sx={{ alignSelf: 'flex-start' }}>
        Înapoi la autentificare
      </ButtonLink>
    </AuthShell>
  );
}
