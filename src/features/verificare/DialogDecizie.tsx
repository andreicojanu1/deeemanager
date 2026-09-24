'use client';

import { useState, useTransition } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Decizie } from '@/lib/domain/coada';
import { decideLot } from './actions';

export type CerereDecizie = { lotId: string; decizie: Decizie; motivPropus: string; reguliRosii: number };

const TITLU: Record<Decizie, string> = {
  ACCEPTAT: 'Accepți lotul?',
  NECESITA_COMPLETARI: 'Ceri completări',
  RESPINS: 'Respingi lotul',
};
const BUTON: Record<Decizie, string> = {
  ACCEPTAT: 'Acceptă lotul',
  NECESITA_COMPLETARI: 'Cere completări',
  RESPINS: 'Respinge lotul',
};

type Props = {
  cerere: CerereDecizie | null;
  onInchide: () => void;
  onDecis: (c: CerereDecizie) => void;
};

/**
 * Confirmarea deciziei. „Acceptă” fără reguli roșii nu trece pe aici. „Cere completări” și
 * „Respinge” cer motivul pentru colector, precompletat din regulile semnalate.
 */
export default function DialogDecizie({ cerere, onInchide, onDecis }: Props) {
  // Componenta se remontează (key) pentru fiecare cerere nouă.
  const [motiv, setMotiv] = useState(cerere?.motivPropus ?? '');
  const [eroare, setEroare] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const confirma = () =>
    cerere &&
    start(async () => {
      const r = await decideLot({ id: cerere.lotId, decizie: cerere.decizie, motiv });
      if (r.ok) onDecis(cerere);
      else setEroare(r.eroare);
    });

  const cuMotiv = cerere?.decizie !== 'ACCEPTAT';

  return (
    <Dialog open={Boolean(cerere)} onClose={() => !pending && onInchide()} fullWidth maxWidth="sm">
      {cerere ? (
        <>
          <DialogTitle sx={{ fontSize: 20, fontWeight: 600 }}>
            {TITLU[cerere.decizie]} · {cerere.lotId}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cerere.decizie === 'ACCEPTAT' && cerere.reguliRosii > 0 ? (
              <Typography>
                Lotul are{' '}
                {cerere.reguliRosii === 1 ? 'o regulă blocantă' : `${cerere.reguliRosii} reguli blocante`}.
                Dacă accepți, decizia ta se salvează împreună cu rezultatul regulilor.
              </Typography>
            ) : null}
            {cuMotiv ? (
              <TextField
                id="motiv-decizie"
                label={
                  cerere.motivPropus
                    ? 'Motiv trimis colectorului · redactat de AI, editabil'
                    : 'Motiv trimis colectorului'
                }
                placeholder="Scrie colectorului ce are de făcut, de exemplu ce document să încarce din nou."
                multiline
                minRows={3}
                value={motiv}
                autoFocus
                onChange={(e) => {
                  setMotiv(e.target.value);
                  setEroare(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) confirma();
                }}
                error={Boolean(eroare)}
                helperText={eroare ?? 'Ctrl + Enter trimite decizia.'}
              />
            ) : eroare ? (
              <Typography color="error">{eroare}</Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
            <Button variant="outlined" onClick={onInchide} disabled={pending}>
              Renunță
            </Button>
            <Button
              variant="contained"
              color={cerere.decizie === 'RESPINS' ? 'error' : 'primary'}
              onClick={confirma}
              disabled={pending}
              autoFocus={!cuMotiv}
              startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {BUTON[cerere.decizie]}
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
