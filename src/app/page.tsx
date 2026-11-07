import { Suspense } from "react";
import { Download } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { AsciiPortrait } from "@/components/AsciiPortrait";
import { ContactForm } from "@/components/ContactForm";
import { FadeIn } from "@/components/FadeIn";
import { HeroBackground } from "@/components/HeroBackground";
import { IconGithub, IconLinkedin, IconMail } from "@/components/Icons";
import { Loader } from "@/components/Loader";
import {
  ProjectsSection,
  ProjectsSectionFallback,
} from "@/components/ProjectsSection";
import { LocationTime } from "@/components/LocationTime";
import { ScreenPet } from "@/components/ScreenPet";
import { ThemeToggle } from "@/components/ThemeToggle";

const EMAIL = "tejasmmali.me@gmail.com";
const CV_HREF = "/Tejas_Mali_CV.pdf";

const stack = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "Python",
  "C++",
  "Vercel",
  "Render",
  "Git",
  "Firebase",
  "Netlify",
  "Web Dev",
  "Browser Extensions",
  "VS Code Extensions",
  "KiCad",
  "Cursor",
  "Claude Code",
  "Onshape",
  "Bootstrap",
  "WordPress",
  "Blender",
  "GitHub",
  "Arduino",
  "Notion",
  "Raspberry Pi",
];

const linkClass =
  "inline-flex items-center gap-2 text-neutral-700 underline-offset-4 hover:underline dark:text-neutral-300";

const cvButtonClass =
  "inline-flex items-center gap-1.5 border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-700 transition-colors duration-200 hover:border-black hover:bg-black hover:text-white dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:bg-white dark:hover:text-black";

export default function Home() {
  return (
    <>
      <Loader />
      <ScreenPet />
      <div className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-8 sm:px-6 sm:pt-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <LocationTime />
          <nav className="flex items-center gap-3">
            <a
              href={CV_HREF}
              download="Tejas_Mali_CV.pdf"
              className={cvButtonClass}
            >
              <Download className="size-3 stroke-[1.25]" aria-hidden />
              Download CV
            </a>
            <ThemeToggle />
          </nav>
        </header>

        <main>
          <section className="relative mb-16">
            <HeroBackground />
            <FadeIn>
              <div className="mb-6 flex items-center gap-4 sm:gap-5">
                <AsciiPortrait size={96} radius={22} />
                <div className="min-w-0">
                  <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
                    Tejas Mali
                  </h1>
                  <p className="mt-1.5 text-[13px] leading-snug text-neutral-500 dark:text-neutral-400">
                    automation &amp; robotics student
                  </p>
                </div>
              </div>
              <p className="max-w-prose text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                Mostly building robotics and open-source projects right now —
                inspection systems, embedded tools, and software that ships
                alongside them. I learn in the open through MLH and Hack Club, a
                nonprofit that funds teens to build projects, and keep robotics
                as the main focus.
              </p>
            </FadeIn>
          </section>

          <FadeIn delay={0.05}>
            <AboutSection />
          </FadeIn>

          <FadeIn delay={0.08}>
            <section className="mb-14" aria-labelledby="projects-heading">
              <h2
                id="projects-heading"
                className="mb-3 text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400"
              >
                Projects
              </h2>
              <Suspense fallback={<ProjectsSectionFallback />}>
                <ProjectsSection />
              </Suspense>
            </section>
          </FadeIn>

          <FadeIn delay={0.1}>
            <section className="mb-14" aria-labelledby="stack-heading">
              <h2
                id="stack-heading"
                className="mb-3 text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400"
              >
                Stack
              </h2>
              <p className="max-w-prose text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {stack.join(" · ")}
              </p>
            </section>
          </FadeIn>

          <FadeIn delay={0.12}>
            <section className="mb-16" aria-labelledby="contact-heading">
              <h2
                id="contact-heading"
                className="mb-3 text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400"
              >
                Contact
              </h2>
              <p className="mb-4 max-w-prose text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Open to collab on robotics builds, open-source work, or hack
                program teams. Say hi below.
              </p>
              <ul className="flex flex-col gap-2 text-[13px]">
                <li>
                  <a href={`mailto:${EMAIL}`} className={linkClass}>
                    <IconMail />
                    {EMAIL}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tejasmmali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <IconGithub />
                    github.com/tejasmmali
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/in/tejasmmali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <IconLinkedin />
                    linkedin.com/in/tejasmmali
                  </a>
                </li>
              </ul>
              <ContactForm />
            </section>
          </FadeIn>
        </main>

        <footer className="border-t border-neutral-200 pt-6 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          © 2026 Tejas Mali
        </footer>
      </div>
    </>
  );
}
