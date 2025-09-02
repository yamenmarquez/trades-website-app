import Link from 'next/link';
import GalleryMasonry from '@/components/GalleryMasonry';
import { fetchProjects } from '@/lib/projects';

export default async function LocalProof({
  serviceSlug,
  citySlug,
}: {
  serviceSlug: string;
  citySlug: string;
}) {
  const projects = await fetchProjects({ service: serviceSlug, city: citySlug });
  const top = projects.slice(0, 6);
  if (top.length === 0) return null;
  const items = top.flatMap((p) => p.images?.slice(0, 1) || []);
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Proyectos recientes en {citySlug.replace(/-/g, ' ')}
        </h2>
        <Link href={`/portfolio?service=${serviceSlug}&city=${citySlug}`} className="link-brand">
          Ver más
        </Link>
      </div>
      <GalleryMasonry items={items} />
    </section>
  );
}
