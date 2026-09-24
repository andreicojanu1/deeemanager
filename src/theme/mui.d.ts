import type { CSSProperties } from 'react';
import type { Tokens } from './tokens';

declare module '@mui/material/styles' {
  interface Theme {
    tokens: Tokens;
  }
  interface ThemeOptions {
    tokens?: Tokens;
  }
  interface TypographyVariants {
    display: CSSProperties;
    metric: CSSProperties;
    bodyStrong: CSSProperties;
    tableHead: CSSProperties;
  }
  interface TypographyVariantsOptions {
    display?: CSSProperties;
    metric?: CSSProperties;
    bodyStrong?: CSSProperties;
    tableHead?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
    metric: true;
    bodyStrong: true;
    tableHead: true;
  }
}
