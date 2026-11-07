import { FALLBACK_PROJECTS } from "@/lib/projects";

export const GITHUB_USER = "tejasmmali";

export const FEATURED = [
  "Smart-Inspection-Helmet",
  "Multi-Drive",
  "Trash-Map",
  "RouterFlip",
  "smart-iot-alarm",
  "class-notes-automation-ai",
];

const TITLE_OVERRIDES: Record<string, string> = {
  "class-notes-automation-ai": "Class Notes Automation AI",
  "smart-inspection-helmet": "Smart Inspection Helmet",
  "smart-iot-alarm": "Smart IoT Alarm",
  "multi-drive": "Multi Drive",
  routerflip: "RouterFlip",
  "trash-map": "Trash Map",
};

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  "class-notes-automation-ai":
    "Local lecture transcription and study notes with faster-whisper and Ollama.",
  "smart-inspection-helmet":
    "A smart helmet project that uses computer vision to read analog gauges and monitor industrial equipment.",
  "smart-iot-alarm":
    "IoT desk alarm clock with a web-synced simulation control panel and phone notifications.",
  "multi-drive":
    "Manage multiple Google Drive and Mega accounts from a single interface — edit, delete, create files, view storage, and search across accounts.",
  routerflip:
    "A CLI for managing and switching Claude Code routers, gateways, API accounts, and models without editing configuration files.",
  "trash-map":
    "Open-source AI-powered garbage reporting and heat-map platform for waste hotspots across India.",
};

export type GithubProject = {
  title: string;
  description: string;
  href: string;
  language: string | null;
  stars: number;
};

type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

const LIMIT = 6;

function toProject(repo: GithubRepo): GithubProject {
  const key = repo.name.toLowerCase();
  return {
    title: TITLE_OVERRIDES[key] ?? repo.name.replace(/[-_]/g, " "),
    description:
      DESCRIPTION_OVERRIDES[key] ??
      (repo.description?.trim() || "No description."),
    href: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
  };
}

function rankRepos(repos: GithubRepo[]): GithubRepo[] {
  return [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return (
      new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );
  });
}

function pickFeatured(repos: GithubRepo[]): GithubRepo[] {
  const byName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]));
  const picked: GithubRepo[] = [];
  const used = new Set<string>();

  for (const name of FEATURED) {
    const match = byName.get(name.toLowerCase());
    if (!match || used.has(match.name.toLowerCase())) continue;
    picked.push(match);
    used.add(match.name.toLowerCase());
    if (picked.length >= LIMIT) return picked;
  }

  for (const repo of rankRepos(repos)) {
    if (used.has(repo.name.toLowerCase())) continue;
    picked.push(repo);
    used.add(repo.name.toLowerCase());
    if (picked.length >= LIMIT) break;
  }

  return picked;
}

async function fetchRepos(): Promise<GithubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tejasmmali-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
    {
      headers,
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }

  const repos = (await res.json()) as GithubRepo[];
  if (!Array.isArray(repos)) {
    throw new Error("Unexpected GitHub response");
  }

  return repos.filter((repo) => !repo.fork && !repo.archived);
}

export async function getFeaturedRepos(): Promise<GithubProject[]> {
  try {
    const filtered = await fetchRepos();
    const selected =
      FEATURED.length > 0
        ? pickFeatured(filtered)
        : rankRepos(filtered).slice(0, LIMIT);

    if (!selected.length) {
      return FALLBACK_PROJECTS;
    }

    return selected.map(toProject);
  } catch (error) {
    console.error("[github] falling back to static projects", error);
    return FALLBACK_PROJECTS;
  }
}

export async function getAllRepos(): Promise<GithubProject[]> {
  try {
    const filtered = await fetchRepos();
    if (!filtered.length) {
      return FALLBACK_PROJECTS;
    }
    return rankRepos(filtered).map(toProject);
  } catch (error) {
    console.error("[github] falling back to static projects", error);
    return FALLBACK_PROJECTS;
  }
}
