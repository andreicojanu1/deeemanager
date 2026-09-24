'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { TIPURI_CONT, type TipCont } from '@/lib/session/personas';
import { color, radius } from '@/theme/tokens';
import { inregistrare } from './actions';
import { Alerta, CampParola, IndicatorParola } from './campuri';

const DESCRIERE_TIP: Record<TipCont, string> = {
  COLECTOR: 'Colectezi DEEE și încarci loturi.',
  COLECTOR_TRATATOR: 'Colectezi și tratezi DEEE; în MVP folosești funcțiile de colector.',
  TRATATOR: 'Disponibil într-o etapă următoare.',
};

export default function FormInregistrare() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState({ nume: '', email: '', parola: '', tip: 'COLECTOR' as TipCont, termeni: false });
  const [eroare, setEroare] = useState<string | null>(null);
  const [campuri, setCampuri] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => {
    setV((x) => ({ ...x, [k]: val }));
    setCampuri((c) => {
      const rest = { ...c };
      delete rest[k];
      return rest;
    });
  };

  const trimite = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await inregistrare(v);
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
      <TextField
        id="nume"
        label="Nume și prenume"
        autoComplete="name"
        value={v.nume}
        onChange={(e) => set('nume', e.target.value)}
        error={Boolean(campuri.nume)}
        helperText={campuri.nume}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={v.email}
        onChange={(e) => set('email', e.target.value)}
        error={Boolean(campuri.email)}
        helperText={campuri.email ?? 'Aici primești codul de confirmare.'}
      />
      <CampParola
        id="parola"
        label="Parolă"
        autoComplete="new-password"
        value={v.parola}
        onChange={(e) => set('parola', e.target.value)}
        error={Boolean(campuri.parola)}
        helperText={campuri.parola}
      />
      <IndicatorParola parola={v.parola} />

      <FormControl error={Boolean(campuri.tip)}>
        <FormLabel id="tip-cont" sx={{ mb: 2 }}>
          Tip cont
        </FormLabel>
        <RadioGroup
          aria-labelledby="tip-cont"
          value={v.tip}
          onChange={(e) => set('tip', e.target.value as TipCont)}
          sx={{ gap: 2 }}
        >
          {(Object.keys(TIPURI_CONT) as TipCont[]).map((t) => {
            const dezactivat = t === 'TRATATOR';
            return (
              <FormControlLabel
                key={t}
                value={t}
                disabled={dezactivat}
                control={<Radio sx={{ p: 2.5 }} />}
                label={
                  <Box>
                    <Typography
                      variant="bodyStrong"
                      component="span"
                      sx={{ display: 'block', color: dezactivat ? color.inkMuted : color.ink }}
                    >
                      {TIPURI_CONT[t]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="span">
                      {DESCRIERE_TIP[t]}
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  alignItems: 'flex-start',
                  border: `1px solid ${v.tip === t ? color.petrol : color.line}`,
                  bgcolor: v.tip === t ? color.petrolSoft : 'transparent',
                  borderRadius: `${radius.md}px`,
                  pr: 3,
                  py: 1,
                  '& .MuiFormControlLabel-label': { pt: 2 },
                  '& .MuiFormControlLabel-label.Mui-disabled': { color: color.inkMuted },
                }}
              />
            );
          })}
        </RadioGroup>
      </FormControl>

      <FormControl error={Boolean(campuri.termeni)}>
        <FormControlLabel
          control={
            <Checkbox
              id="termeni"
              checked={v.termeni}
              onChange={(e) => set('termeni', e.target.checked)}
              sx={{ p: 2.5 }}
            />
          }
          label="Sunt de acord cu termenii de utilizare și cu politica de confidențialitate"
          sx={{ alignItems: 'flex-start', m: 0, '& .MuiFormControlLabel-label': { pt: 2.25 } }}
        />
        {campuri.termeni ? <FormHelperText>{campuri.termeni}</FormHelperText> : null}
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ minHeight: 44 }}
      >
        Creează contul
      </Button>
      <Typography sx={{ textAlign: 'center' }} color="text.secondary">
        Ai deja cont?{' '}
        <Link component={NextLink} href="/autentificare">
          Intră în cont
        </Link>
      </Typography>
    </Box>
  );
}
