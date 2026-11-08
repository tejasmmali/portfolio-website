"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "light" | "dark";

const KEY = "tm-theme";

function systemMode(): Mode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyMode(mode: Mode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const next: Mode =
      stored === "light" || stored === "dark" ? stored : systemMode();
    setMode(next);
    applyMode(next);
  }, []);

  const toggle = () => {
    if (busy) return;
    const next: Mode = mode === "dark" ? "light" : "dark";

    const commit = () => {
      applyMode(next);
      setMode(next);
      window.localStorage.setItem(KEY, next);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    const startViewTransition = document.startViewTransition?.bind(document);
    if (!startViewTransition) {
      commit();
      return;
    }

    setBusy(true);
    const transition = startViewTransition(commit);
    void transition.finished.finally(() => setBusy(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="inline-flex size-7 items-center justify-center text-neutral-500 transition-colors hover:text-black disabled:opacity-60 dark:text-neutral-400 dark:hover:text-white"
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? (
        <Moon className="size-3.5 stroke-[1.25]" aria-hidden />
      ) : (
        <Sun className="size-3.5 stroke-[1.25]" aria-hidden />
      )}
    </button>
  );
}
