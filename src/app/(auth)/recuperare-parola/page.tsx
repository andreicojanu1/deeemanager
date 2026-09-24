import type { Metadata } from 'next';
import AuthShell from '@/components/layout/AuthShell';
import FormRecuperare from '@/features/auth/FormRecuperare';

export const metadata: Metadata = { title: 'Recuperează parola' };

export default function Page() {
  return (
    <AuthShell
      title="Recuperează parola"
      subtitle="Scrie emailul contului. Îți trimitem un link cu care alegi o parolă nouă."
    >
      <FormRecuperare />
    </AuthShell>
  );
}
