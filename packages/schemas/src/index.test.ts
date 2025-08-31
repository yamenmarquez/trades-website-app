import { describe, it, expect } from 'vitest';
import { ThemeSchema, ServiceSchema, ProjectSchema, TestimonialSchema } from './index';

describe('schemas', () => {
  it('parses theme', () => {
    const t = ThemeSchema.parse({
      id: 1,
      name: 'Default',
      brand_color: '#123456',
      accent: '#abcdef',
      neutral: '#111111',
    });
    expect(t.name).toBe('Default');
  });
  it('parses service', () => {
    const s = ServiceSchema.parse({ id: 1, name: 'A', slug: 'a' });
    expect(s.slug).toBe('a');
  });
  it('parses project', () => {
    const p = ProjectSchema.parse({ id: 1, title: 'P', slug: 'p', images: [], url: null });
    expect(p.title).toBe('P');
  });
  it('parses testimonial', () => {
    const t = TestimonialSchema.parse({ id: 1, name: 'N', rating: 5, text: 'ok' });
    expect(t.rating).toBe(5);
  });
});
