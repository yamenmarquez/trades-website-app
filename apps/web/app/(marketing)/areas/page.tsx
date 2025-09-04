import Link from 'next/link';
import { fetchServiceAreas, type ServiceArea } from '@/lib/cms';

export const metadata = {
  title: 'Service Areas - Professional Trades Services',
  description: 'Discover all the areas we serve with our professional trades services.',
};

export default async function AreasPage() {
  const areas = await fetchServiceAreas();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Service Areas</h1>
      <p className="text-lg text-neutral-600 mb-8">
        We proudly serve multiple areas with our comprehensive trades services.
      </p>

      {areas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">We're constantly expanding our service areas.</p>
          <Link href="/contact" className="btn btn-primary">
            Contact us to check availability
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area: ServiceArea) => (
            <Link
              key={area.slug}
              href={`/areas/${area.slug}`}
              className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold mb-2 text-neutral-900">{area.name}</h2>

              {(area.city || area.state) && (
                <p className="text-sm text-neutral-600 mb-3">
                  {[area.city, area.state].filter(Boolean).join(', ')}
                  {area.zip_code && ` ${area.zip_code}`}
                </p>
              )}

              <p className="text-neutral-600 mb-4">
                Professional trades services available in this area.
              </p>

              <div className="text-primary font-medium">View services in {area.name} →</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
