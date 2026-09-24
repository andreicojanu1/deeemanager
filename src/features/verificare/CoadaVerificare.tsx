'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconArrowDown, IconArrowUp, IconChevronRight, IconFilter, IconKeyboard } from '@tabler/icons-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import StatusDot from '@/components/ui/StatusDot';
import { useToast } from '@/components/ui/Toast';
import {
  ETICHETA_PRIORITATE,
  durata,
  type Decizie,
  type Prioritate,
  type RandCoada,
} from '@/lib/domain/coada';
import type { StatusTone } from '@/lib/domain/status';
import { formatKg, formatTime } from '@/lib/format';
import { color, radius } from '@/theme/tokens';
import PageHeader from '@/components/layout/PageHeader';
import { decideLot } from './actions';
import DialogDecizie, { type CerereDecizie } from './DialogDecizie';

type Tab = 'deVerificat' | 'asteaptaColectorul' | 'deciseAzi';

type Props = {
  deVerificat: RandCoada[];
  asteaptaColectorul: RandCoada[];
  deciseAzi: RandCoada[];
  acum: string;
  subtitlu: string;
};

const TON_PRIORITATE: Record<Prioritate, 'danger' | 'warning' | 'success'> = {
  RIDICATA: 'danger',
  MEDIE: 'warning',
  NORMALA: 'success',
};

const VERDICT: Record<Decizie, { tone: StatusTone; label: string }> = {
  ACCEPTAT: { tone: 'success', label: 'Acceptă' },
  NECESITA_COMPLETARI: { tone: 'warning', label: 'Necesită completări' },
  RESPINS: { tone: 'danger', label: 'Respinge' },
};

const MESAJ_DECIS: Record<Decizie, string> = {
  ACCEPTAT: 'a fost acceptat',
  NECESITA_COMPLETARI: 'așteaptă completări de la colector',
  RESPINS: 'a fost respins',
};

export default function CoadaVerificare({
  deVerificat,
  asteaptaColectorul,
  deciseAzi,
  acum,
  subtitlu,
}: Props) {
  const router = useRouter();
  const { arata } = useToast();
  const [, startRefresh] = useTransition();
  const [tab, setTab] = useState<Tab>('deVerificat');
  const [selectat, setSelectat] = useState(0);
  const [dinTastatura, setDinTastatura] = useState(false);
  const [cerere, setCerere] = useState<CerereDecizie | null>(null);
  const [ascunse, setAscunse] = useState<Set<string>>(() => new Set());
  const [filtre, setFiltre] = useState<{ colector: string; doarPericulos: boolean }>({
    colector: '',
    doarPericulos: false,
  });
  const [meniuFiltre, setMeniuFiltre] = useState<HTMLElement | null>(null);
  const randuriRef = useRef<(HTMLTableRowElement | null)[]>([]);

  const surse: Record<Tab, RandCoada[]> = { deVerificat, asteaptaColectorul, deciseAzi };
  const colectori = useMemo(() => [...new Set(deVerificat.map((r) => r.colector))].sort(), [deVerificat]);
  const randuri = surse[tab].filter(
    (r) =>
      !ascunse.has(r.id) &&
      (!filtre.colector || r.colector === filtre.colector) &&
      (!filtre.doarPericulos || r.coduriPericuloase.length > 0),
  );
  const activ = tab === 'deVerificat';
  const curent = randuri[Math.min(selectat, randuri.length - 1)];
  const minuteDe = (iso: string) => (new Date(acum).getTime() - new Date(iso).getTime()) / 60_000;

  const deschide = useCallback((id: string) => router.push(`/admin/verificari/${id}`), [router]);

  const cere = useCallback(
    (r: RandCoada, decizie: Decizie) =>
      setCerere({ lotId: r.id, decizie, motivPropus: r.motivPropus, reguliRosii: r.reguli.ROSU }),
    [],
  );

  const decis = (c: CerereDecizie) => {
    setCerere(null);
    setAscunse((s) => new Set(s).add(c.lotId));
    arata(`${c.lotId} ${MESAJ_DECIS[c.decizie]}.`);
    startRefresh(() => router.refresh());
  };

  // „Acceptă” fără reguli roșii se aplică direct; restul trece prin confirmare.
  const aplica = useCallback(
    async (r: RandCoada, decizie: Decizie) => {
      if (decizie === 'ACCEPTAT' && r.reguli.ROSU === 0) {
        const rez = await decideLot({ id: r.id, decizie, motiv: '' });
        if (rez.ok) decis({ lotId: r.id, decizie, motivPropus: '', reguliRosii: 0 });
        else arata(rez.eroare);
        return;
      }
      cere(r, decizie);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cere],
  );

  // Scurtăturile: doar pe această pagină, doar pe tab-ul „De verificat” și doar când nu scrii.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activ || cerere || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) return;
      if (!randuri.length) return;
      const i = Math.min(selectat, randuri.length - 1);
      const tasta = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (tasta === 'ArrowDown' || tasta === 'ArrowUp') {
        e.preventDefault();
        const next = tasta === 'ArrowDown' ? Math.min(i + 1, randuri.length - 1) : Math.max(i - 1, 0);
        setSelectat(next);
        setDinTastatura(true);
        randuriRef.current[next]?.scrollIntoView({ block: 'nearest' });
      } else if (tasta === 'Enter') {
        if (t?.closest('a, button')) return;
        e.preventDefault();
        deschide(randuri[i].id);
      } else if (tasta === 'a' || tasta === 'c' || tasta === 'r') {
        e.preventDefault();
        const decizie = ({ a: 'ACCEPTAT', c: 'NECESITA_COMPLETARI', r: 'RESPINS' } as const)[tasta];
        void aplica(randuri[i], decizie);
      }
    };
    window.addEventListener('keydown', onKey);
    // Semnal pentru teste: scurtăturile sunt active.
    document.body.setAttribute('data-coada-gata', 'true');
    return () => window.removeEventListener('keydown', onKey);
  }, [activ, cerere, randuri, selectat, deschide, aplica]);

  const numar = (t: Tab) => surse[t].filter((r) => !ascunse.has(r.id)).length;
  const areFiltre = Boolean(filtre.colector || filtre.doarPericulos);

  return (
    <>
      <PageHeader
        title="Coada de verificare"
        subtitle={subtitlu}
        action={
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<IconFilter size={18} stroke={1.5} />}
              onClick={(e) => setMeniuFiltre(e.currentTarget)}
              aria-haspopup="menu"
            >
              Filtre{areFiltre ? ' · active' : ''}
            </Button>
            <Button
              variant="contained"
              startIcon={<IconChevronRight size={18} stroke={1.5} />}
              disabled={!deVerificat.some((r) => !ascunse.has(r.id))}
              onClick={() => {
                const primul = deVerificat.find((r) => !ascunse.has(r.id));
                if (primul) deschide(primul.id);
              }}
            >
              Deschide primul lot
            </Button>
          </Box>
        }
      />
      <Menu
        anchorEl={meniuFiltre}
        open={Boolean(meniuFiltre)}
        onClose={() => setMeniuFiltre(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { p: 4, width: 300, mt: 2 } },
          list: { sx: { display: 'flex', flexDirection: 'column', gap: 3 } },
        }}
      >
        <TextField
          select
          id="filtru-coada-colector"
          label="Colector"
          value={filtre.colector}
          onChange={(e) => setFiltre((f) => ({ ...f, colector: e.target.value }))}
        >
          <MenuItem value="">Toți colectorii</MenuItem>
          {colectori.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Checkbox
              checked={filtre.doarPericulos}
              onChange={(e) => setFiltre((f) => ({ ...f, doarPericulos: e.target.checked }))}
            />
          }
          label="Doar loturi cu cod periculos"
        />
        {areFiltre ? (
          <Button
            variant="text"
            size="small"
            onClick={() => setFiltre({ colector: '', doarPericulos: false })}
            sx={{ alignSelf: 'flex-start' }}
          >
            Șterge filtrele
          </Button>
        ) : null}
      </Menu>

      <Tabs
        value={tab}
        onChange={(_, v: Tab) => {
          setTab(v);
          setSelectat(0);
        }}
        variant="scrollable"
        aria-label="Coada de verificare"
        sx={{ borderBottom: `1px solid ${color.line}` }}
      >
        {(
          [
            ['deVerificat', 'De verificat'],
            ['asteaptaColectorul', 'Așteaptă colectorul'],
            ['deciseAzi', 'Decise azi'],
          ] as [Tab, string][]
        ).map(([k, eticheta]) => (
          <Tab
            key={k}
            value={k}
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {eticheta}
                <Box
                  component="span"
                  className="num"
                  sx={{
                    px: 1.5,
                    minWidth: 24,
                    height: 22,
                    borderRadius: `${radius.sm}px`,
                    bgcolor: tab === k ? color.petrolSoft : color.canvas,
                    fontSize: 13,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {numar(k)}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>

      <Card>
        {randuri.length === 0 ? (
          <EmptyState
            message={
              areFiltre
                ? 'Niciun lot nu se potrivește filtrelor.'
                : tab === 'deVerificat'
                  ? 'Nu ai loturi de verificat. Ai terminat coada.'
                  : tab === 'asteaptaColectorul'
                    ? 'Niciun lot nu așteaptă completări.'
                    : 'Nu ai decis încă niciun lot azi.'
            }
          />
        ) : (
          <>
            {/* Tabel pe ecrane late */}
            <Box
              sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}
              tabIndex={0}
              role="region"
              aria-label="Loturi în coadă"
            >
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <Box component="thead">
                  <tr>
                    {[
                      'Prioritate',
                      'Lot',
                      'Colector',
                      activ ? 'În coadă de' : 'Decis la',
                      'Cantitate',
                      'Cod periculos',
                      'Rezultat reguli',
                      'Verdict propus de AI',
                    ].map((h, i) => (
                      <Box
                        component="th"
                        key={h}
                        scope="col"
                        sx={{
                          textAlign: i === 4 ? 'right' : 'left',
                          fontSize: 12,
                          fontWeight: 500,
                          color: color.inkMuted,
                          px: 4,
                          py: 3,
                          borderBottom: `1px solid ${color.line}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </tr>
                </Box>
                <tbody>
                  {randuri.map((r, i) => {
                    const sel = activ && dinTastatura && curent?.id === r.id;
                    return (
                      <Box
                        component="tr"
                        key={r.id}
                        ref={(el: HTMLTableRowElement | null) => {
                          randuriRef.current[i] = el;
                        }}
                        aria-current={activ && curent?.id === r.id ? 'true' : undefined}
                        onClick={() => deschide(r.id)}
                        sx={{
                          cursor: 'pointer',
                          height: 52,
                          bgcolor: sel ? color.petrolSoft : 'transparent',
                          boxShadow: sel ? `inset 3px 0 0 ${color.petrol}` : 'none',
                          '&:hover': { bgcolor: sel ? color.petrolSoft : color.canvas },
                          '& td': { px: 4, borderBottom: `1px solid ${color.line}` },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: color.inkMuted }}>
                            <StatusDot tone={TON_PRIORITATE[r.prioritate]} />
                            {ETICHETA_PRIORITATE[r.prioritate]}
                          </Box>
                        </td>
                        <td>
                          <Box
                            component={NextLink}
                            href={`/admin/verificari/${r.id}`}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            sx={{
                              color: color.petrol,
                              fontWeight: 500,
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {r.id}
                          </Box>
                        </td>
                        <td>{r.colector}</td>
                        <td className="num" style={{ color: color.inkMuted, whiteSpace: 'nowrap' }}>
                          {activ ? durata(minuteDe(r.trimisLa)) : r.decisLa ? formatTime(r.decisLa) : '—'}
                        </td>
                        <td className="num" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatKg(r.kg)}
                        </td>
                        <td>
                          {r.coduriPericuloase.length ? (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {r.coduriPericuloase.map((c) => (
                                <StatusBadge key={c} tone="warning" label={c} />
                              ))}
                            </Box>
                          ) : (
                            <span aria-label="Niciunul" style={{ color: color.inkMuted }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <Reguli r={r} />
                        </td>
                        <td>
                          {r.verdict ? (
                            <StatusBadge tone={VERDICT[r.verdict].tone} label={VERDICT[r.verdict].label} />
                          ) : (
                            '—'
                          )}
                        </td>
                      </Box>
                    );
                  })}
                </tbody>
              </Box>
            </Box>

            {/* Carduri pe ecrane înguste */}
            <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, p: 0 }}>
              {randuri.map((r, i) => (
                <Box component="li" key={r.id} sx={{ borderTop: i ? `1px solid ${color.line}` : 'none' }}>
                  <Box
                    component={NextLink}
                    href={`/admin/verificari/${r.id}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      p: 4,
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
                      <Typography variant="bodyStrong" sx={{ color: color.petrol }}>
                        {r.id}
                      </Typography>
                      {r.verdict ? (
                        <StatusBadge tone={VERDICT[r.verdict].tone} label={VERDICT[r.verdict].label} />
                      ) : null}
                    </Box>
                    <Typography variant="body1">
                      {r.colector} · <span className="num">{formatKg(r.kg)}</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          color: color.inkMuted,
                          fontSize: 13,
                        }}
                      >
                        <StatusDot tone={TON_PRIORITATE[r.prioritate]} />
                        {ETICHETA_PRIORITATE[r.prioritate]} ·{' '}
                        {activ ? durata(minuteDe(r.trimisLa)) : r.decisLa ? formatTime(r.decisLa) : ''}
                      </Box>
                      <Reguli r={r} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Card>

      {activ ? <BaraScurtaturi /> : null}

      <DialogDecizie
        key={cerere ? `${cerere.lotId}-${cerere.decizie}` : 'inchis'}
        cerere={cerere}
        onInchide={() => setCerere(null)}
        onDecis={decis}
      />
    </>
  );
}

function Reguli({ r }: { r: RandCoada }) {
  const eticheta = `${r.reguli.VERDE} trecute, ${r.reguli.GALBEN} avertismente, ${r.reguli.ROSU} blocante`;
  return (
    <Box
      role="img"
      aria-label={eticheta}
      className="num"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, whiteSpace: 'nowrap' }}
    >
      <StatusDot tone="success" size={8} /> {r.reguli.VERDE}
      <Box component="span" sx={{ ml: 1.5 }} />
      <StatusDot tone="warning" size={8} /> {r.reguli.GALBEN}
      <Box component="span" sx={{ ml: 1.5 }} />
      <StatusDot tone="danger" size={8} /> {r.reguli.ROSU}
    </Box>
  );
}

function Tasta({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <>
      {label ? (
        <Box
          component="span"
          sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
        >
          {label}
        </Box>
      ) : null}
      <Box
        component="kbd"
        sx={{
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 600,
          minWidth: 24,
          height: 24,
          px: 1.5,
          border: `1px solid ${color.lineStrong}`,
          borderRadius: '4px',
          display: 'inline-grid',
          placeItems: 'center',
          color: color.ink,
          bgcolor: color.surface,
        }}
      >
        {children}
      </Box>
    </>
  );
}

function Item({ taste, text }: { taste: React.ReactNode; text: string }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {taste}
      <Typography variant="body1" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

function BaraScurtaturi() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        px: 6,
        py: 4,
      }}
    >
      <IconKeyboard size={20} stroke={1.5} color={color.inkMuted} aria-hidden />
      <Box
        component="ul"
        aria-label="Scurtături de tastatură"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', columnGap: 5, rowGap: 2, flexWrap: 'wrap' }}
      >
        <Item
          taste={
            <>
              <Tasta label="Săgeată sus">
                <IconArrowUp size={14} stroke={2} aria-hidden />
              </Tasta>
              <Tasta label="Săgeată jos">
                <IconArrowDown size={14} stroke={2} aria-hidden />
              </Tasta>
            </>
          }
          text="navighează"
        />
        <Item taste={<Tasta>Enter</Tasta>} text="deschide raportul" />
        <Item taste={<Tasta>A</Tasta>} text="acceptă" />
        <Item taste={<Tasta>C</Tasta>} text="cere completări" />
        <Item taste={<Tasta>R</Tasta>} text="respinge" />
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
        Decizia rămâne mereu a ta · AI-ul doar propune
      </Typography>
    </Box>
  );
}
