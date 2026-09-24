import AppShell from '@/components/layout/AppShell';
import { navFor } from '@/components/layout/nav';
import { numarInCoada } from '@/lib/mock/verificari';
import { requireSession } from '@/lib/session/server';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const session = await requireSession();
  const nav = navFor(session, { verificariInCoada: session.rol === 'ADMIN' ? await numarInCoada() : 0 });
  return (
    <AppShell session={session} nav={nav}>
      {children}
    </AppShell>
  );
}
