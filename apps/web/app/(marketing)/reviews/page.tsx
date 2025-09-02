import { fetchTestimonials, type Testimonial } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function ReviewsPage() {
  const items = await fetchTestimonials();

  return (
    <section className="space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
      </header>

      {items.length === 0 ? (
        <p className="text-slate-500">No reviews yet — add some testimonials in Wagtail.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t: Testimonial, index: number) => (
            <li key={`review-${t.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 rounded-full bg-sky-100" />
                <div>
                  <p className="font-medium">{t.name}</p>
                  {t.city && <p className="text-xs text-slate-500">{t.city}</p>}
                </div>
              </div>
              <p className="text-slate-700">{t.quote}</p>
              {typeof t.rating === 'number' && (
                <p className="mt-3 text-sm text-amber-600">Rating: {t.rating}/5</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
