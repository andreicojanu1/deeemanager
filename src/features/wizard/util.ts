import { formatNumber } from '@/lib/format';

/** 3.355.443 → „3,2 MB”. */
export function marimeFisier(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${formatNumber(Math.round((bytes / 1024 / 1024) * 10) / 10)} MB`;
  return `${formatNumber(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

/** „acum câteva secunde”, „acum 25 de secunde”, „acum 3 minute”. */
export function acumRelativ(de: Date, acum: Date): string {
  const s = Math.max(0, Math.round((acum.getTime() - de.getTime()) / 1000));
  if (s < 5) return 'acum câteva secunde';
  if (s < 60) return `acum ${s} ${s < 20 ? 'secunde' : 'de secunde'}`;
  const m = Math.round(s / 60);
  if (m === 1) return 'acum un minut';
  return `acum ${m} ${m < 20 ? 'minute' : 'de minute'}`;
}
