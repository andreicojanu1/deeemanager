import Box from '@mui/material/Box';
import { color, radius } from '@/theme/tokens';
import { LOT_STATUS_LABEL, LOT_STATUS_TONE, type LotStatus, type StatusTone } from '@/lib/domain/status';

const TONE_STYLE: Record<StatusTone, { bg: string; fg: string; strike?: boolean }> = {
  neutral: { bg: color.canvas, fg: color.inkMuted },
  petrol: { bg: color.petrolSoft, fg: color.petrol },
  warning: { bg: color.warningSoft, fg: color.warningText },
  success: { bg: color.successSoft, fg: color.successText },
  danger: { bg: color.dangerSoft, fg: color.danger },
  cancelled: { bg: color.canvas, fg: color.inkMuted, strike: true },
};

type Props =
  { status: LotStatus; tone?: never; label?: never } | { status?: never; tone: StatusTone; label: string };

/** Badge de status: fundal `-soft`, text în varianta `-text`, radius 6. */
export default function StatusBadge(props: Props) {
  const tone = props.status ? LOT_STATUS_TONE[props.status] : props.tone;
  const label = props.status ? LOT_STATUS_LABEL[props.status] : props.label;
  const s = TONE_STYLE[tone];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        px: 2,
        borderRadius: `${radius.sm}px`,
        bgcolor: s.bg,
        color: s.fg,
        fontSize: 13,
        lineHeight: '18px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        textDecoration: s.strike ? 'line-through' : 'none',
        border: tone === 'neutral' || tone === 'cancelled' ? `1px solid ${color.line}` : 'none',
      }}
    >
      {label}
    </Box>
  );
}
