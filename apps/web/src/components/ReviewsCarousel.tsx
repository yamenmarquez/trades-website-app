import { fetchTestimonials } from '@/lib/cms';
import type { Testimonial } from '@trades/schemas';

export async function ReviewsCarousel({ items }: { items?: Testimonial[] }) {
  const list = items ?? ((await fetchTestimonials()) as Testimonial[]);
  if (!list.length) return null;
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {list.slice(0, 3).map((t, i) => (
            <blockquote key={i} className="card">
              <div className="text-slate-700">{t.text}</div>
              <div className="mt-3 text-sm text-slate-500">— {t.name}</div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
