'use client';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { color, radius } from '@/theme/tokens';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
  /** Lățime CSS opțională (ex. '160px'). */
  width?: string;
  /** Pe mobil: coloana apare ca titlu al cardului. */
  primary?: boolean;
  /** Pe mobil: coloana apare în colțul dreapta-sus al cardului (ex. statusul). */
  aside?: boolean;
  /** Pe mobil: coloana nu apare. */
  hideOnMobile?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Tot rândul e clicabil și duce la detaliu. */
  rowHref?: (row: T) => string | undefined;
  /** Eticheta accesibilă a tabelului. */
  label: string;
};

/**
 * Tabel pe ecrane late, listă de carduri sub 640 px (SPEC-ECRANE §0).
 * Link-ul real e pe coloana principală; clickul pe rând îl urmează.
 */
export default function ResponsiveTable<T>({ columns, rows, rowKey, rowHref, label }: Props<T>) {
  const router = useRouter();
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const aside = columns.find((c) => c.aside);
  const rest = columns.filter((c) => c !== primary && c !== aside && !c.hideOnMobile);

  return (
    <>
      <Box
        sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <Table aria-label={label}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align} sx={{ width: c.width }}>
                  {c.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <TableRow
                  key={rowKey(row)}
                  hover={Boolean(href)}
                  onClick={href ? () => router.push(href) : undefined}
                  sx={{ cursor: href ? 'pointer' : 'default', '&:last-child td': { borderBottom: 0 } }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align}>
                      {c === primary && href ? (
                        <Box
                          component={NextLink}
                          href={href}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: color.petrol,
                            fontWeight: 500,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {c.cell(row)}
                        </Box>
                      ) : (
                        c.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Box
        component="ul"
        aria-label={label}
        sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', listStyle: 'none', m: 0, p: 0 }}
      >
        {rows.map((row) => {
          const href = rowHref?.(row);
          const content = (
            <>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}
              >
                <Typography variant="bodyStrong" sx={{ color: href ? color.petrol : color.ink }}>
                  {primary.cell(row)}
                </Typography>
                {aside ? aside.cell(row) : null}
              </Box>
              <Box
                component="dl"
                sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 3, rowGap: 1 }}
              >
                {rest.map((c) => (
                  <Box key={c.key} sx={{ display: 'contents' }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {c.header}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body1"
                      sx={{ m: 0, textAlign: 'right' }}
                      className="num"
                    >
                      {c.cell(row)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          );
          const sx = {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            px: 4,
            py: 4,
            borderTop: `1px solid ${color.line}`,
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: `${radius.sm}px`,
          } as const;
          return (
            <li key={rowKey(row)}>
              {href ? (
                <Box component={NextLink} href={href} sx={{ ...sx, '&:active': { bgcolor: color.canvas } }}>
                  {content}
                </Box>
              ) : (
                <Box sx={sx}>{content}</Box>
              )}
            </li>
          );
        })}
      </Box>
    </>
  );
}
