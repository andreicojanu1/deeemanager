import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { IconBuildingWarehouse, IconShieldCheck, IconUserCheck } from '@tabler/icons-react';
import AuthShell from '@/components/layout/AuthShell';
import { intraCaPersona } from '@/lib/session/actions';
import { PERSONAS, type PersonaKey } from '@/lib/session/personas';
import { color, radius } from '@/theme/tokens';

export const metadata: Metadata = { title: 'Autentificare' };

const OPTIUNI: { key: PersonaKey; titlu: string; descriere: string; Icon: typeof IconUserCheck }[] = [
  {
    key: 'colector-activ',
    titlu: 'Colector cu cont activ',
    descriere: 'Panou, loturi, lot nou, organizație.',
    Icon: IconBuildingWarehouse,
  },
  {
    key: 'colector-neactivat',
    titlu: 'Colector cu cont neactivat',
    descriere: 'Ajunge direct la activarea contului.',
    Icon: IconUserCheck,
  },
  {
    key: 'admin',
    titlu: 'Administrator platformă',
    descriere: 'Coada de verificare, colectori, taxonomie.',
    Icon: IconShieldCheck,
  },
];

export default function AutentificarePage() {
  return (
    <AuthShell
      title="Intră în cont"
      subtitle="Mediu de test: alege contul cu care vrei să vezi aplicația. Formularul cu email și parolă vine la pasul 9."
    >
      <Box component="form" action={intraCaPersona} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {OPTIUNI.map(({ key, titlu, descriere, Icon }) => (
          <Button
            key={key}
            type="submit"
            name="persona"
            value={key}
            variant="outlined"
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              gap: 4,
              py: 3,
              px: 4,
              minHeight: 64,
              borderRadius: `${radius.lg}px`,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: `${radius.md}px`,
                bgcolor: color.petrolSoft,
                color: color.petrol,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon size={20} stroke={1.5} aria-hidden />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="bodyStrong" component="span" sx={{ display: 'block' }}>
                {titlu}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                {PERSONAS[key].organizatie.denumire} · {descriere}
              </Typography>
            </Box>
          </Button>
        ))}
      </Box>
      <Divider />
      <Typography variant="caption" color="text.secondary">
        Conturile de test dispar în Faza B, când autentificarea se face cu email și parolă.
      </Typography>
    </AuthShell>
  );
}
