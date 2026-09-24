import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconSparkles } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { color, radius } from '@/theme/tokens';

/**
 * Marcajul datelor extrase de AI: icon + „Extras de AI” în culoarea `ai`, fundal `ai-soft`.
 * `label` permite „Verificat de AI” pentru verificarea fotografiilor.
 */
export default function AiExtracted({
  children,
  label = 'Extras de AI',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 3,
        bgcolor: color.aiSoft,
        borderRadius: `${radius.md}px`,
        px: 4,
        py: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color.ai, flexShrink: 0, pt: '1px' }}>
        <IconSparkles size={16} stroke={1.5} aria-hidden />
        <Typography variant="caption" sx={{ color: color.ai, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body1" component="div" className="num" sx={{ minWidth: 0 }}>
        {children}
      </Typography>
    </Box>
  );
}
