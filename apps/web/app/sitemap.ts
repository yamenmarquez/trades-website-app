import type { MetadataRoute } from 'next';
import { env } from '@trades/utils';
import { fetchProjects } from '@/lib/projects';
import { fetchServices } from '@/lib/cms';
import type { Project, Service } from '@trades/schemas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${env.NEXT_PUBLIC_SITE_HOST}`;

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/portfolio`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const [services, projects] = await Promise.all([fetchServices(), fetchProjects()]);
  const dynServices = (services as Service[]).map((s: Service) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const dynProjects = (projects as Project[]).map((p: Project) => ({
    url: `${base}/portfolio/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...statics, ...dynServices, ...dynProjects];
}
