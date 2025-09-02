'use client';

import { useState, useCallback } from 'react';
import GalleryMasonry from '@/components/GalleryMasonry';
import Lightbox from '@/components/Lightbox';

export default function MasonryWithLightbox({ items }: { items: { url: string; alt?: string }[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const onOpen = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  const onClose = useCallback(() => setOpen(false), []);
  const onNext = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);
  const onPrev = useCallback(
    () => setIndex((i) => (i - 1 + items.length) % items.length),
    [items.length],
  );
  return (
    <>
      <GalleryMasonry items={items} onOpen={onOpen} />
      {open && (
        <Lightbox items={items} index={index} onClose={onClose} onNext={onNext} onPrev={onPrev} />
      )}
    </>
  );
}
