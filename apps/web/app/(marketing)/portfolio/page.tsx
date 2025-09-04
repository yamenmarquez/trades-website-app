import { fetchProjects } from '@/lib/projects';
import MasonryWithLightbox from '@/components/MasonryWithLightbox';

export default async function PortfolioPage() {
  const projects = await fetchProjects();
  type LegacyOrNew = { url?: string; src?: string; alt?: string };
  const images: { url: string; alt?: string }[] = projects.flatMap((p) =>
    ((p.images as LegacyOrNew[] | undefined) || []).map((img) => ({
      url: (img?.url ?? img?.src) as string,
      alt: img?.alt || p.title,
    })),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Work</h1>
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
