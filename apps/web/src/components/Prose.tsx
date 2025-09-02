import sanitizeHtml from 'sanitize-html';

export default function Prose({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeHtml(html || '', {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'a',
      'strong',
      'em',
      'br',
      'blockquote',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
  return (
    <div
      className={`prose prose-slate max-w-none ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
