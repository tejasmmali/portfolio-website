import type { Metadata } from "next";
import Link from "next/link";
import { ProjectRow } from "@/components/ProjectRow";
import { LocationTime } from "@/components/LocationTime";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAllRepos } from "@/lib/github";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "All open-source and personal projects by Tejas Mali — robotics, tools, and web apps.",
  alternates: {
    canonical: "/projects",
  },
};

export default async function ProjectsPage() {
  const projects = await getAllRepos();

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-10 flex items-center justify-between gap-4">
        <LocationTime />
        <ThemeToggle />
      </header>

      <main>
        <nav className="mb-6 text-[12px] text-neutral-500 dark:text-neutral-400">
          <Link
            href="/"
            className="underline-offset-4 transition-colors hover:text-black hover:underline dark:hover:text-white"
          >
            ← Home
          </Link>
        </nav>

        <h1 className="mb-2 font-serif text-[28px] leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
          Projects
        </h1>
        <p className="mb-8 max-w-prose text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Everything public on GitHub that isn&apos;t a fork — ranked by stars,
          then recent activity.
        </p>

        <ul className="-mx-2 border-t border-neutral-200 dark:border-neutral-800">
          {projects.map((project) => (
            <li key={project.href + project.title}>
              <ProjectRow project={project} />
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-16 border-t border-neutral-200 pt-6 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        © 2026 Tejas Mali
      </footer>
    </div>
  );
}
