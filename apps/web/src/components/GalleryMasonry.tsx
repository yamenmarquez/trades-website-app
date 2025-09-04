'use client';

import { useCallback } from 'react';
const IS_DEV = (() => {
  const g = globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } };
  return g.process?.env?.NODE_ENV !== 'production';
})();
import Image from 'next/image';

type Item = { url: string; alt?: string };
type Props = { items: Item[]; onOpen?: (index: number) => void };

export default function GalleryMasonry({ items, onOpen }: Props) {
  const handle = useCallback((i: number) => onOpen?.(i), [onOpen]);

  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)]"
        >
          <button
            className="block w-full rounded-lg overflow-hidden shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200 hover:scale-[1.02]"
            onClick={() => handle(i)}
            aria-label={it.alt || 'Open image'}
          >
            <Image
              src={it.url}
              alt={it.alt ?? ''}
              width={400}
              height={300}
              className="w-full h-auto object-cover rounded-lg"
              unoptimized={IS_DEV}
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
            />
          </button>
        </div>
      ))}
    </div>
  );
}
