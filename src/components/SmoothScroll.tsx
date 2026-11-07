"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let destroyed = false;
    let lenis: { destroy: () => void; raf: (t: number) => void } | null =
      null;
    let rafId = 0;

    const run = async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;

      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });

      const frame = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };

    void run();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
