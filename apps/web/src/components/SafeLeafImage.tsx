"use client";

import { isSafeImageDataUrl } from "@/lib/security";

/** Renders leaf photos only when the src is a safe image data URL. */
export function SafeLeafImage({
  src,
  alt = "",
  className,
}: {
  src: string | undefined | null;
  alt?: string;
  className?: string;
}) {
  if (!isSafeImageDataUrl(src)) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--parchment-2)] text-[11px] text-[var(--ink-faint)] ${className || ""}`}
        role="img"
        aria-label="Image unavailable"
      >
        No image
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
