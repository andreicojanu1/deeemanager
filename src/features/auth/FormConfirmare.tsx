'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { color, radius } from '@/theme/tokens';
import { confirmaEmail, retrimiteCod } from './actions';
import { Alerta } from './campuri';

const LUNGIME = 6;
const ASTEPTARE_S = 60;

/** Cod de 6 cifre: avans automat, înapoi cu Backspace, lipire dintr-o dată. */
export default function FormConfirmare({ codDemo }: { codDemo: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [cifre, setCifre] = useState<string[]>(() => Array(LUNGIME).fill(''));
  const [eroare, setEroare] = useState<string | null>(null);
  const [trimis, setTrimis] = useState(false);
  const [secunde, setSecunde] = useState(ASTEPTARE_S);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (secunde <= 0) return;
    const t = setTimeout(() => setSecunde((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secunde]);

  const confirma = (cod: string) =>
    start(async () => {
      const r = await confirmaEmail({ cod });
      if (r.ok) router.push(r.redirect);
      else {
        setEroare(r.eroare);
        setCifre(Array(LUNGIME).fill(''));
        refs.current[0]?.focus();
      }
    });

  const seteaza = (i: number, valoare: string) => {
    const doar = valoare.replace(/\D/g, '');
    if (!doar) {
      setCifre((c) => c.map((x, k) => (k === i ? '' : x)));
      return;
    }
    const noi = [...cifre];
    // Lipire sau tastare rapidă: umple de la poziția curentă.
    doar.split('').forEach((d, k) => {
      if (i + k < LUNGIME) noi[i + k] = d;
    });
    setCifre(noi);
    setEroare(null);
    const urm = Math.min(i + doar.length, LUNGIME - 1);
    refs.current[urm]?.focus();
    if (noi.every(Boolean)) confirma(noi.join(''));
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        confirma(cifre.join(''));
      }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}
    >
      {eroare ? <Alerta tip="eroare">{eroare}</Alerta> : null}
      {trimis ? <Alerta tip="succes">Ți-am trimis un cod nou.</Alerta> : null}
      <Box
        role="group"
        aria-label="Codul de confirmare, 6 cifre"
        sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, justifyContent: 'center' }}
      >
        {cifre.map((c, i) => (
          <Box
            key={i}
            component="input"
            ref={(el: HTMLInputElement | null) => {
              refs.current[i] = el;
            }}
            aria-label={`Cifra ${i + 1}`}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={LUNGIME}
            value={c}
            autoFocus={i === 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => seteaza(i, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Backspace' && !cifre[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
              if (e.key === 'ArrowRight' && i < LUNGIME - 1) refs.current[i + 1]?.focus();
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            className="num"
            sx={{
              width: { xs: 44, sm: 52 },
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: color.ink,
              border: `1px solid ${eroare ? color.danger : color.lineStrong}`,
              borderRadius: `${radius.md}px`,
              bgcolor: color.surface,
              outline: 'none',
              '&:focus': { borderColor: color.petrol, boxShadow: `0 0 0 1px ${color.petrol}` },
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        Mediu de test: codul este <strong className="num">{codDemo}</strong>.
      </Typography>
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={pending || cifre.some((c) => !c)}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        sx={{ minHeight: 44 }}
      >
        Confirmă adresa
      </Button>
      <Button
        variant="text"
        disabled={secunde > 0}
        onClick={async () => {
          await retrimiteCod();
          setTrimis(true);
          setSecunde(ASTEPTARE_S);
        }}
      >
        {secunde > 0 ? `Retrimite codul în ${secunde} s` : 'Retrimite codul'}
      </Button>
    </Box>
  );
}
