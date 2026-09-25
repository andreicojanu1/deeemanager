import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconBulb, IconInfoCircle, IconSparkles, type Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { color, radius } from '@/theme/tokens';

/** O secțiune a documentației: titlu h2 cu ancoră, conținut în coloană. */
export function Sectiune({
  id,
  titlu,
  intro,
  children,
}: {
  id: string;
  titlu: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" aria-labelledby={id} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography id={id} variant="h2" component="h2" sx={{ scrollMarginTop: 88 }}>
          {titlu}
        </Typography>
        {intro ? (
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16, lineHeight: '24px' }}>
            {intro}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}

export function Subtitlu({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <Typography id={id} variant="h3" component="h3" sx={{ mt: 2, scrollMarginTop: 88 }}>
      {children}
    </Typography>
  );
}

export function Paragraf({ children }: { children: ReactNode }) {
  return <Typography sx={{ fontSize: 16, lineHeight: '26px' }}>{children}</Typography>;
}

/** Pași numerotați: ce faci, în ordine. */
export function Pasi({ pasi }: { pasi: ReactNode[] }) {
  return (
    <Box
      component="ol"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      {pasi.map((p, i) => (
        <Box component="li" key={i} sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Box
            aria-hidden
            className="num"
            sx={{
              width: 24,
              height: 24,
              flexShrink: 0,
              mt: '1px',
              borderRadius: '50%',
              bgcolor: color.petrolSoft,
              color: color.petrol,
              fontSize: 13,
              fontWeight: 600,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {i + 1}
          </Box>
          <Typography component="div" sx={{ fontSize: 16, lineHeight: '26px', minWidth: 0 }}>
            {p}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/** Listă cu puncte, pentru enumerări scurte. */
export function Lista({ elemente }: { elemente: ReactNode[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {elemente.map((e, i) => (
        <Typography component="li" key={i} sx={{ fontSize: 16, lineHeight: '26px' }}>
          {e}
        </Typography>
      ))}
    </Box>
  );
}

const NOTE: Record<'sfat' | 'info' | 'ai', { Icon: Icon; titlu: string; fundal: string; accent: string }> = {
  sfat: { Icon: IconBulb, titlu: 'Bine de știut', fundal: color.petrolSoft, accent: color.petrol },
  info: { Icon: IconInfoCircle, titlu: 'De reținut', fundal: color.canvas, accent: color.inkMuted },
  ai: { Icon: IconSparkles, titlu: 'Despre AI', fundal: color.aiSoft, accent: color.ai },
};

export function Nota({
  tip = 'sfat',
  titlu,
  children,
}: {
  tip?: keyof typeof NOTE;
  titlu?: string;
  children: ReactNode;
}) {
  const n = NOTE[tip];
  return (
    <Box
      role="note"
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
        bgcolor: n.fundal,
        border: tip === 'info' ? `1px solid ${color.line}` : 'none',
        borderRadius: `${radius.lg}px`,
        p: { xs: 4, sm: 5 },
      }}
    >
      <n.Icon size={20} stroke={1.5} color={n.accent} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="bodyStrong" component="p" sx={{ color: n.accent }}>
          {titlu ?? n.titlu}
        </Typography>
        <Typography component="div" sx={{ fontSize: 15, lineHeight: '24px' }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

/** Numele unui buton sau câmp din platformă, scris cum apare pe ecran. */
export function Ui({ children }: { children: ReactNode }) {
  return (
    <Box component="strong" sx={{ fontWeight: 600, color: color.ink }}>
      {children}
    </Box>
  );
}
