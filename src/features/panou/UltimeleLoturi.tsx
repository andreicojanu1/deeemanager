'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import ResponsiveTable, { type Column } from '@/components/ui/ResponsiveTable';
import StatusBadge from '@/components/ui/StatusBadge';
import type { RandLot } from '@/lib/domain/panou';
import { formatDate, formatKg } from '@/lib/format';

const COLOANE: Column<RandLot>[] = [
  { key: 'id', header: 'Lot', cell: (r) => r.id, primary: true, width: '180px' },
  { key: 'continut', header: 'Conținut', cell: (r) => r.continut },
  { key: 'kg', header: 'Cantitate', cell: (r) => formatKg(r.kg), align: 'right', width: '120px' },
  { key: 'data', header: 'Data preluării', cell: (r) => formatDate(r.dataPreluarii), width: '160px' },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge status={r.status} />,
    aside: true,
    width: '200px',
  },
];

export default function UltimeleLoturi({ loturi }: { loturi: RandLot[] }) {
  return (
    <Card component="section" aria-labelledby="ultimele-titlu">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
          px: 6,
          pt: 5,
          pb: 3,
        }}
      >
        <Typography id="ultimele-titlu" variant="h3" component="h2">
          Ultimele loturi
        </Typography>
        <Link component={NextLink} href="/loturi">
          Vezi toate loturile
        </Link>
      </Box>
      <ResponsiveTable
        label="Ultimele loturi"
        columns={COLOANE}
        rows={loturi}
        rowKey={(r) => r.id}
        rowHref={(r) => `/loturi/${r.id}`}
      />
    </Card>
  );
}
