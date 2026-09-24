import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { IconBuildingWarehouse, IconShieldCheck, IconUserCheck } from '@tabler/icons-react';
import AuthShell from '@/components/layout/AuthShell';
import { intraCaPersona } from '@/lib/session/actions';
import { PAROLA_DEMO, PERSONAS, type PersonaKey } from '@/lib/session/personas';
import FormAutentificare from '@/features/auth/FormAutentificare';
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

type Props = { searchParams: Promise<{ parola?: string }> };

export default async function AutentificarePage({ searchParams }: Props) {
  const { parola } = await searchParams;
  return (
    <AuthShell title="Intră în cont" subtitle="Folosește emailul și parola contului tău DEEE Manager.">
      <FormAutentificare
        mesaj={parola === 'schimbata' ? 'Parola a fost schimbată. Intră în cont cu parola nouă.' : undefined}
      />

      <Divider>
        <Typography variant="caption" color="text.secondary">
          Mediu de test
        </Typography>
      </Divider>
      <Typography variant="caption" color="text.secondary">
        Parola tuturor conturilor de test este <strong className="num">{PAROLA_DEMO}</strong>. Poți intra și
        direct, cu un clic:
      </Typography>
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
              py: 2,
              px: 3,
              minHeight: 56,
              borderRadius: `${radius.lg}px`,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
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
              <Typography
                variant="caption"
                color="text.secondary"
                component="span"
                sx={{ display: 'block', overflowWrap: 'anywhere' }}
              >
                {PERSONAS[key].utilizator.email} · {descriere}
              </Typography>
            </Box>
          </Button>
        ))}
      </Box>
    </AuthShell>
  );
}
