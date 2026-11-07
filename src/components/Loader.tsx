"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "tm-ascii-loader-seen";

type Props = {
  onDone?: () => void;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Loader({ onDone }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        onDone?.();
        return;
      }
    } catch {
      /* private mode */
    }

    if (prefersReducedMotion()) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      onDone?.();
      return;
    }

    let destroyed = false;
    let decodeHandle: { destroy: () => void; replay: () => void } | null =
      null;
    let fadeTimer: number | undefined;
    let doneTimer: number | undefined;

    setVisible(true);

    const run = async () => {
      const { decode } = await import("asciify-engine/kit");
      if (destroyed || !hostRef.current) return;

      decodeHandle = decode(hostRef.current, {
        text: "Tejas Mali",
        duration: 900,
        trigger: "manual",
        settle: "glyphs",
        replayOnHover: false,
        lazy: false,
        charset: " .:-=+*#%@",
      });

      decodeHandle.replay();

      fadeTimer = window.setTimeout(() => {
        if (destroyed) return;
        setFading(true);
        doneTimer = window.setTimeout(() => {
          if (destroyed) return;
          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
          onDone?.();
        }, 280);
      }, 1000);
    };

    void run();

    return () => {
      destroyed = true;
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (doneTimer) window.clearTimeout(doneTimer);
      decodeHandle?.destroy();
    };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
      aria-hidden
    >
      <div
        ref={hostRef}
        className="font-mono text-sm tracking-tight text-black dark:text-white"
      >
        Tejas Mali
      </div>
    </div>
  );
}
