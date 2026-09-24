'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { IconMinus, IconPlus, IconSparkles } from '@tabler/icons-react';
import { PAGINA, type DocumentVizual, type Zona } from '@/lib/domain/raport';
import { formatNumber } from '@/lib/format';
import { color, motion, radius } from '@/theme/tokens';

type Props = {
  documente: DocumentVizual[];
  selectat: string | null;
  onSelect: (id: string) => void;
  zona?: Zona;
  valoare?: string;
  incredere?: number;
};

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2;
const TABURI_VIZIBILE = 4;

/**
 * Vizualizatorul de documente (SPEC-ECRANE §8): tab-uri pe documente, zoom din butoane
 * sau Ctrl + scroll, iar zona sursă a valorii e un dreptunghi `highlight` cu contur
 * `warning`, desenat din coordonatele salvate la extracție.
 */
export default function Vizualizator({ documente, selectat, onSelect, zona, valoare, incredere }: Props) {
  const [zoom, setZoom] = useState(1);
  const [meniu, setMeniu] = useState<HTMLElement | null>(null);
  const zonaRef = useRef<HTMLDivElement>(null);
  const suprafataRef = useRef<HTMLDivElement>(null);
  const zoomAtins = useRef(false);

  // La deschidere, pagina se potrivește la lățimea disponibilă (important pe telefon).
  useEffect(() => {
    const el = suprafataRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      if (zoomAtins.current) return;
      const disponibil = e.contentRect.width;
      setZoom(Math.min(1, Math.max(ZOOM_MIN / 1.5, Math.floor((disponibil / PAGINA.latime) * 10) / 10)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const doc = documente.find((d) => d.id === selectat) ?? documente[0];
  const idx = documente.findIndex((d) => d.id === doc?.id);
  const vizibile = documente.slice(0, TABURI_VIZIBILE);
  const restul = documente.slice(TABURI_VIZIBILE);
  const schimbaZoom = (d: number) => {
    zoomAtins.current = true;
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN / 1.5, Math.round((z + d) * 10) / 10)));
  };

  if (!doc) {
    return (
      <Box
        sx={{
          bgcolor: color.surface,
          border: `1px solid ${color.line}`,
          borderRadius: `${radius.lg}px`,
          p: 6,
        }}
      >
        <Typography color="text.secondary">Lotul nu are documente încărcate.</Typography>
      </Box>
    );
  }

  const W = PAGINA.latime * zoom;
  const H = PAGINA.inaltime * zoom;

  return (
    <Box
      component="section"
      aria-label="Documentele lotului"
      sx={{
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 3,
          borderBottom: `1px solid ${color.line}`,
          flexWrap: 'wrap',
        }}
      >
        <Box
          role="tablist"
          aria-label="Documente"
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'nowrap',
            flex: { xs: '1 1 100%', sm: 1 },
            minWidth: 0,
            overflowX: 'auto',
            '& > *': { flexShrink: 0, whiteSpace: 'nowrap' },
          }}
        >
          {vizibile.map((d) => (
            <ButtonBase
              key={d.id}
              role="tab"
              aria-selected={d.id === doc.id}
              onClick={() => onSelect(d.id)}
              sx={{
                px: 3,
                height: 36,
                borderRadius: `${radius.md}px`,
                fontSize: 14,
                fontWeight: 500,
                color: d.id === doc.id ? color.petrol : color.inkMuted,
                bgcolor: d.id === doc.id ? color.petrolSoft : 'transparent',
                '&:hover': { color: color.ink },
              }}
            >
              {d.denumire}
            </ButtonBase>
          ))}
          {restul.length ? (
            <>
              <ButtonBase
                onClick={(e) => setMeniu(e.currentTarget)}
                aria-haspopup="menu"
                aria-label={`Încă ${restul.length} documente`}
                sx={{
                  px: 3,
                  height: 36,
                  borderRadius: `${radius.md}px`,
                  fontSize: 14,
                  fontWeight: 500,
                  color: restul.some((d) => d.id === doc.id) ? color.petrol : color.inkMuted,
                  bgcolor: restul.some((d) => d.id === doc.id) ? color.petrolSoft : 'transparent',
                }}
              >
                +{restul.length}
              </ButtonBase>
              <Menu anchorEl={meniu} open={Boolean(meniu)} onClose={() => setMeniu(null)}>
                {restul.map((d) => (
                  <MenuItem
                    key={d.id}
                    selected={d.id === doc.id}
                    onClick={() => {
                      onSelect(d.id);
                      setMeniu(null);
                    }}
                  >
                    {d.denumire}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : null}
        </Box>
        <Typography variant="caption" color="text.secondary" className="num" sx={{ whiteSpace: 'nowrap' }}>
          {doc.fisier} · {idx + 1} / {documente.length}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            aria-label="Micșorează"
            onClick={() => schimbaZoom(-0.2)}
            disabled={zoom <= ZOOM_MIN}
            size="small"
          >
            <IconMinus size={16} stroke={1.5} />
          </IconButton>
          <Typography
            variant="caption"
            className="num"
            sx={{ width: 40, textAlign: 'center' }}
            aria-live="polite"
          >
            {formatNumber(Math.round(zoom * 100))}%
          </Typography>
          <IconButton
            aria-label="Mărește"
            onClick={() => schimbaZoom(0.2)}
            disabled={zoom >= ZOOM_MAX}
            size="small"
          >
            <IconPlus size={16} stroke={1.5} />
          </IconButton>
        </Box>
      </Box>

      <Box
        ref={suprafataRef}
        tabIndex={0}
        role="region"
        aria-label={`${doc.denumire}, previzualizare`}
        onWheel={(e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();
          schimbaZoom(e.deltaY < 0 ? 0.1 : -0.1);
        }}
        sx={{
          bgcolor: color.line,
          overflow: 'auto',
          minHeight: 420,
          maxHeight: { lg: 620 },
          p: { xs: 3, sm: 6 },
          display: 'flex',
          // „safe” păstrează marginea stângă accesibilă când pagina e mai lată decât zona.
          justifyContent: 'safe center',
          alignItems: 'flex-start',
        }}
      >
        <Box
          key={doc.id}
          sx={{
            position: 'relative',
            width: W,
            height: H,
            flexShrink: 0,
            bgcolor: color.surface,
            boxShadow: '0 1px 3px rgba(15, 26, 31, 0.12)',
            fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
            color: color.ink,
            transition: `width ${motion.base}ms ${motion.easing}, height ${motion.base}ms ${motion.easing}`,
            animation: `deee-doc ${motion.base}ms ${motion.easing}`,
            '@keyframes deee-doc': { from: { opacity: 0 }, to: { opacity: 1 } },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: `${PAGINA.margine * 100}%`,
              right: `${PAGINA.margine * 100}%`,
              top: `${(PAGINA.sus - 0.09) * 100}%`,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14 * zoom,
              borderBottom: `1px dashed ${color.lineStrong}`,
              pb: `${10 * zoom}px`,
            }}
          >
            {doc.titlu}
          </Box>
          {doc.randuri.map((r, i) => (
            <Box
              key={r.cheie}
              sx={{
                position: 'absolute',
                left: `${PAGINA.margine * 100}%`,
                right: `${PAGINA.margine * 100}%`,
                top: `${(PAGINA.sus + i * PAGINA.rand) * 100}%`,
                height: `${PAGINA.rand * 100 - 1.2}%`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13 * zoom,
                fontWeight: r.accent ? 700 : 400,
                gap: 3,
              }}
            >
              <span>{r.eticheta}</span>
              <span style={{ textAlign: 'right' }}>{r.valoare}</span>
            </Box>
          ))}
          {doc.subsol ? (
            <Box
              sx={{
                position: 'absolute',
                left: `${PAGINA.margine * 100}%`,
                right: `${PAGINA.margine * 100}%`,
                top: `${(PAGINA.sus + doc.randuri.length * PAGINA.rand + 0.03) * 100}%`,
                textAlign: 'center',
                fontSize: 11 * zoom,
                color: color.inkMuted,
                borderTop: `1px dashed ${color.lineStrong}`,
                pt: `${8 * zoom}px`,
              }}
            >
              {doc.subsol}
            </Box>
          ) : null}
          {zona ? (
            <Box
              ref={zonaRef}
              aria-hidden
              data-zona-sursa
              sx={{
                position: 'absolute',
                left: `${zona.x * 100}%`,
                top: `${zona.y * 100}%`,
                width: `${zona.w * 100}%`,
                height: `${zona.h * 100}%`,
                bgcolor: 'rgba(255, 243, 176, 0.65)',
                border: `2px solid ${color.warning}`,
                borderRadius: '4px',
                mixBlendMode: 'multiply',
                transition: `all ${motion.base}ms ${motion.easing}`,
              }}
            />
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 3,
          borderTop: `1px solid ${color.line}`,
          minHeight: 48,
        }}
      >
        {zona && valoare ? (
          <>
            <IconSparkles size={16} stroke={1.5} color={color.ai} aria-hidden />
            <Typography variant="caption" color="text.secondary">
              Zona evidențiată este sursa valorii{' '}
              <Box component="strong" className="num" sx={{ color: color.ink }}>
                {valoare}
              </Box>
              {incredere !== undefined
                ? ` · încredere extracție ${formatNumber(Math.round(incredere * 100))}%`
                : ''}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Valoarea regulii selectate nu provine din acest document.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
