'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

type Item = { url: string; alt?: string };
type Props = {
  items: Item[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function Lightbox({ items, index, onClose, onNext, onPrev }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  const it = items[index];

  if (!it) return null;

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/70 p-0 w-full max-w-6xl rounded-2xl overflow-hidden"
      onClose={onClose}
      aria-label="Image lightbox"
    >
      <div className="relative bg-black">
        <Image
          src={it.url}
          alt={it.alt ?? ''}
          width={1600}
          height={1000}
          className="w-full h-auto"
          unoptimized
          sizes="100vw"
        />
        <button
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-black rounded-full px-3 py-1"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80"
          onClick={onPrev}
          aria-label="Previous"
        >
          ◀
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80"
          onClick={onNext}
          aria-label="Next"
        >
          ▶
        </button>
      </div>
    </dialog>
  );
}
