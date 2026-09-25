'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { IconUsers } from '@tabler/icons-react';
import AiExtracted from '@/components/ui/AiExtracted';
import EmptyState from '@/components/ui/EmptyState';
import ResponsiveTable, { type Column } from '@/components/ui/ResponsiveTable';
import StatusBadge from '@/components/ui/StatusBadge';
import type { DetaliuColector } from '@/lib/data/types';
import { ETICHETA_ROL_UTILIZATOR, type Utilizator } from '@/lib/domain/colectori';
import { grupeazaIban } from '@/lib/domain/onboarding';
import { formatDate, formatTime } from '@/lib/format';
import { color, radius } from '@/theme/tokens';

/** Datele firmei și autorizația de mediu: aceleași în /admin/colectori/[id] și /organizatie. */
// ── Date ──────────────────────────────────────────────────────────────────────────

export function Rand({ eticheta, children }: { eticheta: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '200px minmax(0, 1fr)' },
        gap: { xs: 0.5, sm: 4 },
        py: 3,
        borderTop: `1px solid ${color.line}`,
      }}
    >
      <Typography color="text.secondary">{eticheta}</Typography>
      <Typography component="div" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {children || '—'}
      </Typography>
    </Box>
  );
}

export function DateColector({
  colector,
  perspectiva = 'admin',
}: {
  colector: DetaliuColector;
  perspectiva?: 'admin' | 'colector';
}) {
  const { firma, autorizatie } = colector.onboarding;
  return (
    <Box
      sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}
    >
      <Card component="section" aria-labelledby="firma-titlu">
        <CardContent>
          <Typography id="firma-titlu" variant="h3" component="h2" sx={{ mb: 3 }}>
            Firma
          </Typography>
          <Rand eticheta="Denumire">{firma.denumire || colector.rand.denumire}</Rand>
          <Rand eticheta="CUI">
            <span className="num">{firma.cui || colector.rand.cui}</span>
            {firma.cuiVerificatAnaf ? (
              <Box component="span" sx={{ ml: 2 }}>
                <StatusBadge tone="success" label="Verificat la ANAF" />
              </Box>
            ) : null}
          </Rand>
          <Rand eticheta="Adresa sediului">{firma.adresaSediu}</Rand>
          <Rand eticheta="Punct de lucru">{firma.punctLucru}</Rand>
          <Rand eticheta="Bancă">{firma.banca}</Rand>
          <Rand eticheta="IBAN">
            <span className="num">{firma.iban ? grupeazaIban(firma.iban) : ''}</span>
          </Rand>
          <Rand eticheta="Înregistrat la">{formatDate(colector.rand.inregistratLa)}</Rand>
        </CardContent>
      </Card>
      <Card component="section" aria-labelledby="autorizatie-titlu">
        <CardContent>
          <Typography id="autorizatie-titlu" variant="h3" component="h2" sx={{ mb: 3 }}>
            Autorizația de mediu
          </Typography>
          {autorizatie ? (
            <>
              <Rand eticheta="Număr">{autorizatie.numar}</Rand>
              <Rand eticheta="Emitent">{autorizatie.emitent}</Rand>
              <Rand eticheta="Valabilă până la">{formatDate(autorizatie.valabilPana)}</Rand>
              <Rand eticheta="Coduri autorizate">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {autorizatie.coduri.map((c) => (
                    <Box
                      key={c}
                      component="span"
                      className="num"
                      sx={{
                        px: 2,
                        py: 0.5,
                        border: `1px solid ${color.line}`,
                        borderRadius: `${radius.sm}px`,
                        fontSize: 13,
                      }}
                    >
                      {c}
                    </Box>
                  ))}
                </Box>
              </Rand>
              <Box sx={{ mt: 3 }}>
                <AiExtracted>
                  {perspectiva === 'colector'
                    ? autorizatie.corectat
                      ? 'Date extrase din autorizație și corectate de tine.'
                      : 'Date extrase din autorizație și confirmate de tine.'
                    : autorizatie.confirmat
                      ? autorizatie.corectat
                        ? 'Datele au fost corectate de colector după extragere. Compară-le cu documentul.'
                        : 'Datele extrase au fost confirmate de colector.'
                      : 'Colectorul nu a confirmat încă datele extrase.'}
                </AiExtracted>
              </Box>
            </>
          ) : (
            <Typography color="text.secondary">Autorizația nu a fost încărcată.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Utilizatori ───────────────────────────────────────────────────────────────────

const coloaneUtilizatori: Column<Utilizator>[] = [
  { key: 'nume', header: 'Nume', cell: (u) => u.nume, primary: true },
  { key: 'email', header: 'Email', cell: (u) => u.email },
  { key: 'rol', header: 'Rol', cell: (u) => ETICHETA_ROL_UTILIZATOR[u.rol], width: '180px' },
  {
    key: 'ultima',
    header: 'Ultima autentificare',
    cell: (u) =>
      u.ultimaAutentificare ? (
        `${formatDate(u.ultimaAutentificare)}, ${formatTime(u.ultimaAutentificare)}`
      ) : (
        <StatusBadge tone="neutral" label="Invitație trimisă" />
      ),
    width: '200px',
  },
];

export function UtilizatoriFirma({ utilizatori }: { utilizatori: Utilizator[] }) {
  if (!utilizatori.length) {
    return (
      <Card>
        <EmptyState icon={<IconUsers size={24} stroke={1.5} />} message="Firma nu are încă utilizatori." />
      </Card>
    );
  }
  return (
    <Card>
      <ResponsiveTable
        label="Utilizatori"
        columns={coloaneUtilizatori}
        rows={utilizatori}
        rowKey={(u) => u.id}
      />
    </Card>
  );
}
