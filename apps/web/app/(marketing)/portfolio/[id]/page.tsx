import { fetchProject } from "@/lib/projects";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { CMS_URL } from "@/lib/cms";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetchProject(id);
  
  if (!project) {
    notFound();
  }
  
  const images = (project.images || []).map((img: any) => ({
    src: img.src.startsWith('http') ? img.src : `${CMS_URL}${img.src}`,
    width: img.width || 1200,
    height: img.height || 800,
    alt: img.alt || project.title,
  }));
  
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
      {project.city && (
  <p className="opacity-80 mb-4">Location: {project.city}</p>
      )}
      {project.date && (
  <p className="opacity-80 mb-4">Date: {new Date(project.date).toLocaleDateString()}</p>
      )}
      {project.description && (
        <div className="prose max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: project.description }} />
        </div>
      )}
      {images.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <Gallery images={images} />
        </div>
      )}
    </main>
  );
}
