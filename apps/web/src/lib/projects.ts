import { CMS_URL } from './cms';
import { ProjectSchema, ProjectsResponseSchema, type Project } from '@trades/schemas';

export async function fetchProjects(params?: {
  service?: string;
  city?: string;
}): Promise<Project[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.service) qs.set('service', params.service);
    if (params?.city) qs.set('city', params.city);
    const url = `${CMS_URL}/api/projects/${qs.toString() ? `?${qs}` : ''}`;
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
  // Try slug detail endpoint first; if it fails and it's numeric, fallback to ID
  const resSlug = await fetch(`${CMS_URL}/api/projects/${idOrSlug}/`, {
    next: { revalidate: 60 },
  });
  if (resSlug.ok) return ProjectSchema.parse(await resSlug.json());
  if (/^\d+$/.test(idOrSlug)) {
    const resId = await fetch(`${CMS_URL}/api/projects/${idOrSlug}/`, { next: { revalidate: 60 } });
    if (resId.ok) return ProjectSchema.parse(await resId.json());
  }
  const list = await fetchProjects();
  return list.find((p) => p.slug === idOrSlug);
}
