import { createTheme } from '@mui/material/styles';
import { color, font, motion, radius, shadow, space, tokens, type as t } from './tokens';

const px = (n: number) => `${n}px`;
type TypeCss = { fontSize: string; lineHeight: string; fontWeight: number; letterSpacing?: string };

const typeStyle = (s: (typeof t)[keyof typeof t]): TypeCss => ({
  fontSize: px(s.fontSize),
  lineHeight: px(s.lineHeight),
  fontWeight: s.fontWeight,
  ...('letterSpacing' in s ? { letterSpacing: s.letterSpacing } : {}),
});

const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

/** Ținta minimă de atingere pe ecrane tactile. */
const coarse = '@media (pointer: coarse)';

// Umbra există doar pentru elementele care plutesc (meniuri, modale, toast).
// Cardurile și suprafețele au elevation 0 și bordură.
const shadows = ['none', ...Array<string>(24).fill(shadow.overlay)] as unknown as ReturnType<
  typeof createTheme
>['shadows'];

export const theme = createTheme({
  tokens,
  spacing: 4,
  // 640: tabelele devin carduri; 1024: meniul lateral devine drawer (SPEC-ECRANE §0).
  breakpoints: { values: { xs: 0, sm: 640, md: 1024, lg: 1280, xl: 1440 } },
  shape: { borderRadius: radius.md },
  shadows,
  palette: {
    mode: 'light',
    primary: {
      main: color.petrol,
      dark: color.petrolHover,
      light: color.petrolSoft,
      contrastText: color.onPetrol,
    },
    success: {
      main: color.success,
      dark: color.successText,
      light: color.successSoft,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: color.warning,
      dark: color.warningText,
      light: color.warningSoft,
      contrastText: '#FFFFFF',
    },
    error: {
      main: color.danger,
      dark: color.danger,
      light: color.dangerSoft,
      contrastText: '#FFFFFF',
    },
    info: {
      main: color.petrol,
      dark: color.petrolHover,
      light: color.petrolSoft,
      contrastText: color.onPetrol,
    },
    text: {
      primary: color.ink,
      secondary: color.inkMuted,
      disabled: color.inkMuted,
    },
    background: { default: color.canvas, paper: color.surface },
    divider: color.line,
    action: {
      hover: color.canvas,
      selected: color.petrolSoft,
      focus: color.petrolSoft,
    },
  },
  typography: {
    fontFamily: font.sans,
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    display: typeStyle(t.display),
    metric: { ...typeStyle(t.metric), ...tabular },
    bodyStrong: typeStyle(t.bodyStrong),
    tableHead: { fontSize: '12px', lineHeight: '16px', fontWeight: 500 },
    h1: typeStyle(t.display),
    h2: typeStyle(t.heading),
    h3: typeStyle(t.subheading),
    h4: typeStyle(t.subheading),
    h5: typeStyle(t.bodyStrong),
    h6: typeStyle(t.bodyStrong),
    subtitle1: typeStyle(t.subheading),
    subtitle2: typeStyle(t.bodyStrong),
    body1: typeStyle(t.body),
    body2: typeStyle(t.caption),
    caption: typeStyle(t.caption),
    button: { ...typeStyle(t.bodyStrong), textTransform: 'none' },
    overline: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
  },
  transitions: {
    duration: {
      shortest: motion.fast,
      shorter: motion.fast,
      short: motion.base,
      standard: motion.base,
      complex: motion.base,
      enteringScreen: motion.base,
      leavingScreen: motion.fast,
    },
    easing: {
      easeInOut: motion.easing,
      easeOut: motion.easing,
      easeIn: motion.easing,
      sharp: motion.easing,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: color.canvas,
          color: color.ink,
          WebkitFontSmoothing: 'antialiased',
        },
        a: { color: color.petrol },
        'a:hover': { color: color.petrolHover },
        ':focus-visible': {
          outline: `2px solid ${color.petrol}`,
          outlineOffset: '2px',
        },
        '.num': tabular,
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButtonBase: {
      // Ripple-ul e o animație decorativă; focusul se vede prin inelul petrol.
      defaultProps: { disableRipple: true, disableTouchRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          minHeight: 40,
          paddingInline: px(space[4]),
          gap: px(space[2]),
          [coarse]: { minHeight: 44 },
          '&.Mui-disabled': { opacity: 1 },
        },
        sizeSmall: { minHeight: 32, paddingInline: px(space[3]), [coarse]: { minHeight: 44 } },
        startIcon: { marginLeft: 0, marginRight: 0 },
        endIcon: { marginLeft: 0, marginRight: 0 },
        contained: {
          '&:hover': { backgroundColor: color.petrolHover },
          '&.Mui-disabled': { backgroundColor: color.lineStrong, color: color.surface },
        },
        outlined: ({ ownerState }) =>
          ownerState.color === 'primary' || ownerState.color === undefined
            ? {
                borderColor: color.lineStrong,
                color: color.ink,
                backgroundColor: color.surface,
                '&:hover': { borderColor: color.inkMuted, backgroundColor: color.canvas },
              }
            : { backgroundColor: color.surface, borderColor: color.lineStrong },
        text: { '&:hover': { backgroundColor: color.petrolSoft } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          width: 40,
          height: 40,
          color: color.inkMuted,
          '&:hover': { backgroundColor: color.canvas, color: color.ink },
          [coarse]: { width: 44, height: 44 },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: radius.lg },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderColor: color.line, borderRadius: radius.lg },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: px(space[6]), '&:last-child': { paddingBottom: px(space[6]) } },
      },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: radius.md, border: `1px solid ${color.line}` } },
    },
    MuiPopover: {
      styleOverrides: { paper: { borderRadius: radius.md } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: radius.lg } },
    },
    MuiInputLabel: {
      // Eticheta stă deasupra câmpului, nu flotantă ca în Material 3.
      defaultProps: { shrink: true },
      styleOverrides: {
        // `&&` bate specificitatea regulilor MUI pentru eticheta outlined + shrink.
        root: {
          '&&': { position: 'static', transform: 'none' },
          maxWidth: 'none',
          marginBottom: px(space[2]),
          ...typeStyle(t.caption),
          color: color.inkMuted,
          '&.Mui-focused, &.Mui-error': { color: color.inkMuted },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { ...typeStyle(t.caption), color: color.inkMuted, '&.Mui-focused': { color: color.inkMuted } },
      },
    },
    MuiOutlinedInput: {
      defaultProps: { notched: false },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: color.surface,
          fontSize: px(t.body.fontSize),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: color.lineStrong },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.inkMuted },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: color.petrol,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: color.danger },
        },
        input: {
          height: 20,
          paddingBlock: px(10),
          paddingInline: px(space[3]),
          [coarse]: { paddingBlock: px(12) },
        },
      },
    },
    MuiSelect: {
      // Opțiunea cu valoarea „” („Toate …”) se vede și când nimic nu e ales.
      defaultProps: { displayEmpty: true },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { ...typeStyle(t.caption), marginLeft: 0, marginTop: px(space[1]) },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.sm, fontWeight: 500, fontSize: px(13), height: 24 },
        label: { paddingInline: px(space[2]) },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${color.line}`,
          paddingBlock: px(space[3]),
          paddingInline: px(space[4]),
          height: 48,
          ...typeStyle(t.body),
        },
        head: {
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 500,
          color: color.inkMuted,
          height: 40,
        },
        alignRight: tabular,
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: color.canvas },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: color.petrolSoft },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: color.petrol, height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          ...typeStyle(t.bodyStrong),
          minHeight: 44,
          color: color.inkMuted,
          '&.Mui-selected': { color: color.petrol },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: radius.pill, backgroundColor: color.line },
        bar: { borderRadius: radius.pill },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: color.ink, ...typeStyle(t.caption), borderRadius: radius.sm },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: { root: { backgroundColor: color.line }, rounded: { borderRadius: radius.lg } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: color.line } },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: color.lineStrong,
          '& .MuiSvgIcon-root': { transition: `transform ${motion.fast}ms ${motion.easing}` },
          '&.Mui-checked .MuiSvgIcon-root': { animation: 'deee-check 150ms ease-out' },
          '@keyframes deee-check': { from: { transform: 'scale(0.8)' }, to: { transform: 'scale(1)' } },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { fontWeight: 500 } },
    },
  },
});

export default theme;
