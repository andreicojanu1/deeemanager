import AppShell from '@/components/layout/AppShell';
import { navFor } from '@/components/layout/nav';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const session = await requireSession();
  const verificariInCoada =
    session.rol === 'ADMIN' ? await data.verificari.numarInCoada(contextDin(session)) : 0;
  return (
    <AppShell session={session} nav={navFor(session, { verificariInCoada })}>
      {children}
    </AppShell>
  );
}
