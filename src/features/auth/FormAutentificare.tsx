'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { autentificare } from './actions';
import { Alerta, CampParola } from './campuri';

export default function FormAutentificare({ mesaj }: { mesaj?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);
  const [campuri, setCampuri] = useState<Record<string, string>>({});

  const trimite = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await autentificare({ email, parola });
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
      {mesaj ? <Alerta tip="succes">{mesaj}</Alerta> : null}
      {eroare ? <Alerta tip="eroare">{eroare}</Alerta> : null}
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={Boolean(campuri.email)}
        helperText={campuri.email}
      />
      <CampParola
        id="parola"
        label="Parolă"
        autoComplete="current-password"
        value={parola}
        onChange={(e) => setParola(e.target.value)}
        error={Boolean(campuri.parola)}
        helperText={campuri.parola}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2 }}>
        <Link component={NextLink} href="/recuperare-parola">
          Ai uitat parola?
        </Link>
      </Box>
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ minHeight: 44 }}
      >
        Intră în cont
      </Button>
      <Typography sx={{ textAlign: 'center' }} color="text.secondary">
        Nu ai cont?{' '}
        <Link component={NextLink} href="/inregistrare">
          Înregistrează-te
        </Link>
      </Typography>
    </Box>
  );
}
