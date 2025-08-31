"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Gallery({ images }: { images: { src: string; width: number; height: number; alt?: string }[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  
  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {images.map((img, i) => (
          <button 
            key={i} 
            className="mb-4 w-full" 
            onClick={() => { 
              setIndex(i); 
              setOpen(true); 
            }}
          >
            <Image 
              src={img.src} 
              alt={img.alt || ""} 
              width={img.width} 
              height={img.height}
              className="w-full h-auto shadow" 
              style={{ borderRadius: "var(--radius)" }}
              unoptimized
            />
          </button>
        ))}
      </div>
      <Lightbox 
        open={open} 
        close={() => setOpen(false)} 
        index={index} 
        slides={images.map(i => ({ src: i.src }))} 
      />
    </>
  );
}
