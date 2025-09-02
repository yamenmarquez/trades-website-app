import type { Metadata } from 'next';
import { fetchProject } from '@/lib/projects';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { CMS_URL } from '@/lib/cms';
import { ldBreadcrumb, absoluteUrl } from '@/lib/seo';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchProject(id);
  if (!p) return {};
  return {
    title: p.title,
    description: p.city ? `${p.title} in ${p.city}` : p.title,
    alternates: { canonical: absoluteUrl(`/portfolio/${p.slug}`) },
    openGraph: { title: p.title, description: p.city ? `${p.title} in ${p.city}` : '' },
    twitter: { title: p.title, description: p.city ? `${p.title} in ${p.city}` : '' },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) {
    notFound();
  }

  type LegacyOrNew = { url?: string; src?: string; alt?: string };
  const images: { url: string; alt?: string }[] = (
    (project.images as LegacyOrNew[] | undefined) || []
  ).map((img) => {
    const raw = (img.url ?? img.src) as string;
    const url = raw && raw.startsWith('http') ? raw : `${CMS_URL}${raw}`;
    return { url, alt: img.alt || project.title };
  });

  const ld = [
    ldBreadcrumb([
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/portfolio' },
      { name: project.title, path: `/portfolio/${project.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: images.map((img, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'ImageObject', contentUrl: img.url, name: img.alt || '' },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
        {project.city && <p className="opacity-80 mb-4">Location: {project.city}</p>}
        {/* Description is not exposed by the current API serializer; add when available. */}
        {images.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <Gallery images={images} />
          </div>
        )}
      </main>
    </>
  );
}
