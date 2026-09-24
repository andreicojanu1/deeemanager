'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconFile } from '@tabler/icons-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  DESTINATII,
  PROVENIENTE,
  STARI_LINIE,
  TIPURI_SURSA,
  kgAcoperitSurse,
  progresDocumente,
  totalBucCiorna,
  totalKgCiorna,
} from '@/lib/domain/ciorna';
import { ETICHETA_GRUP } from '@/lib/domain/documente-cerute';
import { mascheaza } from '@/lib/domain/identificatori';
import { formatDate, formatNumber } from '@/lib/format';
import { color, radius } from '@/theme/tokens';
import { useWizard } from './context';

/** Rezumat read-only și declarația pe propria răspundere (SPEC-ECRANE §5, pasul 3). */
export default function Pas3Confirmare() {
  const { ciorna, actualizeaza, validare } = useWizard();
  const elemente = progresDocumente(ciorna);
  const grupuri = [...new Set(elemente.map((e) => e.grup))];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Card component="section" aria-labelledby="c-informatii">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography id="c-informatii" variant="h3" component="h2">
            Informații
          </Typography>
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
            }}
          >
            <Camp
              eticheta="Data preluării"
              valoare={ciorna.dataPreluarii ? formatDate(ciorna.dataPreluarii) : '—'}
            />
            <Camp eticheta="Punct de lucru" valoare={ciorna.punctLucru || '—'} />
            <Camp eticheta="Destinație" valoare={ciorna.destinatie ? DESTINATII[ciorna.destinatie] : '—'} />
            <Camp
              eticheta="Proveniență"
              valoare={ciorna.provenienta ? PROVENIENTE[ciorna.provenienta] : '—'}
            />
          </Box>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="c-linii">
        <Typography id="c-linii" variant="h3" component="h2" sx={{ px: 6, pt: 5, pb: 3 }}>
          Linii de lot
        </Typography>
        <Box sx={{ overflowX: 'auto' }} tabIndex={0} role="region" aria-label="Linii de lot">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subcategorie</TableCell>
                <TableCell>Cod deșeu</TableCell>
                <TableCell>Stare</TableCell>
                <TableCell align="right">Buc</TableCell>
                <TableCell align="right">Kg</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ciorna.linii.map((l) => (
                <TableRow key={l.cheie}>
                  <TableCell>
                    {l.subcategorieCod} {validare.subcategorie(l.subcategorieCod)?.denumire}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <span className="num">{l.codDeseu}</span>
                      {l.codDeseu.endsWith('*') ? <StatusBadge tone="warning" label="Periculos" /> : null}
                    </Box>
                  </TableCell>
                  <TableCell>{STARI_LINIE[l.stare]}</TableCell>
                  <TableCell align="right">{l.buc === null ? '—' : formatNumber(l.buc)}</TableCell>
                  <TableCell align="right">{l.kg === null ? '—' : formatNumber(l.kg)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ '& td': { borderBottom: 0, fontWeight: 600 } }}>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell align="right">{formatNumber(totalBucCiorna(ciorna))}</TableCell>
                <TableCell align="right">{formatNumber(totalKgCiorna(ciorna))}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Card component="section" aria-labelledby="c-surse">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography id="c-surse" variant="h3" component="h2">
            Surse
          </Typography>
          {ciorna.surse.map((s, i) => (
            <Box
              key={s.cheie}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 4,
                flexWrap: 'wrap',
                py: 2,
                borderTop: i ? `1px solid ${color.line}` : 'none',
              }}
            >
              <Box>
                <Typography variant="bodyStrong" component="p">
                  {s.denumire}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="num">
                  {TIPURI_SURSA[s.tip]} ·{' '}
                  {s.tip === 'PERSOANA_FIZICA' ? `CNP ${mascheaza(s.cnp)}` : `CUI ${s.cui}`} ·{' '}
                  {s.adresaRidicare}
                </Typography>
              </Box>
              <Typography variant="bodyStrong" className="num">
                {formatNumber(s.kg ?? 0)} kg
              </Typography>
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary" className="num">
            Sursele acoperă {formatNumber(kgAcoperitSurse(ciorna))} kg din{' '}
            {formatNumber(totalKgCiorna(ciorna))} kg declarate.
          </Typography>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="c-fisiere">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography id="c-fisiere" variant="h3" component="h2">
            Fișiere
          </Typography>
          {grupuri.map((g) => (
            <Box key={g}>
              <Typography variant="overline" color="text.secondary" component="h3">
                {ETICHETA_GRUP[g]}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {elemente
                  .filter((e) => e.grup === g)
                  .map((e) => (
                    <Box
                      component="li"
                      key={e.cheie}
                      sx={{ display: 'flex', gap: 3, alignItems: 'center', py: 1.5 }}
                    >
                      <IconFile size={16} stroke={1.5} color={color.inkMuted} aria-hidden />
                      <Typography sx={{ flex: 1 }}>{e.denumire}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                        {e.detaliu}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box
        sx={{
          bgcolor: color.surface,
          border: `1px solid ${ciorna.declaratie ? color.line : color.lineStrong}`,
          borderRadius: `${radius.lg}px`,
          p: { xs: 4, sm: 6 },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              id="declaratie"
              checked={ciorna.declaratie}
              onChange={(e) => actualizeaza((d) => void (d.declaratie = e.target.checked))}
              sx={{ p: 2.5 }}
              slotProps={{ input: { 'aria-describedby': 'declaratie-ajutor' } }}
            />
          }
          label={
            <Typography variant="bodyStrong">
              Declar pe propria răspundere că informațiile sunt corecte
            </Typography>
          }
        />
        <Typography
          id="declaratie-ajutor"
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ ml: { xs: 0, sm: 11 } }}
        >
          După trimitere, lotul intră în verificare și nu mai poate fi modificat până la decizia
          administratorului.
        </Typography>
      </Box>
    </Box>
  );
}

function Camp({ eticheta, valoare }: { eticheta: string; valoare: string }) {
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
