'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { IconAlertCircle, IconCamera, IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import {
  SLOTURI_FOTO,
  SLOT_VIDEO,
  ceLipseste,
  progresDocumente,
  totalKgCiorna,
  valideazaPas1,
  type Ciorna,
  type ContextValidare,
  type Pas,
} from '@/lib/domain/ciorna';
import { formatNumber } from '@/lib/format';
import { color, motion } from '@/theme/tokens';
import { salveazaCiorna, trimiteLot } from './actions';
import { WizardContext, type OptiuniFisier, type Taxonomie, type WizardApi } from './context';
import Pas1Informatii from './Pas1Informatii';
import Pas2Documente from './Pas2Documente';
import Pas3Confirmare from './Pas3Confirmare';
import Stepper, { PASI } from './Stepper';
import { acumRelativ, marimeFisier } from './util';

type Props = { initial: Ciorna; tx: Taxonomie; pasInitial?: Pas };

type StareSalvare =
  | { tip: 'nesalvat' }
  | { tip: 'salvare' }
  | { tip: 'salvat'; la: Date | null }
  | { tip: 'eroare'; mesaj: string };

const AUTOSALVARE_MS = 800;

export default function Wizard({ initial, tx, pasInitial = 1 }: Props) {
  const router = useRouter();
  const { arata } = useToast();
  const [ciorna, setCiorna] = useState<Ciorna>(initial);
  const [pas, setPas] = useState<Pas>(pasInitial);
  const [atinse, setAtinse] = useState<Set<string>>(() => new Set());
  const [incercat, setIncercat] = useState<Record<number, boolean>>({});
  const [salvare, setSalvare] = useState<StareSalvare>(
    initial.id ? { tip: 'salvat', la: null } : { tip: 'nesalvat' },
  );
  const [acum, setAcum] = useState(() => new Date());
  const [trimitere, setTrimitere] = useState(false);
  const [previzualizari, setPrevizualizari] = useState<Record<string, string>>({});
  const [progres, setProgres] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const tintaFisier = useRef<string | null>(null);
  const prima = useRef(true);
  const idRef = useRef(initial.id);
  const [lotId, setLotId] = useState(initial.id);

  const validare: ContextValidare = useMemo(() => {
    const subMap = new Map(tx.subcategorii.map((s) => [s.cod, s]));
    return {
      subcategorie: (cod) => subMap.get(cod),
      coduriPermise: (cod) => {
        const s = subMap.get(cod);
        return s ? (tx.coduriPeCategorie[s.categorieId] ?? []) : [];
      },
      coduriAutorizate: tx.coduriAutorizate,
    };
  }, [tx]);

  const actualizeaza = useCallback((fn: (draft: Ciorna) => void) => {
    setCiorna((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  // ── Autosalvare, cu debounce de ~800 ms ─────────────────────────────────────────
  useEffect(() => {
    if (prima.current) {
      prima.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setSalvare({ tip: 'salvare' });
      const r = await salveazaCiorna({ ...ciorna, id: idRef.current });
      if (r.ok) {
        if (!idRef.current) {
          idRef.current = r.id;
          setLotId(r.id);
          // Lotul are ID de la prima salvare; adresa devine cea de editare, fără reîncărcare.
          window.history.replaceState(null, '', `/loturi/${r.id}/editare`);
        }
        setSalvare({ tip: 'salvat', la: new Date() });
      } else setSalvare({ tip: 'eroare', mesaj: r.eroare });
    }, AUTOSALVARE_MS);
    return () => clearTimeout(t);
  }, [ciorna]);

  useEffect(() => {
    const i = setInterval(() => setAcum(new Date()), 5000);
    return () => clearInterval(i);
  }, []);

  // ── Fișiere (Faza A: rămân în browser; pe server ajunge doar numele) ─────────────
  const inregistreaza = useCallback(
    (cheie: string, f: File) => {
      const tip = f.type.startsWith('video/') ? 'VIDEO' : f.type.startsWith('image/') ? 'FOTO' : 'DOCUMENT';
      if (tip !== 'DOCUMENT') {
        const url = URL.createObjectURL(f);
        setPrevizualizari((p) => ({ ...p, [cheie]: url }));
      }
      actualizeaza((d) => {
        d.fisiere[cheie] = [{ nume: f.name, marime: marimeFisier(f.size), tip }];
      });
      // Progres simulat, ca să se vadă bara de încărcare.
      setProgres((p) => ({ ...p, [cheie]: 5 }));
      let v = 5;
      const i = setInterval(() => {
        v = Math.min(100, v + 19);
        setProgres((p) => ({ ...p, [cheie]: v }));
        if (v >= 100) clearInterval(i);
      }, 180);
    },
    [actualizeaza],
  );

  const alegeFisier = useCallback((cheie: string, opt: OptiuniFisier) => {
    const input = inputRef.current;
    if (!input) return;
    tintaFisier.current = cheie;
    input.accept = opt.accept;
    if (opt.capture) input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    input.click();
  }, []);

  const adaugaFisiere = useCallback(
    (fisiere: File[]) => {
      const libereFoto = SLOTURI_FOTO.map((s) => s.cheie).filter((k) => !ciorna.fisiere[k]?.length);
      for (const f of fisiere) {
        if (f.type.startsWith('video/')) inregistreaza(SLOT_VIDEO.cheie, f);
        else if (f.type.startsWith('image/') && libereFoto.length) inregistreaza(libereFoto.shift()!, f);
      }
    },
    [ciorna.fisiere, inregistreaza],
  );

  // ── Validare și navigare între pași ─────────────────────────────────────────────
  const erori = useMemo(() => (pas === 1 ? valideazaPas1(ciorna, validare) : {}), [ciorna, pas, validare]);
  const eroare = useCallback(
    (cheie: string) => (atinse.has(cheie) || incercat[pas] ? erori[cheie] : undefined),
    [atinse, incercat, pas, erori],
  );
  const atinge = useCallback(
    (cheie: string) => setAtinse((s) => (s.has(cheie) ? s : new Set(s).add(cheie))),
    [],
  );

  const lipsa = ceLipseste(ciorna, pas, validare);
  const elemente = progresDocumente(ciorna);
  const primulLipsa = elemente.find((e) => e.stare !== 'COMPLET');

  const mergiLa = (p: Pas) => {
    setPas(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const arataLipsuri = () => {
    setIncercat((s) => ({ ...s, [pas]: true }));
    // Focus pe primul câmp cu eroare, după randare.
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-lipsa="true"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el && 'focus' in el) el.focus({ preventScroll: true });
    });
  };

  const trimite = async () => {
    if (!idRef.current) return;
    setTrimitere(true);
    // Salvează ultima versiune înainte de trimitere.
    const s = await salveazaCiorna({ ...ciorna, id: idRef.current });
    const r = s.ok ? await trimiteLot(idRef.current) : s;
    setTrimitere(false);
    if (r.ok) {
      arata('Lotul a fost trimis la verificare.');
      router.push(`/loturi/${idRef.current}`);
    } else arata(r.eroare);
  };

  const continua = () => {
    if (lipsa) return;
    if (pas < 3) mergiLa((pas + 1) as Pas);
    else void trimite();
  };

  const api: WizardApi = {
    ciorna,
    actualizeaza,
    tx,
    validare,
    erori,
    eroare,
    atinge,
    alegeFisier,
    adaugaFisiere,
    previzualizari,
    progres,
  };

  const kg = totalKgCiorna(ciorna);
  const liniiValide = ciorna.linii.filter((l) => l.subcategorieCod).length;
  const eticheteContinua: Record<Pas, string> = {
    1: 'Continuă la documente',
    2: 'Continuă la confirmare',
    3: 'Trimite la verificare',
  };

  const indicatorSalvare: ReactNode =
    salvare.tip === 'salvare' ? (
      <>
        <CircularProgress size={14} aria-hidden /> Se salvează ciorna…
      </>
    ) : salvare.tip === 'salvat' ? (
      <>
        <IconCheck size={16} stroke={2} color={color.successText} aria-hidden />
        {salvare.la ? `Ciornă salvată automat ${acumRelativ(salvare.la, acum)}` : 'Ciorna e salvată'}
      </>
    ) : salvare.tip === 'eroare' ? (
      <>
        <IconAlertCircle size={16} stroke={1.5} color={color.danger} aria-hidden />
        <span style={{ color: color.danger }}>{salvare.mesaj} Reîncercăm la următoarea modificare.</span>
      </>
    ) : (
      'Ciorna se salvează automat după prima modificare'
    );

  const mobilFotografiaza = pas === 2 && primulLipsa;

  return (
    <WizardContext.Provider value={api}>
      <input
        ref={inputRef}
        type="file"
        hidden
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && tintaFisier.current) inregistreaza(tintaFisier.current, f);
          e.target.value = '';
        }}
      />

      {/* Antet desktop: titlu + stepper; mobil: pasul curent + bară în 3 segmente */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="display" component="h1">
            {initial.id && initial.id === lotId ? `Editează ${initial.id}` : 'Lot nou'}
          </Typography>
          <Typography color="text.secondary" className="num" sx={{ mt: 1, fontSize: 16, lineHeight: '24px' }}>
            {lotId ?? 'Ciornă nesalvată'} · {liniiValide === 1 ? '1 linie' : `${liniiValide} linii`} ·{' '}
            {formatNumber(kg)} kg declarat · Punct de lucru {ciorna.punctLucru || '—'}
          </Typography>
        </Box>
        <Stepper
          pas={pas}
          complet={(p) => !ceLipseste(ciorna, p, validare)}
          laPas={(p) => p < pas && mergiLa(p)}
        />
      </Box>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: -2 }}>
          <IconButton
            aria-label={pas === 1 ? 'Înapoi la loturi' : 'Pasul anterior'}
            onClick={() => (pas === 1 ? router.push('/loturi') : mergiLa((pas - 1) as Pas))}
          >
            <IconChevronLeft size={22} stroke={1.5} />
          </IconButton>
          <Box>
            <Typography variant="h2" component="h1">
              {initial.id && initial.id === lotId ? `Editează ${initial.id}` : 'Lot nou'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pasul {pas} din 3 · {PASI[pas - 1]}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 3 }} aria-hidden>
          {[1, 2, 3].map((p) => (
            <Box
              key={p}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: p < pas ? color.petrol : p === pas ? color.petrol : color.lineStrong,
                opacity: p === pas ? 0.55 : 1,
                transition: `background-color ${motion.base}ms ${motion.easing}`,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box
        key={pas}
        sx={{
          animation: `deee-pas ${motion.base}ms ${motion.easing}`,
          '@keyframes deee-pas': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'none' },
          },
          pb: { xs: 28, sm: 0 },
        }}
      >
        {pas === 1 ? <Pas1Informatii /> : null}
        {pas === 2 ? <Pas2Documente /> : null}
        {pas === 3 ? <Pas3Confirmare /> : null}
      </Box>

      {/* Subsol: indicatorul de ciornă, ce lipsește și acțiunea principală */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 5,
          mx: { xs: -4, md: -8 },
          mb: { xs: -6, md: -8 },
          px: { xs: 4, md: 8 },
          py: 3,
          bgcolor: color.surface,
          borderTop: `1px solid ${color.line}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 3,
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          role="status"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          {indicatorSalvare}
        </Typography>
        {lipsa ? (
          <Button
            variant="text"
            size="small"
            onClick={arataLipsuri}
            sx={{ color: color.inkMuted, fontWeight: 400, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
          >
            {lipsa}
          </Button>
        ) : null}
        {pas > 1 ? (
          <Button
            variant="outlined"
            startIcon={<IconChevronLeft size={18} stroke={1.5} />}
            onClick={() => mergiLa((pas - 1) as Pas)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Înapoi
          </Button>
        ) : null}
        {mobilFotografiaza ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<IconCamera size={20} stroke={1.5} />}
            onClick={() =>
              alegeFisier(
                primulLipsa.tip === 'FOTO_INCARCATURA'
                  ? SLOTURI_FOTO.find((s) => !ciorna.fisiere[s.cheie]?.length)!.cheie
                  : primulLipsa.cheie,
                {
                  accept: primulLipsa.tip === 'FILMARE_CANTAR' ? 'video/*' : 'image/*',
                  capture: true,
                },
              )
            }
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, flex: '1 1 100%', minHeight: 52 }}
          >
            Fotografiază următorul document
          </Button>
        ) : null}
        <Button
          variant="contained"
          onClick={continua}
          disabled={Boolean(lipsa) || trimitere}
          startIcon={trimitere ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            display: { xs: mobilFotografiaza ? 'none' : 'inline-flex', sm: 'inline-flex' },
            flex: { xs: '1 1 100%', sm: '0 0 auto' },
            minHeight: { xs: 52, sm: 40 },
          }}
        >
          {eticheteContinua[pas]}
        </Button>
      </Box>
    </WizardContext.Provider>
  );
}
