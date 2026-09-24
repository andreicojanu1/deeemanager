'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import {
  IconCamera,
  IconCheck,
  IconCircleCheckFilled,
  IconClipboardList,
  IconFile,
  IconPlayerPlayFilled,
  IconX,
} from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AiExtracted from '@/components/ui/AiExtracted';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import StatusDot, { type DotTone } from '@/components/ui/StatusDot';
import type { StatusTone } from '@/lib/domain/status';
import type {
  DocumentLot,
  FisierMedia,
  LotDetaliu,
  Semafor,
  StatusDocumentLot,
  TipSursa,
} from '@/lib/domain/lot';
import type { Subcategorie } from '@/lib/domain/taxonomie';
import { formatDate, formatNumber, formatTime } from '@/lib/format';
import { color, radius } from '@/theme/tokens';

const TABURI = [
  { cheie: 'rezumat', eticheta: 'Rezumat' },
  { cheie: 'documente', eticheta: 'Documente și media' },
  { cheie: 'verificare', eticheta: 'Verificare' },
  { cheie: 'istoric', eticheta: 'Istoric' },
] as const;
type CheieTab = (typeof TABURI)[number]['cheie'];

type Props = { lot: LotDetaliu; subcategorii: Record<string, Pick<Subcategorie, 'denumire'>> };

export default function LotTabs({ lot, subcategorii }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = (params.get('tab') as CheieTab) ?? 'rezumat';
  const [tab, setTab] = useState<CheieTab>(TABURI.some((t) => t.cheie === initial) ? initial : 'rezumat');

  const schimba = (t: CheieTab) => {
    setTab(t);
    const sp = new URLSearchParams(params.toString());
    if (t === 'rezumat') sp.delete('tab');
    else sp.set('tab', t);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v: CheieTab) => schimba(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Secțiunile lotului"
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
        {tab === 'rezumat' ? <Rezumat lot={lot} subcategorii={subcategorii} /> : null}
        {tab === 'documente' ? <DocumenteMedia lot={lot} /> : null}
        {tab === 'verificare' ? <VerificareTab lot={lot} /> : null}
        {tab === 'istoric' ? <Istoric lot={lot} /> : null}
      </Box>
    </Box>
  );
}

// ── Rezumat ───────────────────────────────────────────────────────────────────────

const TIP_SURSA: Record<TipSursa, string> = {
  GENERATOR: 'Generator',
  COLECTOR_PLATFORMA: 'Colector de pe platformă',
  PERSOANA_FIZICA: 'Persoană fizică',
};

function Rezumat({ lot, subcategorii }: Props) {
  const totalKg = lot.linii.reduce((s, l) => s + l.kg, 0);
  const totalBuc = lot.linii.reduce((s, l) => s + l.buc, 0);
  const acoperit = lot.surse.reduce((s, x) => s + x.kg, 0);
  const inchis = Math.abs(acoperit - totalKg) < 0.01;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Card component="section" aria-labelledby="linii-titlu">
        <Typography id="linii-titlu" variant="h3" component="h2" sx={{ px: 6, pt: 5, pb: 3 }}>
          Linii de lot
        </Typography>
        <Box
          sx={{ overflowX: 'auto' }}
          tabIndex={0}
          role="region"
          aria-label="Linii de lot, derulează orizontal"
        >
          <Table aria-labelledby="linii-titlu">
            <TableHead>
              <TableRow>
                <TableCell>Subcategorie</TableCell>
                <TableCell>Cod deșeu</TableCell>
                <TableCell align="right">Kg</TableCell>
                <TableCell align="right">Buc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lot.linii.map((l, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {l.subcategorieCod} {subcategorii[l.subcategorieCod]?.denumire}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span className="num">{l.codDeseu}</span>
                      {l.codDeseu.endsWith('*') ? <StatusBadge tone="warning" label="Periculos" /> : null}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatNumber(l.kg)}</TableCell>
                  <TableCell align="right">{formatNumber(l.buc)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ '& td': { borderBottom: 0, fontWeight: 600 } }}>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell align="right">{formatNumber(totalKg)}</TableCell>
                <TableCell align="right">{formatNumber(totalBuc)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Card component="section" aria-labelledby="surse-titlu">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography id="surse-titlu" variant="h3" component="h2">
            Proveniența lotului
          </Typography>
          {lot.surse.map((s, i) => (
            <Box
              key={s.id}
              sx={{
                border: `1px solid ${color.line}`,
                borderRadius: `${radius.lg}px`,
                p: { xs: 4, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
                <Typography variant="bodyStrong">
                  Sursa {i + 1} · {s.denumire}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="num">
                  {s.linii.join(', ')} · {formatNumber(s.kg)} kg
                </Typography>
              </Box>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                <Camp eticheta="Tip sursă" valoare={TIP_SURSA[s.tip]} />
                <Camp
                  eticheta="CUI"
                  valoare={
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <span className="num">{s.cui ?? '—'}</span>
                      {s.cuiVerificatAnaf ? (
                        <Box
                          component="span"
                          sx={{
                            color: color.successText,
                            fontSize: 13,
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <IconCheck size={14} stroke={2} aria-hidden /> ANAF
                        </Box>
                      ) : null}
                    </Box>
                  }
                />
                <Camp eticheta="Document de proveniență" valoare={s.documentProvenienta ?? '—'} />
                <Camp eticheta="Adresa de ridicare" valoare={s.adresaRidicare} />
                <Camp eticheta="Contract / comandă" valoare={s.contract ?? '—'} />
              </Box>
            </Box>
          ))}
          <Typography
            variant="bodyStrong"
            className="num"
            sx={{
              color: inchis ? color.successText : color.warningText,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {inchis ? <IconCheck size={16} stroke={2} aria-hidden /> : null}
            Sursele acoperă {formatNumber(acoperit)} kg din {formatNumber(totalKg)} kg declarate
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

function Camp({ eticheta, valoare }: { eticheta: string; valoare: React.ReactNode }) {
  return (
    <Box>
      <Typography component="dt" variant="caption" color="text.secondary">
        {eticheta}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {valoare}
      </Typography>
    </Box>
  );
}

// ── Documente și media ────────────────────────────────────────────────────────────

const STATUS_DOC: Record<StatusDocumentLot, { tone: StatusTone; label: string }> = {
  INCARCAT: { tone: 'success', label: 'Încărcat' },
  DE_VERIFICAT: { tone: 'warning', label: 'De verificat' },
  LIPSA: { tone: 'neutral', label: 'Lipsă' },
  DE_INLOCUIT: { tone: 'danger', label: 'De înlocuit' },
};

function DocumenteMedia({ lot }: { lot: LotDetaliu }) {
  const [previzualizare, setPrevizualizare] = useState<FisierMedia | null>(null);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Card component="section" aria-labelledby="media-titlu">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography id="media-titlu" variant="h3" component="h2">
            Foto și video ale lotului
          </Typography>
          {lot.media.length ? (
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'grid',
                gap: 4,
                gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
              }}
            >
              {lot.media.map((m) => (
                <li key={m.id}>
                  <ButtonBase
                    onClick={() => setPrevizualizare(m)}
                    aria-label={`Previzualizează ${m.eticheta}: ${m.nume}`}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: `${radius.md}px`,
                    }}
                  >
                    <Miniatura m={m} />
                    <Typography variant="bodyStrong" component="span" sx={{ display: 'block', mt: 2 }}>
                      {m.eticheta}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="span"
                      sx={{ display: 'block' }}
                    >
                      {m.nume} · {m.marime}
                    </Typography>
                  </ButtonBase>
                </li>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">Nu ai încărcat încă fotografii sau filmări.</Typography>
          )}
        </CardContent>
      </Card>

      <Box
        component="section"
        aria-labelledby="documente-titlu"
        sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <Typography id="documente-titlu" variant="h3" component="h2">
          Documente
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {lot.documente.map((d) => (
            <DocumentCard key={d.id} d={d} />
          ))}
        </Box>
      </Box>

      <Dialog open={Boolean(previzualizare)} onClose={() => setPrevizualizare(null)} fullWidth maxWidth="sm">
        {previzualizare ? (
          <>
            <DialogTitle
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}
            >
              <Box>
                <Typography variant="h3" component="span" sx={{ display: 'block' }}>
                  {previzualizare.eticheta}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {previzualizare.nume} · {previzualizare.marime}
                </Typography>
              </Box>
              <IconButton aria-label="Închide previzualizarea" onClick={() => setPrevizualizare(null)}>
                <IconX size={18} stroke={1.5} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Miniatura m={previzualizare} mare />
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
}

function Miniatura({ m, mare }: { m: FisierMedia; mare?: boolean }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: mare ? 320 : 104,
        borderRadius: `${radius.md}px`,
        bgcolor: color.line,
        display: 'grid',
        placeItems: 'center',
        color: color.inkMuted,
      }}
    >
      {m.tip === 'VIDEO' ? (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: color.ink,
            color: color.surface,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconPlayerPlayFilled size={16} aria-hidden />
        </Box>
      ) : (
        <IconCamera size={mare ? 32 : 22} stroke={1.5} aria-hidden />
      )}
      {m.durata ? (
        <Box
          className="num"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: color.ink,
            color: color.surface,
            fontSize: 12,
            px: 1.5,
            borderRadius: '4px',
          }}
        >
          {m.durata}
        </Box>
      ) : null}
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          color: color.success,
          bgcolor: color.surface,
          borderRadius: '50%',
          display: 'grid',
        }}
      >
        <IconCircleCheckFilled size={22} aria-label="Încărcat" />
      </Box>
      {mare ? (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 12, color: color.inkMuted }}>
          Previzualizarea fișierelor reale vine în Faza B.
        </Typography>
      ) : null}
    </Box>
  );
}

function DocumentCard({ d }: { d: DocumentLot }) {
  const lipsa = d.status === 'LIPSA';
  const st = STATUS_DOC[d.status];
  return (
    <Box
      sx={{
        bgcolor: color.surface,
        border: `1px ${lipsa ? 'dashed' : 'solid'} ${lipsa ? color.lineStrong : color.line}`,
        borderRadius: `${radius.lg}px`,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="bodyStrong" component="h3">
            {d.denumire}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            {d.explicatie}
          </Typography>
          {d.motivCerere ? (
            <Typography variant="caption" component="p" sx={{ color: color.warningText }}>
              {d.motivCerere}
            </Typography>
          ) : null}
        </Box>
        <StatusBadge tone={st.tone} label={st.label} />
      </Box>
      {d.fisier ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: color.inkMuted }}>
          <IconFile size={18} stroke={1.5} aria-hidden />
          <Typography sx={{ color: color.ink }}>{d.fisier.nume}</Typography>
        </Box>
      ) : null}
      {d.extras ? <AiExtracted>{d.extras}</AiExtracted> : null}
    </Box>
  );
}

// ── Verificare (read-only pentru colector) ───────────────────────────────────────

const TON_SEMAFOR: Record<Semafor, DotTone> = {
  VERDE: 'success',
  GALBEN: 'warning',
  ROSU: 'danger',
  NA: 'neutral',
};
const ETICHETA_SEMAFOR: Record<Semafor, string> = {
  VERDE: 'trecută',
  GALBEN: 'avertisment',
  ROSU: 'blocantă',
  NA: 'nu se aplică',
};
const ETICHETA_VERDICT = {
  ACCEPTAT: 'Acceptat',
  NECESITA_COMPLETARI: 'Necesită completări',
  RESPINS: 'Respins',
} as const;

function VerificareTab({ lot }: { lot: LotDetaliu }) {
  const v = lot.verificare;
  if (!v) {
    return (
      <Card>
        <EmptyState
          icon={<IconClipboardList size={24} stroke={1.5} />}
          message="Raportul de verificare apare după ce trimiți lotul."
        />
      </Card>
    );
  }
  const numar = (s: Semafor) => v.rezultate.filter((r) => r.rezultat === s).length;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              {v.decizie
                ? `Propus de AI · confirmat de ${v.decizie.de}`
                : 'Propus de AI · în așteptarea deciziei administratorului'}
            </Typography>
            <Typography variant="h2" component="p" sx={{ m: 0 }}>
              {ETICHETA_VERDICT[v.decizie?.status ?? v.verdictPropus]}
            </Typography>
            {v.decizie ? (
              <Typography variant="caption" color="text.secondary" className="num">
                Decis pe {formatDate(v.decizie.la)}, {formatTime(v.decizie.la)} · {v.regulament}
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ display: 'flex', gap: 4 }} aria-label="Rezultatele regulilor">
            {(['VERDE', 'GALBEN', 'ROSU', 'NA'] as Semafor[]).map((s) => (
              <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StatusDot tone={TON_SEMAFOR[s]} />
                <Typography
                  variant="bodyStrong"
                  className="num"
                  aria-label={`${numar(s)} ${ETICHETA_SEMAFOR[s]}`}
                >
                  {numar(s)}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
      <Card component="section" aria-labelledby="reguli-titlu">
        <Box sx={{ px: 6, pt: 5, pb: 3, display: 'flex', justifyContent: 'space-between', gap: 4 }}>
          <Typography id="reguli-titlu" variant="h3" component="h2">
            Reguli de verificare
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {v.regulament}
          </Typography>
        </Box>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {v.rezultate.map((r) => (
            <Box
              component="li"
              key={r.cod}
              sx={{
                display: 'flex',
                gap: 4,
                alignItems: 'flex-start',
                px: 6,
                py: 3,
                borderTop: `1px solid ${color.line}`,
              }}
            >
              <Box sx={{ pt: '5px' }}>
                <StatusDot tone={TON_SEMAFOR[r.rezultat]} />
              </Box>
              <Typography
                variant="bodyStrong"
                className="num"
                sx={{ width: 36, flexShrink: 0, color: color.inkMuted }}
              >
                {r.cod}
              </Typography>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="bodyStrong" component="p">
                  {r.nume}
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                    }}
                  >
                    {` — ${ETICHETA_SEMAFOR[r.rezultat]}`}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" className="num">
                  {r.rezumat}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}

// ── Istoric ───────────────────────────────────────────────────────────────────────

function Istoric({ lot }: { lot: LotDetaliu }) {
  return (
    <Card component="section" aria-label="Istoricul lotului">
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {lot.istoric.map((e, i) => (
          <Box
            component="li"
            key={`${e.la}-${i}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '160px minmax(0, 1fr)' },
              gap: { xs: 1, sm: 4 },
              px: 6,
              py: 4,
              borderTop: i ? `1px solid ${color.line}` : 'none',
            }}
          >
            <Typography variant="caption" color="text.secondary" className="num">
              {formatDate(e.la)}, {formatTime(e.la)}
            </Typography>
            <Box>
              <Typography>
                <strong>{e.autor}</strong> · {e.actiune}
              </Typography>
              {e.detaliu ? (
                <Typography variant="caption" color="text.secondary">
                  {e.detaliu}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
