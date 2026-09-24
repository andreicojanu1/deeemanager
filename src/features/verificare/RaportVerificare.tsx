'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconFileAlert } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import StatusDot, { type DotTone } from '@/components/ui/StatusDot';
import { useToast } from '@/components/ui/Toast';
import { motivPropus, type Decizie } from '@/lib/domain/coada';
import type { LotDetaliu, Semafor } from '@/lib/domain/lot';
import { regulaInitiala, type DocumentVizual, type RegulaRaport } from '@/lib/domain/raport';
import { formatDate, formatKg, formatTime } from '@/lib/format';
import { color, motion, radius } from '@/theme/tokens';
import { decideLot } from './actions';
import DialogDecizie, { type CerereDecizie } from './DialogDecizie';
import Vizualizator from './Vizualizator';

type Props = {
  lot: LotDetaliu;
  colector: string;
  reguli: RegulaRaport[];
  documente: DocumentVizual[];
  urmatorul: string | null;
  continut: string;
};

const TON: Record<Semafor, DotTone> = { VERDE: 'success', GALBEN: 'warning', ROSU: 'danger', NA: 'neutral' };
const ETICHETA_SEMAFOR: Record<Semafor, string> = {
  VERDE: 'trecută',
  GALBEN: 'avertisment',
  ROSU: 'blocantă',
  NA: 'nu se aplică',
};
const CULOARE_VERDICT: Record<Decizie, string> = {
  ACCEPTAT: color.successText,
  NECESITA_COMPLETARI: color.warningText,
  RESPINS: color.danger,
};
const DECIS: Record<Decizie, string> = {
  ACCEPTAT: 'Acceptat',
  NECESITA_COMPLETARI: 'Necesită completări',
  RESPINS: 'Respins',
};

export default function RaportVerificare({ lot, colector, reguli, documente, urmatorul, continut }: Props) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [regula, setRegula] = useState(() => regulaInitiala(reguli));
  const sel = reguli.find((r) => r.cod === regula);
  const [docSel, setDocSel] = useState<string | null>(
    () => sel?.valori.find((v) => v.documentId)?.documentId ?? documente[0]?.id ?? null,
  );
  const [motiv, setMotiv] = useState(() => motivPropus(lot.verificare));
  const [eroareMotiv, setEroareMotiv] = useState<string | null>(null);
  const [deInlocuit, setDeInlocuit] = useState<string[]>(() => [
    ...new Set(
      reguli
        .filter((r) => r.rezultat === 'ROSU' || r.rezultat === 'GALBEN')
        .flatMap((r) => r.documenteImplicate),
    ),
  ]);
  const [meniuDoc, setMeniuDoc] = useState<HTMLElement | null>(null);
  const [cerere, setCerere] = useState<CerereDecizie | null>(null);
  const motivRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const deschis = lot.status === 'IN_VERIFICARE';
  const verdict = lot.verificare?.verdictPropus ?? null;
  const numar = (s: Semafor) => reguli.filter((r) => r.rezultat === s).length;
  const rosii = numar('ROSU');

  // La schimbarea regulii, vizualizatorul sare la documentul relevant.
  const alegeRegula = useCallback(
    (cod: string) => {
      setRegula(cod);
      const r = reguli.find((x) => x.cod === cod);
      const d = r?.valori.find((v) => v.documentId)?.documentId;
      if (d) setDocSel(d);
    },
    [reguli],
  );

  const valoareInDoc = sel?.valori.find((v) => v.documentId === docSel);

  const finalizeaza = useCallback(
    (decizie: Decizie) => {
      arata(`${lot.id}: ${DECIS[decizie].toLowerCase()}.${urmatorul ? ` Urmează ${urmatorul}.` : ''}`);
      router.push(urmatorul ? `/admin/verificari/${urmatorul}` : '/admin/verificari');
      router.refresh();
    },
    [arata, lot.id, router, urmatorul],
  );

  const decide = useCallback(
    (decizie: Decizie) => {
      if (!deschis || pending) return;
      if (decizie !== 'ACCEPTAT' && motiv.trim().length < 10) {
        setEroareMotiv('Scrie colectorului ce are de făcut (cel puțin 10 caractere).');
        motivRef.current?.focus();
        return;
      }
      if (decizie === 'ACCEPTAT' && rosii > 0) {
        setCerere({ lotId: lot.id, decizie, motivPropus: '', reguliRosii: rosii });
        return;
      }
      start(async () => {
        const r = await decideLot({
          id: lot.id,
          decizie,
          motiv: decizie === 'ACCEPTAT' ? '' : motiv,
          documenteDeInlocuit: decizie === 'NECESITA_COMPLETARI' ? deInlocuit : undefined,
        });
        if (r.ok) finalizeaza(decizie);
        else arata(r.eroare);
      });
    },
    [deschis, pending, motiv, rosii, lot.id, deInlocuit, finalizeaza, arata],
  );

  // Scurtături: ↑/↓ reguli, A/C/R decizie; nu când scrii sau e deschis un meniu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cerere || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      if (document.querySelector('[role="dialog"], [role="menu"]')) return;
      const i = reguli.findIndex((r) => r.cod === regula);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const j = e.key === 'ArrowDown' ? Math.min(i + 1, reguli.length - 1) : Math.max(i - 1, 0);
        alegeRegula(reguli[j].cod);
        listaRef.current?.querySelectorAll('button')[j]?.scrollIntoView({ block: 'nearest' });
        return;
      }
      const tasta = e.key.toLowerCase();
      if (deschis && (tasta === 'a' || tasta === 'c' || tasta === 'r')) {
        e.preventDefault();
        decide(({ a: 'ACCEPTAT', c: 'NECESITA_COMPLETARI', r: 'RESPINS' } as const)[tasta]);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.setAttribute('data-raport-gata', 'true');
    return () => window.removeEventListener('keydown', onKey);
  }, [cerere, reguli, regula, alegeRegula, deschis, decide]);

  const butoane: { d: Decizie; eticheta: string; tasta: string }[] = [
    { d: 'RESPINS', eticheta: 'Respinge', tasta: 'R' },
    { d: 'ACCEPTAT', eticheta: 'Acceptă', tasta: 'A' },
    { d: 'NECESITA_COMPLETARI', eticheta: 'Cere completări', tasta: 'C' },
  ];
  const documenteCuFisier = useMemo(
    () => lot.documente.filter((d) => d.fisier || d.status === 'LIPSA'),
    [lot.documente],
  );

  return (
    <>
      {/* Antet: ID, status, rezumat; în dreapta verdictul propus */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 6,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 480px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="display" component="h1">
              {lot.id}
            </Typography>
            <StatusBadge status={lot.status} />
          </Box>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: 16, lineHeight: '24px' }}>
            {colector} · {continut} · {formatKg(lot.linii.reduce((s, l) => s + l.kg, 0))}
            {lot.trimisLa ? ` · primit ${formatDate(lot.trimisLa)}, ${formatTime(lot.trimisLa)}` : ''}
          </Typography>
        </Box>
        {verdict ? (
          <Box
            sx={{
              bgcolor: color.surface,
              border: `1px solid ${color.line}`,
              borderRadius: `${radius.lg}px`,
              px: 5,
              py: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" component="p">
                {lot.verificare?.decizie
                  ? `Propus de AI · confirmat de ${lot.verificare.decizie.de}`
                  : 'Verdict propus de AI'}
              </Typography>
              <Typography
                variant="h3"
                component="p"
                sx={{ color: CULOARE_VERDICT[lot.verificare?.decizie?.status ?? verdict] }}
              >
                {DECIS[lot.verificare?.decizie?.status ?? verdict]}
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', gap: 3, pl: 5, borderLeft: `1px solid ${color.line}` }}
              role="img"
              aria-label={`${numar('VERDE')} trecute, ${numar('GALBEN')} avertismente, ${rosii} blocante, ${numar('NA')} nu se aplică`}
            >
              {(['VERDE', 'GALBEN', 'ROSU', 'NA'] as Semafor[]).map((s) => (
                <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <StatusDot tone={TON[s]} />
                  <Typography variant="bodyStrong" className="num">
                    {numar(s)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 6,
          gridTemplateColumns: { xs: '1fr', lg: '400px minmax(0, 1fr)' },
          alignItems: 'start',
        }}
      >
        {/* Coloana stângă: regulile */}
        <Box
          component="section"
          aria-labelledby="reguli-titlu"
          sx={{
            bgcolor: color.surface,
            border: `1px solid ${color.line}`,
            borderRadius: `${radius.lg}px`,
            py: 3,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', px: 6, py: 2 }}
          >
            <Typography id="reguli-titlu" variant="h3" component="h2">
              Reguli de verificare
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lot.verificare?.regulament ?? 'Regulament v1'}
            </Typography>
          </Box>
          <Box component="ul" ref={listaRef} sx={{ listStyle: 'none', m: 0, px: 3, py: 1 }}>
            {reguli.map((r) => {
              const activ = r.cod === regula;
              return (
                <li key={r.cod}>
                  <ButtonBase
                    onClick={() => alegeRegula(r.cod)}
                    aria-current={activ ? 'true' : undefined}
                    aria-label={`${r.cod} ${r.nume}, ${ETICHETA_SEMAFOR[r.rezultat]}: ${r.rezumat}`}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 3,
                      textAlign: 'left',
                      px: 3,
                      py: 2.5,
                      borderRadius: `${radius.md}px`,
                      bgcolor: activ ? color.petrolSoft : 'transparent',
                      transition: `background-color ${motion.fast}ms ${motion.easing}`,
                      '&:hover': { bgcolor: activ ? color.petrolSoft : color.canvas },
                    }}
                  >
                    <Box sx={{ pt: '6px' }}>
                      <StatusDot tone={TON[r.rezultat]} />
                    </Box>
                    <Typography
                      variant="bodyStrong"
                      className="num"
                      sx={{ width: 34, flexShrink: 0, color: color.inkMuted, pt: '1px', fontSize: 13 }}
                    >
                      {r.cod}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{r.nume}</Typography>
                      <Typography variant="caption" color="text.secondary" className="num">
                        {r.rezumat}
                      </Typography>
                    </Box>
                  </ButtonBase>
                </li>
              );
            })}
          </Box>
        </Box>

        {/* Coloana dreaptă: comparația și documentul */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          {sel ? (
            <Box
              component="section"
              aria-live="polite"
              aria-labelledby="comparatie-titlu"
              sx={{
                bgcolor: color.surface,
                border: `1px solid ${color.line}`,
                borderRadius: `${radius.lg}px`,
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, alignItems: 'center' }}>
                <Typography id="comparatie-titlu" variant="h3" component="h2">
                  {sel.cod} · {sel.nume}
                </Typography>
                {sel.rezultat === 'ROSU' ? (
                  <StatusBadge
                    tone="danger"
                    label={sel.severitate === 'BLOCANT' ? 'Blocant' : 'Avertisment'}
                  />
                ) : sel.rezultat === 'GALBEN' ? (
                  <StatusBadge tone="warning" label="Avertisment" />
                ) : sel.rezultat === 'VERDE' ? (
                  <StatusBadge tone="success" label="Trecută" />
                ) : (
                  <StatusBadge tone="neutral" label="Nu se aplică" />
                )}
              </Box>
              {sel.valori.length ? (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: `repeat(${Math.min(sel.valori.length, 3)}, minmax(0, 1fr))`,
                    },
                  }}
                >
                  {sel.valori.map((v, i) => {
                    const inDoc = Boolean(v.documentId) && v.documentId === docSel;
                    const continutTile = (
                      <>
                        <Typography
                          variant="caption"
                          sx={{ color: inDoc ? color.warningText : color.inkMuted, display: 'block' }}
                        >
                          {v.eticheta}
                        </Typography>
                        <Typography variant="h2" component="span" className="num" sx={{ display: 'block' }}>
                          {v.valoare}
                        </Typography>
                      </>
                    );
                    const sx = {
                      display: 'block',
                      width: '100%',
                      textAlign: 'left' as const,
                      px: 4,
                      py: 3,
                      borderRadius: `${radius.md}px`,
                      bgcolor: inDoc ? color.highlight : color.canvas,
                      transition: `background-color ${motion.base}ms ${motion.easing}`,
                    };
                    return v.documentId ? (
                      <ButtonBase
                        key={i}
                        onClick={() => setDocSel(v.documentId!)}
                        aria-label={`${v.eticheta}: ${v.valoare}. Arată în document`}
                        sx={sx}
                      >
                        {continutTile}
                      </ButtonBase>
                    ) : (
                      <Box key={i} sx={sx}>
                        {continutTile}
                      </Box>
                    );
                  })}
                </Box>
              ) : null}
              {sel.mesaj ? (
                <Typography
                  sx={{ color: sel.rezultat === 'ROSU' ? color.danger : color.warningText }}
                  className="num"
                >
                  {sel.mesaj}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Vizualizator
            documente={documente}
            selectat={docSel}
            onSelect={setDocSel}
            zona={valoareInDoc?.zona}
            valoare={valoareInDoc?.valoare}
            incredere={valoareInDoc?.incredere}
          />
        </Box>
      </Box>

      {/* Bara de decizie, fixă jos */}
      <Box
        component="section"
        aria-label="Decizia ta"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 5,
          mx: { xs: -4, md: -8 },
          mb: { xs: -6, md: -8 },
          px: { xs: 4, md: 8 },
          py: 4,
          bgcolor: color.surface,
          borderTop: `1px solid ${color.line}`,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {deschis ? (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              id="motiv-colector"
              inputRef={motivRef}
              label="Motiv trimis colectorului · redactat de AI, editabil"
              value={motiv}
              onChange={(e) => {
                setMotiv(e.target.value);
                setEroareMotiv(null);
              }}
              error={Boolean(eroareMotiv)}
              helperText={eroareMotiv ?? undefined}
              placeholder="Pentru Acceptă nu e nevoie de motiv."
              sx={{ flex: '1 1 320px' }}
            />
            <Button
              variant="text"
              startIcon={<IconFileAlert size={18} stroke={1.5} />}
              onClick={(e) => setMeniuDoc(e.currentTarget)}
              aria-haspopup="menu"
              sx={{ color: color.ink }}
            >
              De înlocuit · {deInlocuit.length}
            </Button>
            <Menu
              anchorEl={meniuDoc}
              open={Boolean(meniuDoc)}
              onClose={() => setMeniuDoc(null)}
              slotProps={{ list: { 'aria-label': 'Documente de înlocuit la Cere completări' } }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ px: 4, py: 2, display: 'block' }}>
                Colectorul le va încărca din nou.
              </Typography>
              {documenteCuFisier.map((d) => (
                <MenuItem
                  key={d.id}
                  onClick={() =>
                    setDeInlocuit((x) => (x.includes(d.id) ? x.filter((y) => y !== d.id) : [...x, d.id]))
                  }
                  dense
                >
                  <Checkbox size="small" checked={deInlocuit.includes(d.id)} sx={{ p: 0, mr: 2 }} />
                  <ListItemText primary={d.denumire} secondary={d.fisier?.nume ?? 'Lipsește'} />
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {butoane.map(({ d, eticheta, tasta }) => {
                const principal = d === verdict;
                return (
                  <Button
                    key={d}
                    variant={principal ? 'contained' : 'outlined'}
                    color={d === 'RESPINS' && !principal ? 'error' : 'primary'}
                    onClick={() => decide(d)}
                    disabled={pending}
                    aria-keyshortcuts={tasta}
                    endIcon={
                      pending && principal ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Box
                          component="kbd"
                          aria-hidden
                          sx={{
                            fontFamily: 'inherit',
                            // „&&” bate regula MUI care mărește primul copil din endIcon.
                            '&&': { fontSize: 11 },
                            fontWeight: 600,
                            px: 1.5,
                            borderRadius: '4px',
                            border: `1px solid ${principal ? 'rgba(255,255,255,0.5)' : color.lineStrong}`,
                            lineHeight: '18px',
                          }}
                        >
                          {tasta}
                        </Box>
                      )
                    }
                    sx={{ minHeight: 44 }}
                  >
                    {eticheta}
                  </Button>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Typography>
            <strong>
              Decizie:{' '}
              {lot.verificare?.decizie
                ? DECIS[lot.verificare.decizie.status]
                : (DECIS[lot.status as Decizie] ?? lot.status)}
            </strong>
            {lot.verificare?.decizie
              ? ` · confirmat de ${lot.verificare.decizie.de}, ${formatDate(lot.verificare.decizie.la)}, ${formatTime(lot.verificare.decizie.la)}`
              : ''}
            {lot.motiv ? ` · ${lot.motiv}` : ''}
          </Typography>
        )}
      </Box>

      <DialogDecizie
        key={cerere ? `${cerere.lotId}-${cerere.decizie}` : 'inchis'}
        cerere={cerere}
        onInchide={() => setCerere(null)}
        onDecis={(c) => {
          setCerere(null);
          finalizeaza(c.decizie);
        }}
      />
    </>
  );
}
