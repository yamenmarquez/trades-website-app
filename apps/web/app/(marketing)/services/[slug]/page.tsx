import type { Metadata } from 'next';
import { fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import { notFound } from 'next/navigation';
import { ldBreadcrumb } from '@/lib/seo';
import { absoluteUrl } from '@/lib/seo';

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
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{service.name}</h1>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: service.description }} />
        </div>
      </main>
    </>
  );
}
