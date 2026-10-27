"use client";
import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & { src: string; optimized?: boolean };

export function ResponsiveWardrobeImage({ src, alt, loading = "lazy", decoding = "async", optimized: _optimized, ...props }: Props) {
  return <img {...props} src={src} alt={alt} loading={loading} decoding={decoding} />;
}
