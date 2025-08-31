import { fetchServices } from '@/lib/cms';
import type { Service } from '@trades/schemas';
import { notFound } from 'next/navigation';

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = await fetchServices();
  const service: Service | undefined = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{service.name}</h1>
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: service.description }} />
      </div>
    </main>
  );
}
