'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { IconBox } from '@tabler/icons-react';
import ButtonLink from '@/components/ui/ButtonLink';
import EmptyState from '@/components/ui/EmptyState';
import ResponsiveTable, { type Column } from '@/components/ui/ResponsiveTable';
import StatusBadge from '@/components/ui/StatusBadge';
import type { PaginaLoturi, RandListaLot } from '@/lib/domain/loturi';
import { formatDate, formatNumber, formatTime } from '@/lib/format';
import Paginare from './Paginare';

type Props = {
  pagina: PaginaLoturi;
  filtrate: boolean;
  /** Admin: coloana Colector și link-urile spre raport. */
  colectori?: Record<string, string>;
  /** Prefixul link-ului spre detaliu, ex. „/loturi/”. */
  hrefBaza: string;
  hrefLotNou?: string;
};

const actualizat = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`;

export default function ListaLoturi({ pagina, filtrate, colectori, hrefBaza, hrefLotNou }: Props) {
  const coloane: Column<RandListaLot>[] = [
    { key: 'id', header: 'Lot', cell: (r) => r.id, primary: true, width: '150px' },
    ...(colectori
      ? [
          {
            key: 'colector',
            header: 'Colector',
            cell: (r: RandListaLot) => colectori[r.organizatieId] ?? '—',
          },
        ]
      : []),
    { key: 'continut', header: 'Conținut', cell: (r) => r.continut },
    { key: 'kg', header: 'Cantitate kg', cell: (r) => formatNumber(r.kg), align: 'right', width: '120px' },
    { key: 'buc', header: 'Buc', cell: (r) => formatNumber(r.buc), align: 'right', width: '80px' },
    { key: 'data', header: 'Data preluării', cell: (r) => formatDate(r.dataPreluarii), width: '130px' },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      aside: true,
      width: '180px',
    },
    {
      key: 'actualizat',
      header: 'Actualizat',
      cell: (r) => <span style={{ whiteSpace: 'nowrap' }}>{actualizat(r.actualizatLa)}</span>,
      width: '170px',
      hideOnMobile: true,
    },
  ];

  if (pagina.total === 0) {
    return (
      <Card>
        {filtrate ? (
          <EmptyState
            icon={<IconBox size={24} stroke={1.5} />}
            message="Niciun lot nu se potrivește filtrelor."
          />
        ) : (
          <EmptyState
            icon={<IconBox size={24} stroke={1.5} />}
            message="Nu ai încă loturi."
            action={
              hrefLotNou ? (
                <ButtonLink href={hrefLotNou} variant="contained">
                  Încarcă primul lot
                </ButtonLink>
              ) : undefined
            }
          />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ px: 6, pt: 4, pb: 2 }}>
        <Typography variant="caption" color="text.secondary" className="num" role="status">
          {pagina.total === 1 ? '1 lot' : `${formatNumber(pagina.total)} loturi`}
        </Typography>
      </Box>
      <ResponsiveTable
        label="Loturi"
        columns={coloane}
        rows={pagina.randuri}
        rowKey={(r) => r.id}
        rowHref={(r) =>
          // Adminul deschide raportul de verificare; loturile anulate nu au raport.
          colectori && r.status === 'ANULAT' ? undefined : `${hrefBaza}${r.id}`
        }
      />
      <Paginare pagina={pagina.pagina} pagini={pagina.pagini} />
    </Card>
  );
}
