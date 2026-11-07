"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { motion, useReducedMotion } from "motion/react";

const THEME = {
  light: ["#ffffff", "#d4d4d4", "#a3a3a3", "#525252", "#000000"],
  dark: ["#000000", "#262626", "#525252", "#a3a3a3", "#ffffff"],
};

type Props = {
  data: Activity[];
  summary: string;
  link: { href: string; label: string };
  unit: "contributions" | "minutes";
  className?: string;
};

function isDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function describe(activity: Activity, unit: Props["unit"]): string {
  if (unit === "contributions") {
    const noun = activity.count === 1 ? "contribution" : "contributions";
    return `${activity.count} ${noun} on ${activity.date}`;
  }
  if (activity.count === 0) return `No coding on ${activity.date}`;
  const h = Math.floor(activity.count / 60);
  const m = activity.count % 60;
  return `${h ? `${h}h ` : ""}${m}m coded on ${activity.date}`;
}

export function ContributionMap({ data, summary, link, unit, className = "" }: Props) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scheme, setScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const sync = () => setScheme(isDarkMode() ? "dark" : "light");
    sync();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mq.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const emptyStroke = scheme === "dark" ? "#262626" : "#d4d4d4";

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {summary}
        </p>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[11px] text-neutral-500 underline-offset-2 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-white"
        >
          {link.label}
        </a>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-none overflow-x-auto font-mono text-neutral-500 dark:text-neutral-400"
      >
        <ActivityCalendar
          data={data}
          theme={THEME}
          colorScheme={scheme}
          blockSize={8}
          blockMargin={3}
          blockRadius={0}
          fontSize={10}
          maxLevel={4}
          showTotalCount={false}
          showColorLegend
          showWeekdayLabels={false}
          labels={{ legend: { less: "less", more: "more" } }}
          renderBlock={(block, activity) =>
            cloneElement(block, {
              title: describe(activity, unit),
              stroke: activity.level === 0 ? emptyStroke : undefined,
              strokeWidth: activity.level === 0 ? 1 : undefined,
            })
          }
        />
      </div>
    </motion.div>
  );
}
