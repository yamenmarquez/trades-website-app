import { env } from '@trades/utils';
export const CMS_URL = env.CMS_BASE_URL;
import {
  ThemeSchema,
  ServiceSchema,
  TestimonialSchema,
  ProjectSchema,
  ThemesResponseSchema,
  ServicesResponseSchema,
  TestimonialsResponseSchema,
  ProjectsResponseSchema,
  type Theme,
  type Service,
  type Testimonial,
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

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const json = await safeFetch<unknown>('testimonials/', { revalidate: 60 });
    const parsed = TestimonialsResponseSchema.safeParse(json);
    const arr = parsed.success
      ? Array.isArray(parsed.data)
        ? parsed.data
        : parsed.data.results
      : [];
    return arr.map((t: unknown) => TestimonialSchema.parse(t));
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
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${API_BASE}config/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('config failed');
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
    };
  } catch {
    return {};
  }
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
  return safeFetch<Coverage[]>(`coverage/${qs.toString() ? `?${qs}` : ''}`, { revalidate: 300 });
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
