'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { activeazaCont, reseteazaParola } from './actions';
import { Alerta, CampParola, IndicatorParola } from './campuri';

type Props = { mod: 'resetare' | 'activare'; token: string; emailInvitat?: string };

/** Parola nouă: la resetare (din emailul de recuperare) sau la activarea unei invitații. */
export default function FormParolaNoua({ mod, token, emailInvitat }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [parola, setParola] = useState('');
  const [confirmare, setConfirmare] = useState('');
  const [termeni, setTermeni] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [campuri, setCampuri] = useState<Record<string, string>>({});

  const trimite = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r =
        mod === 'resetare'
          ? await reseteazaParola({ token, parola, confirmare })
          : await activeazaCont({ token, parola, confirmare, termeni });
      if (r.ok) router.push(r.redirect);
      else {
        setEroare(r.eroare);
        setCampuri(r.campuri ?? {});
      }
    });
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={trimite}
      sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}
    >
      {eroare ? <Alerta tip="eroare">{eroare}</Alerta> : null}
      {emailInvitat ? (
        <TextField
          id="email-invitat"
          label="Email"
          value={emailInvitat}
          slotProps={{ htmlInput: { readOnly: true } }}
          helperText="Adresa la care ai primit invitația."
        />
      ) : null}
      <CampParola
        id="parola"
        label="Parolă nouă"
        autoComplete="new-password"
        value={parola}
        onChange={(e) => setParola(e.target.value)}
        error={Boolean(campuri.parola)}
        helperText={campuri.parola}
      />
      <IndicatorParola parola={parola} />
      <CampParola
        id="confirmare"
        label="Scrie parola din nou"
        autoComplete="new-password"
        value={confirmare}
        onChange={(e) => setConfirmare(e.target.value)}
        error={Boolean(campuri.confirmare)}
        helperText={campuri.confirmare}
      />
      {mod === 'activare' ? (
        <FormControl error={Boolean(campuri.termeni)}>
          <FormControlLabel
            control={
              <Checkbox
                id="termeni"
                checked={termeni}
                onChange={(e) => setTermeni(e.target.checked)}
                sx={{ p: 2.5 }}
              />
            }
            label="Sunt de acord cu termenii de utilizare și cu politica de confidențialitate"
            sx={{ alignItems: 'flex-start', m: 0, '& .MuiFormControlLabel-label': { pt: 2.25 } }}
          />
          {campuri.termeni ? <FormHelperText>{campuri.termeni}</FormHelperText> : null}
        </FormControl>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ minHeight: 44 }}
      >
        {mod === 'resetare' ? 'Salvează parola' : 'Activează contul'}
      </Button>
    </Box>
  );
}
