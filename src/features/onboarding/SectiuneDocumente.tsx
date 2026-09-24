'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconCamera, IconCircleCheckFilled, IconFile, IconSparkles, IconUpload } from '@tabler/icons-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import {
  DOCUMENTE_ONBOARDING,
  ETICHETA_STARE_DOC,
  ExtrasAutorizatieSchema,
  type DocumentOnboarding,
  type ExtrasAutorizatie,
  type Onboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import { formatDate } from '@/lib/format';
import { color, motion, radius } from '@/theme/tokens';
import { marimeFisier } from '@/features/wizard/util';
import { confirmaAutorizatie, incarcaDocument } from './actions';
import { TON_STARE } from './tonuri';

const ACCEPT_DOC = 'image/*,application/pdf';

type Props = {
  o: Onboarding;
  editabil: boolean;
  onChange: (o: Onboarding) => void;
  arataErori: boolean;
};

export default function SectiuneDocumente({ o, editabil, onChange, arataErori }: Props) {
  const { arata } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const tinta = useRef<TipDocumentOnboarding | null>(null);
  const [progres, setProgres] = useState<Partial<Record<TipDocumentOnboarding, number>>>({});

  const alege = (tip: TipDocumentOnboarding, capture: boolean) => {
    const el = input.current;
    if (!el) return;
    tinta.current = tip;
    el.accept = capture ? 'image/*' : ACCEPT_DOC;
    if (capture) el.setAttribute('capture', 'environment');
    else el.removeAttribute('capture');
    el.click();
  };

  const incarca = async (tip: TipDocumentOnboarding, f: File) => {
    // Faza A: progres simulat; în Faza B fișierul merge în S3 prin URL pre-semnat.
    for (const v of [5, 29, 53, 77, 100]) {
      setProgres((p) => ({ ...p, [tip]: v }));
      await new Promise((r) => setTimeout(r, 160));
    }
    const r = await incarcaDocument(tip, { nume: f.name, marime: marimeFisier(f.size) });
    setProgres((p) => {
      const rest = { ...p };
      delete rest[tip];
      return rest;
    });
    if (r.ok) onChange(r.valoare);
    else arata(r.eroare);
  };

  const ordonate = DOCUMENTE_ONBOARDING.map((info) => ({
    info,
    d: o.documente.find((x) => x.tip === info.tip)!,
  }));
  const gata = o.documente.filter((d) => d.stare !== 'LIPSA' && d.stare !== 'RESPINS').length;

  return (
    <Box
      component="section"
      id="sectiune-documente"
      aria-labelledby="documente-titlu"
      sx={{ display: 'flex', flexDirection: 'column', gap: 4, scrollMarginTop: 88 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
        <Box>
          <Typography id="documente-titlu" variant="h3" component="h2">
            Documente
          </Typography>
          <Typography color="text.secondary">
            PDF sau fotografie clară, câte un fișier pentru fiecare document.
          </Typography>
        </Box>
        <Typography color="text.secondary" className="num" sx={{ whiteSpace: 'nowrap' }}>
          {gata} din {o.documente.length}
        </Typography>
      </Box>
      <input
        ref={input}
        type="file"
        hidden
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && tinta.current) void incarca(tinta.current, f);
          e.target.value = '';
        }}
      />
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {ordonate.map(({ info, d }) => (
          <Box
            component="li"
            key={info.tip}
            sx={{
              gridColumn:
                info.tip === 'AUTORIZATIE_MEDIU' && o.autorizatie && d.fisier ? { lg: '1 / -1' } : undefined,
            }}
          >
            <CardDocument
              denumire={info.denumire}
              explicatie={info.explicatie}
              d={d}
              editabil={editabil}
              progres={progres[info.tip]}
              evidentiaza={arataErori && (d.stare === 'LIPSA' || d.stare === 'RESPINS')}
              onAlege={(capture) => alege(info.tip, capture)}
            >
              {info.tip === 'AUTORIZATIE_MEDIU' &&
              o.autorizatie &&
              d.fisier &&
              progres[info.tip] === undefined ? (
                <BlocAutorizatie
                  key={`${d.fisier.incarcatLa}-${o.autorizatie.confirmat}`}
                  extras={o.autorizatie}
                  editabil={editabil}
                  evidentiaza={arataErori && !o.autorizatie.confirmat}
                  onSalvat={onChange}
                />
              ) : null}
            </CardDocument>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CardDocument({
  denumire,
  explicatie,
  d,
  editabil,
  progres,
  evidentiaza,
  onAlege,
  children,
}: {
  denumire: string;
  explicatie: string;
  d: DocumentOnboarding;
  editabil: boolean;
  progres?: number;
  evidentiaza: boolean;
  onAlege: (capture: boolean) => void;
  children?: React.ReactNode;
}) {
  const respins = d.stare === 'RESPINS';
  const incarcare = progres !== undefined;
  const poateInlocui = editabil && d.stare !== 'APROBAT';
  const bordura = respins || evidentiaza ? color.danger : d.fisier ? color.line : color.lineStrong;

  return (
    <Box
      data-stare={d.stare}
      sx={{
        height: '100%',
        bgcolor: color.surface,
        border: `1px ${d.fisier || respins ? 'solid' : 'dashed'} ${bordura}`,
        borderRadius: `${radius.lg}px`,
        p: { xs: 5, sm: 6 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        transition: `border-color ${motion.fast}ms ${motion.easing}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="bodyStrong" component="h3">
            {denumire}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            {explicatie}
          </Typography>
        </Box>
        {!incarcare ? <StatusBadge tone={TON_STARE[d.stare]} label={ETICHETA_STARE_DOC[d.stare]} /> : null}
      </Box>

      {respins && d.motiv ? (
        <Box sx={{ bgcolor: color.dangerSoft, borderRadius: `${radius.md}px`, px: 4, py: 3 }}>
          <Typography variant="caption" sx={{ color: color.danger, fontWeight: 500, display: 'block' }}>
            Motivul respingerii
          </Typography>
          <Typography>{d.motiv}</Typography>
        </Box>
      ) : null}

      {d.fisier && !incarcare ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: color.inkMuted }}>
          {d.stare === 'APROBAT' ? (
            <IconCircleCheckFilled size={18} color={color.success} aria-hidden />
          ) : (
            <IconFile size={18} stroke={1.5} aria-hidden />
          )}
          <Typography
            sx={{
              color: respins ? color.inkMuted : color.ink,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textDecoration: respins ? 'line-through' : 'none',
            }}
          >
            {d.fisier.nume}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="num" sx={{ whiteSpace: 'nowrap' }}>
            {d.fisier.marime}
          </Typography>
        </Box>
      ) : null}

      {incarcare ? (
        <LinearProgress
          variant="determinate"
          value={progres}
          aria-label={`Se încarcă ${denumire}`}
          sx={{ '& .MuiLinearProgress-bar': { transition: 'transform 160ms linear' } }}
        />
      ) : null}

      {poateInlocui && !incarcare ? (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Button
            variant={respins ? 'contained' : d.fisier ? 'text' : 'outlined'}
            startIcon={<IconUpload size={18} stroke={1.5} />}
            onClick={() => onAlege(false)}
            aria-label={`${d.fisier ? 'Înlocuiește' : 'Încarcă'}: ${denumire}`}
            sx={{ minHeight: 44 }}
          >
            {d.fisier ? 'Înlocuiește' : 'Încarcă fișier'}
          </Button>
          {!d.fisier || respins ? (
            <Button
              variant="text"
              startIcon={<IconCamera size={18} stroke={1.5} />}
              onClick={() => onAlege(true)}
              aria-label={`Fotografiază: ${denumire}`}
              sx={{ minHeight: 44 }}
            >
              Fotografiază
            </Button>
          ) : null}
        </Box>
      ) : null}

      {children}
    </Box>
  );
}

// ── Autorizația de mediu: blocul „Extras de AI” ────────────────────────────────────

function BlocAutorizatie({
  extras,
  editabil,
  evidentiaza,
  onSalvat,
}: {
  extras: ExtrasAutorizatie;
  editabil: boolean;
  evidentiaza: boolean;
  onSalvat: (o: Onboarding) => void;
}) {
  const { arata } = useToast();
  const [corectez, setCorectez] = useState(false);
  const [v, setV] = useState({ ...extras, coduriText: extras.coduri.join(', ') });
  const [erori, setErori] = useState<Record<string, string>>({});
  const [salvez, setSalvez] = useState(false);

  const trimite = async (valori: typeof v) => {
    const coduri = valori.coduriText
      .split(/[,;\n]+/)
      .map((c) => c.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    const payload = { numar: valori.numar, emitent: valori.emitent, valabilPana: valori.valabilPana, coduri };
    const p = ExtrasAutorizatieSchema.safeParse(payload);
    if (!p.success) {
      const e: Record<string, string> = {};
      for (const i of p.error.issues) {
        const k = String(i.path[0]);
        if (!e[k]) e[k] = i.message;
      }
      setErori(e);
      return;
    }
    setSalvez(true);
    const r = await confirmaAutorizatie(payload);
    setSalvez(false);
    if (r.ok) {
      onSalvat(r.valoare);
      arata(corectez ? 'Corecturile au fost salvate.' : 'Datele autorizației au fost confirmate.');
    } else arata(r.eroare);
  };

  const rand = (eticheta: string, valoare: React.ReactNode) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '160px minmax(0, 1fr)' },
        gap: { xs: 0.5, sm: 4 },
        py: 2,
        borderTop: `1px solid ${color.aiSoft}`,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ pt: { sm: '2px' } }}>
        {eticheta}
      </Typography>
      <Typography component="div" className="num" sx={{ minWidth: 0 }}>
        {valoare}
      </Typography>
    </Box>
  );

  return (
    <Box
      role="group"
      aria-labelledby="autorizatie-ai-titlu"
      sx={{
        bgcolor: color.aiSoft,
        borderRadius: `${radius.md}px`,
        p: { xs: 4, sm: 5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        outline: evidentiaza ? `2px solid ${color.danger}` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color.ai }}>
          <IconSparkles size={16} stroke={1.5} aria-hidden />
          <Typography id="autorizatie-ai-titlu" variant="caption" sx={{ color: color.ai, fontWeight: 500 }}>
            Extras de AI
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        {extras.confirmat ? (
          <StatusBadge tone="success" label={extras.corectat ? 'Corectat de tine' : 'Confirmat de tine'} />
        ) : (
          <StatusBadge tone="warning" label="Așteaptă confirmarea ta" />
        )}
      </Box>

      {!corectez ? (
        <>
          <Box sx={{ bgcolor: color.surface, borderRadius: `${radius.md}px`, px: 4, py: 1 }}>
            {rand('Număr', extras.numar)}
            {rand('Emitent', extras.emitent)}
            {rand('Valabilă până la', formatDate(extras.valabilPana))}
            {rand(
              'Coduri autorizate',
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {extras.coduri.map((c) => (
                  <Box
                    key={c}
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      border: `1px solid ${color.line}`,
                      borderRadius: `${radius.sm}px`,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c}
                  </Box>
                ))}
              </Box>,
            )}
          </Box>
          {editabil ? (
            <>
              <Typography variant="caption" color="text.secondary">
                Verifică datele cu autorizația. Codurile confirmate aici sunt singurele pe care le vei putea
                declara în loturi.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {!extras.confirmat ? (
                  <Button
                    variant="contained"
                    onClick={() => trimite(v)}
                    disabled={salvez}
                    sx={{ minHeight: 44 }}
                  >
                    Confirmă datele
                  </Button>
                ) : null}
                <Button
                  variant="outlined"
                  onClick={() => setCorectez(true)}
                  sx={{ minHeight: 44, bgcolor: color.surface }}
                >
                  Corectează
                </Button>
              </Box>
            </>
          ) : null}
        </>
      ) : (
        <Box
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void trimite(v);
          }}
          sx={{
            bgcolor: color.surface,
            borderRadius: `${radius.md}px`,
            p: 4,
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <TextField
            id="aut-numar"
            label="Număr"
            value={v.numar}
            onChange={(e) => setV({ ...v, numar: e.target.value })}
            error={Boolean(erori.numar)}
            helperText={erori.numar}
          />
          <TextField
            id="aut-valabilitate"
            label="Valabilă până la"
            type="date"
            value={v.valabilPana}
            onChange={(e) => setV({ ...v, valabilPana: e.target.value })}
            error={Boolean(erori.valabilPana)}
            helperText={erori.valabilPana}
          />
          <TextField
            id="aut-emitent"
            label="Emitent"
            value={v.emitent}
            onChange={(e) => setV({ ...v, emitent: e.target.value })}
            error={Boolean(erori.emitent)}
            helperText={erori.emitent}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <TextField
            id="aut-coduri"
            label="Coduri de deșeu autorizate"
            value={v.coduriText}
            onChange={(e) => setV({ ...v, coduriText: e.target.value })}
            error={Boolean(erori.coduri)}
            helperText={erori.coduri ?? 'Separate prin virgulă, de exemplu 20 01 35*, 20 01 36.'}
            multiline
            minRows={2}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <Box sx={{ gridColumn: { sm: '1 / -1' }, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" disabled={salvez} sx={{ minHeight: 44 }}>
              Salvează corecturile
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setCorectez(false);
                setErori({});
                setV({ ...extras, coduriText: extras.coduri.join(', ') });
              }}
              sx={{ minHeight: 44 }}
            >
              Renunță
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
