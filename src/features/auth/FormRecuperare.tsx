'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import NextLink from 'next/link';
import { recuperareParola } from './actions';
import { Alerta } from './campuri';

export default function FormRecuperare() {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);
  const [trimis, setTrimis] = useState(false);

  if (trimis) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Mesaj neutru: nu confirmăm dacă adresa există. */}
        <Alerta tip="succes">
          Dacă adresa există, vei primi un email cu linkul de resetare în câteva minute.
        </Alerta>
        <Link component={NextLink} href="/autentificare">
          Înapoi la autentificare
        </Link>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await recuperareParola({ email });
          if (r.ok) setTrimis(true);
          else setEroare(r.eroare);
        });
      }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}
    >
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEroare(null);
        }}
        error={Boolean(eroare)}
        helperText={eroare}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ minHeight: 44 }}
      >
        Trimite link
      </Button>
      <Link component={NextLink} href="/autentificare" sx={{ alignSelf: 'center' }}>
        Înapoi la autentificare
      </Link>
    </Box>
  );
}
