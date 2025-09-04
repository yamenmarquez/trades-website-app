import Link from 'next/link';
import { fetchGeoAreas, type GeoArea } from '@/lib/cms';

export default async function NearbyAreas({
  citySlug,
  serviceSlug,
}: {
  citySlug: string;
  serviceSlug: string;
}) {
  try {
    const cities = await fetchGeoAreas({ type: 'city' });
    if (!Array.isArray(cities)) {
      console.error('fetchGeoAreas did not return an array:', cities);
      return null;
    }
    const city = cities.find((c: GeoArea & { neighbors?: string[] }) => c.slug === citySlug);
    const neighbors = city?.neighbors as string[] | undefined;
    if (!neighbors?.length) return null;
    
    return (
      <section className="mt-10">
        <h3 className="text-lg font-semibold mb-3">
          También atendemos cerca de {citySlug.replace(/-/g, ' ')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {neighbors.slice(0, 6).map((n) => (
            <Link key={n} className="link-brand" href={`/services/${serviceSlug}/${n}`}>
              {n.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error in NearbyAreas:', error);
    return null;
  }
}
