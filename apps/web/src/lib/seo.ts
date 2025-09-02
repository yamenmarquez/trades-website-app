import type { Metadata } from 'next';
import { env } from '@trades/utils';

export function absoluteUrl(path = '') {
  const base = `https://${env.NEXT_PUBLIC_SITE_HOST}`.replace(/\/+$/, '');
  const pRaw = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const p = pRaw.replace(/\/+?/g, '/').toLowerCase();
  return `${base}${p}`;
}

export function baseMetadata(): Metadata {
  const title = 'Your Trade Partner';
  const description = 'Quality glass/carpentry projects with fast lead times and fair pricing.';
  const url = absoluteUrl('/');
  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: title,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
  };
}

export function ldWebSite() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}search?q={query}`,
      'query-input': 'required name=query',
    },
  };
}

export function ldLocalBusiness(cfg: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cfg.name,
    url: absoluteUrl('/'),
  };
  if (cfg.phone) data.telephone = cfg.phone;
  if (cfg.email) data.email = cfg.email;
  if (cfg.address) data.address = { '@type': 'PostalAddress', streetAddress: cfg.address };
  return data;
}

export function ldBreadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function ldFAQ(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function ldImage(img: { url: string; alt?: string }) {
  return {
    '@type': 'ImageObject',
    url: img.url,
    name: img.alt ?? 'image',
  } as const;
}

export function ldService(input: {
  name: string;
  area: { type: 'city' | 'neighborhood'; name: string };
  images?: { url: string; alt?: string }[];
  rating?: { value: number; count?: number };
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: input.name,
    areaServed: {
      '@type': input.area.type === 'city' ? 'City' : 'Neighborhood',
      name: input.area.name,
    },
  };
  if (input.images?.length) {
    (data as Record<string, unknown>).image = input.images.map((i) => ldImage(i));
  }
  if (input.rating) {
    (data as Record<string, unknown>).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.value,
      ratingCount: input.rating.count ?? 1,
    };
  }
  return data;
}
