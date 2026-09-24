'use client';

import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import CategorieIcon from '@/components/ui/CategorieIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  DESTINATII,
  PROVENIENTE,
  STARI_LINIE,
  SURSE_PERMISE,
  TIPURI_SURSA,
  kgAcoperitSurse,
  linieNoua,
  sursaNoua,
  totalKgCiorna,
  type Destinatie,
  type LinieCiorna,
  type StareLinie,
  type SursaCiorna,
  type TipSursaCiorna,
} from '@/lib/domain/ciorna';
import type { Provenienta } from '@/lib/domain/documente-cerute';
import { cuiValid } from '@/lib/domain/identificatori';
import type { Subcategorie } from '@/lib/domain/taxonomie';
import { formatNumber } from '@/lib/format';
import { color, radius } from '@/theme/tokens';
import { cautaCui } from './actions';
import { CampNumeric, CampSensibil } from './campuri';
import { useWizard } from './context';

export default function Pas1Informatii() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Antet />
      <Linii />
      <Provenienta />
    </Box>
  );
}

function Sectiune({
  id,
  titlu,
  descriere,
  children,
  dreapta,
}: {
  id: string;
  titlu: string;
  descriere?: string;
  children: React.ReactNode;
  dreapta?: React.ReactNode;
}) {
  return (
    <Card component="section" aria-labelledby={id}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: { xs: 4, sm: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 4,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
            <Typography id={id} variant="h3" component="h2">
              {titlu}
            </Typography>
            {descriere ? (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {descriere}
              </Typography>
            ) : null}
          </Box>
          {dreapta}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

// ── Antetul lotului ───────────────────────────────────────────────────────────────

function Antet() {
  const { ciorna, actualizeaza, eroare, atinge, tx } = useWizard();
  return (
    <Sectiune
      id="antet-titlu"
      titlu="Informații"
      descriere="Când și unde ai preluat deșeurile și ce faci cu ele."
    >
      <Box
        sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}
      >
        <TextField
          id="dataPreluarii"
          type="date"
          label="Data preluării"
          value={ciorna.dataPreluarii}
          onChange={(e) => actualizeaza((d) => void (d.dataPreluarii = e.target.value))}
          onBlur={() => atinge('dataPreluarii')}
          error={Boolean(eroare('dataPreluarii'))}
          helperText={eroare('dataPreluarii')}
        />
        <TextField
          id="punctLucru"
          select
          label="Punct de lucru"
          value={ciorna.punctLucru}
          onChange={(e) => actualizeaza((d) => void (d.punctLucru = e.target.value))}
          onBlur={() => atinge('punctLucru')}
          error={Boolean(eroare('punctLucru'))}
          helperText={eroare('punctLucru')}
        >
          <MenuItem value="" disabled>
            Alege punctul de lucru
          </MenuItem>
          {tx.puncteLucru.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="destinatie"
          select
          label="Destinație declarată"
          value={ciorna.destinatie ?? ''}
          onChange={(e) => actualizeaza((d) => void (d.destinatie = e.target.value as Destinatie))}
          onBlur={() => atinge('destinatie')}
          error={Boolean(eroare('destinatie'))}
          helperText={eroare('destinatie')}
        >
          <MenuItem value="" disabled>
            Alege destinația
          </MenuItem>
          {Object.entries(DESTINATII).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Sectiune>
  );
}

// ── Liniile lotului ───────────────────────────────────────────────────────────────

function Linii() {
  const { ciorna, actualizeaza, eroare } = useWizard();
  return (
    <Sectiune
      id="linii-titlu"
      titlu="Linii de lot"
      descriere="O linie pentru fiecare subcategorie și cod de deșeu."
      dreapta={
        <Typography variant="bodyStrong" className="num" sx={{ alignSelf: 'center' }}>
          Total {formatNumber(totalKgCiorna(ciorna))} kg
        </Typography>
      }
    >
      <Box
        component="ol"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {ciorna.linii.map((l, i) => (
          <Linie key={l.cheie} linie={l} index={i} />
        ))}
      </Box>
      {eroare('linii') ? (
        <Typography variant="caption" sx={{ color: color.danger }}>
          {eroare('linii')}
        </Typography>
      ) : null}
      <Button
        variant="text"
        startIcon={<IconPlus size={18} stroke={1.5} />}
        onClick={() => actualizeaza((d) => void d.linii.push(linieNoua()))}
        sx={{ alignSelf: 'flex-start' }}
      >
        Adaugă linie
      </Button>
    </Sectiune>
  );
}

function Linie({ linie: l, index: i }: { linie: LinieCiorna; index: number }) {
  const { ciorna, actualizeaza, eroare, atinge, tx, validare } = useWizard();
  const p = `linii.${i}`;
  const sub = validare.subcategorie(l.subcategorieCod) ?? null;
  const permise = sub ? validare.coduriPermise(sub.cod) : [];
  const periculos = l.codDeseu.endsWith('*');
  const set = (fn: (x: LinieCiorna) => void) => actualizeaza((d) => fn(d.linii[i]));
  const categorie = (s: Subcategorie) => tx.categorii.find((c) => c.id === s.categorieId);

  return (
    <Box
      component="li"
      aria-label={`Linia ${i + 1}`}
      sx={{
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        p: { xs: 4, sm: 5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box
          className="num"
          sx={{
            width: 24,
            height: 24,
            borderRadius: `${radius.sm}px`,
            bgcolor: color.canvas,
            border: `1px solid ${color.line}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {i + 1}
        </Box>
        <Typography variant="bodyStrong">Linia {i + 1}</Typography>
        {periculos ? <StatusBadge tone="warning" label="Cod periculos" /> : null}
        <Box sx={{ flex: 1 }} />
        {ciorna.linii.length > 1 ? (
          <IconButton
            aria-label={`Șterge linia ${i + 1}`}
            onClick={() =>
              actualizeaza((d) => {
                d.linii.splice(i, 1);
                d.surse.forEach((s) => (s.linii = s.linii.filter((k) => k !== l.cheie)));
              })
            }
          >
            <IconTrash size={18} stroke={1.5} />
          </IconButton>
        ) : null}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'minmax(0, 2.2fr) minmax(0, 1.3fr) minmax(0, 0.8fr) minmax(0, 0.9fr) minmax(0, 1fr)',
          },
          alignItems: 'start',
        }}
      >
        <Autocomplete
          id={`${p}.subcategorie`}
          options={tx.subcategorii}
          groupBy={(s) => {
            const c = categorie(s);
            return c ? `${c.cod}. ${c.denumire}` : '';
          }}
          getOptionLabel={(s) => `${s.cod} ${s.denumire}`}
          value={sub}
          onChange={(_, v) =>
            set((x) => {
              x.subcategorieCod = v?.cod ?? '';
              // Codul rămâne doar dacă e permis și pentru noua subcategorie.
              if (v && !(tx.coduriPeCategorie[v.categorieId] ?? []).includes(x.codDeseu)) x.codDeseu = '';
            })
          }
          onBlur={() => atinge(`${p}.subcategorieCod`)}
          renderGroup={(g) => (
            <li key={g.key}>
              <Box
                sx={{
                  position: 'sticky',
                  top: -8,
                  zIndex: 1,
                  bgcolor: color.canvas,
                  px: 4,
                  py: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: color.inkMuted,
                }}
              >
                <CategorieIcon categorieId={Number(g.group.split('.')[0])} size={16} />
                {g.group}
              </Box>
              <ul style={{ padding: 0 }}>{g.children}</ul>
            </li>
          )}
          noOptionsText="Nicio subcategorie nu se potrivește."
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subcategorie"
              placeholder="Caută: frigider, 4.2, laptop…"
              error={Boolean(eroare(`${p}.subcategorieCod`))}
              helperText={
                eroare(`${p}.subcategorieCod`) ??
                (sub ? `Tarif ${sub.unitateTarif === 'PER_BUCATA' ? 'pe bucată' : 'pe kg'}` : undefined)
              }
            />
          )}
        />
        <TextField
          id={`${p}.codDeseu`}
          select
          label="Cod deșeu"
          value={l.codDeseu}
          disabled={!sub}
          onChange={(e) => set((x) => void (x.codDeseu = e.target.value))}
          onBlur={() => atinge(`${p}.codDeseu`)}
          error={Boolean(eroare(`${p}.codDeseu`))}
          helperText={eroare(`${p}.codDeseu`) ?? (!sub ? 'Alege întâi subcategoria.' : undefined)}
          slotProps={{ select: { renderValue: (v) => (v ? String(v) : 'Alege codul') } }}
        >
          {tx.coduri
            .filter((c) => permise.includes(c.cod))
            .map((c) => {
              const autorizat = tx.coduriAutorizate.includes(c.cod);
              return (
                <MenuItem
                  key={c.cod}
                  value={c.cod}
                  disabled={!autorizat}
                  title={autorizat ? undefined : 'Nu e în autorizația ta de mediu'}
                >
                  <ListItemText
                    primary={c.cod}
                    secondary={autorizat ? c.denumire : 'Nu e în autorizația ta de mediu'}
                    slotProps={{ secondary: { sx: { fontSize: 12, whiteSpace: 'normal', maxWidth: 320 } } }}
                  />
                </MenuItem>
              );
            })}
        </TextField>
        <CampNumeric
          id={`${p}.buc`}
          label="Bucăți"
          intreg
          valoare={l.buc}
          onValoare={(v) => set((x) => void (x.buc = v))}
          onBlur={() => atinge(`${p}.buc`)}
          error={Boolean(eroare(`${p}.buc`) ?? eroare(`${p}.cantitate`))}
          helperText={eroare(`${p}.buc`) ?? eroare(`${p}.cantitate`)}
        />
        <CampNumeric
          id={`${p}.kg`}
          label="Kg"
          valoare={l.kg}
          onValoare={(v) => set((x) => void (x.kg = v))}
          onBlur={() => atinge(`${p}.kg`)}
          error={Boolean(eroare(`${p}.kg`))}
          helperText={eroare(`${p}.kg`)}
        />
        <TextField
          id={`${p}.stare`}
          select
          label="Stare"
          value={l.stare}
          onChange={(e) => set((x) => void (x.stare = e.target.value as StareLinie))}
        >
          {Object.entries(STARI_LINIE).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
}

// ── Proveniență și surse ──────────────────────────────────────────────────────────

function Provenienta() {
  const { ciorna, actualizeaza, eroare, atinge } = useWizard();
  const total = totalKgCiorna(ciorna);
  const acoperit = kgAcoperitSurse(ciorna);
  const inchis = total > 0 && Math.abs(total - acoperit) < 0.01;

  return (
    <Sectiune
      id="provenienta-titlu"
      titlu="Proveniența lotului"
      descriere="De la cine ai preluat deșeurile. Fiecare sursă trebuie să acopere o parte din cantitatea declarată."
      dreapta={
        <TextField
          id="provenienta"
          select
          label="Proveniență"
          value={ciorna.provenienta ?? ''}
          onChange={(e) =>
            actualizeaza((d) => {
              const p = e.target.value as Provenienta;
              d.provenienta = p;
              d.surse = d.surse.filter((s) => SURSE_PERMISE[p].includes(s.tip));
              if (d.surse.length === 0) d.surse.push(sursaNoua(SURSE_PERMISE[p][0]));
            })
          }
          onBlur={() => atinge('provenienta')}
          error={Boolean(eroare('provenienta'))}
          helperText={eroare('provenienta')}
          sx={{ width: { xs: '100%', sm: 240 } }}
        >
          <MenuItem value="" disabled>
            Alege proveniența
          </MenuItem>
          {Object.entries(PROVENIENTE).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      }
    >
      {ciorna.provenienta ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ciorna.surse.map((s, i) => (
              <Sursa key={s.cheie} sursa={s} index={i} />
            ))}
          </Box>
          {eroare('surse') ? (
            <Typography variant="caption" sx={{ color: color.danger }}>
              {eroare('surse')}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Button
              variant="text"
              startIcon={<IconPlus size={18} stroke={1.5} />}
              onClick={() =>
                actualizeaza((d) => void d.surse.push(sursaNoua(SURSE_PERMISE[d.provenienta!][0])))
              }
            >
              Adaugă sursă
            </Button>
            <Typography
              variant="bodyStrong"
              className="num"
              role="status"
              sx={{
                color: inchis ? color.successText : color.warningText,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {inchis ? <IconCheck size={16} stroke={2} aria-hidden /> : null}
              Sursele acoperă {formatNumber(acoperit)} kg din {formatNumber(total)} kg declarate
            </Typography>
          </Box>
        </>
      ) : null}
    </Sectiune>
  );
}

function Sursa({ sursa: s, index: i }: { sursa: SursaCiorna; index: number }) {
  const { ciorna, actualizeaza, eroare, atinge, validare } = useWizard();
  const [anaf, setAnaf] = useState<'idle' | 'cauta' | 'negasit'>('idle');
  const p = `surse.${i}`;
  const set = (fn: (x: SursaCiorna) => void) => actualizeaza((d) => fn(d.surse[i]));
  const pf = s.tip === 'PERSOANA_FIZICA';
  const permise = ciorna.provenienta ? SURSE_PERMISE[ciorna.provenienta] : [];
  const liniiAcoperite = ciorna.linii.filter((l) => s.linii.includes(l.cheie));
  const rezumat = liniiAcoperite
    .map((l) => [l.subcategorieCod, l.buc ? `${formatNumber(l.buc)} buc` : null].filter(Boolean).join(' · '))
    .join(', ');

  const verificaAnaf = async () => {
    atinge(`${p}.cui`);
    if (!cuiValid(s.cui) || s.cuiVerificatAnaf) return;
    setAnaf('cauta');
    const r = await cautaCui(s.cui);
    setAnaf(r ? 'idle' : 'negasit');
    if (r) {
      set((x) => {
        x.cuiVerificatAnaf = true;
        if (!x.denumire.trim()) x.denumire = r.denumire;
        if (!x.adresaRidicare.trim() && r.adresa) x.adresaRidicare = r.adresa;
      });
    }
  };

  const camp = (cheie: keyof SursaCiorna) => ({
    id: `${p}.${cheie}`,
    onBlur: () => atinge(`${p}.${cheie}`),
    error: Boolean(eroare(`${p}.${cheie}`)),
    helperText: eroare(`${p}.${cheie}`),
  });

  return (
    <Box
      aria-label={`Sursa ${i + 1}`}
      role="group"
      sx={{
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        p: { xs: 4, sm: 5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Box
          className="num"
          sx={{
            width: 24,
            height: 24,
            borderRadius: `${radius.sm}px`,
            bgcolor: color.petrolSoft,
            color: color.petrol,
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {i + 1}
        </Box>
        <Typography variant="bodyStrong">Sursa {i + 1}</Typography>
        {s.cuiVerificatAnaf ? <StatusBadge tone="success" label="Verificat la ANAF" /> : null}
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary" className="num">
          {[rezumat, s.kg ? `${formatNumber(s.kg)} kg` : null].filter(Boolean).join(' · ')}
        </Typography>
        {ciorna.surse.length > 1 ? (
          <IconButton
            aria-label={`Șterge sursa ${i + 1}`}
            onClick={() => actualizeaza((d) => void d.surse.splice(i, 1))}
          >
            <IconTrash size={18} stroke={1.5} />
          </IconButton>
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <TextField
          {...camp('tip')}
          select
          label="Tip sursă"
          value={s.tip}
          onChange={(e) =>
            set((x) => {
              x.tip = e.target.value as TipSursaCiorna;
              x.cuiVerificatAnaf = false;
            })
          }
        >
          {permise.map((t) => (
            <MenuItem key={t} value={t}>
              {TIPURI_SURSA[t]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...camp('denumire')}
          label={pf ? 'Nume și prenume' : 'Denumire'}
          value={s.denumire}
          onChange={(e) => set((x) => void (x.denumire = e.target.value))}
        />
        {pf ? (
          <>
            <CampSensibil
              {...camp('cnp')}
              label="CNP"
              valoare={s.cnp}
              onValoare={(v) => set((x) => void (x.cnp = v.replace(/\D/g, '').slice(0, 13)))}
              helperText={eroare(`${p}.cnp`) ?? 'Se afișează mascat după ce ieși din câmp.'}
            />
            <CampSensibil
              {...camp('actIdentitate')}
              label="Seria și numărul actului"
              valoare={s.actIdentitate}
              onValoare={(v) => set((x) => void (x.actIdentitate = v.toUpperCase().slice(0, 12)))}
            />
          </>
        ) : (
          <TextField
            {...camp('cui')}
            label="CUI"
            value={s.cui}
            onChange={(e) =>
              set((x) => {
                x.cui = e.target.value;
                x.cuiVerificatAnaf = false;
              })
            }
            onBlur={verificaAnaf}
            helperText={
              eroare(`${p}.cui`) ??
              (anaf === 'cauta'
                ? 'Verificăm la ANAF…'
                : anaf === 'negasit'
                  ? 'Nu am găsit CUI-ul la ANAF. Verifică cifrele.'
                  : undefined)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {anaf === 'cauta' ? (
                      <CircularProgress size={16} aria-label="Se verifică la ANAF" />
                    ) : s.cuiVerificatAnaf ? (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: color.successText,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <IconCheck size={14} stroke={2} aria-hidden /> ANAF
                      </Box>
                    ) : null}
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        <TextField
          {...camp('adresaRidicare')}
          label="Adresa de ridicare"
          value={s.adresaRidicare}
          onChange={(e) => set((x) => void (x.adresaRidicare = e.target.value))}
        />
        {!pf ? (
          <>
            <TextField
              {...camp('contract')}
              label="Contract / comandă"
              value={s.contract}
              onChange={(e) => set((x) => void (x.contract = e.target.value))}
              helperText={eroare(`${p}.contract`) ?? 'Opțional'}
            />
            <TextField
              {...camp('documentProvenienta')}
              label="Document de proveniență"
              placeholder="ex. Aviz EWC 0457"
              value={s.documentProvenienta}
              onChange={(e) => set((x) => void (x.documentProvenienta = e.target.value))}
            />
          </>
        ) : null}
        <TextField
          {...camp('linii')}
          select
          label="Linii acoperite"
          value={s.linii}
          onChange={(e) => set((x) => void (x.linii = e.target.value as unknown as string[]))}
          slotProps={{
            select: {
              multiple: true,
              renderValue: (v) => {
                const sel = v as string[];
                if (!sel.length) return 'Alege liniile';
                return ciorna.linii
                  .map((l, k) =>
                    sel.includes(l.cheie)
                      ? `Linia ${k + 1}${l.subcategorieCod ? ` (${l.subcategorieCod})` : ''}`
                      : null,
                  )
                  .filter(Boolean)
                  .join(', ');
              },
            },
          }}
        >
          {ciorna.linii.map((l, k) => (
            <MenuItem key={l.cheie} value={l.cheie} dense>
              <Checkbox size="small" checked={s.linii.includes(l.cheie)} sx={{ p: 0, mr: 2 }} />
              <ListItemText
                primary={`Linia ${k + 1}`}
                secondary={validare.subcategorie(l.subcategorieCod)?.denumire ?? 'fără subcategorie'}
              />
            </MenuItem>
          ))}
        </TextField>
        <CampNumeric
          {...camp('kg')}
          label="Kg de la această sursă"
          valoare={s.kg}
          onValoare={(v) => set((x) => void (x.kg = v))}
        />
      </Box>
      {pf ? (
        <Typography variant="caption" color="text.secondary">
          Pentru fiecare persoană fizică vei încărca un borderou de achiziție la pasul Documente.
        </Typography>
      ) : null}
    </Box>
  );
}
