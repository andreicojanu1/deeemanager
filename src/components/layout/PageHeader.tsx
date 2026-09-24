import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Props = { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; badge?: ReactNode };

/** Titlul paginii 28/600, subtitlul în ink-muted, acțiunea principală aliniată la dreapta. */
export default function PageHeader({ title, subtitle, action, badge }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 4,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="display" component="h1">
            {title}
          </Typography>
          {badge}
        </Box>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16, lineHeight: '24px' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: { sm: 0 }, maxWidth: '100%' }}>{action}</Box> : null}
    </Box>
  );
}
