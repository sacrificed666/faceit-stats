"use client";

import Image from "next/image";
import { useState } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./Avatar.module.scss";

export type AvatarRing = "line" | "surface" | "plane" | "accent";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: number;
  phoneSize?: number;
  ring?: AvatarRing;
  className?: string;
  eager?: boolean;
}

// A round avatar that never shrinks and falls back to the initial
const Avatar = ({ src, name, size = 40, phoneSize, ring = "line", className, eager = false }: AvatarProps) => {
  const [failed, setFailed] = useState<string | null>(null);
  const style = { width: size, height: size, "--avatar-phone": phoneSize ? `${phoneSize}px` : undefined };
  const classes = cx(
    styles.avatar,
    ring !== "line" && styles[ring],
    phoneSize !== undefined && styles.phone,
    className,
  );
  if (!src || failed === src) {
    return (
      <span
        aria-hidden="true"
        style={{ ...style, fontSize: Math.round(size * 0.42) }}
        className={cx(classes, styles.initial)}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(src)}
      style={style}
      className={classes}
    />
  );
};

export default Avatar;
