import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconCheck } from '@tabler/icons-react';
import { ETAPE, type EtapaOnboarding } from '@/lib/domain/onboarding';
import { color, motion } from '@/theme/tokens';

/** Cele 4 stări ale activării: Documente → În verificare → Vizită în teren → Activ. */
export default function StepperActivare({ etapa }: { etapa: EtapaOnboarding }) {
  const curent = ETAPE.findIndex((e) => e.etapa === etapa);
  return (
    <Box
      component="ol"
      aria-label="Etapele activării contului"
      sx={{
        listStyle: 'none',
        m: 0,
        p: { xs: 4, sm: 5 },
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: '10px',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
        gap: { xs: 4, md: 0 },
      }}
    >
      {ETAPE.map((e, i) => {
        const trecut = i < curent;
        const activ = i === curent;
        return (
          <Box
            component="li"
            key={e.etapa}
            aria-current={activ ? 'step' : undefined}
            sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}
          >
            <Box
              className="num"
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                bgcolor: trecut || activ ? color.petrol : color.surface,
                color: trecut || activ ? color.surface : color.inkMuted,
                border: trecut || activ ? 'none' : `1px solid ${color.lineStrong}`,
                transition: `background-color ${motion.base}ms ${motion.easing}`,
              }}
            >
              {trecut ? <IconCheck size={16} stroke={2} aria-hidden /> : i + 1}
            </Box>
            <Typography
              sx={{ color: activ ? color.ink : color.inkMuted, fontWeight: activ ? 600 : 400, minWidth: 0 }}
            >
              {e.eticheta}
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                }}
              >
                {trecut ? ', finalizat' : activ ? ', etapa curentă' : ''}
              </Box>
            </Typography>
            {i < ETAPE.length - 1 ? (
              <Box
                aria-hidden
                sx={{
                  display: { xs: 'none', md: 'block' },
                  flex: 1,
                  height: '1px',
                  mx: 3,
                  bgcolor: trecut ? color.petrol : color.line,
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
