'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconAlertTriangle, IconChevronDown, IconPencil } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CategorieIcon from '@/components/ui/CategorieIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import type { CodDeseu } from '@/lib/domain/lot';
import type { Severitate } from '@/lib/domain/raport';
import { ETICHETA_SEVERITATE, type ConfigRegula } from '@/lib/domain/reguli';
import {
  ETICHETA_UNITATE,
  type Categorie,
  type Subcategorie,
  type UnitateTarif,
} from '@/lib/domain/taxonomie';
import { formatNumber } from '@/lib/format';
import { color, motion } from '@/theme/tokens';
import { modificaCod, modificaRegula, modificaSubcategorie } from './actions';

const TABURI = [
  { cheie: 'categorii', eticheta: 'Categorii și subcategorii' },
  { cheie: 'coduri', eticheta: 'Coduri deșeu' },
  { cheie: 'reguli', eticheta: 'Reguli de verificare' },
] as const;
type CheieTab = (typeof TABURI)[number]['cheie'];

type Props = {
  categorii: Categorie[];
  subcategorii: Subcategorie[];
  coduri: CodDeseu[];
  reguli: ConfigRegula[];
};

/** Rulează o acțiune de server, arată rezultatul și reîncarcă datele paginii. */
function useSalvare() {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const salveaza = (fn: () => Promise<{ ok: boolean; eroare?: string }>, succes: string, dupa?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        arata(succes);
        dupa?.();
        router.refresh();
      } else arata(r.eroare ?? 'Modificarea nu s-a salvat.');
    });
  return { pending, salveaza };
}

export default function TaxonomieTabs(props: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get('tab') as CheieTab;
  const [tab, setTab] = useState<CheieTab>(TABURI.some((t) => t.cheie === initial) ? initial : 'categorii');

  const schimba = (t: CheieTab) => {
    setTab(t);
    const sp = new URLSearchParams(params.toString());
    if (t === 'categorii') sp.delete('tab');
    else sp.set('tab', t);
    const qs = sp.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v: CheieTab) => schimba(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Secțiunile taxonomiei"
        sx={{ borderBottom: `1px solid ${color.line}`, mb: 6 }}
      >
        {TABURI.map((t) => (
          <Tab
            key={t.cheie}
            value={t.cheie}
            label={t.eticheta}
            id={`tab-${t.cheie}`}
            aria-controls={`panou-${t.cheie}`}
          />
        ))}
      </Tabs>
      <Box
        role="tabpanel"
        id={`panou-${tab}`}
        aria-labelledby={`tab-${tab}`}
        sx={{
          animation: 'deee-fade 150ms ease-out',
          '@keyframes deee-fade': { from: { opacity: 0 }, to: { opacity: 1 } },
        }}
      >
        {tab === 'categorii' ? (
          <Arbore categorii={props.categorii} subcategorii={props.subcategorii} />
        ) : null}
        {tab === 'coduri' ? <Coduri coduri={props.coduri} /> : null}
        {tab === 'reguli' ? <Reguli reguli={props.reguli} /> : null}
      </Box>
    </Box>
  );
}

// ── Categorii → subcategorii ──────────────────────────────────────────────────────

const tarif = (s: Pick<Subcategorie, 'valoareTarif' | 'unitateTarif'>) =>
  `${formatNumber(s.valoareTarif, 2)} ${ETICHETA_UNITATE[s.unitateTarif]}`;

function Arbore({ categorii, subcategorii }: { categorii: Categorie[]; subcategorii: Subcategorie[] }) {
  const [deschise, setDeschise] = useState<Set<number>>(() => new Set([categorii[0]?.id]));
  const [editez, setEditez] = useState<string | null>(null);

  return (
    <Card>
      <Box sx={{ px: 6, py: 4, borderBottom: `1px solid ${color.line}` }}>
        <Typography color="text.secondary">
          Tarifele sunt fără TVA. Subcategoriile dezactivate nu mai apar la loturi noi; loturile existente le
          păstrează.
        </Typography>
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {categorii.map((c) => {
          const ale = subcategorii.filter((s) => s.categorieId === c.id);
          const deschis = deschise.has(c.id);
          const active = ale.filter((s) => s.activa !== false).length;
          return (
            <li key={c.id}>
              <Box
                component="button"
                type="button"
                aria-expanded={deschis}
                aria-controls={`categorie-${c.id}`}
                onClick={() =>
                  setDeschise((s) => {
                    const n = new Set(s);
                    if (n.has(c.id)) n.delete(c.id);
                    else n.add(c.id);
                    return n;
                  })
                }
                sx={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  px: 6,
                  minHeight: 56,
                  cursor: 'pointer',
                  borderTop: `1px solid ${color.line}`,
                  '&:hover': { bgcolor: color.canvas },
                  '&:focus-visible': { outline: `2px solid ${color.petrol}`, outlineOffset: -2 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'grid',
                    color: color.inkMuted,
                    transform: deschis ? 'none' : 'rotate(-90deg)',
                    transition: `transform ${motion.fast}ms ${motion.easing}`,
                  }}
                >
                  <IconChevronDown size={18} stroke={1.5} aria-hidden />
                </Box>
                <CategorieIcon categorieId={c.id} size={20} />
                <Typography variant="bodyStrong" component="span" sx={{ flex: 1 }}>
                  {c.cod}. {c.denumire}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="num">
                  {active} din {ale.length} active
                </Typography>
              </Box>
              <Collapse in={deschis} timeout={motion.base} id={`categorie-${c.id}`}>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, bgcolor: color.canvas }}>
                  {ale.map((s) =>
                    editez === s.cod ? (
                      <EditareSubcategorie key={s.cod} s={s} onGata={() => setEditez(null)} />
                    ) : (
                      <RandSubcategorie key={s.cod} s={s} onEditeaza={() => setEditez(s.cod)} />
                    ),
                  )}
                </Box>
              </Collapse>
            </li>
          );
        })}
      </Box>
    </Card>
  );
}

function RandSubcategorie({ s, onEditeaza }: { s: Subcategorie; onEditeaza: () => void }) {
  const { pending, salveaza } = useSalvare();
  const activa = s.activa !== false;
  return (
    <Box
      component="li"
      data-subcategorie={s.cod}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '64px minmax(0, 1fr) 160px auto auto' },
        alignItems: 'center',
        columnGap: 4,
        rowGap: 1,
        pl: { xs: 6, md: 14 },
        pr: 4,
        py: 2,
        minHeight: 52,
        borderTop: `1px solid ${color.line}`,
        color: activa ? color.ink : color.inkMuted,
      }}
    >
      <Typography className="num" sx={{ color: 'inherit', display: { xs: 'none', md: 'block' } }}>
        {s.cod}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: 'inherit' }}>
          <Box component="span" className="num" sx={{ display: { md: 'none' } }}>
            {s.cod}{' '}
          </Box>
          {s.denumire}
        </Typography>
        <Typography variant="caption" color="text.secondary" className="num" sx={{ display: { md: 'none' } }}>
          {tarif(s)}
        </Typography>
      </Box>
      <Typography
        className="num"
        sx={{ color: 'inherit', textAlign: 'right', display: { xs: 'none', md: 'block' } }}
      >
        {tarif(s)}
      </Typography>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {activa ? null : <StatusBadge tone="cancelled" label="Dezactivată" />}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch
          checked={activa}
          disabled={pending}
          onChange={(e) =>
            salveaza(
              () => modificaSubcategorie(s.cod, { activa: e.target.checked }),
              e.target.checked ? `${s.cod} e din nou activă.` : `${s.cod} a fost dezactivată.`,
            )
          }
          slotProps={{ input: { 'aria-label': `Activă: ${s.cod} ${s.denumire}` } }}
        />
        <IconButton onClick={onEditeaza} aria-label={`Editează ${s.cod} ${s.denumire}`}>
          <IconPencil size={18} stroke={1.5} />
        </IconButton>
      </Box>
    </Box>
  );
}

function EditareSubcategorie({ s, onGata }: { s: Subcategorie; onGata: () => void }) {
  const { pending, salveaza } = useSalvare();
  const [denumire, setDenumire] = useState(s.denumire);
  const [unitate, setUnitate] = useState<UnitateTarif>(s.unitateTarif);
  const [valoare, setValoare] = useState(formatNumber(s.valoareTarif, 2));
  const [eroare, setEroare] = useState<string | null>(null);

  const trimite = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(valoare.replace(/\./g, '').replace(',', '.'));
    if (!valoare.trim() || Number.isNaN(n)) {
      setEroare('Scrie tariful ca număr, de exemplu 12,50.');
      return;
    }
    salveaza(
      () => modificaSubcategorie(s.cod, { denumire, unitateTarif: unitate, valoareTarif: n }),
      `${s.cod} a fost actualizată.`,
      onGata,
    );
  };

  return (
    <Box
      component="li"
      sx={{
        pl: { xs: 6, md: 14 },
        pr: 4,
        py: 4,
        borderTop: `1px solid ${color.line}`,
        bgcolor: color.surface,
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={trimite}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onGata();
        }}
        aria-label={`Editare ${s.cod}`}
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '64px minmax(0, 1fr) 160px 140px auto' },
          alignItems: 'start',
        }}
      >
        <TextField
          id={`cod-${s.cod}`}
          label="Cod"
          value={s.cod}
          slotProps={{ htmlInput: { readOnly: true, className: 'num' } }}
          helperText=" "
          sx={{ '& .MuiInputBase-root': { bgcolor: color.canvas } }}
        />
        <TextField
          id={`denumire-${s.cod}`}
          label="Denumire"
          value={denumire}
          autoFocus
          onChange={(e) => setDenumire(e.target.value)}
          helperText=" "
        />
        <TextField
          id={`tarif-${s.cod}`}
          label="Valoare tarif"
          value={valoare}
          onChange={(e) => {
            setValoare(e.target.value);
            setEroare(null);
          }}
          error={Boolean(eroare)}
          helperText={eroare ?? ' '}
          slotProps={{
            htmlInput: { inputMode: 'decimal', className: 'num', style: { textAlign: 'right' } },
            input: { endAdornment: <InputAdornment position="end">lei</InputAdornment> },
          }}
        />
        <TextField
          id={`unitate-${s.cod}`}
          select
          label="Unitate"
          value={unitate}
          onChange={(e) => setUnitate(e.target.value as UnitateTarif)}
          helperText=" "
        >
          <MenuItem value="PER_BUCATA">Per bucată</MenuItem>
          <MenuItem value="PER_KG">Per kg</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', gap: 2, pt: { md: 7 } }}>
          <Button onClick={onGata}>Renunță</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Salvează
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ── Coduri deșeu ──────────────────────────────────────────────────────────────────

function Coduri({ coduri }: { coduri: CodDeseu[] }) {
  const { pending, salveaza } = useSalvare();
  return (
    <Card>
      <Box
        sx={{ px: 6, py: 4, display: 'flex', gap: 3, alignItems: 'flex-start', bgcolor: color.warningSoft }}
      >
        <IconAlertTriangle
          size={20}
          stroke={1.5}
          color={color.warningText}
          aria-hidden
          style={{ flexShrink: 0 }}
        />
        <Typography sx={{ color: color.warningText }}>
          Lista de coduri permise pe subcategorie nu e încă validată de client. Codurile dezactivate nu mai
          pot fi alese în loturi noi.
        </Typography>
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {coduri.map((c) => {
          const activ = c.activ !== false;
          return (
            <Box
              component="li"
              key={c.cod}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: '110px minmax(0, 1fr) auto auto' },
                alignItems: 'center',
                columnGap: 4,
                px: 6,
                py: 2,
                minHeight: 52,
                borderTop: `1px solid ${color.line}`,
                color: activ ? color.ink : color.inkMuted,
              }}
            >
              <Typography
                className="num"
                sx={{ color: 'inherit', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
              >
                {c.cod}
              </Typography>
              <Typography sx={{ color: 'inherit', minWidth: 0 }}>
                <Box component="span" className="num" sx={{ display: { sm: 'none' }, fontWeight: 500 }}>
                  {c.cod}{' '}
                </Box>
                {c.denumire}
              </Typography>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {c.periculos ? <StatusBadge tone="warning" label="Periculos" /> : null}
              </Box>
              <Switch
                checked={activ}
                disabled={pending}
                onChange={(e) =>
                  salveaza(
                    () => modificaCod(c.cod, e.target.checked),
                    e.target.checked ? `${c.cod} e din nou activ.` : `${c.cod} a fost dezactivat.`,
                  )
                }
                slotProps={{ input: { 'aria-label': `Activ: ${c.cod}` } }}
              />
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ── Reguli de verificare ──────────────────────────────────────────────────────────

function Reguli({ reguli }: { reguli: ConfigRegula[] }) {
  return (
    <Card>
      <Box
        sx={{ px: 6, py: 4, display: 'flex', gap: 3, alignItems: 'flex-start', bgcolor: color.warningSoft }}
      >
        <IconAlertTriangle
          size={20}
          stroke={1.5}
          color={color.warningText}
          aria-hidden
          style={{ flexShrink: 0 }}
        />
        <Typography sx={{ color: color.warningText }}>
          Regulamentul de verificare nu e încă validat de client. Severitățile și toleranțele de aici sunt
          propuneri și se aplică loturilor verificate de acum înainte.
        </Typography>
      </Box>
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '64px minmax(0, 1fr) 180px 160px 72px',
          columnGap: 4,
          px: 6,
          py: 3,
          borderTop: `1px solid ${color.line}`,
        }}
      >
        {['Cod', 'Regulă', 'Severitate', 'Toleranță', 'Activă'].map((h) => (
          <Typography key={h} variant="tableHead" color="text.secondary">
            {h}
          </Typography>
        ))}
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {reguli.map((r) => (
          <RandRegula key={r.cod} r={r} />
        ))}
      </Box>
    </Card>
  );
}

function RandRegula({ r }: { r: ConfigRegula }) {
  const { pending, salveaza } = useSalvare();
  const [toleranta, setToleranta] = useState(
    r.toleranta === undefined ? '' : formatNumber(Math.round(r.toleranta * 1000) / 10),
  );
  const [eroare, setEroare] = useState<string | null>(null);

  const salveazaToleranta = () => {
    if (r.toleranta === undefined) return;
    const n = Number(toleranta.replace(',', '.'));
    if (!toleranta.trim() || Number.isNaN(n) || n < 0 || n > 100) {
      setEroare('Scrie un procent între 0 și 100.');
      return;
    }
    if (Math.abs(n / 100 - r.toleranta) < 1e-9) return;
    salveaza(
      () => modificaRegula(r.cod, { toleranta: n / 100 }),
      `${r.cod}: toleranța e acum ±${formatNumber(n)}%.`,
    );
  };

  return (
    <Box
      component="li"
      data-regula={r.cod}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '64px minmax(0, 1fr) 180px 160px 72px' },
        alignItems: 'center',
        columnGap: 4,
        rowGap: 3,
        px: 6,
        py: 3,
        borderTop: `1px solid ${color.line}`,
        color: r.activa ? color.ink : color.inkMuted,
      }}
    >
      <Typography
        className="num"
        sx={{ color: 'inherit', fontWeight: 500, display: { xs: 'none', md: 'block' } }}
      >
        {r.cod}
      </Typography>
      <Typography sx={{ color: 'inherit' }}>
        <Box component="span" className="num" sx={{ display: { md: 'none' }, fontWeight: 500 }}>
          {r.cod}{' '}
        </Box>
        {r.nume}
      </Typography>
      <TextField
        id={`severitate-${r.cod}`}
        select
        size="small"
        value={r.severitate}
        disabled={pending}
        onChange={(e) =>
          salveaza(
            () => modificaRegula(r.cod, { severitate: e.target.value as Severitate }),
            `${r.cod}: severitatea e acum ${ETICHETA_SEVERITATE[e.target.value as Severitate].toLowerCase()}.`,
          )
        }
        slotProps={{ htmlInput: { 'aria-label': `Severitate ${r.cod}` } }}
        sx={{ gridColumn: { xs: '1 / 2', md: 'auto' }, gridRow: { xs: 2, md: 'auto' } }}
      >
        {(Object.keys(ETICHETA_SEVERITATE) as Severitate[]).map((s) => (
          <MenuItem key={s} value={s}>
            {ETICHETA_SEVERITATE[s]}
          </MenuItem>
        ))}
      </TextField>
      {r.toleranta === undefined ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Fără prag numeric
        </Typography>
      ) : (
        <TextField
          id={`toleranta-${r.cod}`}
          size="small"
          value={toleranta}
          disabled={pending}
          onChange={(e) => {
            setToleranta(e.target.value);
            setEroare(null);
          }}
          onBlur={salveazaToleranta}
          onKeyDown={(e) => {
            if (e.key === 'Enter') salveazaToleranta();
          }}
          error={Boolean(eroare)}
          helperText={eroare ?? undefined}
          slotProps={{
            htmlInput: {
              'aria-label': `Toleranță ${r.cod}, în procente`,
              inputMode: 'decimal',
              className: 'num',
              style: { textAlign: 'right' },
            },
            input: {
              startAdornment: <InputAdornment position="start">±</InputAdornment>,
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            },
          }}
          sx={{ gridColumn: { xs: '1 / 2', md: 'auto' }, gridRow: { xs: 3, md: 'auto' } }}
        />
      )}
      <Switch
        checked={r.activa}
        disabled={pending}
        onChange={(e) =>
          salveaza(
            () => modificaRegula(r.cod, { activa: e.target.checked }),
            e.target.checked ? `${r.cod} e din nou activă.` : `${r.cod} a fost dezactivată.`,
          )
        }
        slotProps={{ input: { 'aria-label': `Activă: ${r.cod} ${r.nume}` } }}
        sx={{ gridColumn: { xs: 2, md: 'auto' }, gridRow: { xs: 1, md: 'auto' } }}
      />
    </Box>
  );
}
