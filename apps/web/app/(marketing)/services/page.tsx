import { fetchCoverage, fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import { Suspense } from 'react';
import ServicesList from '@/components/ServicesList';

type ServiceWithHtml = Service & { description_html?: string };
type CoverageItem = { service: { slug: string; name: string }; geo: { slug: string } };

export default async function ServicesPage() {
  const services = (await fetchServices()) as ServiceWithHtml[];
  const coverages = await fetchCoverage({ ready: true }).catch(() => []);
  const items: CoverageItem[] = Array.isArray(coverages) ? (coverages as CoverageItem[]) : [];

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <Suspense>
        <ServicesList services={services} coverages={items} />
      </Suspense>
    </main>
  );
}

// moved client-side list into src/components/ServicesList
