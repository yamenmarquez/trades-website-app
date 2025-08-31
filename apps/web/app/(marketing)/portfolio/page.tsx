import { fetchProjects } from '@/lib/projects';
import type { ProjectImage } from '@trades/schemas';
import Gallery from '@/components/Gallery';
import { CMS_URL } from '@/lib/cms';

export default async function PortfolioPage() {
  const projects = await fetchProjects();
  const images: ProjectImage[] = projects.flatMap((p) =>
    (p.images || []).map((img) => ({
      src: img.src.startsWith('http') ? img.src : `${CMS_URL}${img.src}`,
      width: img.width || 1200,
      height: img.height || 800,
      alt: img.alt || p.title,
    })),
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
