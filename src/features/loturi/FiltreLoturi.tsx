'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { IconAdjustmentsHorizontal, IconHierarchy2, IconList, IconSearch, IconX } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FiltreLoturi } from '@/lib/domain/filtre';
import type { CodDeseu } from '@/lib/domain/lot';
import { LOT_STATUS_LABEL, LOT_STATUSES, type LotStatus } from '@/lib/domain/status';
import type { Categorie, Subcategorie } from '@/lib/domain/taxonomie';
import { formatDate } from '@/lib/format';
import { color, radius } from '@/theme/tokens';

type Props = {
  filtre: FiltreLoturi;
  categorii: Categorie[];
  subcategorii: Subcategorie[];
  coduri: CodDeseu[];
  puncteLucru: string[];
  colectori: { id: string; denumire: string }[];
};

type Cheie = keyof FiltreLoturi;

export default function FiltreLoturiBar({
  filtre,
  categorii,
  subcategorii,
  coduri,
  puncteLucru,
  colectori,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filtre.q ?? '');
  const [deschis, setDeschis] = useState(false);

  const seteaza = (schimbari: Partial<Record<Cheie, string | undefined>>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(schimbari)) {
      if (v === undefined || v === '') p.delete(k);
      else p.set(k, v);
    }
    // Orice schimbare de filtru te duce înapoi la prima pagină.
    if (!('pagina' in schimbari)) p.delete('pagina');
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Căutarea se aplică după o scurtă pauză de tastare.
  useEffect(() => {
    if ((filtre.q ?? '') === q) return;
    const t = setTimeout(() => seteaza({ q: q.trim() || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const subDisponibile = useMemo(
    () => (filtre.categorie ? subcategorii.filter((s) => s.categorieId === filtre.categorie) : subcategorii),
    [filtre.categorie, subcategorii],
  );

  const chips: { cheie: string; eticheta: string; sterge: Partial<Record<Cheie, undefined>> }[] = [];
  if (filtre.q) chips.push({ cheie: 'q', eticheta: `„${filtre.q}”`, sterge: { q: undefined } });
  if (filtre.categorie) {
    const c = categorii.find((x) => x.id === filtre.categorie);
    chips.push({
      cheie: 'categorie',
      eticheta: `Cat. ${c?.cod} ${c?.denumireScurta}`,
      sterge: { categorie: undefined, subcategorie: undefined },
    });
  }
  if (filtre.subcategorie) {
    chips.push({
      cheie: 'subcategorie',
      eticheta: `Subcategoria ${filtre.subcategorie}`,
      sterge: { subcategorie: undefined },
    });
  }
  if (filtre.cod) chips.push({ cheie: 'cod', eticheta: `Cod ${filtre.cod}`, sterge: { cod: undefined } });
  for (const s of filtre.status ?? []) {
    chips.push({
      cheie: `status-${s}`,
      eticheta: LOT_STATUS_LABEL[s],
      sterge: {} /* tratat separat */,
    });
  }
  if (filtre.de)
    chips.push({ cheie: 'de', eticheta: `De la ${formatDate(filtre.de)}`, sterge: { de: undefined } });
  if (filtre.pana)
    chips.push({
      cheie: 'pana',
      eticheta: `Până la ${formatDate(filtre.pana)}`,
      sterge: { pana: undefined },
    });
  if (filtre.punct)
    chips.push({ cheie: 'punct', eticheta: `Punct ${filtre.punct}`, sterge: { punct: undefined } });
  if (filtre.colector) {
    chips.push({
      cheie: 'colector',
      eticheta: colectori.find((c) => c.id === filtre.colector)?.denumire ?? filtre.colector,
      sterge: { colector: undefined },
    });
  }

  const stergeChip = (cheie: string, sterge: Partial<Record<Cheie, undefined>>) => {
    if (cheie.startsWith('status-')) {
      const rest = (filtre.status ?? []).filter((s) => `status-${s}` !== cheie);
      seteaza({ status: rest.join(',') || undefined });
    } else {
      if (cheie === 'q') setQ('');
      seteaza(sterge);
    }
  };

  const numarFiltre = chips.length - (filtre.q ? 1 : 0);
  const vedere = filtre.vedere ?? 'lista';

  const campuri = (
    <Box
      sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: `repeat(${colectori.length ? 4 : 3}, minmax(0, 1fr))`,
        },
        pt: { xs: 4, md: 0 },
      }}
    >
      {colectori.length ? (
        <TextField
          select
          label="Colector"
          id="filtru-colector"
          value={filtre.colector ?? ''}
          onChange={(e) => seteaza({ colector: e.target.value })}
        >
          <MenuItem value="">Toți colectorii</MenuItem>
          {colectori.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.denumire}
            </MenuItem>
          ))}
        </TextField>
      ) : null}
      <TextField
        select
        label="Categorie"
        id="filtru-categorie"
        value={filtre.categorie ?? ''}
        onChange={(e) => seteaza({ categorie: e.target.value, subcategorie: undefined })}
      >
        <MenuItem value="">Toate categoriile</MenuItem>
        {categorii.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.cod}. {c.denumireScurta}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Subcategorie"
        id="filtru-subcategorie"
        value={filtre.subcategorie ?? ''}
        onChange={(e) => seteaza({ subcategorie: e.target.value })}
        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 360 } } } } } }}
      >
        <MenuItem value="">Toate subcategoriile</MenuItem>
        {subDisponibile.map((s) => (
          <MenuItem key={s.cod} value={s.cod}>
            {s.cod} {s.denumire}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Cod deșeu"
        id="filtru-cod"
        value={filtre.cod ?? ''}
        onChange={(e) => seteaza({ cod: e.target.value })}
      >
        <MenuItem value="">Toate codurile</MenuItem>
        {coduri.map((c) => (
          <MenuItem key={c.cod} value={c.cod}>
            {c.cod}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Status"
        id="filtru-status"
        value={filtre.status ?? []}
        onChange={(e) => {
          const v = e.target.value as unknown as LotStatus[];
          seteaza({ status: v.join(',') || undefined });
        }}
        slotProps={{
          select: {
            multiple: true,
            displayEmpty: true,
            renderValue: (v) => {
              const sel = v as LotStatus[];
              return sel.length ? sel.map((s) => LOT_STATUS_LABEL[s]).join(', ') : 'Toate statusurile';
            },
          },
        }}
      >
        {LOT_STATUSES.map((s) => (
          <MenuItem key={s} value={s} dense>
            <Checkbox size="small" checked={filtre.status?.includes(s) ?? false} sx={{ p: 0, mr: 2 }} />
            <ListItemText primary={LOT_STATUS_LABEL[s]} />
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="date"
        label="Preluat de la"
        id="filtru-de"
        value={filtre.de ?? ''}
        onChange={(e) => seteaza({ de: e.target.value })}
      />
      <TextField
        type="date"
        label="Preluat până la"
        id="filtru-pana"
        value={filtre.pana ?? ''}
        onChange={(e) => seteaza({ pana: e.target.value })}
      />
      <TextField
        select
        label="Punct de lucru"
        id="filtru-punct"
        value={filtre.punct ?? ''}
        onChange={(e) => seteaza({ punct: e.target.value })}
      >
        <MenuItem value="">Toate punctele</MenuItem>
        {puncteLucru.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {pending ? (
        <LinearProgress
          aria-label="Se actualizează lista"
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: 0 }}
        />
      ) : null}
      <Box sx={{ p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            id="filtru-cautare"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută după lot, subcategorie sau cod"
            slotProps={{
              htmlInput: { 'aria-label': 'Caută în loturi' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} stroke={1.5} aria-hidden />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: '1 1 240px', maxWidth: { md: 420 } }}
          />
          <Badge badgeContent={numarFiltre} color="primary" sx={{ display: { md: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<IconAdjustmentsHorizontal size={18} stroke={1.5} />}
              onClick={() => setDeschis((d) => !d)}
              aria-expanded={deschis}
              aria-controls="filtre-avansate"
            >
              Filtre
            </Button>
          </Badge>
          <ToggleButtonGroup
            exclusive
            value={vedere}
            onChange={(_, v: 'lista' | 'categorii' | null) =>
              v && seteaza({ vedere: v === 'lista' ? undefined : v })
            }
            aria-label="Mod de afișare"
            sx={{ ml: { md: 'auto' } }}
          >
            <ToggleButton
              value="lista"
              aria-label="Listă"
              sx={{ gap: 2, px: 4, textTransform: 'none', height: 40 }}
            >
              <IconList size={18} stroke={1.5} aria-hidden /> Listă
            </ToggleButton>
            <ToggleButton
              value="categorii"
              aria-label="Pe categorii"
              sx={{ gap: 2, px: 4, textTransform: 'none', height: 40 }}
            >
              <IconHierarchy2 size={18} stroke={1.5} aria-hidden /> Pe categorii
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box id="filtre-avansate" sx={{ display: { xs: 'block', md: 'none' } }}>
          <Collapse in={deschis}>{campuri}</Collapse>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>{campuri}</Box>

        {chips.length ? (
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
            aria-label="Filtre active"
          >
            {chips.map((c) => (
              <Chip
                key={c.cheie}
                label={c.eticheta}
                onDelete={() => stergeChip(c.cheie, c.sterge)}
                deleteIcon={<IconX size={14} stroke={1.5} aria-label={`Șterge filtrul ${c.eticheta}`} />}
                sx={{
                  bgcolor: color.petrolSoft,
                  color: color.petrol,
                  '& .MuiChip-deleteIcon': { color: color.petrol },
                }}
              />
            ))}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setQ('');
                startTransition(() =>
                  router.replace(filtre.vedere ? `${pathname}?vedere=${filtre.vedere}` : pathname, {
                    scroll: false,
                  }),
                );
              }}
            >
              Șterge filtrele
            </Button>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
