import { fetchGeoAreas, type GeoArea } from '@/lib/cms';
import Link from 'next/link';

export async function AreasStrip({ areas }: { areas?: GeoArea[] }) {
  const cities = areas ?? (await fetchGeoAreas({ type: 'city' }));
  if (!cities.length) return null;
  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4">Areas We Serve</h2>
        <div className="flex flex-wrap gap-2">
          {cities.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              className="px-3 py-1 rounded-full bg-white border text-sm"
              href={`/areas/${c.slug}`}
            >
              {c.name || c.slug}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
