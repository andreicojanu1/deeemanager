'use client';

import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import type { Session } from '@/lib/session/types';
import { color } from '@/theme/tokens';
import type { NavItem } from './nav';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';

type Props = { session: Session; nav: NavItem[]; children: ReactNode };

/** Meniu lateral 248 px (drawer sub 1024 px), bară superioară 64 px, conținut pe canvas. */
export default function AppShell({ session, nav, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: color.canvas }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${color.line}`,
          bgcolor: color.surface,
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, height: '100dvh' }}>
          <Sidebar items={nav} session={session} />
        </Box>
      </Box>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: { md: 'none' } }}
        slotProps={{ paper: { sx: { borderRadius: 0 } } }}
      >
        <Sidebar items={nav} session={session} onNavigate={() => setOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar session={session} onOpenMenu={() => setOpen(true)} />
        <Box
          component="main"
          id="continut"
          sx={{
            flex: 1,
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
