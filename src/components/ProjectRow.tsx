import { ArrowUpRight } from "lucide-react";
import type { GithubProject } from "@/lib/github";

export function ProjectRow({ project }: { project: GithubProject }) {
  const meta = [
    project.language,
    project.stars > 0
      ? `${project.stars} ${project.stars === 1 ? "star" : "stars"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-neutral-200 px-2 py-3.5 transition-colors duration-200 hover:bg-black hover:text-white dark:border-neutral-800 dark:hover:bg-white dark:hover:text-black"
    >
      <span className="flex items-baseline gap-3">
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
          {project.title}
        </span>
        {meta ? (
          <span className="shrink-0 text-[11px] tabular-nums text-neutral-400 group-hover:text-inherit dark:text-neutral-500">
            {meta}
          </span>
        ) : null}
        <ArrowUpRight
          className="size-3 shrink-0 translate-y-px stroke-[1.25] opacity-50 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
          aria-hidden
        />
      </span>
      <span className="mt-1 line-clamp-2 max-w-[56ch] text-[12px] leading-relaxed text-neutral-500 group-hover:text-inherit group-hover:opacity-80 dark:text-neutral-400">
        {project.description}
      </span>
    </a>
  );
}
