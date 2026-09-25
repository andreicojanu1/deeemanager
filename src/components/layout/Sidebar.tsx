'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  IconBook2,
  IconBox,
  IconBuilding,
  IconChecklist,
  IconHierarchy2,
  IconHome,
  IconShieldCheck,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import type { Session } from '@/lib/session/types';
import { color, radius } from '@/theme/tokens';
import { isActive, type NavIcon, type NavItem } from './nav';

const ICONS: Record<NavIcon, Icon> = {
  panou: IconHome,
  loturi: IconBox,
  organizatie: IconBuilding,
  verificari: IconChecklist,
  colectori: IconUsers,
  taxonomie: IconHierarchy2,
  activare: IconShieldCheck,
  documentatie: IconBook2,
};

export const SIDEBAR_WIDTH = 248;

type Props = { items: NavItem[]; session: Session; onNavigate?: () => void };

export default function Sidebar({ items, session, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      aria-label="Meniu principal"
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        px: 4,
        py: 5,
        bgcolor: color.surface,
      }}
    >
      <Box sx={{ px: 2 }}>
        <Logo />
      </Box>

      <Lista items={items.filter((i) => !i.jos)} pathname={pathname} onNavigate={onNavigate} />

      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Documentația stă jos, deasupra cardului organizației. */}
        <Lista items={items.filter((i) => i.jos)} pathname={pathname} onNavigate={onNavigate} />
        <Box
          sx={{
            border: `1px solid ${color.line}`,
            borderRadius: `${radius.lg}px`,
            px: 4,
            py: 3,
          }}
        >
          <Typography variant="bodyStrong" component="div">
            {session.organizatie.denumire}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {session.organizatie.eticheta}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Lista({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  if (!items.length) return null;
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      {items.map((item) => {
        const active = isActive(item, pathname);
        const Icon = ICONS[item.icon];
        return (
          <li key={item.href}>
            <Box
              component={NextLink}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                height: 40,
                px: 3,
                borderRadius: `${radius.md}px`,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                textDecoration: 'none',
                color: active ? color.petrol : color.inkMuted,
                bgcolor: active ? color.petrolSoft : 'transparent',
                transition: 'background-color 150ms ease-out, color 150ms ease-out',
                '&:hover': {
                  bgcolor: active ? color.petrolSoft : color.canvas,
                  color: active ? color.petrol : color.ink,
                },
                '@media (pointer: coarse)': { height: 44 },
              }}
            >
              <Icon size={18} stroke={1.5} aria-hidden style={{ flexShrink: 0 }} />
              <Box component="span" sx={{ flex: 1 }}>
                {item.label}
              </Box>
              {item.badge ? (
                <Box
                  component="span"
                  aria-label={`${item.badge} în coadă`}
                  className="num"
                  sx={{
                    minWidth: 24,
                    height: 20,
                    px: 1.5,
                    borderRadius: `${radius.sm}px`,
                    bgcolor: active ? color.petrol : color.petrolSoft,
                    color: active ? color.onPetrol : color.petrol,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {item.badge}
                </Box>
              ) : null}
            </Box>
          </li>
        );
      })}
    </Box>
  );
}
