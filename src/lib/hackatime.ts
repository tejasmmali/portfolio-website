import { connection } from "next/server";
import type { ContributionDay } from "@/lib/contributions";

type Span = {
  start_time: number;
  end_time: number;
  duration: number;
};

export type HackatimePayload = {
  data: ContributionDay[];
  totalMinutes: number;
};

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function levelFor(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 90) return 2;
  if (minutes < 180) return 3;
  return 4;
}

export async function getHackatimeActivity(): Promise<HackatimePayload | null> {
  const apiKey = process.env.HACKATIME_API_KEY;
  const user = process.env.HACKATIME_USER ?? (apiKey ? "my" : "tejasmali");

  await connection();

  try {
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);

    const url = new URL(
      `https://hackatime.hackclub.com/api/v1/users/${encodeURIComponent(user)}/heartbeats/spans`,
    );
    url.searchParams.set("start_date", start.toISOString());

    const res = await fetch(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Hackatime API ${res.status}`);
    }

    const json = (await res.json()) as { spans?: Span[] };
    if (!Array.isArray(json.spans)) {
      throw new Error("Unexpected Hackatime response");
    }

    const minutesByDay = new Map<string, number>();
    for (const span of json.spans) {
      const key = dayKey.format(new Date(span.start_time * 1000));
      minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + span.duration / 60);
    }

    const startKey = dayKey.format(start);
    const endKey = dayKey.format(end);

    const data: ContributionDay[] = [...minutesByDay.entries()]
      .filter(([date]) => date >= startKey && date <= endKey)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, minutes]) => {
        const count = Math.round(minutes);
        return { date, count, level: levelFor(count) };
      });

    if (data[0]?.date !== startKey) {
      data.unshift({ date: startKey, count: 0, level: 0 });
    }
    if (data[data.length - 1].date !== endKey) {
      data.push({ date: endKey, count: 0, level: 0 });
    }

    const totalMinutes = data.reduce((sum, day) => sum + day.count, 0);
    return { data, totalMinutes };
  } catch (error) {
    console.error("[hackatime] fetch failed", error);
    return null;
  }
}
