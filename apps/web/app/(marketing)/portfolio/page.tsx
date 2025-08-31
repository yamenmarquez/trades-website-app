import { fetchProjects } from '@/lib/projects';
import Gallery from '@/components/Gallery';
import { CMS_URL } from '@/lib/cms';

export default async function PortfolioPage() {
  const projects = await fetchProjects();
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
      {images.length > 0 ? (
        <Gallery images={images} />
      ) : (
        <p className="text-center py-12 opacity-70">
          No projects found. Please add some projects in the CMS.
        </p>
      )}
    </main>
  );
}
