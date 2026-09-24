import 'server-only';
import { mockData } from '@/lib/mock';
import type { Session } from '@/lib/session/types';
import type { DataContext, DataLayer } from './types';

/** Implementarea activă a stratului de date. În Faza B se înlocuiește cu cea Prisma. */
export const data: DataLayer = mockData;

export const contextDin = (session: Session): DataContext => ({
  organizatieId: session.organizatie.id,
  rol: session.rol,
});
