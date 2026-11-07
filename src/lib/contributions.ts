import { connection } from "next/server";
import { GITHUB_USER } from "@/lib/github";

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionsPayload = {
  data: ContributionDay[];
  total: number;
};

type ApiResponse = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getContributions(): Promise<ContributionsPayload | null> {
  await connection();

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      throw new Error(`Contributions API ${res.status}`);
    }

    const json = (await res.json()) as ApiResponse;
    if (!Array.isArray(json.contributions)) {
      throw new Error("Unexpected contributions response");
    }

    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);

    const startStr = isoDate(start);
    const endStr = isoDate(end);

    const data = [...json.contributions]
      .filter((day) => day.date >= startStr && day.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (data.length === 0 || data[0].date !== startStr) {
      data.unshift({ date: startStr, count: 0, level: 0 });
    }
    if (data[data.length - 1].date !== endStr) {
      data.push({ date: endStr, count: 0, level: 0 });
    }

    const total = data.reduce((sum, day) => sum + day.count, 0);

    return { data, total };
  } catch (error) {
    console.error("[contributions] fetch failed", error);
    return null;
  }
}
