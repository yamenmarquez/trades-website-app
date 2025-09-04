import { notFound } from 'next/navigation';
import Link from 'next/link';

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:8000';

type ServiceArea = {
  name: string;
  slug: string;
  city?: string;
  state?: string;
  zip_code?: string;
  geo_slug?: string | null; // 🔗 NUEVO: enlace a GeoArea
  neighbors?: string[]; // 🔗 NUEVO: áreas vecinas
};

type Coverage = {
  id: number;
  service: { slug: string; name: string };
  hero_image?: { url: string; alt: string };
  ready: boolean;
};

async function fetchAreas(): Promise<ServiceArea[]> {
  try {
    const res = await fetch(`${CMS_URL}/api/areas/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results ?? []);
  } catch {
    return [];
  }
}

async function fetchArea(slug: string): Promise<ServiceArea | null> {
  try {
    // 🔗 MEJORADO: usar lookup directo por slug
    const res = await fetch(`${CMS_URL}/api/areas/${slug}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchCoverage(geoSlug: string): Promise<Coverage[]> {
  try {
    // 🔗 MEJORADO: usar el filtro geo en lugar de city (sin ready para demo)
    const res = await fetch(`${CMS_URL}/api/coverage/?geo=${encodeURIComponent(geoSlug)}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data) ? data : (data.results ?? []);
    // Filtrar solo los que tengan status ready
    return results.filter((item: Record<string, unknown>) => item.status === 'ready');
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const areas = await fetchAreas();
  return areas.slice(0, 50).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = await fetchArea(slug);
  const title = area ? `Services in ${area.name}` : 'Service Area';
  const canonical = `/areas/${slug}`.toLowerCase();
  return { title, alternates: { canonical } };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = await fetchArea(slug);
  if (!area) return notFound();

  // 🔗 MEJORADO: solo buscar cobertura si hay geo_slug enlazado
  const coverages = area.geo_slug ? await fetchCoverage(area.geo_slug) : [];

  // Fetch all areas to create neighbor slug mapping
  const allAreas = await fetchAreas();
  const areaSlugMap = new Map(
    allAreas.map((a) => [a.city?.toLowerCase() || a.name.toLowerCase(), a.slug]),
  );

  // JSON-LD (Service + areaServed)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Trades Services in ${area.name}`,
    areaServed: area.name,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header de área */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">{area.name}</h1>
        {(area.city || area.state) && (
          <p className="mt-2 text-lg text-neutral-600">
            {[area.city, area.state].filter(Boolean).join(', ')}
            {area.zip_code && ` ${area.zip_code}`}
          </p>
        )}
      </div>

      {/* Servicios disponibles */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-900">Available Services</h2>
        {coverages.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              We're expanding coverage here
            </h3>
            <p className="text-neutral-600 mb-6">
              Contact us to check availability for your specific needs in {area.name}.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Contact Us
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coverages.map((coverage, i) => (
              <div
                key={`${coverage.service.slug}-${i}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {coverage.service.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">Available in {area.name}</p>
                    <div className="flex gap-3">
                      <Link
                        href={`/services/${coverage.service.slug}/${area.geo_slug}`}
                        className="text-[var(--color-primary)] text-sm hover:underline"
                      >
                        View local page →
                      </Link>
                      <Link
                        href="/contact"
                        className="text-[var(--color-accent)] text-sm hover:underline"
                      >
                        Get quote
                      </Link>
                    </div>
                  </div>
                  {coverage.hero_image && (
                    <div className="ml-4 w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={coverage.hero_image.url}
                        alt={coverage.hero_image.alt || coverage.service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔗 NUEVO: Áreas vecinas */}
      {Array.isArray(area.neighbors) && area.neighbors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-900">Nearby Areas</h2>
          <div className="flex flex-wrap gap-3">
            {area.neighbors.map((neighborName) => {
              // Map short neighbor name to full slug
              const fullSlug = areaSlugMap.get(neighborName.toLowerCase()) || neighborName;
              const displayName = neighborName
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <Link
                  key={neighborName}
                  href={`/areas/${fullSlug}`}
                  className="inline-block px-4 py-2 rounded-full border border-neutral-200 text-neutral-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-sm"
                >
                  {displayName}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Navegación de regreso */}
      <div className="border-t border-neutral-200 pt-6">
        <Link
          href="/areas"
          className="inline-flex items-center text-[var(--color-primary)] hover:underline"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all areas
        </Link>
      </div>
    </main>
  );
}
