import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import Logo from '@/components/brand/Logo';
import { color } from '@/theme/tokens';

type Props = { title: string; subtitle?: ReactNode; children?: ReactNode; width?: number };

/** Card alb centrat de 440 px pe canvas, logo deasupra, fără meniu. */
export default function AuthShell({ title, subtitle, children, width = 440 }: Props) {
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
        gap: 6,
        px: 4,
        py: 8,
      }}
    >
      <Logo />
      <Card sx={{ width: '100%', maxWidth: width }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 6, p: { xs: 6, sm: 8 } }}>
          <Box>
            <Typography variant="h2" component="h1">
              {title}
            </Typography>
            {subtitle ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
