import { fetchServices } from '@/lib/cms';
import Prose from '@/components/Prose';
import Link from 'next/link';
import type { Service } from '@trades/schemas';

export async function ServicesGrid({
  services,
}: {
  services?: (Service & { description_html?: string })[];
}) {
  const list = services ?? ((await fetchServices()) as (Service & { description_html?: string })[]);
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((s) => (
            <div key={s.id} className="card">
              <h3 className="font-semibold mb-2">{s.name}</h3>
              <Prose html={s.description_html ?? ''} className="line-clamp-3 text-sm" />
              <Link
                href={`/services`}
                className="inline-block mt-4 px-3 py-2 rounded bg-sky-500 text-white text-sm"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/services" className="px-4 py-2 bg-slate-900 text-white rounded">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
