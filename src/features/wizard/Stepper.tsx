'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { IconCheck } from '@tabler/icons-react';
import type { Pas } from '@/lib/domain/ciorna';
import { color, motion } from '@/theme/tokens';

export const PASI = ['Informații', 'Documente', 'Confirmare'] as const;

type Props = { pas: Pas; complet: (p: Pas) => boolean; laPas: (p: Pas) => void };

/** Stepper-ul din dreapta-sus: pașii parcurși au bifă; te poți întoarce la ei. */
export default function Stepper({ pas, complet, laPas }: Props) {
  return (
    <Box
      component="ol"
      aria-label="Pașii lotului"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 6, alignItems: 'center' }}
    >
      {PASI.map((eticheta, i) => {
        const p = (i + 1) as Pas;
        const curent = p === pas;
        const trecut = p < pas;
        const bifat = trecut && complet(p);
        return (
          <li key={eticheta}>
            <ButtonBase
              onClick={() => laPas(p)}
              disabled={!trecut}
              aria-current={curent ? 'step' : undefined}
              aria-label={`Pasul ${p}: ${eticheta}${bifat ? ', completat' : curent ? ', curent' : ''}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                borderRadius: '8px',
                p: 1,
                '&.Mui-disabled': { opacity: 1 },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: `all ${motion.base}ms ${motion.easing}`,
                  ...(bifat
                    ? { bgcolor: color.petrol, color: color.onPetrol }
                    : curent
                      ? { border: `2px solid ${color.petrol}`, color: color.petrol }
                      : { border: `1px solid ${color.lineStrong}`, color: color.inkMuted }),
                }}
              >
                {bifat ? <IconCheck size={18} stroke={2} aria-hidden /> : p}
              </Box>
              <Typography
                variant="bodyStrong"
                sx={{
                  color: curent || bifat ? color.ink : color.inkMuted,
                  fontSize: 16,
                  fontWeight: curent ? 600 : 500,
                }}
              >
                {eticheta}
              </Typography>
            </ButtonBase>
          </li>
        );
      })}
    </Box>
  );
}
