import { CMS_URL } from "./cms";

export async function fetchProjects() {
  try {
    const url = `${CMS_URL}/api/projects/`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

export async function fetchProject(idOrSlug: string) {
  // For now, the API exposes by ID; try numeric parse, else fetch list and find by slug
  if (/^\d+$/.test(idOrSlug)) {
    const res = await fetch(`${CMS_URL}/api/projects/${idOrSlug}/`, { next: { revalidate: 60 } });
    if (res.ok) return res.json();
  }
  const list = await fetchProjects();
  return list.find((p: any) => p.slug === idOrSlug);
}
