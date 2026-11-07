import Link from "next/link";
import { ContributionMap } from "@/components/ContributionMap";
import { ProjectRow } from "@/components/ProjectRow";
import { getContributions } from "@/lib/contributions";
import { getFeaturedRepos, GITHUB_USER } from "@/lib/github";
import { getHackatimeActivity } from "@/lib/hackatime";

export async function ProjectsSection() {
  const [projects, contributions, hackatime] = await Promise.all([
    getFeaturedRepos(),
    getContributions(),
    getHackatimeActivity(),
  ]);

  return (
    <>
      <ul className="-mx-2 border-t border-neutral-200 dark:border-neutral-800">
        {projects.map((project) => (
          <li key={project.href + project.title}>
            <ProjectRow project={project} />
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-[12px] text-neutral-500 underline-offset-4 transition-colors hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-white"
        >
          More
          <span aria-hidden>→</span>
        </Link>
      </div>
      {contributions ? (
        <ContributionMap
          className="mt-10"
          data={contributions.data}
          unit="contributions"
          summary={`${contributions.total.toLocaleString("en-US")} contributions in the last year`}
          link={{
            href: `https://github.com/${GITHUB_USER}`,
            label: `github.com/${GITHUB_USER}`,
          }}
        />
      ) : null}
      {hackatime ? (
        <ContributionMap
          className="mt-8"
          data={hackatime.data}
          unit="minutes"
          summary={`${Math.round(hackatime.totalMinutes / 60).toLocaleString("en-US")} hours coded in the last year`}
          link={{
            href: "https://hackatime.hackclub.com/@tejasmali",
            label: "hackatime.hackclub.com/@tejasmali",
          }}
        />
      ) : null}
    </>
  );
}

export function ProjectsSectionFallback() {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-neutral-200 py-3.5 dark:border-neutral-800"
        >
          <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-3 w-full max-w-sm bg-neutral-100 dark:bg-neutral-900" />
        </div>
      ))}
    </div>
  );
}
