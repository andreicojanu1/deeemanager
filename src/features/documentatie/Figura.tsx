'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { IconX, IconZoomIn } from '@tabler/icons-react';
import { color, radius } from '@/theme/tokens';
import capturi from './capturi.json';

export type NumeCaptura = keyof typeof capturi;

type Props = {
  captura: NumeCaptura;
  /** Textul alternativ: ce se vede în imagine, pentru cine nu o vede. */
  alt: string;
  legenda: string;
  /** Capturile de pe telefon se afișează înguste, nu pe toată lățimea. */
  latimeMaxima?: number;
};

/** Captură din platformă, cu legendă; un clic o deschide mărită. */
export default function Figura({ captura, alt, legenda, latimeMaxima }: Props) {
  const [marita, setMarita] = useState(false);
  const { latime, inaltime } = capturi[captura];
  const src = `/documentatie/${captura}.png`;

  return (
    <Box component="figure" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ButtonBase
        onClick={() => setMarita(true)}
        aria-label={`Mărește captura: ${legenda}`}
        sx={{
          position: 'relative',
          display: 'block',
          width: '100%',
          maxWidth: latimeMaxima,
          borderRadius: `${radius.lg}px`,
          border: `1px solid ${color.line}`,
          overflow: 'hidden',
          bgcolor: color.canvas,
          cursor: 'zoom-in',
          '&:hover .marire, &.Mui-focusVisible .marire': { opacity: 1 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={latime}
          height={inaltime}
          loading="lazy"
          decoding="async"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        <Box
          className="marire"
          aria-hidden
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: `${radius.md}px`,
            bgcolor: color.surface,
            border: `1px solid ${color.line}`,
            color: color.ink,
            fontSize: 13,
            opacity: 0,
            transition: 'opacity 150ms ease-out',
            '@media (hover: none)': { opacity: 1 },
          }}
        >
          <IconZoomIn size={16} stroke={1.5} />
          Mărește
        </Box>
      </ButtonBase>
      <Typography component="figcaption" variant="caption" color="text.secondary">
        {legenda}
      </Typography>

      <Dialog
        open={marita}
        onClose={() => setMarita(false)}
        maxWidth={false}
        aria-label={legenda}
        slotProps={{ paper: { sx: { m: { xs: 2, sm: 6 }, maxWidth: 'min(1400px, calc(100vw - 32px))' } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            px: 4,
            py: 2,
            borderBottom: `1px solid ${color.line}`,
          }}
        >
          <Typography variant="bodyStrong" sx={{ flex: 1 }}>
            {legenda}
          </Typography>
          <IconButton onClick={() => setMarita(false)} aria-label="Închide">
            <IconX size={20} stroke={1.5} />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto', bgcolor: color.canvas }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={latime}
            height={inaltime}
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
