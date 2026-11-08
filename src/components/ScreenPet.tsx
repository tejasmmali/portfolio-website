"use client";

import Script from "next/script";
import { useLoaderDone } from "@/components/Loader";

export function ScreenPet() {
  const loaderDone = useLoaderDone();

  if (!loaderDone) return null;

  return (
    <Script
      src="/oneko.js"
      strategy="afterInteractive"
      data-cat="/oneko.gif"
    />
  );
}
