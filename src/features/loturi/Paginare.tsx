'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { color } from '@/theme/tokens';

export default function Paginare({ pagina, pagini }: { pagina: number; pagini: number }) {
  const pathname = usePathname();
  const params = useSearchParams();
  if (pagini <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    if (p === 1) sp.delete('pagina');
    else sp.set('pagina', String(p));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <Box
      component="nav"
      aria-label="Paginare"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        px: 6,
        py: 3,
        borderTop: `1px solid ${color.line}`,
      }}
    >
      <Typography variant="caption" color="text.secondary" className="num" sx={{ mr: 2 }}>
        Pagina {pagina} din {pagini}
      </Typography>
      <IconButton
        component={pagina > 1 ? NextLink : 'button'}
        href={pagina > 1 ? href(pagina - 1) : undefined}
        disabled={pagina <= 1}
        aria-label="Pagina anterioară"
        sx={{ border: `1px solid ${color.line}` }}
      >
        <IconChevronLeft size={18} stroke={1.5} />
      </IconButton>
      <IconButton
        component={pagina < pagini ? NextLink : 'button'}
        href={pagina < pagini ? href(pagina + 1) : undefined}
        disabled={pagina >= pagini}
        aria-label="Pagina următoare"
        sx={{ border: `1px solid ${color.line}` }}
      >
        <IconChevronRight size={18} stroke={1.5} />
      </IconButton>
    </Box>
  );
}
