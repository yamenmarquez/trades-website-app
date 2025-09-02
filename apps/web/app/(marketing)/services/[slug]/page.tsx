import type { Metadata } from 'next';
import { fetchProjects } from '@/lib/projects';
import { fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import { notFound } from 'next/navigation';
import { ldBreadcrumb, absoluteUrl } from '@/lib/seo';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const services = await fetchServices();
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.name,
    description: s.description || `Professional ${s.name}`,
    alternates: { canonical: absoluteUrl(`/services/${s.slug}`) },
    openGraph: { title: s.name, description: s.description || '' },
    twitter: { title: s.name, description: s.description || '' },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const services = await fetchServices();
  const service: Service | undefined = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const ld = [
    ldBreadcrumb([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: service.name, path: `/services/${service.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: service.name,
      image: [],
    },
  ];

  const projects = await fetchProjects({ service: service.name });
  const ctaHref = `/contact?subject=${encodeURIComponent(service.name)}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="container mx-auto px-4 py-12">
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-3">{service.name}</h1>
          <p
            className="opacity-80 mb-4"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
          <a className="btn-primary" href={ctaHref}>
            Request {service.name}
          </a>
        </section>

        {/* FAQs and gallery would require extended fields; placeholder render when present */}
        {/* Related projects (no city filter) */}
        {projects.length > 0 && (
          <section className="mt-12">
            <h3 className="text-lg font-semibold mb-3">Recent projects</h3>
            <ul className="list-disc pl-6">
              {projects.slice(0, 6).map((p: { slug: string; title: string }) => (
                <li key={p.slug}>
                  <a className="link" href={`/portfolio/${p.slug}`}>
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
