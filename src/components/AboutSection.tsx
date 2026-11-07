"use client";

import { motion, useReducedMotion } from "motion/react";

const paragraphs = [
  "I'm a diploma student in Automation and Robotics at Dr. S. & S. Gandhi College of Engineering and Technology, Surat. Robotics is the centre of what I do — sensors, vision, embedded boards, and the machines that inspect or move through the physical world.",
  "Right now I'm making projects in the open: open-source repos, team builds, and programs like MLH and Hack Club — a nonprofit that funds teens to ship real projects. That loop is how I pick up experience: build something, get feedback, improve it.",
  "My current work is in industrial inspection. I'm building systems that help check equipment in the field — a smart helmet that reads analog gauges with computer vision, and a magnetic crawler that finds cracks on metal surfaces. Robotics first; software supports that.",
];

export function AboutSection() {
  const reduce = useReducedMotion();

  return (
    <section className="mb-14" aria-labelledby="about-heading">
      <div className="mb-4 flex items-center gap-3">
        <h2
          id="about-heading"
          className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400"
        >
          About
        </h2>
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-left bg-neutral-200 dark:bg-neutral-800"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>

      <div className="flex max-w-prose flex-col gap-3 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        {paragraphs.map((text, i) => (
          <motion.p
            key={text.slice(0, 24)}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-24px" }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 0.4,
                    delay: 0.12 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
