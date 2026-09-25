'use client';

import { useEffect, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconBuildingWarehouse, IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import ResponsiveTable, { type Column } from '@/components/ui/ResponsiveTable';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  ETICHETA_STATUS_CONT,
  TON_STATUS_CONT,
  type FiltreColectori,
  type RandColector,
  type StatusCont,
} from '@/lib/domain/colectori';
import { formatDate, formatNumber } from '@/lib/format';

const coloane: Column<RandColector>[] = [
  { key: 'denumire', header: 'Denumire', cell: (r) => r.denumire, primary: true },
  { key: 'cui', header: 'CUI', cell: (r) => <span className="num">{r.cui}</span>, width: '120px' },
  { key: 'localitate', header: 'Localitate', cell: (r) => r.localitate, hideOnMobile: true },
  {
    key: 'status',
    header: 'Status cont',
    cell: (r) => <StatusBadge tone={TON_STATUS_CONT[r.status]} label={ETICHETA_STATUS_CONT[r.status]} />,
    aside: true,
    width: '200px',
  },
  { key: 'loturi', header: 'Loturi', cell: (r) => formatNumber(r.loturi), align: 'right', width: '90px' },
  {
    key: 'inregistrat',
    header: 'Înregistrat la',
    cell: (r) => formatDate(r.inregistratLa),
    width: '140px',
  },
];

export default function ListaColectori({
  randuri,
  filtre,
}: {
  randuri: RandColector[];
  filtre: FiltreColectori;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(filtre.q ?? '');

  const seteaza = (f: FiltreColectori) => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.status) p.set('status', f.status);
    const qs = p.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Căutarea pornește la 300 ms după ultima tastă.
  useEffect(() => {
    if (q === (filtre.q ?? '')) return;
    const t = setTimeout(() => seteaza({ ...filtre, q: q || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <Card>
      <Box
        sx={{
          p: { xs: 4, sm: 6 },
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 2fr) minmax(0, 1fr)' },
        }}
      >
        <TextField
          id="cauta-colector"
          label="Caută colector"
          placeholder="Denumire, CUI sau localitate"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} stroke={1.5} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          id="filtru-status-cont"
          select
          label="Status cont"
          value={filtre.status ?? ''}
          onChange={(e) =>
            seteaza({ ...filtre, status: (e.target.value || undefined) as StatusCont | undefined })
          }
        >
          <MenuItem value="">Toate</MenuItem>
          {(Object.keys(ETICHETA_STATUS_CONT) as StatusCont[]).map((s) => (
            <MenuItem key={s} value={s}>
              {ETICHETA_STATUS_CONT[s]}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ height: 2 }}>{pending ? <LinearProgress aria-label="Se actualizează lista" /> : null}</Box>
      {randuri.length ? (
        <>
          <Box sx={{ px: 6, pt: 2, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" className="num" role="status">
              {randuri.length === 1 ? '1 colector' : `${formatNumber(randuri.length)} colectori`}
            </Typography>
          </Box>
          <ResponsiveTable
            label="Colectori"
            columns={coloane}
            rows={randuri}
            rowKey={(r) => r.id}
            rowHref={(r) => `/admin/colectori/${r.id}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<IconBuildingWarehouse size={24} stroke={1.5} />}
          message="Niciun colector nu se potrivește filtrelor."
        />
      )}
    </Card>
  );
}
