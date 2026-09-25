import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import PageHeader from '@/components/layout/PageHeader';
import ButtonLink from '@/components/ui/ButtonLink';
import { Contoare, ConturiDeVerificat } from '@/features/admin/PanouAdmin';
import IntrariChart from '@/features/panou/IntrariChart';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Panou' };

export default async function Page() {
  const session = await requireSession();
  const panou = await data.admin.panou(contextDin(session));
  return (
    <>
      <PageHeader
        title="Panou"
        subtitle="Situația platformei azi."
        action={
          <ButtonLink href="/admin/verificari" variant="contained">
            Deschide coada
          </ButtonLink>
        }
      />
      <Contoare {...panou} />
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
          alignItems: 'start',
        }}
      >
        <IntrariChart intrari={panou.intrari} descriere="Kilograme acceptate pe toată platforma" />
        <ConturiDeVerificat conturi={panou.conturiDeVerificat} />
      </Box>
    </>
  );
}
