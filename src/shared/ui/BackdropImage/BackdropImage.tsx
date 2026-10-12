"use client";

import Image from "next/image";
import { useState } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./BackdropImage.module.scss";

interface BackdropImageProps {
  src: string | null;
  sizes: string;
  eager?: boolean;
  className?: string;
}

// A cover image behind a card that hides itself when it fails
const BackdropImage = ({ src, sizes, eager = false, className }: BackdropImageProps) => {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return null;
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(src)}
      className={cx(styles.image, className)}
    />
  );
};

export default BackdropImage;
