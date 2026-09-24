'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconCheck } from '@tabler/icons-react';
import { cuiValid } from '@/lib/domain/identificatori';
import { grupeazaIban, valideazaFirma, type DateFirma } from '@/lib/domain/onboarding';
import { color, radius } from '@/theme/tokens';
import { cautaFirma } from './actions';

type Props = {
  firma: DateFirma;
  editabil: boolean;
  onChange: (f: DateFirma) => void;
  arataErori: boolean;
};

export default function SectiuneFirma({ firma, editabil, onChange, arataErori }: Props) {
  const [anaf, setAnaf] = useState<'idle' | 'cauta' | 'negasit'>('idle');
  const [atinse, setAtinse] = useState<Set<keyof DateFirma>>(new Set());
  const erori = valideazaFirma(firma);
  const eroare = (k: keyof DateFirma) => (arataErori || atinse.has(k) ? erori[k] : undefined);
  const atinge = (k: keyof DateFirma) => setAtinse((s) => (s.has(k) ? s : new Set(s).add(k)));
  const set = (patch: Partial<DateFirma>) => onChange({ ...firma, ...patch });

  const verificaAnaf = async () => {
    atinge('cui');
    if (!cuiValid(firma.cui) || firma.cuiVerificatAnaf) return;
    setAnaf('cauta');
    const r = await cautaFirma(firma.cui);
    setAnaf(r ? 'idle' : 'negasit');
    if (r) onChange({ ...firma, cuiVerificatAnaf: true, denumire: r.denumire, adresaSediu: r.adresa });
  };

  const citireAnaf = (id: string, label: string, valoare: string) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography component="label" htmlFor={id} variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {firma.cuiVerificatAnaf && anaf !== 'cauta' ? <BadgeAnaf /> : null}
      </Box>
      {anaf === 'cauta' ? (
        <Skeleton
          variant="rounded"
          height={44}
          sx={{ borderRadius: `${radius.md}px` }}
          aria-label="Se încarcă datele de la ANAF"
        />
      ) : (
        <TextField
          id={id}
          fullWidth
          value={valoare}
          placeholder="Se completează din ANAF după CUI"
          slotProps={{ htmlInput: { readOnly: true, 'aria-readonly': true } }}
          sx={{ '& .MuiInputBase-root': { bgcolor: color.canvas } }}
        />
      )}
    </Box>
  );

  return (
    <Box
      component="section"
      id="sectiune-firma"
      aria-labelledby="firma-titlu"
      sx={{
        bgcolor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${radius.lg}px`,
        p: { xs: 5, sm: 6 },
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        scrollMarginTop: 88,
      }}
    >
      <Box>
        <Typography id="firma-titlu" variant="h3" component="h2">
          Date firmă
        </Typography>
        <Typography color="text.secondary">
          Scrie CUI-ul: denumirea și adresa sediului le preluăm de la ANAF.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        <TextField
          id="cui"
          label="CUI"
          value={firma.cui}
          disabled={!editabil}
          onChange={(e) => {
            setAnaf('idle');
            set({ cui: e.target.value.slice(0, 14), cuiVerificatAnaf: false, denumire: '', adresaSediu: '' });
          }}
          onBlur={verificaAnaf}
          error={Boolean(eroare('cui')) || anaf === 'negasit'}
          helperText={
            anaf === 'cauta'
              ? 'Verificăm la ANAF…'
              : anaf === 'negasit'
                ? 'Nu am găsit CUI-ul la ANAF. Verifică cifrele.'
                : (eroare('cui') ?? 'Fără prefixul RO.')
          }
          slotProps={{
            htmlInput: { inputMode: 'numeric', className: 'num' },
            input: {
              endAdornment:
                anaf === 'cauta' ? (
                  <InputAdornment position="end">
                    <Box
                      component="span"
                      role="progressbar"
                      aria-label="Se verifică la ANAF"
                      sx={{ display: 'grid' }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${color.line}`,
                          borderTopColor: color.petrol,
                          animation: 'deee-rotire 800ms linear infinite',
                          '@keyframes deee-rotire': { to: { transform: 'rotate(360deg)' } },
                        }}
                      />
                    </Box>
                  </InputAdornment>
                ) : firma.cuiVerificatAnaf ? (
                  <InputAdornment position="end">
                    <BadgeAnaf verificat />
                  </InputAdornment>
                ) : undefined,
            },
          }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
        {citireAnaf('denumire', 'Denumire', firma.denumire)}
        {citireAnaf('adresa-sediu', 'Adresa sediului', firma.adresaSediu)}
        <TextField
          id="punct-lucru"
          label="Adresa punctului de lucru"
          value={firma.punctLucru}
          disabled={!editabil}
          onChange={(e) => set({ punctLucru: e.target.value.slice(0, 300) })}
          onBlur={() => atinge('punctLucru')}
          error={Boolean(eroare('punctLucru'))}
          helperText={eroare('punctLucru') ?? 'Unde depozitezi DEEE colectate.'}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField
          id="banca"
          label="Bancă"
          value={firma.banca}
          disabled={!editabil}
          onChange={(e) => set({ banca: e.target.value.slice(0, 100) })}
          onBlur={() => atinge('banca')}
          error={Boolean(eroare('banca'))}
          helperText={eroare('banca')}
        />
        <TextField
          id="iban"
          label="IBAN"
          value={grupeazaIban(firma.iban)}
          disabled={!editabil}
          onChange={(e) => set({ iban: e.target.value.replace(/\s+/g, '').toUpperCase().slice(0, 34) })}
          onBlur={() => atinge('iban')}
          error={Boolean(eroare('iban'))}
          helperText={eroare('iban') ?? 'Contul în care primești plata loturilor acceptate.'}
          slotProps={{ htmlInput: { className: 'num', autoComplete: 'off', spellCheck: false } }}
        />
      </Box>
    </Box>
  );
}

function BadgeAnaf({ verificat }: { verificat?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        height: 22,
        borderRadius: `${radius.sm}px`,
        bgcolor: color.successSoft,
        color: color.successText,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <IconCheck size={14} stroke={2} aria-hidden />
      {verificat ? 'Verificat la ANAF' : 'din ANAF'}
    </Box>
  );
}
