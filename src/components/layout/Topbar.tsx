'use client';

import { useEffect, useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { IconBell, IconChevronRight, IconLogout, IconMenu2, IconSearch, IconUser } from '@tabler/icons-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { delogare } from '@/lib/session/actions';
import type { Session } from '@/lib/session/types';
import { color, radius } from '@/theme/tokens';
import { breadcrumbsFor } from './nav';

export const TOPBAR_HEIGHT = 64;

type Props = { session: Session; onOpenMenu: () => void };

export default function Topbar({ session, onOpenMenu }: Props) {
  const pathname = usePathname();
  const crumbs = breadcrumbsFor(pathname);
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // „/” mută focusul în căutare, dacă nu scrii deja într-un câmp.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: TOPBAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        px: { xs: 4, md: 8 },
        bgcolor: color.surface,
        borderBottom: `1px solid ${color.line}`,
      }}
    >
      <IconButton aria-label="Deschide meniul" onClick={onOpenMenu} sx={{ display: { md: 'none' }, ml: -2 }}>
        <IconMenu2 size={20} stroke={1.5} />
      </IconButton>

      <Box component="nav" aria-label="Breadcrumb" sx={{ minWidth: 0, flex: 1 }}>
        <Box
          component="ol"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}
        >
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Box
                component="li"
                key={c.href}
                sx={{
                  display: { xs: last ? 'flex' : 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 2,
                  minWidth: 0,
                  fontSize: 14,
                }}
              >
                {last ? (
                  <Box
                    component="span"
                    aria-current="page"
                    sx={{
                      fontWeight: 500,
                      color: color.ink,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.label}
                  </Box>
                ) : (
                  <>
                    <Box
                      component={NextLink}
                      href={c.href}
                      sx={{ color: color.inkMuted, textDecoration: 'none', '&:hover': { color: color.ink } }}
                    >
                      {c.label}
                    </Box>
                    <IconChevronRight size={14} stroke={1.5} color={color.inkMuted} aria-hidden />
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        role="search"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 2,
          width: 280,
          height: 40,
          px: 3,
          border: `1px solid ${color.lineStrong}`,
          borderRadius: `${radius.md}px`,
          color: color.inkMuted,
          '&:focus-within': { borderColor: color.petrol, boxShadow: `inset 0 0 0 1px ${color.petrol}` },
        }}
      >
        <IconSearch size={18} stroke={1.5} aria-hidden />
        <InputBase
          inputRef={searchRef}
          placeholder="Caută lot, cod, document..."
          inputProps={{ 'aria-label': 'Caută lot, cod de deșeu sau document (scurtătură: /)' }}
          sx={{ flex: 1, fontSize: 14, '& input:focus-visible': { outline: 'none' } }}
        />
        <Box
          component="kbd"
          aria-hidden
          sx={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: color.inkMuted,
            border: `1px solid ${color.line}`,
            borderRadius: '4px',
            px: 1.5,
            lineHeight: '18px',
          }}
        >
          /
        </Box>
      </Box>

      <IconButton
        aria-label="Caută"
        sx={{ display: { sm: 'none' } }}
        onClick={() => searchRef.current?.focus()}
      >
        <IconSearch size={20} stroke={1.5} />
      </IconButton>

      <IconButton aria-label="Notificări" sx={{ border: `1px solid ${color.line}` }}>
        <IconBell size={18} stroke={1.5} />
      </IconButton>

      <ButtonBase
        aria-label={`Contul tău: ${session.utilizator.nume}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(menuAnchor)}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{ borderRadius: '50%' }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: color.petrolSoft,
            color: color.petrol,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {session.utilizator.initiale}
        </Avatar>
      </ButtonBase>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 2, minWidth: 240 } } }}
      >
        <Box sx={{ px: 4, py: 2 }}>
          <Typography variant="bodyStrong" component="div">
            {session.utilizator.nume}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {session.utilizator.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={NextLink} href="/cont" onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <IconUser size={18} stroke={1.5} />
          </ListItemIcon>
          Cont
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            void delogare();
          }}
        >
          <ListItemIcon>
            <IconLogout size={18} stroke={1.5} />
          </ListItemIcon>
          Delogare
        </MenuItem>
      </Menu>
    </Box>
  );
}
