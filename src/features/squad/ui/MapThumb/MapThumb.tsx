"use client";

import Image from "next/image";
import { createContext, use, useState, type ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import { mapName } from "../../model/maps";

import styles from "./MapThumb.module.scss";

const MapImagesContext = createContext<Readonly<Record<string, string>>>({});

const SIZES = { xs: "32px", sm: "44px", md: "56px" } as const;

// Shares the map pictures of the squad with every MapThumb below it
export const MapImagesProvider = ({
  images,
  children,
}: {
  images: Readonly<Record<string, string>>;
  children: ReactNode;
}) => <MapImagesContext value={images}>{children}</MapImagesContext>;

interface MapThumbProps {
  map: string;
  size?: keyof typeof SIZES;
  className?: string;
}

// A small picture of the map, or its initials when FACEIT has none
const MapThumb = ({ map, size = "sm", className }: MapThumbProps) => {
  const image = use(MapImagesContext)[map];
  const [failed, setFailed] = useState(false);
  return (
    <span aria-hidden="true" className={cx(styles.thumb, styles[size], className)}>
      {image && !failed ? (
        <Image src={image} alt="" fill sizes={SIZES[size]} className={styles.image} onError={() => setFailed(true)} />
      ) : (
        <span className={styles.initials}>{mapName(map).slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
};

export default MapThumb;
