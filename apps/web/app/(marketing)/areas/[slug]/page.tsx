import { notFound } from 'next/navigation';
import Link from 'next/link';

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:8000';

type ServiceArea = { name: string; slug: string; city?: string; state?: string; zip_code?: string };
type Coverage = {
  id: number;
  service: { slug: string; name: string };
  geoarea?: string;
  ready?: boolean;
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
    const res = await fetch(`${CMS_URL}/api/areas/?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (data.results ?? []);
    return arr[0] || null;
  } catch {
    return null;
  }
}

async function fetchCoverageByCity(slug: string): Promise<Coverage[]> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/coverage/?city=${encodeURIComponent(slug)}&ready=true`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results ?? []);
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

  const cov = await fetchCoverageByCity(slug);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{area.name}</h1>
        {area.city && area.state && (
          <p className="text-neutral-600 mt-2">
            {area.city}, {area.state} {area.zip_code ?? ''}
          </p>
        )}
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Services</h2>
        {cov.length === 0 ? (
          <p className="text-neutral-600">
            We're expanding coverage here. Contact us for availability.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cov.map((c) => (
              <a
                key={c.id}
                href={`/services?city=${encodeURIComponent(slug)}&service=${encodeURIComponent(c.service.slug)}`}
                className="card hover:shadow-lg transition"
              >
                <h3 className="font-semibold">{c.service.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">Now serving {area.name}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <Link
          href="/areas"
          className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline"
        >
          ← Back to all areas
        </Link>
      </div>
    </main>
  );
}
