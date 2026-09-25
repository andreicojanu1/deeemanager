'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconBox, IconCheck, IconFile, IconMapPin } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ButtonLink from '@/components/ui/ButtonLink';
import EmptyState from '@/components/ui/EmptyState';
import ResponsiveTable, { type Column } from '@/components/ui/ResponsiveTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import type { DetaliuColector } from '@/lib/data/types';
import type { RandListaLot } from '@/lib/domain/loturi';
import {
  DOCUMENTE_ONBOARDING,
  ETICHETA_STARE_DOC,
  type DocumentOnboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import { formatDate, formatNumber } from '@/lib/format';
import { color } from '@/theme/tokens';
import { TON_STARE } from '@/features/onboarding/tonuri';
import { aprobaToate, decideDocument, finalizeazaVizita, programeazaVizita } from './actions';
import { DateColector, Rand, UtilizatoriFirma } from '@/features/organizatie/DateColector';

const TABURI = [
  { cheie: 'date', eticheta: 'Date' },
  { cheie: 'documente', eticheta: 'Documente onboarding' },
  { cheie: 'vizita', eticheta: 'Vizită în teren' },
  { cheie: 'loturi', eticheta: 'Loturi' },
  { cheie: 'utilizatori', eticheta: 'Utilizatori' },
] as const;
type CheieTab = (typeof TABURI)[number]['cheie'];

type Props = {
  colector: DetaliuColector;
  loturi: { randuri: RandListaLot[]; total: number };
  /** „Azi” în datele mock, pentru valorile implicite ale datelor. */
  azi: string;
};

export default function ColectorTabs({ colector, loturi, azi }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get('tab') as CheieTab;
  const [tab, setTab] = useState<CheieTab>(TABURI.some((t) => t.cheie === initial) ? initial : 'date');
  const deVerificat = colector.onboarding.documente.filter((d) => d.stare === 'DE_VERIFICAT').length;

  const schimba = (t: CheieTab) => {
    setTab(t);
    const sp = new URLSearchParams(params.toString());
    if (t === 'date') sp.delete('tab');
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
        aria-label="Secțiunile colectorului"
        sx={{ borderBottom: `1px solid ${color.line}`, mb: 6 }}
      >
        {TABURI.map((t) => (
          <Tab
            key={t.cheie}
            value={t.cheie}
            id={`tab-${t.cheie}`}
            aria-controls={`panou-${t.cheie}`}
            label={
              t.cheie === 'documente' && deVerificat ? (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  {t.eticheta}
                  <Box
                    component="span"
                    className="num"
                    aria-label={`${deVerificat} de verificat`}
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 1.5,
                      borderRadius: '10px',
                      bgcolor: color.petrol,
                      color: color.surface,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-grid',
                      placeItems: 'center',
                    }}
                  >
                    {deVerificat}
                  </Box>
                </Box>
              ) : (
                t.eticheta
              )
            }
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
        {tab === 'date' ? <DateColector colector={colector} /> : null}
        {tab === 'documente' ? <Documente colector={colector} /> : null}
        {tab === 'vizita' ? <VizitaTab colector={colector} azi={azi} /> : null}
        {tab === 'loturi' ? <Loturi id={colector.rand.id} loturi={loturi} /> : null}
        {tab === 'utilizatori' ? <UtilizatoriFirma utilizatori={colector.utilizatori} /> : null}
      </Box>
    </Box>
  );
}

// ── Documente onboarding ──────────────────────────────────────────────────────────

const MOTIVE_RAPIDE = [
  'Documentul nu se citește. Încarcă o copie clară, cu toate paginile.',
  'Documentul a expirat. Încarcă varianta în vigoare.',
  'Extrasul e mai vechi de 30 de zile. Încarcă unul emis recent.',
];

function Documente({ colector }: { colector: DetaliuColector }) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const [respinge, setRespinge] = useState<TipDocumentOnboarding | null>(null);
  const id = colector.rand.id;
  const docs = DOCUMENTE_ONBOARDING.map((info) => ({
    info,
    d: colector.onboarding.documente.find((x) => x.tip === info.tip)!,
  }));

  const decide = (tip: TipDocumentOnboarding, decizie: 'APROBAT' | 'RESPINS', motiv?: string) =>
    start(async () => {
      const r = await decideDocument(id, tip, decizie, motiv);
      if (r.ok) {
        const nume = DOCUMENTE_ONBOARDING.find((x) => x.tip === tip)!.denumire;
        arata(decizie === 'APROBAT' ? `${nume}: aprobat.` : `${nume}: am cerut reîncărcarea.`);
        setRespinge(null);
        router.refresh();
      } else arata(r.eroare);
    });

  const deVerificat = docs.filter(({ d }) => d.stare === 'DE_VERIFICAT').length;

  return (
    <Card component="section" aria-labelledby="documente-titlu">
      <Box
        sx={{
          p: 6,
          pb: 4,
          display: 'flex',
          gap: 4,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography id="documente-titlu" variant="h3" component="h2">
            Documente onboarding
          </Typography>
          <Typography color="text.secondary">
            Aprobă fiecare document sau cere reîncărcarea lui, cu motiv. După ultimul document aprobat urmează
            vizita în teren.
          </Typography>
        </Box>
        {deVerificat ? (
          <Button
            variant="contained"
            disabled={pending}
            startIcon={<IconCheck size={18} stroke={1.5} />}
            onClick={() =>
              start(async () => {
                const r = await aprobaToate(id);
                if (r.ok) {
                  arata(r.valoare === 1 ? 'Am aprobat documentul.' : `Am aprobat ${r.valoare} documente.`);
                  router.refresh();
                } else arata(r.eroare);
              })
            }
            sx={{ minHeight: 44 }}
          >
            {deVerificat === 1 ? 'Aprobă documentul' : `Aprobă toate (${deVerificat})`}
          </Button>
        ) : null}
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {docs.map(({ info, d }) => (
          <RandDocument
            key={info.tip}
            denumire={info.denumire}
            d={d}
            dezactivat={pending}
            onAproba={() => decide(info.tip, 'APROBAT')}
            onRespinge={() => setRespinge(info.tip)}
          />
        ))}
      </Box>
      {respinge ? (
        <DialogReincarcare
          key={respinge}
          denumire={DOCUMENTE_ONBOARDING.find((x) => x.tip === respinge)!.denumire}
          pending={pending}
          onInchide={() => setRespinge(null)}
          onTrimite={(motiv) => decide(respinge, 'RESPINS', motiv)}
        />
      ) : null}
    </Card>
  );
}

function RandDocument({
  denumire,
  d,
  dezactivat,
  onAproba,
  onRespinge,
}: {
  denumire: string;
  d: DocumentOnboarding;
  dezactivat: boolean;
  onAproba: () => void;
  onRespinge: () => void;
}) {
  const deVerificat = d.stare === 'DE_VERIFICAT';
  return (
    <Box
      component="li"
      data-document={d.tip}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
        gap: 3,
        alignItems: 'center',
        px: 6,
        py: 4,
        borderTop: `1px solid ${color.line}`,
        bgcolor: deVerificat ? color.petrolSoft : 'transparent',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="bodyStrong" component="h3">
            {denumire}
          </Typography>
          <StatusBadge tone={TON_STARE[d.stare]} label={ETICHETA_STARE_DOC[d.stare]} />
        </Box>
        {d.fisier ? (
          <Typography
            variant="caption"
            color="text.secondary"
            className="num"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
          >
            <IconFile size={14} stroke={1.5} aria-hidden />
            {d.fisier.nume} · {d.fisier.marime} · încărcat {formatDate(d.fisier.incarcatLa)}
            {d.valabilPana ? ` · valabil până la ${formatDate(d.valabilPana)}` : ''}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Neîncărcat
          </Typography>
        )}
        {d.stare === 'RESPINS' && d.motiv ? (
          <Typography variant="caption" component="p" sx={{ color: color.danger, mt: 1 }}>
            Motiv trimis colectorului: {d.motiv}
          </Typography>
        ) : null}
      </Box>
      {deVerificat ? (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="text"
            onClick={onRespinge}
            disabled={dezactivat}
            aria-label={`Cere reîncărcare: ${denumire}`}
          >
            Cere reîncărcare
          </Button>
          <Button
            variant="outlined"
            onClick={onAproba}
            disabled={dezactivat}
            startIcon={<IconCheck size={18} stroke={1.5} />}
            aria-label={`Aprobă: ${denumire}`}
            sx={{ bgcolor: color.surface }}
          >
            Aprobă
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

function DialogReincarcare({
  denumire,
  pending,
  onInchide,
  onTrimite,
}: {
  denumire: string;
  pending: boolean;
  onInchide: () => void;
  onTrimite: (motiv: string) => void;
}) {
  const [motiv, setMotiv] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);
  return (
    <Dialog open onClose={onInchide} fullWidth maxWidth="sm" aria-labelledby="reincarcare-titlu">
      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!motiv.trim()) {
            setEroare('Scrie motivul, ca firma să știe ce să încarce.');
            return;
          }
          onTrimite(motiv);
        }}
      >
        <DialogTitle id="reincarcare-titlu">Cere reîncărcare: {denumire}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography color="text.secondary">
            Colectorul vede motivul lângă document, pe pagina de activare.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {MOTIVE_RAPIDE.map((m) => (
              <Button
                key={m}
                variant="outlined"
                size="small"
                onClick={() => {
                  setMotiv(m);
                  setEroare(null);
                }}
                sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {m}
              </Button>
            ))}
          </Box>
          <TextField
            id="motiv-reincarcare"
            label="Motiv"
            multiline
            minRows={3}
            value={motiv}
            onChange={(e) => {
              setMotiv(e.target.value.slice(0, 300));
              setEroare(null);
            }}
            error={Boolean(eroare)}
            helperText={eroare ?? `${motiv.length} / 300`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
          <Button onClick={onInchide}>Renunță</Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Trimite colectorului
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Vizită în teren ───────────────────────────────────────────────────────────────

function VizitaTab({ colector, azi }: { colector: DetaliuColector; azi: string }) {
  const router = useRouter();
  const { arata } = useToast();
  const [pending, start] = useTransition();
  const { etapa, vizita } = colector.onboarding;
  const [programare, setProgramare] = useState(vizita?.programataLa ?? '');
  const [efectuata, setEfectuata] = useState(azi);
  const [observatii, setObservatii] = useState('');
  const id = colector.rand.id;

  if (etapa === 'ACTIV') {
    return (
      <Card component="section" aria-labelledby="vizita-titlu">
        <CardContent>
          <Typography id="vizita-titlu" variant="h3" component="h2" sx={{ mb: 3 }}>
            Vizită efectuată
          </Typography>
          <Rand eticheta="Data">{vizita?.efectuataLa ? formatDate(vizita.efectuataLa) : ''}</Rand>
          <Rand eticheta="Marcată de">{vizita?.de}</Rand>
          <Rand eticheta="Observații">{vizita?.observatii}</Rand>
        </CardContent>
      </Card>
    );
  }

  if (etapa !== 'VIZITA') {
    return (
      <Card>
        <EmptyState
          icon={<IconMapPin size={24} stroke={1.5} />}
          message="Vizita în teren se programează după ce aprobi toate documentele de onboarding."
        />
      </Card>
    );
  }

  const ruleaza = (fn: () => Promise<{ ok: boolean; eroare?: string }>, succes: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        arata(succes);
        router.refresh();
      } else arata(r.eroare ?? 'Nu s-a salvat.');
    });

  return (
    <Box
      sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}
    >
      <Card component="section" aria-labelledby="programare-titlu">
        <Box
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            ruleaza(
              () => programeazaVizita(id, programare),
              `Vizita e programată pe ${formatDate(programare)}.`,
            );
          }}
          sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <Box>
            <Typography id="programare-titlu" variant="h3" component="h2">
              Programare
            </Typography>
            <Typography color="text.secondary">
              {vizita?.programataLa
                ? `Programată pe ${formatDate(vizita.programataLa)}.`
                : 'Stabilește data cu firma și noteaz-o aici.'}
            </Typography>
          </Box>
          <TextField
            id="data-programare"
            label="Data vizitei"
            type="date"
            value={programare}
            onChange={(e) => setProgramare(e.target.value)}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={pending || !programare}
            sx={{ alignSelf: 'flex-start' }}
          >
            Salvează programarea
          </Button>
        </Box>
      </Card>
      <Card component="section" aria-labelledby="efectuata-titlu">
        <Box
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            ruleaza(
              () => finalizeazaVizita(id, { data: efectuata, observatii }),
              `Contul ${colector.rand.denumire} e activ.`,
            );
          }}
          sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <Box>
            <Typography id="efectuata-titlu" variant="h3" component="h2">
              Vizita efectuată
            </Typography>
            <Typography color="text.secondary">
              După ce o marchezi, contul devine activ și firma poate încărca loturi.
            </Typography>
          </Box>
          <TextField
            id="data-efectuata"
            label="Data la care a avut loc"
            type="date"
            value={efectuata}
            onChange={(e) => setEfectuata(e.target.value)}
            slotProps={{ htmlInput: { max: azi } }}
          />
          <TextField
            id="observatii-vizita"
            label="Observații"
            multiline
            minRows={3}
            value={observatii}
            onChange={(e) => setObservatii(e.target.value.slice(0, 500))}
            helperText="Opțional. Ce ai verificat la punctul de lucru."
          />
          <Button
            type="submit"
            variant="contained"
            disabled={pending || !efectuata}
            sx={{ alignSelf: 'flex-start' }}
          >
            Marchează vizita și activează contul
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

// ── Loturi ────────────────────────────────────────────────────────────────────────

const coloaneLoturi: Column<RandListaLot>[] = [
  { key: 'id', header: 'Lot', cell: (r) => r.id, primary: true, width: '150px' },
  { key: 'continut', header: 'Conținut', cell: (r) => r.continut },
  { key: 'kg', header: 'Cantitate kg', cell: (r) => formatNumber(r.kg), align: 'right', width: '120px' },
  { key: 'data', header: 'Data preluării', cell: (r) => formatDate(r.dataPreluarii), width: '130px' },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => <StatusBadge status={r.status} />,
    aside: true,
    width: '180px',
  },
];

function Loturi({ id, loturi }: { id: string; loturi: Props['loturi'] }) {
  if (!loturi.total) {
    return (
      <Card>
        <EmptyState icon={<IconBox size={24} stroke={1.5} />} message="Colectorul nu a trimis încă loturi." />
      </Card>
    );
  }
  return (
    <Card>
      <Box
        sx={{
          px: 6,
          pt: 4,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Typography variant="caption" color="text.secondary" className="num">
          Ultimele {loturi.randuri.length} din {formatNumber(loturi.total)}
        </Typography>
        <ButtonLink href={`/admin/loturi?colector=${id}`} variant="text">
          Toate loturile colectorului
        </ButtonLink>
      </Box>
      <ResponsiveTable
        label="Loturile colectorului"
        columns={coloaneLoturi}
        rows={loturi.randuri}
        rowKey={(r) => r.id}
        rowHref={(r) => (r.status === 'ANULAT' ? undefined : `/admin/verificari/${r.id}`)}
      />
    </Card>
  );
}
