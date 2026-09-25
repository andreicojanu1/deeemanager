'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { color, radius } from '@/theme/tokens';

export type IntrareCuprins = { id: string; titlu: string };

/** Cuprinsul lipit în dreapta; secțiunea în care te afli e marcată. */
export default function Cuprins({ intrari }: { intrari: IntrareCuprins[] }) {
  const [activ, setActiv] = useState(intrari[0]?.id);

  useEffect(() => {
    const titluri = intrari
      .map((i) => document.getElementById(i.id))
      .filter((x): x is HTMLElement => Boolean(x));
    const obs = new IntersectionObserver(
      (e) => {
        const vizibile = e
          .filter((x) => x.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vizibile[0]) setActiv(vizibile[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    titluri.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [intrari]);

  return (
    <Box component="nav" aria-labelledby="cuprins-titlu">
      <Typography
        id="cuprins-titlu"
        variant="overline"
        component="h2"
        sx={{ color: color.inkMuted, display: 'block', mb: 2 }}
      >
        Cuprins
      </Typography>
      <Box
        component="ol"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}
      >
        {intrari.map((i) => {
          const curent = i.id === activ;
          return (
            <li key={i.id}>
              <Box
                component="a"
                href={`#${i.id}`}
                aria-current={curent ? 'location' : undefined}
                onClick={() => setActiv(i.id)}
                sx={{
                  display: 'block',
                  px: 3,
                  py: 1.5,
                  borderRadius: `${radius.md}px`,
                  fontSize: 14,
                  lineHeight: '20px',
                  textDecoration: 'none',
                  color: curent ? `${color.petrol} !important` : `${color.inkMuted} !important`,
                  fontWeight: curent ? 600 : 400,
                  bgcolor: curent ? color.petrolSoft : 'transparent',
                  borderLeft: `2px solid ${curent ? color.petrol : 'transparent'}`,
                  transition: 'background-color 150ms ease-out',
                  '&:hover': { bgcolor: curent ? color.petrolSoft : color.canvas },
                  '@media (pointer: coarse)': { py: 3 },
                }}
              >
                {i.titlu}
              </Box>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}
