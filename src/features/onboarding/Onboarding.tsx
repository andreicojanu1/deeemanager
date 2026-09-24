'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconClockHour4,
  IconMapPin,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import {
  DOCUMENTE_ONBOARDING,
  ETICHETA_STARE_DOC,
  ceLipseste,
  poateTrimite,
  type DateFirma,
  type Onboarding as OnboardingT,
} from '@/lib/domain/onboarding';
import { formatDate, formatTime } from '@/lib/format';
import { color, radius } from '@/theme/tokens';
import { salveazaFirma, trimiteOnboarding } from './actions';
import SectiuneDocumente from './SectiuneDocumente';
import SectiuneFirma from './SectiuneFirma';
import StepperActivare from './StepperActivare';
import { TON_STARE } from './tonuri';

const AUTOSALVARE_MS = 800;

type Salvare =
  { tip: 'idle' } | { tip: 'salvare' } | { tip: 'salvat'; la: string } | { tip: 'eroare'; mesaj: string };

export default function Onboarding({ initial }: { initial: OnboardingT }) {
  const router = useRouter();
  const { arata } = useToast();
  const [o, setO] = useState(initial);
  const [salvare, setSalvare] = useState<Salvare>({ tip: 'idle' });
  const [incercat, setIncercat] = useState(false);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editabil = o.etapa === 'DOCUMENTE';

  // ── Autosalvarea datelor firmei, cu debounce de ~800 ms ─────────────────────────
  const schimbaFirma = useCallback((firma: DateFirma) => {
    setO((x) => ({ ...x, firma }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSalvare({ tip: 'salvare' });
      const r = await salveazaFirma(firma);
      setSalvare(r.ok ? { tip: 'salvat', la: r.valoare.salvatLa } : { tip: 'eroare', mesaj: r.eroare });
    }, AUTOSALVARE_MS);
  }, []);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const lipsa = ceLipseste(o);
  const respinse = o.documente.filter((d) => d.stare === 'RESPINS');

  /** Evidențiază câmpurile și documentele care lipsesc și duce la primul. */
  const aratLipsa = () => {
    setIncercat(true);
    document
      .getElementById(lipsa[0] === 'Datele firmei' ? 'sectiune-firma' : 'sectiune-documente')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trimite = () => {
    if (!poateTrimite(o)) return;
    start(async () => {
      if (timer.current) {
        clearTimeout(timer.current);
        await salveazaFirma(o.firma);
      }
      const r = await trimiteOnboarding();
      if (r.ok) {
        setO(r.valoare);
        arata('Dosarul a fost trimis la verificare.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        router.refresh();
      } else arata(r.eroare);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <PageHeader
        title="Activează-ți contul"
        subtitle={
          editabil
            ? 'Completează datele firmei și încarcă documentele. După verificare programăm vizita în teren.'
            : 'Dosarul e la verificare. Te anunțăm pe email când avem un răspuns.'
        }
      />
      <StepperActivare etapa={o.etapa} />

      {o.etapa === 'IN_VERIFICARE' ? (
        <Banner ton="petrol" Icon={IconClockHour4} titlu="În verificare · răspuns în maximum 24 h">
          Ai trimis dosarul {o.trimisLa ? `pe ${formatDate(o.trimisLa)}, la ${formatTime(o.trimisLa)}` : ''}.
          Administratorul verifică documentele; dacă ceva nu e în regulă, îți spunem exact ce să înlocuiești.
        </Banner>
      ) : null}
      {o.etapa === 'VIZITA' ? (
        <Banner ton="success" Icon={IconMapPin} titlu="Documente aprobate · urmează vizita în teren">
          Te sunăm în următoarele 2 zile lucrătoare ca să stabilim data vizitei la punctul de lucru.
          Pregătește originalele documentelor și accesul la zona de depozitare.
        </Banner>
      ) : null}
      {editabil && respinse.length ? (
        <Banner
          ton="danger"
          Icon={IconAlertTriangle}
          titlu={
            respinse.length === 1
              ? 'Un document a fost respins'
              : `${respinse.length} documente au fost respinse`
          }
        >
          Înlocuiește {respinse.length === 1 ? 'documentul marcat' : 'documentele marcate'} și trimite dosarul
          din nou.
        </Banner>
      ) : null}

      <SectiuneFirma firma={o.firma} editabil={editabil} onChange={schimbaFirma} arataErori={incercat} />
      <SectiuneDocumente o={o} editabil={editabil} onChange={setO} arataErori={incercat} />
      <Rezumat o={o} />

      {editabil ? (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 5,
            mx: { xs: -4, md: -8 },
            mb: { xs: -6, md: -8 },
            bgcolor: color.surface,
            borderTop: `1px solid ${color.line}`,
            px: { xs: 4, md: 8 },
            py: 3,
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Box
            aria-live="polite"
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: '1 1 240px' }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <IndicatorSalvare s={salvare} />
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color:
                  lipsa.length && incercat ? color.danger : lipsa.length ? color.inkMuted : color.successText,
              }}
            >
              {lipsa.length ? (
                <>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Mai ai de completat: {lipsa.slice(0, 3).join(', ')}
                    {lipsa.length > 3 ? ` și încă ${lipsa.length - 3}` : ''}.
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    {lipsa.length === 1
                      ? 'Mai ai de completat 1 element.'
                      : `Mai ai de completat ${lipsa.length} elemente.`}
                  </Box>
                </>
              ) : (
                'Dosarul e complet.'
              )}
              {lipsa.length ? (
                <Button
                  variant="text"
                  size="small"
                  onClick={aratLipsa}
                  sx={{ ml: 1, verticalAlign: 'baseline' }}
                >
                  Arată ce lipsește
                </Button>
              ) : null}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={trimite}
            disabled={pending || !poateTrimite(o)}
            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              minHeight: 44,
              flex: { xs: '1 1 100%', sm: '0 0 auto' },
            }}
          >
            Trimite la verificare
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

function IndicatorSalvare({ s }: { s: Salvare }) {
  if (s.tip === 'salvare')
    return (
      <>
        <CircularProgress size={12} aria-hidden /> Se salvează…
      </>
    );
  if (s.tip === 'salvat')
    return (
      <>
        <IconCheck size={14} stroke={2} color={color.successText} aria-hidden /> Salvat automat la{' '}
        {formatTime(s.la)}
      </>
    );
  if (s.tip === 'eroare')
    return (
      <>
        <IconAlertCircle size={14} stroke={1.5} color={color.danger} aria-hidden />
        <span style={{ color: color.danger }}>{s.mesaj}</span>
      </>
    );
  return <>Modificările se salvează automat.</>;
}

const BANNER: Record<'petrol' | 'success' | 'danger', { bg: string; fg: string }> = {
  petrol: { bg: color.petrolSoft, fg: color.petrol },
  success: { bg: color.successSoft, fg: color.successText },
  danger: { bg: color.dangerSoft, fg: color.danger },
};

function Banner({
  ton,
  Icon,
  titlu,
  children,
}: {
  ton: keyof typeof BANNER;
  Icon: typeof IconCheck;
  titlu: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      role="status"
      sx={{
        bgcolor: BANNER[ton].bg,
        borderRadius: `${radius.lg}px`,
        p: 5,
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
      }}
    >
      <Icon size={22} stroke={1.5} color={BANNER[ton].fg} aria-hidden style={{ flexShrink: 0 }} />
      <Box>
        <Typography variant="bodyStrong" component="p" sx={{ color: BANNER[ton].fg, fontSize: 16 }}>
          {titlu}
        </Typography>
        <Typography sx={{ color: color.ink }}>{children}</Typography>
      </Box>
    </Box>
  );
}

// ── Rezumatul de la final ──────────────────────────────────────────────────────────

function Rezumat({ o }: { o: OnboardingT }) {
  return (
    <Box
      component="section"
      aria-labelledby="rezumat-titlu"
      sx={{
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 6, pb: 4 }}>
        <Typography id="rezumat-titlu" variant="h3" component="h2">
          Rezumat
        </Typography>
        <Typography color="text.secondary">Fiecare document și statusul lui.</Typography>
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {DOCUMENTE_ONBOARDING.map((info) => {
          const d = o.documente.find((x) => x.tip === info.tip)!;
          const respins = d.stare === 'RESPINS';
          return (
            <Box
              component="li"
              key={info.tip}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr auto', sm: 'minmax(0, 1fr) 140px' },
                columnGap: 4,
                rowGap: 1,
                alignItems: 'center',
                minHeight: 48,
                px: 6,
                py: 2,
                borderTop: `1px solid ${color.line}`,
                bgcolor: respins ? color.dangerSoft : 'transparent',
              }}
            >
              <Typography sx={{ minWidth: 0 }}>{info.denumire}</Typography>
              <Box sx={{ justifySelf: 'end' }}>
                <StatusBadge tone={TON_STARE[d.stare]} label={ETICHETA_STARE_DOC[d.stare]} />
              </Box>
              {respins && d.motiv ? (
                <Typography variant="caption" sx={{ gridColumn: '1 / -1', color: color.danger }}>
                  {d.motiv}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
