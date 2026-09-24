import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import StatusDot, { type DotTone } from '@/components/ui/StatusDot';
import type { LoturiPeStatus, StatusGrup } from '@/lib/domain/panou';
import { formatPercent } from '@/lib/format';
import { color } from '@/theme/tokens';

const ETICHETA: Record<StatusGrup, string> = {
  ACCEPTAT: 'Acceptate',
  IN_VERIFICARE: 'În verificare',
  NECESITA_COMPLETARI: 'Necesită completări',
  RESPINS: 'Respinse',
};

const TON: Record<StatusGrup, DotTone> = {
  ACCEPTAT: 'success',
  IN_VERIFICARE: 'petrol',
  NECESITA_COMPLETARI: 'warning',
  RESPINS: 'danger',
};

const FILL: Record<DotTone, string> = {
  success: color.success,
  petrol: color.petrol,
  warning: color.warning,
  danger: color.danger,
  neutral: color.lineStrong,
};

function durata(min: number | null): string {
  if (min === null) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

const pct = (r: number) => formatPercent(Math.round(r * 100) / 100);

export default function StatusuriCard({ statusuri }: { statusuri: LoturiPeStatus }) {
  const vizibile = statusuri.grupuri.filter((g) => g.numar > 0);
  return (
    <Card component="section" aria-labelledby="statusuri-titlu" sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <Box>
          <Typography id="statusuri-titlu" variant="h3" component="h2">
            Loturi pe status
          </Typography>
          <Typography variant="body1" color="text.secondary" className="num">
            Ultimele 30 de zile ·{' '}
            {statusuri.total === 1 ? '1 lot trimis' : `${statusuri.total} loturi trimise`}
          </Typography>
        </Box>

        {/* Bară segmentată, cu 2 px de spațiu între segmente. */}
        <Box aria-hidden sx={{ display: 'flex', gap: '2px', height: 12 }}>
          {vizibile.map((g, i) => (
            <Box
              key={g.status}
              sx={{
                flexGrow: g.numar,
                flexBasis: 0,
                minWidth: 6,
                bgcolor: FILL[TON[g.status]],
                borderRadius: `${i === 0 ? 4 : 0}px ${i === vizibile.length - 1 ? 4 : 0}px ${i === vizibile.length - 1 ? 4 : 0}px ${i === 0 ? 4 : 0}px`,
              }}
            />
          ))}
        </Box>

        <Box
          component="dl"
          sx={{ m: 0, display: 'grid', gridTemplateColumns: '1fr auto 48px', rowGap: 3, columnGap: 4 }}
        >
          {statusuri.grupuri.map((g) => (
            <Box key={g.status} sx={{ display: 'contents' }}>
              <Box component="dt" sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <StatusDot tone={TON[g.status]} />
                <Typography variant="body1">{ETICHETA[g.status]}</Typography>
              </Box>
              <Typography
                component="dd"
                variant="bodyStrong"
                className="num"
                sx={{ m: 0, textAlign: 'right' }}
              >
                {g.numar}
              </Typography>
              <Typography
                component="dd"
                variant="body1"
                color="text.secondary"
                className="num"
                sx={{ m: 0, textAlign: 'right' }}
              >
                {pct(g.pondere)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          component="dl"
          sx={{
            m: 0,
            mt: 'auto',
            pt: 5,
            borderTop: `1px solid ${color.line}`,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
          }}
        >
          <Box>
            <Typography component="dt" variant="caption" color="text.secondary">
              Timp mediu de verificare
            </Typography>
            <Typography component="dd" variant="h2" className="num" sx={{ m: 0 }}>
              {durata(statusuri.timpMediuVerificareMin)}
            </Typography>
          </Box>
          <Box>
            <Typography component="dt" variant="caption" color="text.secondary">
              Acceptate din prima
            </Typography>
            <Typography component="dd" variant="h2" className="num" sx={{ m: 0 }}>
              {statusuri.acceptateDinPrima === null ? '—' : pct(statusuri.acceptateDinPrima)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
