// Shared Zod schemas for CMS models and API payloads
// Keep these minimal and in sync with apps/cms serializers. Adjust when API evolves.

import { z } from 'zod';

export const ThemeSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  brand_color: z.string().regex(/^#|rgb|hsl|var\(/, {
    message: 'Expected a CSS color string',
  }),
  accent: z.string(),
  neutral: z.string(),
  font_heading: z.string().optional().default('system-ui'),
  font_body: z.string().optional().default('system-ui'),
  radius: z.string().optional().default('1rem'),
  layout_variant: z.string().optional().default('default'),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const ServiceSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(''),
  icon: z.string().optional().nullable(),
});
export type Service = z.infer<typeof ServiceSchema>;

export const TestimonialSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  source: z.string().url().optional().nullable(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

export const ProjectImageSchema = z.object({
  src: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional().default(''),
});
export type ProjectImage = z.infer<typeof ProjectImageSchema>;

export const ProjectSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  slug: z.string(),
  city: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  images: z.array(ProjectImageSchema).default([]),
  url: z.string().optional().nullable(),
});
export type Project = z.infer<typeof ProjectSchema>;

// Generic paginated or array response shape
export const PaginatedSchema = <T extends z.ZodTypeAny>(items: T) =>
  z.union([z.array(items), z.object({ results: z.array(items) })]);

export const ThemesResponseSchema = PaginatedSchema(ThemeSchema);
export const ServicesResponseSchema = PaginatedSchema(ServiceSchema);
export const TestimonialsResponseSchema = PaginatedSchema(TestimonialSchema);
export const ProjectsResponseSchema = PaginatedSchema(ProjectSchema);
