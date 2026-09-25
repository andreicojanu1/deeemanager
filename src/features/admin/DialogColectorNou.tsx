'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { invitaColector } from './actions';

const GOL = { denumire: '', cui: '', nume: '', email: '' };

/** „Colector nou”: adminul creează firma și trimite invitația administratorului ei. */
export default function DialogColectorNou() {
  const router = useRouter();
  const { arata } = useToast();
  const [deschis, setDeschis] = useState(false);
  const [v, setV] = useState(GOL);
  const [campuri, setCampuri] = useState<Record<string, string>>({});
  const [eroare, setEroare] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const inchide = () => {
    setDeschis(false);
    setV(GOL);
    setCampuri({});
    setEroare(null);
  };

  const camp = (k: keyof typeof GOL, label: string, extra?: object) => (
    <TextField
      id={`nou-${k}`}
      label={label}
      value={v[k]}
      onChange={(e) => {
        setV({ ...v, [k]: e.target.value });
        setCampuri((c) => {
          const r = { ...c };
          delete r[k];
          return r;
        });
      }}
      error={Boolean(campuri[k])}
      helperText={campuri[k]}
      {...extra}
    />
  );

  return (
    <>
      <Button
        variant="contained"
        startIcon={<IconPlus size={18} stroke={1.5} />}
        onClick={() => setDeschis(true)}
      >
        Colector nou
      </Button>
      <Dialog open={deschis} onClose={inchide} fullWidth maxWidth="sm" aria-labelledby="colector-nou-titlu">
        <Box
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await invitaColector(v);
              if (r.ok) {
                inchide();
                arata(`Am trimis invitația la ${v.email.trim().toLowerCase()}.`);
                router.push(`/admin/colectori/${r.valoare.id}`);
              } else {
                setEroare(r.campuri ? null : r.eroare);
                setCampuri(r.campuri ?? {});
              }
            });
          }}
        >
          <DialogTitle id="colector-nou-titlu">Colector nou</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography color="text.secondary">
              Administratorul firmei primește pe email un link cu care își alege parola și încarcă
              documentele.
            </Typography>
            {eroare ? (
              <Typography role="alert" sx={{ color: 'error.main' }}>
                {eroare}
              </Typography>
            ) : null}
            {camp('denumire', 'Denumirea firmei')}
            {camp('cui', 'CUI', { slotProps: { htmlInput: { inputMode: 'numeric', className: 'num' } } })}
            {camp('nume', 'Numele administratorului firmei')}
            {camp('email', 'Email administrator', { type: 'email' })}
          </DialogContent>
          <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
            <Button onClick={inchide}>Renunță</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pending}
              startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Trimite invitația
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
