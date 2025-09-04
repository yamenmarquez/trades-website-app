export function Footer({ theme }: { theme?: { phone?: string; whatsapp?: string; gbp?: string } }) {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-neutral-600 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span>© 2025 Trades. All rights reserved.</span>
        <div className="flex gap-4">
          {theme?.phone && (
            <a className="hover:text-[var(--accent)]" href={`tel:${theme.phone}`}>
              Call
            </a>
          )}
          {theme?.whatsapp && (
            <a className="hover:text-[var(--accent)]" href={theme.whatsapp} target="_blank">
              WhatsApp
            </a>
          )}
          {theme?.gbp && (
            <a
              className="hover:text-[var(--accent)]"
              href={theme.gbp}
              target="_blank"
              rel="nofollow"
            >
              Google Business
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
