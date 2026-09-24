'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { IconChevronRight, IconHierarchy2 } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import type { NodArbore } from '@/lib/domain/loturi';
import { formatNumber } from '@/lib/format';
import { color, motion } from '@/theme/tokens';

/**
 * Arborele categorie → subcategorie → cod deșeu (SPEC-ECRANE §4). Totalurile sunt
 * aliniate la dreapta; click pe un cod filtrează lista.
 */
export default function ArboreCategorii({ noduri }: { noduri: NodArbore[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [deschise, setDeschise] = useState<Set<string>>(
    () => new Set(noduri.slice(0, 1).map((n) => n.cheie)),
  );

  const comuta = (cheie: string) =>
    setDeschise((s) => {
      const n = new Set(s);
      if (n.has(cheie)) n.delete(cheie);
      else n.add(cheie);
      return n;
    });

  const filtreaza = (nod: NodArbore) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete('vedere');
    sp.delete('pagina');
    sp.delete('categorie');
    for (const [k, v] of Object.entries(nod.filtru)) sp.set(k, String(v));
    router.push(`${pathname}?${sp.toString()}`);
  };

  if (noduri.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<IconHierarchy2 size={24} stroke={1.5} />}
          message="Niciun lot nu se potrivește filtrelor."
        />
      </Card>
    );
  }

  const coloane = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 96px 72px 64px',
    columnGap: 4,
    alignItems: 'center',
  };

  const Rand = ({ nod, nivel }: { nod: NodArbore; nivel: 0 | 1 | 2 }) => {
    const frunza = nod.copii.length === 0;
    const deschis = deschise.has(nod.cheie);
    return (
      <Box
        component="li"
        role="treeitem"
        aria-expanded={frunza ? undefined : deschis}
        aria-level={nivel + 1}
        sx={{ listStyle: 'none' }}
      >
        <ButtonBase
          onClick={() => (frunza ? filtreaza(nod) : comuta(nod.cheie))}
          aria-label={frunza ? `${nod.eticheta}: arată loturile` : undefined}
          sx={{
            ...coloane,
            width: '100%',
            textAlign: 'left',
            minHeight: 48,
            px: { xs: 4, sm: 6 },
            pl: { xs: 4 + nivel * 5, sm: 6 + nivel * 7 },
            borderTop: `1px solid ${color.line}`,
            '&:hover': { bgcolor: color.canvas },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            {frunza ? (
              <Box sx={{ width: 18, flexShrink: 0 }} />
            ) : (
              <IconChevronRight
                size={18}
                stroke={1.5}
                aria-hidden
                style={{
                  flexShrink: 0,
                  color: color.inkMuted,
                  transform: deschis ? 'rotate(90deg)' : 'none',
                  transition: `transform ${motion.base}ms ${motion.easing}`,
                }}
              />
            )}
            <Typography
              variant={nivel === 0 ? 'bodyStrong' : 'body1'}
              sx={{
                color: frunza ? color.petrol : color.ink,
                fontWeight: frunza ? 500 : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nod.eticheta}
            </Typography>
          </Box>
          <Typography
            variant={nivel === 0 ? 'bodyStrong' : 'body1'}
            className="num"
            sx={{ textAlign: 'right' }}
          >
            {formatNumber(nod.kg)}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="num" sx={{ textAlign: 'right' }}>
            {formatNumber(nod.buc)}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="num" sx={{ textAlign: 'right' }}>
            {nod.loturi}
          </Typography>
        </ButtonBase>
        {!frunza ? (
          <Collapse in={deschis} timeout={motion.base} unmountOnExit>
            <Box component="ul" role="group" sx={{ m: 0, p: 0 }}>
              {nod.copii.map((c) => (
                <Rand key={c.cheie} nod={c} nivel={(nivel + 1) as 1 | 2} />
              ))}
            </Box>
          </Collapse>
        ) : null}
      </Box>
    );
  };

  return (
    <Card>
      <Box sx={{ ...coloane, px: { xs: 4, sm: 6 }, py: 3 }} aria-hidden>
        {['Categorie / subcategorie / cod', 'Kg', 'Buc', 'Loturi'].map((h, i) => (
          <Typography
            key={h}
            variant="tableHead"
            color="text.secondary"
            sx={{ textAlign: i ? 'right' : 'left' }}
          >
            {h}
          </Typography>
        ))}
      </Box>
      <Box component="ul" role="tree" aria-label="Loturi pe categorii" sx={{ m: 0, p: 0 }}>
        {noduri.map((n) => (
          <Rand key={n.cheie} nod={n} nivel={0} />
        ))}
      </Box>
    </Card>
  );
}
