"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const LoaderDoneContext = createContext<boolean | null>(null);

export function useLoaderDone() {
  const value = useContext(LoaderDoneContext);
  return value === null ? true : value;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LoaderGate({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);

  return (
    <LoaderDoneContext.Provider value={done}>
      <Loader onDone={onDone} />
      {children}
    </LoaderDoneContext.Provider>
  );
}

function Loader({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(false);
      onDone();
      return;
    }

    const fadeTimer = window.setTimeout(() => setFading(true), 700);
    const doneTimer = window.setTimeout(() => {
      setVisible(false);
      onDone();
    }, 1000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-white transition-opacity duration-300 dark:bg-black"
      style={{ opacity: fading ? 0 : 1 }}
      aria-hidden
    />
  );
}
