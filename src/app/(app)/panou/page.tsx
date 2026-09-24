import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import { IconPlus } from '@tabler/icons-react';
import PageHeader from '@/components/layout/PageHeader';
import ButtonLink from '@/components/ui/ButtonLink';
import DeRezolvat from '@/features/panou/DeRezolvat';
import IntrariChart from '@/features/panou/IntrariChart';
import StatusuriCard from '@/features/panou/StatusuriCard';
import StocCategorii from '@/features/panou/StocCategorii';
import UltimeleLoturi from '@/features/panou/UltimeleLoturi';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Panou' };

export default async function PanouPage() {
  const session = await requireSession();
  const panou = await data.panou.colector(contextDin(session));

  return (
    <>
      <PageHeader
        title="Panou"
        subtitle="Stoc actual și ce ai de făcut azi."
        action={
          <ButtonLink href="/loturi/nou" variant="contained" startIcon={<IconPlus size={18} stroke={1.5} />}>
            Lot nou
          </ButtonLink>
        }
      />
      <DeRezolvat items={panou.deRezolvat} />
      <StocCategorii {...panou.stoc} />
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
        }}
      >
        <IntrariChart intrari={panou.intrari} />
        <StatusuriCard statusuri={panou.statusuri} />
      </Box>
      <UltimeleLoturi loturi={panou.ultimeleLoturi} />
    </>
  );
}
