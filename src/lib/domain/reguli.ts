import { z } from 'zod';
import type { Severitate } from './raport';

/**
 * Configurarea unei reguli de verificare, editabilă din /admin/taxonomie.
 * TODO(validare-client): regulamentul de verificare nu e încă validat; valorile implicite
 * sunt propuneri.
 */
export type ConfigRegula = {
  cod: string;
  nume: string;
  activa: boolean;
  severitate: Severitate;
  /** Toleranța relativă (0,01 = ±1%); lipsește la regulile fără prag numeric. */
  toleranta?: number;
};

export const ETICHETA_SEVERITATE: Record<Severitate, string> = {
  BLOCANT: 'Blocant',
  AVERTISMENT: 'Avertisment',
};

export const ModificareRegulaSchema = z.object({
  activa: z.boolean().optional(),
  severitate: z.enum(['BLOCANT', 'AVERTISMENT']).optional(),
  toleranta: z
    .number()
    .min(0, 'Toleranța nu poate fi negativă.')
    .max(1, 'Toleranța e un procent între 0 și 100.')
    .optional(),
});

export type ModificareRegula = z.infer<typeof ModificareRegulaSchema>;
