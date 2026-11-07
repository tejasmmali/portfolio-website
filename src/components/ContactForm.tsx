"use client";

import { useEffect, useState, type FormEvent } from "react";

const EMAIL = "tejasmmali.me@gmail.com";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const fieldClass =
  "w-full rounded-sm border border-neutral-300 bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-neutral-400 focus:border-black dark:border-neutral-700 dark:placeholder:text-neutral-600 dark:focus:border-white";

export function ContactForm() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) return;

    if (!ACCESS_KEY) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Portfolio — ${name}`)}&body=${encodeURIComponent(`${message}\n\n— ${name}\n${email}`)}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name,
          email,
          message,
          subject: `Portfolio message from ${name}`,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) throw new Error("fail");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (!mounted) {
    return <div className="mt-5 h-[220px]" aria-hidden />;
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2.5" noValidate>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-500 dark:text-neutral-400">
            Name
          </span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-500 dark:text-neutral-400">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] text-neutral-500 dark:text-neutral-400">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={4}
          className={`${fieldClass} min-h-[96px] resize-y`}
        />
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-sm border border-black bg-black px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-transparent hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-transparent dark:hover:text-white"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" ? (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Sent. I&apos;ll get back to you soon.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Couldn&apos;t send. Email{" "}
            <a href={`mailto:${EMAIL}`} className="underline underline-offset-2">
              {EMAIL}
            </a>{" "}
            instead.
          </p>
        ) : null}
      </div>
    </form>
  );
}
