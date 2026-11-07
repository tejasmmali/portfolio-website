"use client";

import { useEffect, useRef } from "react";

export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let destroyed = false;
    let handle: { destroy: () => void; supported: boolean } | null = null;

    const run = async () => {
      try {
        const { background, drift } = await import("asciify-engine/kit");
        if (destroyed || !ref.current) return;

        const bg = background(ref.current, {
          preset: drift,
          cursor: false,
          lazy: false,
          speed: 0.35,
          cellSize: 14,
          charset: " .:-=+*#",
          opacity: 1,
        });

        if (!bg.supported) {
          bg.destroy();
          return;
        }
        handle = bg;
      } catch {
        /* skip decorative field */
      }
    };

    void run();

    return () => {
      destroyed = true;
      handle?.destroy();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] dark:opacity-[0.18]"
      aria-hidden
    />
  );
}
