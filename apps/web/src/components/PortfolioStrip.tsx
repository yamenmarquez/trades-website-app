import Image from 'next/image';
import { fetchProjects } from '@/lib/projects';
import { CMS_URL } from '@/lib/cms';
import type { Project } from '@trades/schemas';

type Img = { url?: string; src?: string; alt?: string };

export async function PortfolioStrip({ items }: { items?: Img[] | Project[] }) {
  let imgs: Img[] = [];

  if (items && items.length > 0) {
    const first = items[0] as unknown as { images?: Img[] };
    if (first && 'images' in first && Array.isArray(first.images)) {
      imgs = (items as Project[]).flatMap((p) => p.images || []);
    } else {
      imgs = items as Img[];
    }
  } else {
    const projects = await fetchProjects();
    imgs = projects.flatMap((p) => p.images || []);
  }

  imgs = imgs.slice(0, 8);

  if (!imgs.length) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Work</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {imgs.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={
                  (img.url || img.src || '').startsWith('http')
                    ? (img.url || img.src)!
                    : `${CMS_URL}${img.url || img.src}`
                }
                alt={img.alt ?? 'project image'}
                width={1200}
                height={900}
                sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 100vw"
                className="object-cover w-full h-56"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
