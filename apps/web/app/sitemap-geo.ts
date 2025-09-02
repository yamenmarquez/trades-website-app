import type { MetadataRoute } from 'next';
import { env } from '@trades/utils';
import { fetchCoverage, getSiteConfig } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = await getSiteConfig();
  if (!cfg?.local_seo_enabled) return [];
  const base = `https://${env.NEXT_PUBLIC_SITE_HOST}`;
  const cov = await fetchCoverage({ ready: true });
  return cov.map((c) => ({
    url: `${base}/services/${c.service.slug}/${c.geo.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
