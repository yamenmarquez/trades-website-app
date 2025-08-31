import { env } from '@trades/utils';
export const CMS_URL = env.CMS_BASE_URL;
import {
  ThemeSchema,
  ServiceSchema,
  TestimonialSchema,
  ThemesResponseSchema,
  ServicesResponseSchema,
  TestimonialsResponseSchema,
  type Theme,
  type Service,
  type Testimonial,
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

export type SiteConfig = {
  phone?: string;
  email?: string;
  address?: string;
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
    };
  } catch {
    return {};
  }
}
