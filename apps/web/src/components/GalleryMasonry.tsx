'use client';

import { useCallback } from 'react';
import Image from 'next/image';

type Item = { url: string; alt?: string };
type Props = { items: Item[]; onOpen?: (index: number) => void };

export default function GalleryMasonry({ items, onOpen }: Props) {
  const handle = useCallback((i: number) => onOpen?.(i), [onOpen]);
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      {items.map((it, i) => (
        <button
          key={i}
          className="mb-4 w-full inline-block rounded-[var(--radius)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          onClick={() => handle(i)}
          aria-label={it.alt || 'Open image'}
          style={{ breakInside: 'avoid' }}
        >
          <Image
            src={it.url}
            alt={it.alt ?? ''}
            width={1200}
            height={800}
            className="w-full h-auto align-top block"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </button>
      ))}
    </div>
  );
}
