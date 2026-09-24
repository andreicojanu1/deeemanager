/**
 * Tokenii de design „Precizie calmă”.
 * Sursa de adevăr este `design/tokens.json`; testul `tests/unit/tokens.test.ts`
 * verifică faptul că valorile de aici nu au divergat.
 */
export const color = {
  petrol: '#0F4C5C',
  petrolHover: '#0B3C49',
  petrolSoft: '#E3EEF0',
  onPetrol: '#FFFFFF',
  ink: '#0F1A1F',
  inkMuted: '#5B6770',
  line: '#E3E7EA',
  lineStrong: '#C9D0D5',
  canvas: '#F6F7F7',
  surface: '#FFFFFF',
  success: '#1E8E5A',
  successText: '#17724A',
  successSoft: '#E6F4EC',
  warning: '#B7791F',
  warningText: '#8A5A12',
  warningSoft: '#FBF1DF',
  danger: '#C53030',
  dangerSoft: '#FBE9E9',
  ai: '#4F46E5',
  aiSoft: '#EEEDFC',
  highlight: '#FFF3B0',
  /** Culoarea numelui din logo. Se folosește doar în logo. */
  logoText: '#0A2114',
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  pill: 999,
} as const;

export const shadow = {
  overlay: '0 8px 24px rgba(15, 26, 31, 0.12)',
} as const;

export const font = {
  sans: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  logo: 'Montserrat, Inter, system-ui, sans-serif',
} as const;

export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: 400 | 500 | 600;
  letterSpacing?: string;
};

export const type = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: 600, letterSpacing: '-0.01em' },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: 600 },
  subheading: { fontSize: 16, lineHeight: 24, fontWeight: 600 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: 400 },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: 500 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: 400 },
  metric: { fontSize: 28, lineHeight: 32, fontWeight: 600, letterSpacing: '-0.01em' },
} as const satisfies Record<string, TypeStyle>;

/** Durate de animație: doar funcționale, 150–200 ms. */
export const motion = {
  fast: 150,
  base: 200,
  easing: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export const tokens = { color, space, radius, shadow, font, type, motion } as const;
export type Tokens = typeof tokens;
