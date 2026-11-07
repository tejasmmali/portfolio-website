"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function LocationTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
      Surat, India
      {time ? (
        <>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{time} IST</span>
        </>
      ) : null}
    </p>
  );
}
