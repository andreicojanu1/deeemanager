import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PageHeader from '@/components/layout/PageHeader';
import Cont from '@/features/cont/Cont';
import { delogare } from '@/lib/session/actions';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Cont' };

export default async function Page() {
  const s = await requireSession();
  return (
    <>
      <PageHeader title="Cont" subtitle="Datele tale de autentificare." />
      <Cont
        nume={s.utilizator.nume}
        email={s.utilizator.email}
        organizatie={s.organizatie.denumire}
        rol={s.rol === 'ADMIN' ? 'Administrator platformă' : 'Colector'}
      />
      <Box component="form" action={delogare}>
        <Button type="submit" variant="text" sx={{ minHeight: 44 }}>
          Ieși din cont
        </Button>
      </Box>
    </>
  );
}
