'use client';

import { useRef, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IconAlertTriangle, IconCamera, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import type { DocumentLot } from '@/lib/domain/lot';
import { color, radius } from '@/theme/tokens';
import { inlocuiesteDocument } from './actions';

type Props = { id: string; motiv?: string; documente: DocumentLot[] };

/** SPEC-ECRANE §6: motivul adminului și documentele de înlocuit, cu încărcare direct din banner. */
export default function BannerCompletari({ id, motiv, documente }: Props) {
  return (
    <Box
      role="region"
      aria-labelledby="banner-completari-titlu"
      sx={{
        bgcolor: color.warningSoft,
        border: `1px solid ${color.warning}`,
        borderRadius: `${radius.lg}px`,
        p: { xs: 4, sm: 6 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <IconAlertTriangle
          size={20}
          stroke={1.5}
          color={color.warningText}
          aria-hidden
          style={{ flexShrink: 0, marginTop: 2 }}
        />
        <Box>
          <Typography
            id="banner-completari-titlu"
            variant="bodyStrong"
            component="h2"
            sx={{ color: color.warningText }}
          >
            Administratorul a cerut completări
          </Typography>
          <Typography sx={{ mt: 1 }}>{motiv}</Typography>
        </Box>
      </Box>
      {documente.length ? (
        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {documente.map((d) => (
            <DocumentDeInlocuit key={d.id} lotId={id} document={d} />
          ))}
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: color.successText, fontWeight: 500 }}>
          Ai înlocuit toate documentele cerute. Poți retrimite lotul la verificare.
        </Typography>
      )}
    </Box>
  );
}

function DocumentDeInlocuit({ lotId, document: d }: { lotId: string; document: DocumentLot }) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [eroare, setEroare] = useState<string | null>(null);
  const fisierRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Faza A: fișierul nu se urcă nicăieri; trimitem doar numele, ca să vezi fluxul.
  const laAlegere = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    start(async () => {
      const r = await inlocuiesteDocument({ id: lotId, documentId: d.id, numeFisier: f.name });
      if (r.ok) {
        arata(r.mesaj);
        router.refresh();
      } else setEroare(r.eroare);
    });
  };

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.md}px`,
        px: 4,
        py: 3,
      }}
    >
      <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
        <Typography variant="bodyStrong" component="p">
          {d.denumire}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {d.fisier ? `Fișierul actual: ${d.fisier.nume}` : d.explicatie}
        </Typography>
        {eroare ? (
          <Typography variant="caption" sx={{ color: color.danger, display: 'block' }}>
            {eroare}
          </Typography>
        ) : null}
      </Box>
      <input ref={fisierRef} type="file" hidden accept="image/*,application/pdf" onChange={laAlegere} />
      <input ref={cameraRef} type="file" hidden accept="image/*" capture="environment" onChange={laAlegere} />
      <Button
        variant="outlined"
        onClick={() => cameraRef.current?.click()}
        disabled={pending}
        startIcon={<IconCamera size={18} stroke={1.5} />}
        aria-label={`Fotografiază ${d.denumire}`}
      >
        Fotografiază
      </Button>
      <Button
        variant="outlined"
        onClick={() => fisierRef.current?.click()}
        disabled={pending}
        startIcon={
          pending ? <CircularProgress size={16} color="inherit" /> : <IconUpload size={18} stroke={1.5} />
        }
        aria-label={`Încarcă ${d.denumire}`}
      >
        Încarcă fișier
      </Button>
    </Box>
  );
}
