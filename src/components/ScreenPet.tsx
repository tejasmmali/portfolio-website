"use client";

import { useEffect, useRef, useState } from "react";

const SPRITES = {
  sit: [
    "........#...#...",
    "........##.##...",
    "........#####...",
    "........#.#.#...",
    "........#####...",
    ".......#####....",
    "......######....",
    "#....#######....",
    "#....#######....",
    ".#...#######....",
    "..#.########....",
    "...#########....",
    "....##.##.##....",
  ],
  runA: [
    "............#..#",
    "............####",
    "#...........#.##",
    ".#.........#####",
    "..##############",
    "...############.",
    "...###########..",
    "...#.#.....#.#..",
    "..#...#...#...#.",
  ],
  runB: [
    "............#..#",
    "............####",
    "............#.##",
    "##.........#####",
    "..##############",
    "...############.",
    "...###########..",
    "....#.#...#.#...",
    "....#.#...#.#...",
  ],
  sleep: [
    "...........#..#.",
    "....#####..####.",
    "..#########.###.",
    ".##############.",
    "################",
    "################",
    ".##############.",
  ],
} as const;

type Frame = keyof typeof SPRITES;

const COLS = 16;
const ROWS = 13;
const PX = 2;
const PET_W = COLS * PX;
const PET_H = ROWS * PX;

const WAKE_AFTER_MS = 8000;
const SLEEP_AFTER_MS = 5000;
const CATCH_DISTANCE = 14;
const WAKE_DISTANCE = 72;
const FOLLOW_LAG = 0.028;
const MAX_SPEED = 85;
const MIN_SPEED = 22;
const RUN_FRAME_RATE = 3;

const RECTS: Record<Frame, { x: number; y: number }[]> = Object.fromEntries(
  (Object.keys(SPRITES) as Frame[]).map((frame) => {
    const rows = SPRITES[frame];
    const offset = ROWS - rows.length;
    const cells: { x: number; y: number }[] = [];
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === "#") cells.push({ x, y: y + offset });
      });
    });
    return [frame, cells];
  }),
) as Record<Frame, { x: number; y: number }[]>;

export function ScreenPet() {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<Frame>("sit");
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: -100, y: -100 };
    const pointer = { x: 0, y: 0, set: false };
    const target = { x: 0, y: 0 };
    const mountedAt = performance.now();

    let mode: "perched" | "run" | "rest" = "perched";
    let restSince = 0;
    let stepClock = 0;
    let last = performance.now();
    let raf = 0;
    let shown = false;
    let currentFrame: Frame = "sit";
    let currentFacing: 1 | -1 = -1;

    const showFrame = (next: Frame) => {
      if (next === currentFrame) return;
      currentFrame = next;
      setFrame(next);
    };

    const face = (next: 1 | -1) => {
      if (next === currentFacing) return;
      currentFacing = next;
      setFacing(next);
    };

    const perchPoint = () => {
      const perch = document.querySelector<HTMLElement>("[data-pet-perch]");
      if (!perch) return null;
      const rect = perch.getBoundingClientRect();
      return { x: rect.right - PET_W - 20, y: rect.top - PET_H + PX };
    };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX - PET_W / 2;
      pointer.y = event.clientY + 10;
      pointer.set = true;
      if (!target.x && !target.y) {
        target.x = pointer.x;
        target.y = pointer.y;
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (mode === "perched") {
        const perch = perchPoint();
        if (perch) {
          pos.x = perch.x;
          pos.y = perch.y;
        }
        showFrame("sit");
        const awake = now - mountedAt > WAKE_AFTER_MS;
        if (!reduce && pointer.set && (awake || !perch)) mode = "run";
      } else {
        if (pointer.set) {
          target.x += (pointer.x - target.x) * Math.min(1, FOLLOW_LAG + dt);
          target.y += (pointer.y - target.y) * Math.min(1, FOLLOW_LAG + dt);
        }

        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const threshold = mode === "run" ? CATCH_DISTANCE : WAKE_DISTANCE;

        if (dist > threshold) {
          mode = "run";
          const speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, dist * 0.45));
          const step = Math.min(dist, speed * dt);
          pos.x += (dx / dist) * step;
          pos.y += (dy / dist) * step;
          if (Math.abs(dx) > 2) face(dx > 0 ? 1 : -1);
          stepClock += dt;
          showFrame(
            Math.floor(stepClock * RUN_FRAME_RATE) % 2 ? "runA" : "runB",
          );
        } else {
          if (mode === "run") {
            mode = "rest";
            restSince = now;
          }
          showFrame(now - restSince > SLEEP_AFTER_MS ? "sleep" : "sit");
        }
      }

      el.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)`;
      if (!shown && pos.x > -100) {
        shown = true;
        setVisible(true);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-40 text-black transition-opacity duration-300 dark:text-white"
      style={{ width: PET_W, height: PET_H, opacity: visible ? 1 : 0 }}
    >
      <svg
        width={PET_W}
        height={PET_H}
        viewBox={`0 0 ${COLS} ${ROWS}`}
        shapeRendering="crispEdges"
        fill="currentColor"
        style={{ transform: facing < 0 ? "scaleX(-1)" : undefined }}
      >
        {RECTS[frame].map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </svg>
      {frame === "sleep" ? (
        <span className="absolute -top-3 right-0 font-mono text-[9px] leading-none text-neutral-500">
          z
        </span>
      ) : null}
    </div>
  );
}
