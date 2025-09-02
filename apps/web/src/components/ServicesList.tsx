'use client';
import Link from 'next/link';
import type { Service } from '@trades/schemas';
import Prose from '@/components/Prose';

type ServiceWithHtml = Service & { description_html?: string };
type CoverageItem = { service: { slug: string; name: string }; geo: { slug: string } };

export default function ServicesList({
  services,
  coverages,
}: {
  services: ServiceWithHtml[];
  coverages: CoverageItem[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const locals = Array.isArray(coverages)
            ? coverages.filter((c) => c?.service?.slug === service.slug).slice(0, 3)
            : [];
          return (
            <div key={service.id} className="card" data-service-card data-name={service.name}>
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <Prose html={service.description_html ?? ''} className="line-clamp-3 mb-4" />
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
