import { CMS_URL } from './cms';
import { ProjectSchema, ProjectsResponseSchema, type Project } from '@trades/schemas';

export async function fetchProjects(): Promise<Project[]> {
  try {
    const url = `${CMS_URL}/api/projects/`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    const parsed = ProjectsResponseSchema.safeParse(data);
    const arr = parsed.success
      ? Array.isArray(parsed.data)
        ? parsed.data
        : parsed.data.results
      : [];
    return arr.map((p: unknown) => ProjectSchema.parse(p));
  } catch {
    return [];
  }
}

export async function fetchProject(idOrSlug: string): Promise<Project | undefined> {
  // For now, the API exposes by ID; try numeric parse, else fetch list and find by slug
  if (/^\d+$/.test(idOrSlug)) {
    const res = await fetch(`${CMS_URL}/api/projects/${idOrSlug}/`, { next: { revalidate: 60 } });
    if (res.ok) return ProjectSchema.parse(await res.json());
  }
  const list = await fetchProjects();
  return list.find((p) => p.slug === idOrSlug);
}
