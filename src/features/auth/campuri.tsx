'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconAlertCircle, IconCircleCheck, IconEye, IconEyeOff } from '@tabler/icons-react';
import { ETICHETA_NIVEL, evalueazaParola } from '@/lib/domain/parola';
import { color, motion, radius } from '@/theme/tokens';

/** Câmp de parolă cu butonul „afișează / ascunde”. */
export function CampParola(props: TextFieldProps) {
  const [vizibila, setVizibila] = useState(false);
  return (
    <TextField
      {...props}
      type={vizibila ? 'text' : 'password'}
      slotProps={{
        ...props.slotProps,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVizibila((v) => !v)}
                aria-label={vizibila ? 'Ascunde parola' : 'Afișează parola'}
                edge="end"
                size="small"
              >
                {vizibila ? <IconEyeOff size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

const CULOARE = [color.lineStrong, color.danger, color.warning, color.success, color.success];

/** Indicatorul de complexitate: 4 segmente și ce mai lipsește. */
export function IndicatorParola({ parola }: { parola: string }) {
  if (!parola) return null;
  const { nivel, lipsa } = evalueazaParola(parola);
  return (
    <Box aria-live="polite" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: -2 }}>
      <Box sx={{ display: 'flex', gap: 1 }} aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: i <= nivel ? CULOARE[nivel] : color.line,
              transition: `background-color ${motion.fast}ms ${motion.easing}`,
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        Parolă {ETICHETA_NIVEL[nivel].toLowerCase()}
        {lipsa.length ? ` · mai adaugă ${lipsa.join(', ')}` : ''}
      </Typography>
    </Box>
  );
}

export function Alerta({ tip, children }: { tip: 'eroare' | 'succes'; children: React.ReactNode }) {
  const eroare = tip === 'eroare';
  return (
    <Box
      role={eroare ? 'alert' : 'status'}
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        bgcolor: eroare ? color.dangerSoft : color.successSoft,
        color: eroare ? color.danger : color.successText,
        borderRadius: `${radius.md}px`,
        px: 4,
        py: 3,
        fontSize: 14,
      }}
    >
      {eroare ? (
        <IconAlertCircle size={18} stroke={1.5} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      ) : (
        <IconCircleCheck size={18} stroke={1.5} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      )}
      <span>{children}</span>
    </Box>
  );
}
