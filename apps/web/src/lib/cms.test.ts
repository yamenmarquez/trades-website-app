import { describe, it, expect } from 'vitest';
import { ThemeSchema } from '@trades/schemas';

describe('schemas in web', () => {
  it('ThemeSchema parses minimal theme', () => {
    const t = ThemeSchema.parse({
      name: 'T',
      brand_color: '#000',
      accent: '#111',
      neutral: '#222',
    });
    expect(t.name).toBe('T');
  });
});
