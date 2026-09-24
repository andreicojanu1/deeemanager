import type { DataContext } from './types';

/**
 * Singurul punct de acces la date operaționale: un colector vede doar rândurile
 * organizației lui; adminul vede tot. Orice citire trece pe aici.
 */
export function vizibilePentru<T extends { organizatieId: string }>(
  ctx: DataContext,
  rows: readonly T[],
): T[] {
  if (ctx.rol === 'ADMIN') return [...rows];
  return rows.filter((r) => r.organizatieId === ctx.organizatieId);
}

export class AccesInterzisError extends Error {
  constructor() {
    super('Acces interzis');
  }
}

export function doarAdmin(ctx: DataContext): void {
  if (ctx.rol !== 'ADMIN') throw new AccesInterzisError();
}
