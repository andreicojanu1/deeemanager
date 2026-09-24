'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { IconCircleCheck } from '@tabler/icons-react';
import { color, radius, shadow } from '@/theme/tokens';

type ToastApi = { arata: (mesaj: string) => void };

const ToastContext = createContext<ToastApi>({ arata: () => {} });

export const useToast = () => useContext(ToastContext);

/** Toast jos-dreapta, 4 s, pentru confirmări (SPEC-ECRANE §0). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [mesaj, setMesaj] = useState<{ text: string; key: number } | null>(null);
  const arata = useCallback((text: string) => setMesaj({ text, key: Date.now() }), []);

  return (
    <ToastContext.Provider value={{ arata }}>
      {children}
      <Snackbar
        key={mesaj?.key}
        open={Boolean(mesaj)}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== 'clickaway' && setMesaj(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          role="status"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: color.ink,
            color: color.surface,
            borderRadius: `${radius.md}px`,
            boxShadow: shadow.overlay,
            px: 4,
            py: 3,
            fontSize: 14,
            maxWidth: 400,
          }}
        >
          <IconCircleCheck size={18} stroke={1.5} color={color.successSoft} aria-hidden />
          {mesaj?.text}
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  );
}
