import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { color, radius } from '@/theme/tokens';

/** Stare goală: un mesaj și un singur buton (BRAND.md, „Voce și microcopy”). */
export default function EmptyState({
  icon,
  message,
  action,
}: {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        py: 10,
        px: 6,
        textAlign: 'center',
      }}
    >
      {icon ? (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: `${radius.lg}px`,
            bgcolor: color.canvas,
            color: color.inkMuted,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography color="text.secondary">{message}</Typography>
      {action}
    </Box>
  );
}
