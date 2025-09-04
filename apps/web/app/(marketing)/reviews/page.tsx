import { fetchTestimonials, type CompatTestimonial } from '@/lib/cms';

function Stars({ value = 5 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value || 0)));
  return (
    <div className="flex gap-1" aria-label={`${v} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < v ? 'text-yellow-500' : 'text-neutral-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.985 2.126c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81H7.43a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const items: CompatTestimonial[] = await fetchTestimonials();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Customer Reviews</h1>
        <p className="text-neutral-600 mt-2">What customers say about our work.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <article key={t.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.name || 'Customer'}</h3>
                <Stars value={t.rating ?? 5} />
              </div>
              <p className="text-sm text-neutral-700">{t.quote}</p>
              {t.geoarea && <p className="text-xs text-neutral-500 mt-3">Area: {t.geoarea}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
