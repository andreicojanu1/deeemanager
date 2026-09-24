import Box from '@mui/material/Box';
import Image from 'next/image';
import { color, font } from '@/theme/tokens';

/** Simbolul de 28 px + „DEEE Manager” în Montserrat 700. Magenta apare doar aici. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Box
      aria-label="DEEE Manager"
      role="img"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px', height: 40 }}
    >
      <Image
        src="/brand/deee-manager-mark.png"
        alt=""
        width={Math.round((size * 152) / 132)}
        height={size}
        priority
      />
      <Box
        component="span"
        aria-hidden
        sx={{
          fontFamily: font.logo,
          fontWeight: 700,
          fontSize: Math.round((size * 17) / 28),
          letterSpacing: '-0.01em',
          color: color.logoText,
          whiteSpace: 'nowrap',
        }}
      >
        DEEE Manager
      </Box>
    </Box>
  );
}
