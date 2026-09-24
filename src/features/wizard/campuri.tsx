'use client';

import { useState } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { mascheaza } from '@/lib/domain/identificatori';
import { formatNumber } from '@/lib/format';

/** „1.234,5” sau „1234.5” → 1234.5; null pentru gol sau invalid. */
export function parseNumarRo(s: string): number | null {
  const t = s.trim().replace(/\s/g, '');
  if (!t) return null;
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = Number(normal);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

type NumericProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  valoare: number | null;
  onValoare: (v: number | null) => void;
  intreg?: boolean;
};

/** Câmp numeric în format românesc; textul se păstrează cât scrii și se normalizează la ieșire. */
export function CampNumeric({ valoare, onValoare, intreg, onBlur, onFocus, ...rest }: NumericProps) {
  const [text, setText] = useState<string | null>(null);
  const afisat = text ?? (valoare === null ? '' : formatNumber(valoare));
  return (
    <TextField
      {...rest}
      value={afisat}
      onFocus={(e) => {
        setText(valoare === null ? '' : String(valoare).replace('.', ','));
        onFocus?.(e);
      }}
      onChange={(e) => {
        setText(e.target.value);
        onValoare(parseNumarRo(e.target.value));
      }}
      onBlur={(e) => {
        setText(null);
        onBlur?.(e);
      }}
      slotProps={{
        ...rest.slotProps,
        htmlInput: {
          inputMode: intreg ? 'numeric' : 'decimal',
          className: 'num',
          style: { textAlign: 'right' },
          ...((rest.slotProps?.htmlInput as object) ?? {}),
        },
      }}
    />
  );
}

type SensibilProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  valoare: string;
  onValoare: (v: string) => void;
};

/** Date personale (CNP, act de identitate): afișate mascat „•••• 1234” după ce ieși din câmp. */
export function CampSensibil({ valoare, onValoare, onBlur, onFocus, ...rest }: SensibilProps) {
  const [focus, setFocus] = useState(false);
  return (
    <TextField
      {...rest}
      value={focus ? valoare : mascheaza(valoare)}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      onChange={(e) => onValoare(e.target.value)}
      slotProps={{
        ...rest.slotProps,
        htmlInput: { autoComplete: 'off', spellCheck: false, className: 'num' },
      }}
    />
  );
}
