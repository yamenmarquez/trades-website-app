import { fetchProjects } from '@/lib/projects';
import MasonryWithLightbox from '@/components/MasonryWithLightbox';
import { CMS_URL } from '@/lib/cms';
import Link from 'next/link';

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; city?: string }>;
}) {
  const sp = await searchParams;
  const projects = await fetchProjects({ service: sp?.service, city: sp?.city });
  type LegacyOrNew = { url?: string; src?: string; alt?: string };
  const images: { url: string; alt?: string }[] = projects.flatMap((p) =>
    ((p.images as LegacyOrNew[] | undefined) || []).map((img) => {
      const raw = (img?.url ?? img?.src) as string;
      const url = raw && raw.startsWith('http') ? raw : `${CMS_URL}${raw}`;
      return { url, alt: img?.alt || p.title };
    }),
  );

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Work</h1>
      {/* minimal chips using query params; could be enhanced with services list */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sp?.service && (
          <Link
            className="px-3 py-1 rounded-full bg-gray-200"
            href={`/portfolio?service=${encodeURIComponent(sp.service)}${sp.city ? `&city=${encodeURIComponent(sp.city)}` : ''}`}
          >
            Service: {sp.service}
          </Link>
        )}
        {sp?.city && (
          <Link
            className="px-3 py-1 rounded-full bg-gray-200"
            href={`/portfolio?city=${encodeURIComponent(sp.city)}${sp.service ? `&service=${encodeURIComponent(sp.service)}` : ''}`}
          >
            City: {sp.city}
          </Link>
        )}
      </div>
      {images.length > 0 ? (
        <MasonryWithLightbox items={images} />
      ) : (
        <p className="text-center py-12 opacity-70">
          No projects found. Please add some projects in the CMS.
        </p>
      )}
    </main>
  );
}
