import { fetchCoverage, fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import Link from 'next/link';
import { Suspense } from 'react';
import Prose from '@/components/Prose';

type ServiceWithHtml = Service & { description_html?: string };

export default async function ServicesPage() {
  const services = (await fetchServices()) as ServiceWithHtml[];
  const coverages = await fetchCoverage({ ready: true });

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <Suspense>
        <ServicesClient services={services} coverages={coverages} />
      </Suspense>
    </main>
  );
}

function ServicesClient({
  services,
  coverages,
}: {
  services: Service[];
  coverages: { service: { slug: string; name: string }; geo: { slug: string } }[];
}) {
  return (
    <>
      <input
        type="search"
        placeholder="Search services..."
        className="input input-bordered mb-6 w-full max-w-md"
        onChange={(e) => {
          const q = e.currentTarget.value.toLowerCase();
          document.querySelectorAll<HTMLDivElement>('[data-service-card]')?.forEach((el) => {
            const text = (el.dataset.name || '').toLowerCase();
            el.style.display = text.includes(q) ? '' : 'none';
          });
        }}
      />
      {/* TODO: category filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: ServiceWithHtml) => {
          const locals = coverages.filter((c) => c.service.slug === service.slug).slice(0, 3);
          return (
            <div key={service.id} className="card" data-service-card data-name={service.name}>
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <div className="line-clamp-3 mb-4">
                <Prose html={service.description_html || ''} />
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {locals.map((c) => (
                  <Link
                    key={`${service.slug}-${c.geo.slug}`}
                    href={`/services/${service.slug}/${c.geo.slug}`}
                    className="btn-secondary btn-sm"
                  >
                    {c.geo.slug.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
              <Link href={`/services/${service.slug}`} className="btn-primary">
                Learn More
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
