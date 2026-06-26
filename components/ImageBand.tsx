"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageBlock } from "@/types/menu";

const NATURAL_DIMENSIONS: Record<"16:9" | "4:5", { width: number; height: number }> = {
  "16:9": { width: 960, height: 540 },
  "4:5": { width: 800, height: 1000 },
};

/**
 * Renders one image band. Intended to be conditionally mounted only while
 * its category tab is active (see MenuApp) — this sidesteps the original
 * site's documented bug where native lazy-load / IntersectionObserver don't
 * repaint reliably when a hidden (display:none) section becomes visible.
 * Mounting fresh on tab activation guarantees the image actually loads.
 */
export function ImageBand({
  block,
  src,
  delayIndex,
}: {
  block: { aspect: "16:9" | "4:5"; caption?: string };
  src: string;
  delayIndex: number;
}) {
  const [errored, setErrored] = useState(false);
  const style = { animationDelay: `${Math.min(delayIndex, 6) * 0.03}s` };
  const { width, height } = NATURAL_DIMENSIONS[block.aspect];

  if (errored) {
    return (
      <figure className="image-band" data-aspect={block.aspect} style={style}>
        <div className="image-placeholder" style={{ aspectRatio: block.aspect.replace(":", "/") }}>
          image coming soon
        </div>
      </figure>
    );
  }

  return (
    <figure className="image-band" data-aspect={block.aspect} style={style}>
      <Image
        src={src}
        alt={block.caption || ""}
        width={width}
        height={height}
        onError={() => setErrored(true)}
        sizes="(min-width: 760px) 720px, 100vw"
      />
      {block.caption ? <figcaption className="image-band-caption">{block.caption}</figcaption> : null}
    </figure>
  );
}

export type { ImageBlock };
