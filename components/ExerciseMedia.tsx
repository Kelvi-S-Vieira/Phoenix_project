"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shows the first frame of an exercise's demonstration image, alternating
 * between the two provided frames (start/end of the movement) while the
 * element is visible on screen — ported from the prototype's
 * `buildSimpleMediaEl` (IntersectionObserver-gated `setInterval`). If the
 * image fails to load it just disappears (no broken-image icon).
 */
export default function ExerciseMedia({ name, frames }: { name: string; frames: string[] }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (frames.length <= 1) return;
    const el = imgRef.current;
    if (!el || typeof IntersectionObserver !== "function") return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!timer) {
              timer = setInterval(() => {
                setFrameIdx((i) => (i + 1) % frames.length);
              }, 700);
            }
          } else if (timer) {
            clearInterval(timer);
            timer = null;
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      if (timer) clearInterval(timer);
      observer.disconnect();
    };
  }, [frames.length]);

  if (!frames.length || broken) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domain; not worth a next/image remote-patterns entry for a demo GIF frame.
    <img
      ref={imgRef}
      className="fx-exercise-media"
      src={frames[frameIdx % frames.length]}
      alt={`Demonstração: ${name}`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}
