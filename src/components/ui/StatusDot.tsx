import Box from '@mui/material/Box';
import { color } from '@/theme/tokens';

export type DotTone = 'success' | 'warning' | 'danger' | 'petrol' | 'neutral';

const FILL: Record<DotTone, string> = {
  success: color.success,
  warning: color.warning,
  danger: color.danger,
  petrol: color.petrol,
  neutral: color.lineStrong,
};

/** Punctul de semafor. Merge mereu lângă un text care spune același lucru. */
export default function StatusDot({ tone, size = 10 }: { tone: DotTone; size?: number }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: FILL[tone],
        flexShrink: 0,
      }}
    />
  );
}
