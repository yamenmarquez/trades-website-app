export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:8000";

export async function fetchTheme() {
  try {
  const res = await fetch(`${CMS_URL}/api/themes/`, { cache: "no-store" });
    const json = await res.json();
    const theme = Array.isArray(json) ? json[0] : json?.results?.[0] ?? json;
    return theme;
  } catch {
    return undefined as any;
  }
}

export async function fetchServices() {
  try {
    const res = await fetch(`${CMS_URL}/api/services/`, { next: { revalidate: 60 } });
    const json = await res.json();
    return Array.isArray(json) ? json : json.results || [];
  } catch {
    return [];
  }
}

export async function fetchTestimonials() {
  try {
    const res = await fetch(`${CMS_URL}/api/testimonials/`, { next: { revalidate: 60 } });
    const json = await res.json();
    return Array.isArray(json) ? json : json.results || [];
  } catch {
    return [];
  }
}
