import { fetchServices, fetchCoverage, type Coverage } from '@/lib/cms';
import Prose from '@/components/Prose';
import type { Service } from '@trades/schemas';
import Link from 'next/link';

export const dynamic = 'force-static';

export default async function ServicesIndex() {
  const [services, coverages] = await Promise.all([
    fetchServices(),
    fetchCoverage({ ready: true }).catch(() => []),
  ]);
  const items: Coverage[] = Array.isArray(coverages) ? (coverages as Coverage[]) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Services</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(services as (Service & { description_html?: string })[]).map((s) => {
          const locals = items.filter((c) => c?.service?.slug === s.slug).slice(0, 3);
          return (
            <div key={s.id} className="card">
              <h2 className="text-lg font-semibold mb-2">{s.name}</h2>
              <Prose html={s.description_html ?? ''} className="line-clamp-3 text-sm" />
              {locals.length ? (
                <div className="mt-3 text-sm text-slate-600">
                  Ready in:{' '}
                  {locals
                    .map((l) => l?.geo?.slug)
                    .filter(Boolean)
                    .join(', ')}
                </div>
              ) : null}
              <Link
                className="inline-block mt-4 px-3 py-2 rounded bg-sky-600 text-white text-sm"
                href={`/contact`}
              >
                Get Quote
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
