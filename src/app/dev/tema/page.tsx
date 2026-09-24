'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconBell, IconCamera, IconFridge, IconPlus, IconSparkles, IconUpload } from '@tabler/icons-react';
import Logo from '@/components/brand/Logo';
import StatusBadge from '@/components/ui/StatusBadge';
import { LOT_STATUSES } from '@/lib/domain/status';
import { formatDate, formatKg } from '@/lib/format';
import { color } from '@/theme/tokens';

const ICON = { size: 18, stroke: 1.5 } as const;

const SWATCHES: [string, string][] = [
  ['petrol', color.petrol],
  ['petrol-hover', color.petrolHover],
  ['petrol-soft', color.petrolSoft],
  ['ink', color.ink],
  ['ink-muted', color.inkMuted],
  ['line', color.line],
  ['line-strong', color.lineStrong],
  ['canvas', color.canvas],
  ['success', color.success],
  ['success-text', color.successText],
  ['warning', color.warning],
  ['warning-text', color.warningText],
  ['danger', color.danger],
  ['ai', color.ai],
  ['ai-soft', color.aiSoft],
  ['highlight', color.highlight],
];

const LOTURI = [
  {
    id: 'LOT-2026-0418',
    continut: '4.2 Mașini de gătit · 5.2 Aspiratoare',
    kg: 1240,
    data: '2026-09-24',
    status: 'IN_VERIFICARE',
  },
  {
    id: 'LOT-2026-0415',
    continut: '1.1 Frigidere / congelatoare',
    kg: 860,
    data: '2026-09-23',
    status: 'ACCEPTAT',
  },
  {
    id: 'LOT-2026-0412',
    continut: '2.4 Televizoare ≤ 32″',
    kg: 415,
    data: '2026-09-22',
    status: 'NECESITA_COMPLETARI',
  },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h2">{title}</Typography>
      {children}
    </Box>
  );
}

export default function TemaPage() {
  const [tab, setTab] = useState(0);
  const [bifat, setBifat] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Box
      sx={{
        maxWidth: 1120,
        mx: 'auto',
        p: { xs: 4, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' }, gap: 4 }}
      >
        <Box>
          <Logo />
          <Typography variant="display" component="h1" sx={{ mt: 4, display: 'block' }}>
            Pagină de probă a temei
          </Typography>
          <Typography color="text.secondary">
            Tokenii „Precizie calmă” aplicați pe componentele MUI. Pagina e doar pentru dezvoltare.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<IconPlus {...ICON} />}>
          Lot nou
        </Button>
      </Stack>

      <Section title="Culori">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 4 }}>
          {SWATCHES.map(([name, hex]) => (
            <Box key={name}>
              <Box
                sx={{ height: 48, borderRadius: '8px', bgcolor: hex, border: `1px solid ${color.line}` }}
              />
              <Typography variant="bodyStrong" component="div" sx={{ mt: 2 }}>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hex}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="Tipografie">
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="display">Display 28 · Loturi</Typography>
            <Typography variant="h2">Heading 20 · De rezolvat</Typography>
            <Typography variant="h3">Subheading 16 · Documente cerute</Typography>
            <Typography>Body 14 · Tichetul de cântar indică 1.310 kg net.</Typography>
            <Typography variant="bodyStrong">Body strong 14 · LOT-2026-0418</Typography>
            <Typography variant="caption" color="text.secondary">
              Caption 13 · Încărcat azi, 09:42 · Punct de lucru Chiajna
            </Typography>
            <Typography variant="metric">
              12.480{' '}
              <Typography component="span" color="text.secondary" sx={{ fontSize: 16 }}>
                kg
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Section>

      <Section title="Butoane">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Trimite la verificare
          </Button>
          <Button variant="outlined" startIcon={<IconCamera {...ICON} />}>
            Fotografiază
          </Button>
          <Button variant="outlined" startIcon={<IconUpload {...ICON} />}>
            Încarcă fișier
          </Button>
          <Button variant="outlined" color="error">
            Respinge
          </Button>
          <Button variant="text">Vezi toate loturile</Button>
          <Button variant="contained" disabled>
            Continuă la confirmare
          </Button>
          <Tooltip title="Notificări">
            <IconButton aria-label="Notificări">
              <IconBell {...ICON} />
            </IconButton>
          </Tooltip>
          <Link href="#">Link petrol</Link>
        </Stack>
      </Section>

      <Section title="Câmpuri">
        <Card>
          <CardContent
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}
          >
            <TextField label="Denumire" defaultValue="Hotel Parc Central SRL" />
            <TextField
              label="CUI"
              placeholder="RO 18244571"
              helperText="Verificăm CUI-ul la ANAF când ieși din câmp."
            />
            <TextField
              label="Cantitate (kg)"
              error
              defaultValue="0"
              helperText="Completează cel puțin bucăți sau kg."
            />
          </CardContent>
        </Card>
        <FormControlLabel
          control={<Checkbox checked={bifat} onChange={(e) => setBifat(e.target.checked)} />}
          label="Declar pe propria răspundere că informațiile sunt corecte"
        />
      </Section>

      <Section title="Statusuri lot">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          {LOT_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </Stack>
      </Section>

      <Section title="Carduri și date extrase de AI">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: color.petrolSoft,
                    color: color.petrol,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <IconFridge size={24} stroke={1.5} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Cat. 1 · 6 loturi
                </Typography>
              </Stack>
              <Typography color="text.secondary">Transfer termic</Typography>
              <Typography variant="metric">
                4.860{' '}
                <Typography component="span" color="text.secondary" sx={{ fontSize: 16 }}>
                  kg
                </Typography>
              </Typography>
              <LinearProgress variant="determinate" value={29} aria-label="29% din stocul total" />
              <Typography variant="caption" color="text.secondary" className="num">
                38 buc · 29% din stoc
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3">Tichet de cântar</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dovada greutății la recepție
                  </Typography>
                </Box>
                <StatusBadge tone="warning" label="De verificat" />
              </Stack>
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  bgcolor: color.aiSoft,
                  borderRadius: '8px',
                  px: 4,
                  py: 3,
                }}
              >
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', color: color.ai, flexShrink: 0 }}>
                  <IconSparkles size={16} stroke={1.5} aria-hidden />
                  <Typography variant="caption" sx={{ color: color.ai, fontWeight: 500 }}>
                    Extras de AI
                  </Typography>
                </Stack>
                <Typography variant="body1" className="num">
                  Net 1.310 kg · brut 4.870 kg · tară 3.560 kg
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: color.highlight,
                  border: `2px solid ${color.warning}`,
                  borderRadius: '6px',
                  px: 3,
                  py: 2,
                  fontFamily: 'monospace',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>NET</span>
                <span>1.310 kg</span>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Section>

      <Section title="Tabel">
        <Card>
          <Tabs
            variant="scrollable"
            value={tab}
            onChange={(_, v: number) => setTab(v)}
            sx={{ px: 6, borderBottom: `1px solid ${color.line}` }}
          >
            <Tab label="De verificat · 12" />
            <Tab label="Așteaptă colectorul · 3" />
            <Tab label="Decise azi · 7" />
          </Tabs>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lot</TableCell>
                  <TableCell>Conținut</TableCell>
                  <TableCell align="right">Cantitate</TableCell>
                  <TableCell>Data preluării</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LOTURI.map((l, i) => (
                  <TableRow key={l.id} hover selected={i === 0} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Link href="#">{l.id}</Link>
                    </TableCell>
                    <TableCell>{l.continut}</TableCell>
                    <TableCell align="right">{formatKg(l.kg)}</TableCell>
                    <TableCell className="num">{formatDate(l.data)}</TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Section>
    </Box>
  );
}
