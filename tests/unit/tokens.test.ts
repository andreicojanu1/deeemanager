import { describe, expect, it } from 'vitest';
import raw from '../../design/tokens.json';
import { color, radius, space, type } from '@/theme/tokens';

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

describe('tokens.ts urmează design/tokens.json', () => {
  it('culorile', () => {
    for (const tk of raw.color.tokens) {
      expect(color[camel(tk.name) as keyof typeof color], tk.name).toBe(tk.value);
    }
  });

  it('spațierea', () => {
    for (const tk of raw.spacing.tokens) {
      const key = Number(tk.name.replace('space-', '')) as keyof typeof space;
      expect(`${space[key]}px`, tk.name).toBe(tk.value);
    }
  });

  it('razele', () => {
    for (const tk of raw.radius.tokens) {
      const key = tk.name.replace('radius-', '') as keyof typeof radius;
      expect(`${radius[key]}px`, tk.name).toBe(tk.value);
    }
  });

  it('stilurile de text', () => {
    for (const s of raw.type.groups[0].styles) {
      const key = camel(s.name) as keyof typeof type;
      expect(`${type[key].fontSize}px`, s.name).toBe(s.fontSize);
      expect(`${type[key].lineHeight}px`, s.name).toBe(s.lineHeight);
      expect(type[key].fontWeight, s.name).toBe(s.fontWeight);
    }
  });
});
