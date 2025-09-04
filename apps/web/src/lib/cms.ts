import { env } from '@trades/utils';
export const CMS_URL = env.CMS_BASE_URL;
import {
  ThemeSchema,
  ServiceSchema,
  ProjectSchema,
  ThemesResponseSchema,
  ServicesResponseSchema,
  ProjectsResponseSchema,
  type Theme,
  type Service,
  type Project,
} from '@trades/schemas';

const API_BASE = new URL('/api/', CMS_URL).toString();

async function safeFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (env.CMS_API_KEY) {
    headers.set('Authorization', `Token ${env.CMS_API_KEY}`);
  }
  const reqInit: RequestInit = {
    ...init,
    headers,
    // Map custom revalidate to Next's fetch option
    next: init?.revalidate ? { revalidate: init.revalidate } : init?.next,
  };
  const res = await fetch(`${API_BASE}${path}`, reqInit);
  if (!res.ok) throw new Error(`CMS request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchTheme(): Promise<Theme | undefined> {
  try {
    const json = await safeFetch<unknown>('themes/', { cache: 'no-store' });
    const parsed = ThemesResponseSchema.safeParse(json);
    if (parsed.success) {
      const arr = Array.isArray(parsed.data) ? parsed.data : parsed.data.results;
      const first = arr[0];
      return first ? ThemeSchema.parse(first) : undefined;
    }
    // Fallback: endpoint may return a single Theme object
    return ThemeSchema.safeParse(json).data;
  } catch {
    return undefined;
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const json = await safeFetch<unknown>('services/', { revalidate: 60 });
    const parsed = ServicesResponseSchema.safeParse(json);
    const arr = parsed.success
      ? Array.isArray(parsed.data)
        ? parsed.data
        : parsed.data.results
      : [];
    return arr.map((s: unknown) => ServiceSchema.parse(s));
  } catch {
    return [];
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const json = await safeFetch<unknown>('projects/', { revalidate: 60 });
    const parsed = ProjectsResponseSchema.safeParse(json);
    const arr = parsed.success
      ? Array.isArray(parsed.data)
        ? parsed.data
        : parsed.data.results
      : [];
    return arr.map((p: unknown) => ProjectSchema.parse(p));
  } catch {
    return [];
  }
}

export type SiteConfig = {
  phone?: string;
  email?: string;
  address?: string;
  local_seo_enabled?: boolean;
  primary_city_slug?: string;
  gbp_url?: string;
  service_radius_km?: number;
  default_utm_source?: string;
  default_utm_campaign?: string;
  primary?: string;
  accent?: string;
  whatsapp?: string;
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${API_BASE}config/`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    if (!res.ok) throw new Error(`config failed with status ${res.status}`);
    const json: Partial<SiteConfig> = await res.json();
    return {
      phone: json?.phone,
      email: json?.email,
      address: json?.address,
      local_seo_enabled: json?.local_seo_enabled ?? false,
      primary_city_slug: json?.primary_city_slug,
      gbp_url: json?.gbp_url,
      service_radius_km: json?.service_radius_km,
      default_utm_source: json?.default_utm_source,
      default_utm_campaign: json?.default_utm_campaign,
      primary: json?.primary,
      accent: json?.accent,
      whatsapp: json?.whatsapp,
    };
  } catch (error) {
    console.error('Failed to fetch site config:', error);
    return {};
  }
}

// --- Compat layer for testimonials and media URLs ---
const CMS = process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:8000';

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  rating?: number;
  city?: string | null;
  geoarea?: string | null;
};

export type CompatTestimonial = {
  id: number;
  name: string;
  quote: string;
  rating?: number;
  city?: string | null;
  geoarea?: string | null;
};

export async function fetchTestimonials(limit?: number): Promise<CompatTestimonial[]> {
  try {
    const url = new URL('/api/testimonials/', CMS);
    if (limit) url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    // tolera array o {results}
    const items = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
    return items.map((t: Record<string, unknown>) => ({
      id: (t.id as number) ?? (t.pk as number) ?? 0,
      name: (t.name as string) ?? (t.author as string) ?? 'Customer',
      quote: (t.quote as string) ?? (t.text as string) ?? '',
      rating: (t.rating as number) ?? (t.stars as number) ?? undefined,
      city: (t.city as string) ?? null,
      geoarea: (t.geoarea as string) ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchTestimonialsCompat(limit?: number): Promise<CompatTestimonial[]> {
  try {
    const url = new URL('/api/testimonials/', CMS);
    if (limit) url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const results = Array.isArray(data)
      ? data
      : typeof data === 'object' &&
          data !== null &&
          Array.isArray((data as { results?: unknown }).results)
        ? (data as { results: unknown[] }).results
        : [];
    return (results as unknown[]).map((t: unknown) => {
      const obj = (t ?? {}) as Record<string, unknown>;
      return {
        id: (obj.id as number) ?? (obj.pk as number) ?? 0,
        name: (obj.name as string) ?? (obj.author as string) ?? 'Customer',
        quote: (obj.quote as string) ?? (obj.text as string) ?? '',
        rating: (obj.rating as number) ?? (obj.stars as number) ?? undefined,
        city: (obj.city as string) ?? null,
        geoarea: (obj.geoarea as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

export function withCMS(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return `${CMS}${url.startsWith('/') ? '' : '/'}${url}`;
}
// --- Local SEO ---
export type GeoArea = {
  id: number;
  type: 'city' | 'neighborhood';
  name: string;
  slug: string;
  parent_city_slug?: string | null;
  center_lat?: number | null;
  center_lng?: number | null;
  neighbors?: string[];
};
export async function fetchGeoAreas(params?: {
  type?: 'city' | 'neighborhood';
  parent?: string;
}): Promise<GeoArea[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.parent) qs.set('parent', params.parent);
  const json = await safeFetch<GeoArea[]>(`geoareas/${qs.toString() ? `?${qs}` : ''}`, {
    revalidate: 60,
  });
  return json;
}

export type Coverage = {
  id: number;
  service: { slug: string; name: string };
  geo: { slug: string; name: string; type: string };
  status: string;
  hero_image?: { url: string; alt?: string } | null;
  ready: boolean;
  reviews_summary?: { avg: number | null; count: number } | null;
};
export async function fetchCoverage(params?: {
  service?: string;
  city?: string;
  ready?: boolean;
}): Promise<Coverage[]> {
  const qs = new URLSearchParams();
  if (params?.service) qs.set('service', params.service);
  if (params?.city) qs.set('city', params.city);
  if (params?.ready) qs.set('ready', 'true');
  try {
    const data = await safeFetch<unknown>(`coverage/${qs.toString() ? `?${qs}` : ''}`, {
      revalidate: 300,
    });
    const list: unknown = Array.isArray(data)
      ? data
      : typeof data === 'object' && data && 'results' in data
        ? (data as { results: unknown }).results
        : [];
    return (Array.isArray(list) ? list : []) as Coverage[];
  } catch {
    return [];
  }
}

export async function fetchCoverageDetail(
  serviceSlug: string,
  citySlug: string,
): Promise<Coverage | undefined> {
  const res = await fetch(`${API_BASE}coverage/${serviceSlug}/${citySlug}/`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return undefined; // 404 when not ready
  return (await res.json()) as Coverage;
}
