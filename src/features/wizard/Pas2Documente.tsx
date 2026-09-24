'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import {
  IconAlertTriangle,
  IconCamera,
  IconCircleCheckFilled,
  IconFile,
  IconPlayerPlayFilled,
  IconSparkles,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import AiExtracted from '@/components/ui/AiExtracted';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  PROVENIENTE,
  SLOTURI_FOTO,
  SLOT_VIDEO,
  progresDocumente,
  totalKgCiorna,
  type Ciorna,
  type ElementLista,
  type StareElement,
} from '@/lib/domain/ciorna';
import {
  DOCUMENT_INFO,
  ETICHETA_GRUP,
  type GrupDocumente,
  type TipDocument,
} from '@/lib/domain/documente-cerute';
import { formatNumber } from '@/lib/format';
import { color, motion, radius } from '@/theme/tokens';
import { useWizard } from './context';

const ACCEPT_DOC = 'image/*,application/pdf,.xlsx,.xls,.csv';

/**
 * Faza A: rezumatele „Extras de AI” sunt simulate din datele declarate, ca să se vadă
 * unde apar. În Faza C le produce pipeline-ul de extracție.
 */
function extrasMock(tip: TipDocument, c: Ciorna): string | undefined {
  const kg = `${formatNumber(totalKgCiorna(c))} kg`;
  const linii = c.linii.filter((l) => l.subcategorieCod).length;
  switch (tip) {
    case 'TICHET_CANTAR':
      return `Net ${kg}`;
    case 'AVIZ':
      return kg;
    case 'ANEXA_3':
      return `Cod ${c.linii[0]?.codDeseu || '—'} · ${kg}`;
    case 'CENTRALIZATOR':
      return `${linii === 1 ? '1 linie' : `${linii} linii`} · ${kg}`;
    default:
      return undefined;
  }
}

export default function Pas2Documente() {
  const { ciorna } = useWizard();
  const elemente = progresDocumente(ciorna);
  return (
    <>
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 6,
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <Media />
          <Documente elemente={elemente} />
        </Box>
        <Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PanouDocumenteCerute elemente={elemente} />
          <NotaAi />
        </Box>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ListaMobil elemente={elemente} />
      </Box>
    </>
  );
}

// ── Foto și video ─────────────────────────────────────────────────────────────────

function Media() {
  const { ciorna, alegeFisier, adaugaFisiere } = useWizard();
  const [peste, setPeste] = useState(false);
  const toateFoto = SLOTURI_FOTO.every((s) => ciorna.fisiere[s.cheie]?.length);
  const primulFotoLiber = SLOTURI_FOTO.find((s) => !ciorna.fisiere[s.cheie]?.length);

  return (
    <Box
      component="section"
      id="doc-FOTO_INCARCATURA"
      aria-labelledby="media-titlu"
      sx={{
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography id="media-titlu" variant="h3" component="h2">
            Foto și video ale lotului
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Minimum 3 fotografii (față, lateral, spate) și filmarea cântarului plin / gol. JPG, PNG, HEIC,
            MP4, MOV · până la 200 MB pe video.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Button
            variant="outlined"
            startIcon={<IconCamera size={18} stroke={1.5} />}
            onClick={() =>
              alegeFisier((primulFotoLiber ?? SLOTURI_FOTO[0]).cheie, { accept: 'image/*', capture: true })
            }
          >
            Fotografiază
          </Button>
          <Button
            variant="outlined"
            startIcon={<IconVideo size={18} stroke={1.5} />}
            onClick={() => alegeFisier(SLOT_VIDEO.cheie, { accept: 'video/*', capture: true })}
          >
            Filmează
          </Button>
        </Box>
      </Box>
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
        {[...SLOTURI_FOTO, SLOT_VIDEO].map((slot) => (
          <Slot
            key={slot.cheie}
            cheie={slot.cheie}
            eticheta={slot.eticheta}
            video={slot.cheie === SLOT_VIDEO.cheie}
          />
        ))}
        <li>
          <ButtonBase
            onClick={() => alegeFisier((primulFotoLiber ?? SLOT_VIDEO).cheie, { accept: 'image/*,video/*' })}
            onDragOver={(e) => {
              e.preventDefault();
              setPeste(true);
            }}
            onDragLeave={() => setPeste(false)}
            onDrop={(e) => {
              e.preventDefault();
              setPeste(false);
              adaugaFisiere(Array.from(e.dataTransfer.files));
            }}
            aria-label="Trage fișiere aici sau alege din calculator"
            sx={{
              width: '100%',
              height: 104,
              borderRadius: `${radius.md}px`,
              border: `1px dashed ${peste ? color.petrol : color.lineStrong}`,
              bgcolor: peste ? color.petrolSoft : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              color: color.inkMuted,
              transition: `all ${motion.fast}ms ${motion.easing}`,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: `${radius.md}px`,
                bgcolor: color.petrolSoft,
                color: color.petrol,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <IconUpload size={18} stroke={1.5} aria-hidden />
            </Box>
            <Typography variant="caption" sx={{ textAlign: 'center', lineHeight: '16px' }}>
              Trage fișiere
              <br />
              sau alege
            </Typography>
          </ButtonBase>
        </li>
      </Box>
      {toateFoto ? (
        <AiExtracted label="Verificat de AI">
          Fotografiile arată echipamente din categoriile declarate · {SLOTURI_FOTO.length} unghiuri distincte
          · nicio imagine reutilizată din alte loturi
        </AiExtracted>
      ) : null}
    </Box>
  );
}

function Slot({ cheie, eticheta, video }: { cheie: string; eticheta: string; video: boolean }) {
  const { ciorna, alegeFisier, previzualizari, progres } = useWizard();
  const f = ciorna.fisiere[cheie]?.[0];
  const url = previzualizari[cheie];
  const p = progres[cheie];
  const incarcare = p !== undefined && p < 100;
  return (
    <li>
      <ButtonBase
        onClick={() => alegeFisier(cheie, { accept: video ? 'video/*' : 'image/*', capture: true })}
        aria-label={
          f ? `${eticheta}: ${f.nume}. Înlocuiește` : `${eticheta}: ${video ? 'filmează' : 'fotografiază'}`
        }
        sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: `${radius.md}px` }}
      >
        <Box
          sx={{
            position: 'relative',
            height: 104,
            borderRadius: `${radius.md}px`,
            overflow: 'hidden',
            bgcolor: f ? color.line : color.canvas,
            border: f ? 'none' : `1px dashed ${color.lineStrong}`,
            display: 'grid',
            placeItems: 'center',
            color: color.inkMuted,
          }}
        >
          {url && !video ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : video && f ? (
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
          ) : video ? (
            <IconVideo size={22} stroke={1.5} aria-hidden />
          ) : (
            <IconCamera size={22} stroke={1.5} aria-hidden />
          )}
          {f && !incarcare ? (
            <Box
              sx={{
                position: 'absolute',
                left: 8,
                bottom: 8,
                color: color.success,
                bgcolor: color.surface,
                borderRadius: '50%',
                display: 'grid',
                animation: 'deee-bifa 150ms ease-out',
                '@keyframes deee-bifa': { from: { transform: 'scale(0.8)' }, to: { transform: 'scale(1)' } },
              }}
            >
              <IconCircleCheckFilled size={22} aria-hidden />
            </Box>
          ) : null}
          {incarcare ? (
            <LinearProgress
              variant="determinate"
              value={p}
              aria-label={`Se încarcă ${eticheta}`}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 4,
                borderRadius: 0,
                '& .MuiLinearProgress-bar': { transition: 'transform 180ms linear' },
              }}
            />
          ) : null}
        </Box>
        <Typography variant="bodyStrong" component="span" sx={{ display: 'block', mt: 2 }}>
          {eticheta}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          component="span"
          sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {f ? `${f.nume} · ${f.marime}` : 'Lipsește'}
        </Typography>
      </ButtonBase>
    </li>
  );
}

// ── Documente ─────────────────────────────────────────────────────────────────────

function Documente({ elemente }: { elemente: ElementLista[] }) {
  const docs = elemente.filter((e) => !DOCUMENT_INFO[e.tip].media);
  return (
    <Box
      component="section"
      aria-labelledby="documente-titlu"
      sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <Typography id="documente-titlu" variant="h3" component="h2">
        Documente
      </Typography>
      <Box
        sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}
      >
        {docs.map((d) => (
          <CardDocument key={d.cheie} d={d} />
        ))}
      </Box>
    </Box>
  );
}

function CardDocument({ d }: { d: ElementLista }) {
  const { ciorna, alegeFisier, progres } = useWizard();
  const f = ciorna.fisiere[d.cheie]?.[0];
  const p = progres[d.cheie];
  const incarcare = p !== undefined && p < 100;
  const extras = f && !incarcare ? extrasMock(d.tip, ciorna) : undefined;

  return (
    <Box
      id={`doc-${d.cheie}`}
      data-lipsa={f ? undefined : 'true'}
      tabIndex={-1}
      sx={{
        bgcolor: color.surface,
        border: `1px ${f ? 'solid' : 'dashed'} ${f ? color.line : color.lineStrong}`,
        borderRadius: `${radius.lg}px`,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        scrollMarginTop: 96,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="bodyStrong" component="h3">
            {d.denumire}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            {d.explicatie}
          </Typography>
          {d.motiv ? (
            <Typography variant="caption" component="p" sx={{ color: color.warningText }}>
              {d.motiv}
            </Typography>
          ) : null}
        </Box>
        {f && !incarcare ? <StatusBadge tone="success" label="Încărcat" /> : null}
      </Box>
      {f ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: color.inkMuted }}>
            <IconFile size={18} stroke={1.5} aria-hidden />
            <Typography
              sx={{ color: color.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {f.nume}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => alegeFisier(d.cheie, { accept: ACCEPT_DOC })}
              aria-label={`Înlocuiește ${d.denumire}`}
            >
              Înlocuiește
            </Button>
          </Box>
          {incarcare ? (
            <LinearProgress variant="determinate" value={p} aria-label={`Se încarcă ${d.denumire}`} />
          ) : null}
          {extras ? <AiExtracted>{extras}</AiExtracted> : null}
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<IconUpload size={18} stroke={1.5} />}
            onClick={() => alegeFisier(d.cheie, { accept: ACCEPT_DOC })}
            aria-label={`Încarcă fișier: ${d.denumire}`}
          >
            Încarcă fișier
          </Button>
          <Button
            variant="text"
            startIcon={<IconCamera size={18} stroke={1.5} />}
            onClick={() => alegeFisier(d.cheie, { accept: 'image/*', capture: true })}
            aria-label={`Fotografiază: ${d.denumire}`}
          >
            Fotografiază
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ── Panoul „Documente cerute” ─────────────────────────────────────────────────────

function IconStare({ stare }: { stare: StareElement }) {
  if (stare === 'COMPLET') {
    return (
      <Box
        component="span"
        sx={{
          color: color.success,
          display: 'grid',
          animation: 'deee-bifa 150ms ease-out',
          '@keyframes deee-bifa': { from: { transform: 'scale(0.8)' }, to: { transform: 'scale(1)' } },
        }}
      >
        <IconCircleCheckFilled size={22} aria-label="Complet" />
      </Box>
    );
  }
  return (
    <Box
      component="span"
      role="img"
      aria-label={stare === 'PARTIAL' ? 'Parțial' : 'Lipsește'}
      sx={{
        width: 20,
        height: 20,
        m: '1px',
        borderRadius: '50%',
        border: `2px solid ${stare === 'PARTIAL' ? color.warning : color.lineStrong}`,
        flexShrink: 0,
      }}
    />
  );
}

function grupuri(elemente: ElementLista[]) {
  const ordine: GrupDocumente[] = ['BAZA', 'PJ', 'PF', 'PERICULOS', 'INTERNATIONAL'];
  return ordine
    .map((g) => ({ grup: g, elemente: elemente.filter((e) => e.grup === g) }))
    .filter((g) => g.elemente.length);
}

function PanouDocumenteCerute({ elemente }: { elemente: ElementLista[] }) {
  const { ciorna } = useWizard();
  const total = elemente.length + 1; // + proveniența, completată la pasul 1
  const gata = elemente.filter((e) => e.stare === 'COMPLET').length + 1;
  const periculos = elemente.find((e) => e.grup === 'PERICULOS');

  const du = (cheie: string) => {
    const el = document.getElementById(`doc-${cheie}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.focus({ preventScroll: true });
  };

  return (
    <Box
      component="aside"
      aria-labelledby="cerute-titlu"
      sx={{ bgcolor: color.surface, border: `1px solid ${color.line}`, borderRadius: `${radius.lg}px` }}
    >
      <Box sx={{ p: 6, pb: 4, borderBottom: `1px solid ${color.line}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography id="cerute-titlu" variant="h3" component="h2">
            Documente cerute
          </Typography>
          <Typography variant="body1" color="text.secondary" className="num">
            {gata} din {total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(gata / total) * 100}
          aria-label={`${gata} din ${total} documente`}
          sx={{
            my: 3,
            '& .MuiLinearProgress-bar': { transition: `transform ${motion.base}ms ${motion.easing}` },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Lista se generează din proveniență ({PROVENIENTE[ciorna.provenienta ?? 'PJ'].toLowerCase()}) și din
          codurile declarate.
        </Typography>
      </Box>
      {grupuri(elemente).map(({ grup, elemente: el }, gi) => (
        <Box key={grup} sx={{ px: 6, py: 4, borderTop: gi ? `1px solid ${color.line}` : 'none' }}>
          <Typography
            variant="overline"
            component="h3"
            sx={{ color: grup === 'PERICULOS' ? color.warningText : color.inkMuted, display: 'block', mb: 2 }}
          >
            {grup === 'PERICULOS' && periculos?.motiv
              ? `Cod periculos declarat · ${periculos.motiv.match(/\(([^)]+)\)/)?.[1] ?? ''}`
              : ETICHETA_GRUP[grup]}
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {el.map((e) => (
              <li key={e.cheie}>
                <ButtonBase
                  onClick={() => du(e.cheie)}
                  sx={{
                    display: 'flex',
                    gap: 3,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    width: '100%',
                    textAlign: 'left',
                    py: 1.5,
                    borderRadius: `${radius.sm}px`,
                    '&:hover': { bgcolor: color.canvas },
                  }}
                >
                  <IconStare stare={e.stare} />
                  <Typography
                    sx={{ color: e.stare === 'COMPLET' ? color.ink : color.inkMuted, fontSize: 14 }}
                  >
                    {e.denumire}
                    {e.tip === 'FOTO_INCARCATURA' ? ` · ${e.detaliu.split(' · ')[0]}` : ''}
                  </Typography>
                </ButtonBase>
              </li>
            ))}
            {grup === 'BAZA' ? (
              <li>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', py: 1.5 }}>
                  <IconStare stare="COMPLET" />
                  <Typography sx={{ fontSize: 14 }}>
                    Proveniență completată ·{' '}
                    {ciorna.surse.length === 1 ? '1 sursă' : `${ciorna.surse.length} surse`}
                  </Typography>
                </Box>
              </li>
            ) : null}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function NotaAi() {
  return (
    <Box sx={{ bgcolor: color.aiSoft, borderRadius: `${radius.lg}px`, p: 5, display: 'flex', gap: 3 }}>
      <IconSparkles
        size={18}
        stroke={1.5}
        color={color.ai}
        aria-hidden
        style={{ flexShrink: 0, marginTop: 1 }}
      />
      <Typography variant="body1">
        AI-ul citește fiecare document la încărcare. Diferențele dintre documente apar în raportul de
        verificare; tu vezi aici doar ce s-a extras.
      </Typography>
    </Box>
  );
}

// ── Mobil: lista e ecranul principal ──────────────────────────────────────────────

function ListaMobil({ elemente }: { elemente: ElementLista[] }) {
  const { ciorna, alegeFisier } = useWizard();
  const gata = elemente.filter((e) => e.stare === 'COMPLET').length;
  const periculoaseLipsa = elemente.filter((e) => e.grup === 'PERICULOS' && e.stare !== 'COMPLET');

  const deschide = (e: ElementLista) => {
    if (e.tip === 'FOTO_INCARCATURA') {
      const liber = SLOTURI_FOTO.find((s) => !ciorna.fisiere[s.cheie]?.length) ?? SLOTURI_FOTO[0];
      alegeFisier(liber.cheie, { accept: 'image/*', capture: true });
    } else if (e.tip === 'FILMARE_CANTAR') alegeFisier(e.cheie, { accept: 'video/*', capture: true });
    else alegeFisier(e.cheie, { accept: 'image/*', capture: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="h2" component="h2">
          Documente cerute
        </Typography>
        <Typography color="text.secondary" className="num">
          {gata} din {elemente.length}
        </Typography>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          bgcolor: color.surface,
          border: `1px solid ${color.line}`,
          borderRadius: `${radius.lg}px`,
          overflow: 'hidden',
        }}
      >
        {elemente.map((e, i) => {
          const extras = e.stare === 'COMPLET' ? extrasMock(e.tip, ciorna) : undefined;
          return (
            <Box
              component="li"
              key={e.cheie}
              data-lipsa={e.stare === 'COMPLET' ? undefined : 'true'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minHeight: 64,
                px: 4,
                py: 2,
                borderTop: i ? `1px solid ${color.line}` : 'none',
              }}
            >
              <IconStare stare={e.stare} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="bodyStrong" component="p" sx={{ fontSize: 16 }}>
                  {e.denumire}
                </Typography>
                <Typography
                  variant="caption"
                  className="num"
                  sx={{
                    color: extras ? color.ai : e.stare === 'PARTIAL' ? color.warningText : color.inkMuted,
                  }}
                >
                  {extras ? `Extras de AI · ${extras}` : e.detaliu}
                </Typography>
              </Box>
              {e.stare !== 'COMPLET' ? (
                <IconButton
                  onClick={() => deschide(e)}
                  aria-label={`Fotografiază: ${e.denumire}`}
                  sx={{
                    width: 44,
                    height: 44,
                    border: `1px solid ${color.lineStrong}`,
                    color: color.petrol,
                    flexShrink: 0,
                  }}
                >
                  <IconCamera size={20} stroke={1.5} />
                </IconButton>
              ) : null}
            </Box>
          );
        })}
      </Box>
      {periculoaseLipsa.length ? (
        <Box
          sx={{
            bgcolor: color.warningSoft,
            borderRadius: `${radius.lg}px`,
            p: 4,
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
          }}
        >
          <IconAlertTriangle
            size={20}
            stroke={1.5}
            color={color.warningText}
            aria-hidden
            style={{ flexShrink: 0 }}
          />
          <Typography sx={{ color: color.warningText }}>
            Cod periculos declarat: mai ai nevoie de {periculoaseLipsa.map((e) => e.denumire).join(', ')}.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
