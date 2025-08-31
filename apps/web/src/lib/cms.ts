export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8000';
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

export async function fetchTheme(): Promise<Theme | undefined> {
  try {
    const res = await fetch(`${CMS_URL}/api/themes/`, { cache: 'no-store' });
    const json = await res.json();
    const parsed = ThemesResponseSchema.safeParse(json);
    const arr = parsed.success
      ? Array.isArray(parsed.data)
        ? parsed.data
        : parsed.data.results
      : [];
    const first = arr[0];
    return first ? ThemeSchema.parse(first) : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/services/`, { next: { revalidate: 60 } });
    const json = await res.json();
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
    const res = await fetch(`${CMS_URL}/api/testimonials/`, { next: { revalidate: 60 } });
    const json = await res.json();
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
