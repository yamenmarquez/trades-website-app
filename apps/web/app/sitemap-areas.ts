import type { MetadataRoute } from 'next';

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:8000';
const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function fetchAreas(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/areas/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (data.results ?? []);
    return arr.map((a: { slug: string }) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await fetchAreas();
  return [
    { url: `${BASE}/areas`, changeFrequency: 'weekly', priority: 0.6 },
    ...items.map((a) => ({
      url: `${BASE}/areas/${a.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
