import type { MetadataRoute } from 'next';
import { env } from '@trades/utils';

export default function robots(): MetadataRoute.Robots {
  const base = `https://${env.NEXT_PUBLIC_SITE_HOST}`;
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  };
}
