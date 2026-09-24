import type { Metadata } from 'next';
import AuthShell from '@/components/layout/AuthShell';
import FormInregistrare from '@/features/auth/FormInregistrare';

export const metadata: Metadata = { title: 'Creează-ți contul' };

export default function Page() {
  return (
    <AuthShell
      title="Creează-ți contul"
      subtitle="După confirmarea emailului îți activezi contul cu documentele firmei."
    >
      <FormInregistrare />
    </AuthShell>
  );
}
