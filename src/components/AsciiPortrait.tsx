"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export const ASCII_PORTRAIT = {
  src: "/headshot-mirrored.jpg",
  charset: " .:-=+*#%@",
  fontSizes: [22, 16, 12, 10, 8, 7, 6],
  durationMs: 1500,
  size: 280,
  charSpacing: 1,
  charAspect: 0.55,
  brightness: 0,
  contrast: 0.12,
  normalize: true,
  ditherStrength: 0,
} as const;

const PORTRAIT_BG = "#000000";
const PORTRAIT_FG = "#e6e6e6";

type EngineModule = typeof import("asciify-engine");
type AsciiOptions = EngineModule["DEFAULT_OPTIONS"];
type AsciiTextFrame = ReturnType<EngineModule["imageToAsciiTextFrame"]>;

type FrameEntry = {
  frame: AsciiTextFrame;
  options: AsciiOptions;
};

type Props = {
  className?: string;
  alt?: string;
  size?: number;
  radius?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error("Headshot has zero dimensions"));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function makeOptions(engine: EngineModule, fontSize: number): AsciiOptions {
  return {
    ...engine.DEFAULT_OPTIONS,
    fontSize,
    charSpacing: ASCII_PORTRAIT.charSpacing,
    charset: ASCII_PORTRAIT.charset,
    colorMode: "grayscale",
    invert: false,
    brightness: ASCII_PORTRAIT.brightness,
    contrast: ASCII_PORTRAIT.contrast,
    normalize: ASCII_PORTRAIT.normalize,
    ditherStrength: ASCII_PORTRAIT.ditherStrength,
    charAspect: ASCII_PORTRAIT.charAspect,
    animationStyle: "none",
    hoverStrength: 0,
    renderMode: "ascii",
  };
}

function paintFrame(
  engine: EngineModule,
  ctx: CanvasRenderingContext2D,
  entry: FrameEntry,
  width: number,
  height: number,
) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PORTRAIT_BG;
  ctx.fillRect(0, 0, width, height);

  engine.renderTextFrameToCanvas(ctx, entry.frame, entry.options, width, height);

  const probe = ctx.getImageData(
    Math.floor(width / 2),
    Math.floor(height / 2),
    1,
    1,
  ).data;
  const lit = probe[0] + probe[1] + probe[2];
  const looksEmpty = lit < 40;

  if (looksEmpty) {
    ctx.fillStyle = PORTRAIT_BG;
    ctx.fillRect(0, 0, width, height);
    const cols = Math.max(1, entry.frame.cols);
    const rows = Math.max(1, entry.frame.rowCount);
    const cellW = width / cols;
    const cellH = height / rows;
    const fontPx = Math.max(1, 0.9 * Math.min(cellW / 0.55, cellH));
    ctx.fillStyle = PORTRAIT_FG;
    ctx.font = `${fontPx}px ui-monospace, "Geist Mono", "JetBrains Mono", monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let y = 0; y < entry.frame.rows.length; y++) {
      const line = entry.frame.rows[y];
      if (!line.trim()) continue;
      ctx.fillText(line, cellW * 0.5, y * cellH + cellH * 0.5);
    }
  }

  ctx.restore();
}

export function AsciiPortrait({
  className = "",
  alt = "Portrait of Tejas Mali",
  size = ASCII_PORTRAIT.size,
  radius = 2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<FrameEntry[]>([]);
  const engineRef = useRef<EngineModule | null>(null);
  const rafRef = useRef<number | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [ready, setReady] = useState(false);

  const compact = size <= 96;
  const durationMs = compact ? 900 : ASCII_PORTRAIT.durationMs;

  const paint = useCallback((entry: FrameEntry) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    paintFrame(engine, ctx, entry, canvas.width, canvas.height);
  }, []);

  const buildFrames = useCallback(
    async (engine: EngineModule, image: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas missing");

      await document.fonts.ready;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelSize = Math.max(1, Math.round(size * dpr));
      canvas.width = pixelSize;
      canvas.height = pixelSize;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const entries: FrameEntry[] = [];

      const sizes = compact
        ? [14, 11, 9, 7, 6, 5]
        : ASCII_PORTRAIT.fontSizes;

      for (const fontSize of sizes) {
        const options = makeOptions(engine, fontSize);
        const frame = engine.imageToAsciiTextFrame(
          image,
          options,
          pixelSize,
          pixelSize,
        );
        entries.push({ frame, options });
      }

      if (!entries.length) throw new Error("No ASCII frames generated");
      framesRef.current = entries;
    },
    [compact, size],
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      setUseFallback(true);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const engine = await import("asciify-engine");
        if (cancelled) return;
        engineRef.current = engine;

        const image = await loadImage(ASCII_PORTRAIT.src);
        if (cancelled) return;

        await buildFrames(engine, image);
        if (cancelled) return;

        setReady(true);
        const start = performance.now();

        const tick = (now: number) => {
          if (cancelled) return;
          const frames = framesRef.current;
          if (!frames.length) return;

          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - (1 - t) * (1 - t);
          const index = Math.round(eased * (frames.length - 1));
          paint(frames[index]);

          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setShowPhoto(true);
          }
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          console.error("[AsciiPortrait]", err);
          setUseFallback(true);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [buildFrames, durationMs, paint]);

  const shellStyle: CSSProperties = {
    width: size,
    height: size,
    maxWidth: "100%",
    background: PORTRAIT_BG,
    borderRadius: radius,
  };

  if (useFallback) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden border border-neutral-500 ${className}`}
        style={shellStyle}
        data-pet-perch
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASCII_PORTRAIT.src}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-neutral-500 ${className}`}
      style={{ ...shellStyle, aspectRatio: "1 / 1" }}
      data-pet-perch
      role="img"
      aria-label={alt}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{
          opacity: showPhoto ? 0 : 1,
          background: PORTRAIT_BG,
        }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASCII_PORTRAIT.src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: showPhoto ? 1 : 0 }}
        aria-hidden
      />
      {!ready && (
        <div
          className="absolute inset-0"
          style={{ background: PORTRAIT_BG }}
          aria-hidden
        />
      )}
    </div>
  );
}
