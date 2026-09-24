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
import { IconDownload, IconPencil, IconSend } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import ButtonLink from '@/components/ui/ButtonLink';
import { useToast } from '@/components/ui/Toast';
import type { LotStatus } from '@/lib/domain/status';
import { areDosar, poateAnula, poateEdita, poateRetrimite } from '@/lib/domain/tranzitii';
import { anuleazaLot, retrimiteLot } from './actions';

type Props = { id: string; status: LotStatus; deInlocuit: number };

const ICON = { size: 18, stroke: 1.5 } as const;

/** O singură acțiune principală, în funcție de status; restul sunt secundare. */
export default function LotActiuni({ id, status, deInlocuit }: Props) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [anulare, setAnulare] = useState(false);
  const [motiv, setMotiv] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);

  const retrimite = () =>
    start(async () => {
      const r = await retrimiteLot({ id });
      if (r.ok) {
        arata(r.mesaj);
        router.refresh();
      } else arata(r.eroare);
    });

  const confirmaAnulare = () =>
    start(async () => {
      const r = await anuleazaLot({ id, motiv });
      if (r.ok) {
        setAnulare(false);
        arata(r.mesaj);
        router.refresh();
      } else setEroare(r.eroare);
    });

  const editare = poateEdita(status);
  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      {poateAnula(status) ? (
        <Button variant="text" color="error" onClick={() => setAnulare(true)}>
          Anulează lotul
        </Button>
      ) : null}
      {editare && status !== 'CIORNA' ? (
        <ButtonLink href={`/loturi/${id}/editare`} variant="outlined" startIcon={<IconPencil {...ICON} />}>
          Editează
        </ButtonLink>
      ) : null}
      {status === 'CIORNA' ? (
        <ButtonLink href={`/loturi/${id}/editare`} variant="contained" startIcon={<IconPencil {...ICON} />}>
          Continuă ciorna
        </ButtonLink>
      ) : null}
      {poateRetrimite(status) ? (
        <Button
          variant="contained"
          onClick={retrimite}
          disabled={pending || deInlocuit > 0}
          startIcon={pending ? <CircularProgress size={16} color="inherit" /> : <IconSend {...ICON} />}
        >
          Retrimite la verificare
        </Button>
      ) : null}
      {areDosar(status) ? (
        <Button
          variant="contained"
          startIcon={<IconDownload {...ICON} />}
          onClick={() => arata('Dosarul PDF se compilează din documente în Faza B.')}
        >
          Descarcă dosarul
        </Button>
      ) : null}

      <Dialog open={anulare} onClose={() => !pending && setAnulare(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 20, fontWeight: 600 }}>Anulezi {id}?</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography color="text.secondary">
            Lotul rămâne în istoric cu statusul Anulat și nu mai poate fi trimis la verificare.
          </Typography>
          <TextField
            id="motiv-anulare"
            label="Motivul anulării"
            multiline
            minRows={3}
            value={motiv}
            onChange={(e) => {
              setMotiv(e.target.value);
              setEroare(null);
            }}
            error={Boolean(eroare)}
            helperText={eroare ?? 'Îl vede și administratorul.'}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
          <Button variant="outlined" onClick={() => setAnulare(false)} disabled={pending}>
            Renunță
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmaAnulare}
            disabled={pending}
            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Anulează lotul
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
