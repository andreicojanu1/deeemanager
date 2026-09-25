'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import {
  IconBuildingWarehouse,
  IconChevronRight,
  IconClockHour4,
  IconListCheck,
  IconChecks,
} from '@tabler/icons-react';
import NextLink from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { ETICHETA_STATUS_CONT, TON_STATUS_CONT, type RandColector } from '@/lib/domain/colectori';
import { formatDate, formatNumber, formatTime } from '@/lib/format';
import { color, radius } from '@/theme/tokens';

type Contor = { eticheta: string; valoare: string; detaliu: string; href?: string; Icon: typeof IconChecks };

export function Contoare({
  colectoriActivi,
  inCoada,
  deciseAzi,
  timpMediuDecizieMin,
}: {
  colectoriActivi: number;
  inCoada: number;
  deciseAzi: number;
  timpMediuDecizieMin: number | null;
}) {
  const contoare: Contor[] = [
    {
      eticheta: 'Colectori activi',
      valoare: formatNumber(colectoriActivi),
      detaliu: 'Conturi cu vizita în teren efectuată',
      href: '/admin/colectori?status=ACTIV',
      Icon: IconBuildingWarehouse,
    },
    {
      eticheta: 'Loturi în coadă',
      valoare: formatNumber(inCoada),
      detaliu: 'Așteaptă decizia ta',
      href: '/admin/verificari',
      Icon: IconListCheck,
    },
    {
      eticheta: 'Decise azi',
      valoare: formatNumber(deciseAzi),
      detaliu: 'Acceptate, respinse sau cu completări',
      Icon: IconChecks,
    },
    {
      eticheta: 'Timp mediu până la decizie',
      valoare: timpMediuDecizieMin === null ? '—' : durata(timpMediuDecizieMin),
      detaliu: 'Pentru loturile decise azi',
      Icon: IconClockHour4,
    },
  ];
  return (
    <Box
      component="ul"
      aria-label="Contoare"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
      }}
    >
      {contoare.map((c) => {
        const continut = (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: color.inkMuted }}>
              <c.Icon size={18} stroke={1.5} aria-hidden />
              <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
                {c.eticheta}
              </Typography>
              {c.href ? <IconChevronRight size={18} stroke={1.5} aria-hidden /> : null}
            </Box>
            <Typography variant="metric" component="p" className="num" sx={{ m: 0 }}>
              {c.valoare}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {c.detaliu}
            </Typography>
          </>
        );
        const sx = {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          textAlign: 'left',
          gap: 2,
          p: { xs: 4, sm: 6 },
          height: '100%',
          width: '100%',
        } as const;
        return (
          <li key={c.eticheta}>
            <Card sx={{ height: '100%' }}>
              {c.href ? (
                <ButtonBase
                  component={NextLink}
                  href={c.href}
                  sx={{ ...sx, '&:hover': { bgcolor: color.canvas } }}
                >
                  {continut}
                </ButtonBase>
              ) : (
                <Box sx={sx}>{continut}</Box>
              )}
            </Card>
          </li>
        );
      })}
    </Box>
  );
}

/** 42 → „42 min”; 135 → „2 h 15 min”. */
function durata(min: number) {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`;
}

export function ConturiDeVerificat({ conturi }: { conturi: RandColector[] }) {
  return (
    <Card component="section" aria-labelledby="conturi-titlu">
      <Box
        sx={{ p: 6, pb: 4, display: 'flex', justifyContent: 'space-between', gap: 4, alignItems: 'baseline' }}
      >
        <Box>
          <Typography id="conturi-titlu" variant="h3" component="h2">
            Conturi de verificat
          </Typography>
          <Typography color="text.secondary">
            Dosare de activare trimise și vizite în teren de făcut.
          </Typography>
        </Box>
        <Typography color="text.secondary" className="num">
          {conturi.length}
        </Typography>
      </Box>
      {conturi.length ? (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {conturi.map((c) => (
            <li key={c.id}>
              <ButtonBase
                component={NextLink}
                href={`/admin/colectori/${c.id}?tab=${c.status === 'VIZITA' ? 'vizita' : 'documente'}`}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  gap: 4,
                  minHeight: 64,
                  px: 6,
                  py: 3,
                  borderTop: `1px solid ${color.line}`,
                  '&:hover': { bgcolor: color.canvas },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: `${radius.md}px`,
                    bgcolor: color.petrolSoft,
                    color: color.petrol,
                    display: { xs: 'none', sm: 'grid' },
                    placeItems: 'center',
                  }}
                >
                  <IconBuildingWarehouse size={18} stroke={1.5} aria-hidden />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="bodyStrong"
                    component="span"
                    sx={{ display: 'block', color: color.petrol }}
                  >
                    {c.denumire}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="num">
                    CUI {c.cui} · {c.localitate}
                    {c.trimisLa ? ` · trimis ${formatDate(c.trimisLa)}, ${formatTime(c.trimisLa)}` : ''}
                  </Typography>
                </Box>
                <StatusBadge tone={TON_STATUS_CONT[c.status]} label={ETICHETA_STATUS_CONT[c.status]} />
              </ButtonBase>
            </li>
          ))}
        </Box>
      ) : (
        <EmptyState
          icon={<IconChecks size={24} stroke={1.5} />}
          message="Niciun cont nu așteaptă verificarea."
        />
      )}
    </Card>
  );
}
