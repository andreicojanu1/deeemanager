import Box from '@mui/material/Box';
import ButtonLink from '@/components/ui/ButtonLink';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import Logo from '@/components/brand/Logo';
import { color, radius } from '@/theme/tokens';

type Props = {
  code: string;
  title: string;
  description: ReactNode;
  icon: ReactNode;
  action?: ReactNode;
};

/** Pagini de sistem (404, eroare, acces interzis): un mesaj și o singură acțiune. */
export default function SystemPage({ code, title, description, icon, action }: Props) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        bgcolor: color.canvas,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        px: 4,
        py: 8,
        textAlign: 'center',
      }}
    >
      <Logo />
      <Box sx={{ maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: `${radius.lg}px`,
            bgcolor: color.surface,
            border: `1px solid ${color.line}`,
            color: color.inkMuted,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" className="num">
          {code}
        </Typography>
        <Typography variant="display" component="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: '24px' }}>
          {description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {action ?? (
            <ButtonLink href="/" variant="contained">
              Mergi la pagina de start
            </ButtonLink>
          )}
        </Box>
      </Box>
    </Box>
  );
}
