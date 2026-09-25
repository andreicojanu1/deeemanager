'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { CampParola, IndicatorParola } from '@/features/auth/campuri';
import { color } from '@/theme/tokens';
import { salveazaNume, schimbaParola } from './actions';

type Props = { nume: string; email: string; organizatie: string; rol: string };

const card = { p: { xs: 5, sm: 6 }, display: 'flex', flexDirection: 'column', gap: 4 } as const;

export default function Cont({ nume, email, organizatie, rol }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        alignItems: 'start',
      }}
    >
      <DatePersonale nume={nume} email={email} organizatie={organizatie} rol={rol} />
      <SchimbaParola />
    </Box>
  );
}

function DatePersonale({ nume: initial, email, organizatie, rol }: Props) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [nume, setNume] = useState(initial);
  const [eroare, setEroare] = useState<string | null>(null);
  return (
    <Card component="section" aria-labelledby="date-titlu">
      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await salveazaNume(nume);
            if (r.ok) {
              arata('Numele a fost salvat.');
              router.refresh();
            } else setEroare(r.campuri?.nume ?? r.eroare);
          });
        }}
        sx={card}
      >
        <Typography id="date-titlu" variant="h3" component="h2">
          Date personale
        </Typography>
        <TextField
          id="nume"
          label="Nume și prenume"
          autoComplete="name"
          value={nume}
          onChange={(e) => {
            setNume(e.target.value);
            setEroare(null);
          }}
          error={Boolean(eroare)}
          helperText={eroare}
        />
        <TextField
          id="email"
          label="Email"
          value={email}
          helperText="Emailul e și numele de utilizator; îl schimbă administratorul platformei."
          slotProps={{ htmlInput: { readOnly: true } }}
          sx={{ '& .MuiInputBase-root': { bgcolor: color.canvas } }}
        />
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography color="text.secondary">Organizație</Typography>
          <Typography>
            {organizatie} · {rol}
          </Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={pending || nume.trim() === initial}
          sx={{ alignSelf: 'flex-start', minHeight: 44 }}
        >
          Salvează
        </Button>
      </Box>
    </Card>
  );
}

const PAROLA_GOALA = { curenta: '', parola: '', confirmare: '' };

function SchimbaParola() {
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState(PAROLA_GOALA);
  const [campuri, setCampuri] = useState<Record<string, string>>({});
  const set = (k: keyof typeof PAROLA_GOALA, val: string) => {
    setV((x) => ({ ...x, [k]: val }));
    setCampuri((c) => {
      const r = { ...c };
      delete r[k];
      return r;
    });
  };
  return (
    <Card component="section" aria-labelledby="parola-titlu">
      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await schimbaParola(v);
            if (r.ok) {
              arata('Parola a fost schimbată.');
              setV(PAROLA_GOALA);
              setCampuri({});
            } else setCampuri(r.campuri ?? {});
          });
        }}
        sx={card}
      >
        <Box>
          <Typography id="parola-titlu" variant="h3" component="h2">
            Schimbă parola
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mediu de test: parola conturilor de test rămâne cea afișată la autentificare.
          </Typography>
        </Box>
        <CampParola
          id="parola-curenta"
          label="Parola actuală"
          autoComplete="current-password"
          value={v.curenta}
          onChange={(e) => set('curenta', e.target.value)}
          error={Boolean(campuri.curenta)}
          helperText={campuri.curenta}
        />
        <CampParola
          id="parola-noua"
          label="Parolă nouă"
          autoComplete="new-password"
          value={v.parola}
          onChange={(e) => set('parola', e.target.value)}
          error={Boolean(campuri.parola)}
          helperText={campuri.parola}
        />
        <IndicatorParola parola={v.parola} />
        <CampParola
          id="parola-confirmare"
          label="Scrie parola nouă din nou"
          autoComplete="new-password"
          value={v.confirmare}
          onChange={(e) => set('confirmare', e.target.value)}
          error={Boolean(campuri.confirmare)}
          helperText={campuri.confirmare}
        />
        <Button
          type="submit"
          variant="outlined"
          disabled={pending}
          sx={{ alignSelf: 'flex-start', minHeight: 44 }}
        >
          Schimbă parola
        </Button>
      </Box>
    </Card>
  );
}
