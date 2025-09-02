import { describe, it, expect } from 'vitest';
import sanitizeHtml from 'sanitize-html';

function clean(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 'a'],
    allowedAttributes: { a: ['href', 'rel'] },
  });
}

describe('Prose sanitization', () => {
  it('strips script and preserves paragraphs', () => {
    const raw = '<p>Hello</p><script>alert(1)</script>';
    const out = clean(raw);
    expect(out).toContain('<p>Hello</p>');
    expect(out).not.toContain('<script>');
  });
});
