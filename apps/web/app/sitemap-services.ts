import type { MetadataRoute } from 'next';
import { env } from '@trades/utils';
import { fetchServices, getSiteConfig } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = await getSiteConfig();
  if (!cfg?.local_seo_enabled) return [];
  const base = `https://${env.NEXT_PUBLIC_SITE_HOST}`;
  const services = await fetchServices();
  return services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}
