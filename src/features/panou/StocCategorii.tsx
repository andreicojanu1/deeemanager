'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import CategorieIcon from '@/components/ui/CategorieIcon';
import type { StocCategorie } from '@/lib/domain/panou';
import { formatBuc, formatNumber, formatPercent } from '@/lib/format';
import { color, radius } from '@/theme/tokens';

type Props = { categorii: StocCategorie[]; totalKg: number; totalLoturi: number };

const loturiText = (n: number) => (n === 1 ? '1 lot' : `${n} loturi`);

export default function StocCategorii({ categorii, totalKg, totalLoturi }: Props) {
  return (
    <Box
      component="section"
      aria-labelledby="stoc-titlu"
      sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 2,
        }}
      >
        <Typography id="stoc-titlu" variant="h3" component="h2">
          Stoc pe categorii
        </Typography>
        <Typography variant="caption" color="text.secondary" className="num">
          Total {formatNumber(totalKg)} kg ·{' '}
          {totalLoturi === 1 ? '1 lot acceptat' : `${totalLoturi} loturi acceptate`}
        </Typography>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {categorii.map(({ categorie, kg, buc, loturi, pondere }) => (
          <li key={categorie.id}>
            <Box
              component={NextLink}
              href={`/loturi?categorie=${categorie.id}`}
              aria-label={`Categoria ${categorie.cod}, ${categorie.denumireScurta}: ${formatNumber(kg)} kg, ${formatBuc(buc)}, ${formatPercent(Math.round(pondere * 100) / 100)} din stoc. Vezi loturile.`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: { xs: 4, sm: 6, lg: 5 },
                bgcolor: color.surface,
                border: `1px solid ${color.line}`,
                borderRadius: `${radius.lg}px`,
                color: 'inherit',
                textDecoration: 'none',
                transition: 'border-color 150ms ease-out',
                '&:hover': { borderColor: color.lineStrong },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, lg: 2.5 }, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: `${radius.md}px`,
                    bgcolor: color.petrolSoft,
                    color: color.petrol,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <CategorieIcon categorieId={categorie.id} />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="num"
                  sx={{ whiteSpace: 'nowrap', fontSize: { lg: 12 } }}
                >
                  Cat. {categorie.cod} · {loturiText(loturi)}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {categorie.denumireScurta}
              </Typography>
              <Typography variant="metric" component="p" sx={{ m: 0, whiteSpace: 'nowrap' }}>
                {formatNumber(kg)}{' '}
                <Box component="span" sx={{ fontSize: 16, fontWeight: 400, color: color.inkMuted }}>
                  kg
                </Box>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(pondere * 100, pondere > 0 ? 2 : 0)}
                aria-hidden
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary" className="num">
                {formatBuc(buc)} · {formatPercent(Math.round(pondere * 100) / 100)} din stoc
              </Typography>
            </Box>
          </li>
        ))}
      </Box>
    </Box>
  );
}
