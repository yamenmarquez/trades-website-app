import { fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import Link from 'next/link';

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: Service) => (
          <div key={service.id} className="card">
            <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
            <p className="opacity-80 mb-4">{service.description}</p>
            <Link href={`/services/${service.slug}`} className="btn-primary">
              Learn More
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
