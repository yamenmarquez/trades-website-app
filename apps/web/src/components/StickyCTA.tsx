export default function StickyCTA({ phone }: { phone?: string }) {
  return (
    <div className="md:hidden fixed bottom-4 inset-x-0 px-4 z-40">
      <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
        <a href={phone ? `tel:${phone}` : '#'} className="btn-secondary">
          Call
        </a>
        <a href="/contact" className="btn-primary">
          Get Quote
        </a>
      </div>
    </div>
  );
}
