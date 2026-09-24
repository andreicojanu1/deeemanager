import type { Metadata } from 'next';
import ButtonLink from '@/components/ui/ButtonLink';
import AuthShell from '@/components/layout/AuthShell';
import InLucru from '@/components/ui/InLucru';

export const metadata: Metadata = { title: 'Creează-ți contul' };

export default function Page() {
  return (
    <AuthShell title="Creează-ți contul" subtitle="Nume, email, parolă și tipul contului.">
      <InLucru pas={9} descriere="Formularul complet, cu validare, se construiește la pasul 9." />
      <ButtonLink href="/autentificare" variant="text" sx={{ alignSelf: 'flex-start' }}>
        Înapoi la autentificare
      </ButtonLink>
    </AuthShell>
  );
}
