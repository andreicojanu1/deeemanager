'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { IconAlertTriangle, IconFile, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import {
  DOCUMENTE_ONBOARDING,
  ETICHETA_STARE_DOC,
  type DocumentOnboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import { formatDate } from '@/lib/format';
import { color, radius } from '@/theme/tokens';
import { TON_STARE } from '@/features/onboarding/tonuri';
import { marimeFisier } from '@/features/wizard/util';
import { inlocuiesteDocument } from './actions';

const ZI = 86_400_000;
/** Pragul de la care un document cu termen apare ca „expiră curând”. */
const PRAG_ZILE = 30;

export default function DocumenteFirma({
  documente,
  acum,
}: {
  documente: DocumentOnboarding[];
  acum: string;
}) {
  const router = useRouter();
  const { arata } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const tinta = useRef<TipDocumentOnboarding | null>(null);
  const [progres, setProgres] = useState<Partial<Record<TipDocumentOnboarding, number>>>({});

  const zile = (d: DocumentOnboarding) =>
    d.valabilPana
      ? Math.ceil((new Date(d.valabilPana).getTime() - new Date(acum.slice(0, 10)).getTime()) / ZI)
      : null;
  const expiraCurand = (d: DocumentOnboarding) => {
    const z = zile(d);
    return d.stare === 'APROBAT' && z !== null && z < PRAG_ZILE;
  };
  // O singură acțiune principală: primul document care expiră curând sau e respins.
  const urgent = documente.find((d) => d.stare === 'RESPINS') ?? documente.find(expiraCurand);

  const alege = (tip: TipDocumentOnboarding) => {
    tinta.current = tip;
    input.current?.click();
  };

  const incarca = async (tip: TipDocumentOnboarding, f: File) => {
    for (const v of [10, 40, 70, 100]) {
      setProgres((p) => ({ ...p, [tip]: v }));
      await new Promise((r) => setTimeout(r, 150));
    }
    const r = await inlocuiesteDocument(tip, { nume: f.name, marime: marimeFisier(f.size) });
    setProgres((p) => {
      const rest = { ...p };
      delete rest[tip];
      return rest;
    });
    if (r.ok) {
      arata('Documentul a fost trimis la verificare.');
      router.refresh();
    } else arata(r.eroare);
  };

  return (
    <Card component="section" aria-labelledby="documente-firma-titlu">
      <Box sx={{ p: 6, pb: 4 }}>
        <Typography id="documente-firma-titlu" variant="h3" component="h2">
          Documentele firmei
        </Typography>
        <Typography color="text.secondary">
          Când încarci o variantă nouă, administratorul o verifică; până atunci rămâne valabilă cea aprobată.
        </Typography>
      </Box>
      <input
        ref={input}
        type="file"
        hidden
        aria-hidden
        tabIndex={-1}
        accept="image/*,application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && tinta.current) void incarca(tinta.current, f);
          e.target.value = '';
        }}
      />
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {DOCUMENTE_ONBOARDING.map((info) => {
          const d = documente.find((x) => x.tip === info.tip)!;
          const z = zile(d);
          const curand = expiraCurand(d);
          const respins = d.stare === 'RESPINS';
          const p = progres[info.tip];
          return (
            <Box
              component="li"
              key={info.tip}
              data-document={info.tip}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                gap: 3,
                alignItems: 'center',
                px: 6,
                py: 4,
                borderTop: `1px solid ${color.line}`,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Typography variant="bodyStrong" component="h3">
                    {info.denumire}
                  </Typography>
                  {curand ? (
                    <StatusBadge
                      tone="warning"
                      label={z! < 0 ? 'Expirat' : `Expiră în ${z === 1 ? 'o zi' : `${z} zile`}`}
                    />
                  ) : (
                    <StatusBadge tone={TON_STARE[d.stare]} label={ETICHETA_STARE_DOC[d.stare]} />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="num"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}
                >
                  <IconFile size={14} stroke={1.5} aria-hidden />
                  {d.fisier ? `${d.fisier.nume} · încărcat ${formatDate(d.fisier.incarcatLa)}` : 'Neîncărcat'}
                  {d.valabilPana ? ` · valabil până la ${formatDate(d.valabilPana)}` : ''}
                </Typography>
                {respins && d.motiv ? (
                  <Typography variant="caption" component="p" sx={{ color: color.danger, mt: 1 }}>
                    {d.motiv}
                  </Typography>
                ) : null}
                {curand ? (
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      bgcolor: color.warningSoft,
                      borderRadius: `${radius.md}px`,
                      px: 3,
                      py: 2,
                    }}
                  >
                    <IconAlertTriangle
                      size={16}
                      stroke={1.5}
                      color={color.warningText}
                      aria-hidden
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <Typography variant="caption" sx={{ color: color.warningText }}>
                      Încarcă documentul nou până pe {formatDate(d.valabilPana!)}, altfel nu vei mai putea
                      trimite loturi.
                    </Typography>
                  </Box>
                ) : null}
                {p !== undefined ? (
                  <LinearProgress
                    variant="determinate"
                    value={p}
                    aria-label={`Se încarcă ${info.denumire}`}
                    sx={{ mt: 2 }}
                  />
                ) : null}
              </Box>
              {d.stare !== 'DE_VERIFICAT' && p === undefined ? (
                <Button
                  variant={urgent?.tip === info.tip ? 'contained' : 'text'}
                  startIcon={<IconUpload size={18} stroke={1.5} />}
                  onClick={() => alege(info.tip)}
                  aria-label={`Încarcă varianta nouă: ${info.denumire}`}
                  sx={{ minHeight: 44, justifySelf: { md: 'end' } }}
                >
                  Încarcă varianta nouă
                </Button>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
