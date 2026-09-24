'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { IntrareLuna } from '@/lib/domain/panou';
import { formatNumber } from '@/lib/format';
import { color } from '@/theme/tokens';

/** Axă „rotundă”: 1, 2, 2,5 sau 5 × 10^n, cu 4 intervale. */
function scala(max: number): number[] {
  if (max <= 0) return [0, 1];
  const brut = max / 4;
  const p = 10 ** Math.floor(Math.log10(brut));
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s * 4 >= max) ?? 10 * p;
  return [0, 1, 2, 3, 4].map((k) => k * pas);
}

const INALTIME = 200;

export default function IntrariChart({ intrari }: { intrari: IntrareLuna[] }) {
  const curenta = intrari.at(-1);
  const anterioara = intrari.at(-2);
  const ticks = scala(Math.max(...intrari.map((i) => i.kg)));
  const top = ticks.at(-1)!;
  const variatie = curenta && anterioara?.kg ? (curenta.kg - anterioara.kg) / anterioara.kg : null;

  return (
    <Card component="section" aria-labelledby="intrari-titlu" sx={{ height: '100%' }}>
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', position: 'relative' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography id="intrari-titlu" variant="h3" component="h2">
              Intrări acceptate pe lună
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kilograme din loturile acceptate, ultimele {intrari.length} luni
            </Typography>
          </Box>
          {curenta ? (
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="h2" component="p" className="num" sx={{ m: 0 }}>
                {formatNumber(curenta.kg)} kg
              </Typography>
              {variatie !== null ? (
                <Typography
                  variant="caption"
                  className="num"
                  sx={{ color: variatie >= 0 ? color.successText : color.danger, fontWeight: 500 }}
                >
                  {variatie >= 0 ? '+' : '−'}
                  {formatNumber(Math.round(Math.abs(variatie) * 100))}% față de {anterioara?.numeLung}
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mt: 'auto' }} aria-hidden>
          {/* Axa Y */}
          <Box sx={{ position: 'relative', width: 40, height: INALTIME, flexShrink: 0 }}>
            {ticks.map((t) => (
              <Typography
                key={t}
                variant="caption"
                className="num"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: `${(t / top) * 100}%`,
                  transform: 'translateY(50%)',
                  color: color.inkMuted,
                  fontSize: 12,
                }}
              >
                {formatNumber(t)}
              </Typography>
            ))}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ position: 'relative', height: INALTIME }}>
              {ticks.map((t) => (
                <Box
                  key={t}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${(t / top) * 100}%`,
                    borderTop: `1px solid ${t === 0 ? color.lineStrong : color.line}`,
                  }}
                />
              ))}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: { xs: 2, sm: 4 },
                }}
              >
                {intrari.map((i) => (
                  <Tooltip
                    key={i.luna}
                    placement="top"
                    title={`${i.numeLung} ${i.luna.slice(0, 4)} · ${formatNumber(i.kg)} kg · ${i.loturi === 1 ? '1 lot' : `${i.loturi} loturi`}`}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        cursor: 'default',
                      }}
                    >
                      <Typography
                        variant="caption"
                        className="num"
                        sx={{
                          fontSize: 12,
                          color: i.curenta ? color.ink : color.inkMuted,
                          fontWeight: i.curenta ? 600 : 400,
                          mb: 1,
                          whiteSpace: 'nowrap',
                          display: { xs: 'none', sm: 'block' },
                        }}
                      >
                        {formatNumber(i.kg)}
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 64,
                          height: `${(i.kg / top) * 100}%`,
                          minHeight: i.kg > 0 ? 2 : 0,
                          bgcolor: color.petrol,
                          opacity: i.curenta ? 1 : 0.28,
                          borderRadius: '4px 4px 0 0',
                          transition: 'opacity 150ms ease-out',
                          '*:hover > &': { opacity: i.curenta ? 1 : 0.45 },
                        }}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, mt: 2 }}>
              {intrari.map((i) => (
                <Typography
                  key={i.luna}
                  variant="caption"
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    color: i.curenta ? color.ink : color.inkMuted,
                    fontWeight: i.curenta ? 600 : 400,
                  }}
                >
                  {i.eticheta}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Aceleași date, pentru cititoarele de ecran. */}
        <Box sx={visuallyHidden}>
          <table>
            <caption>Kilograme acceptate pe lună</caption>
            <thead>
              <tr>
                <th scope="col">Luna</th>
                <th scope="col">Kg</th>
                <th scope="col">Loturi</th>
              </tr>
            </thead>
            <tbody>
              {intrari.map((i) => (
                <tr key={i.luna}>
                  <th scope="row">
                    {i.numeLung} {i.luna.slice(0, 4)}
                  </th>
                  <td>{formatNumber(i.kg)}</td>
                  <td>{i.loturi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
}

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;
