import Link from 'next/link';
import { fetchCoverage, type Coverage } from '@/lib/cms';

export default async function RelatedServices({
  citySlug,
  currentService,
}: {
  citySlug: string;
  currentService: string;
}) {
  const cov = await fetchCoverage({ city: citySlug, ready: true });
  const items: Coverage[] = cov.filter((c) => c.service.slug !== currentService).slice(0, 6);
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h3 className="text-lg font-semibold mb-3">
        Servicios relacionados en {citySlug.replace(/-/g, ' ')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((c: Coverage) => (
          <Link
            key={c.id}
            className="btn-secondary"
            href={`/services/${c.service.slug}/${citySlug}`}
          >
            {c.service.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
