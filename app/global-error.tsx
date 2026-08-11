"use client";

import "./globals.css";

/**
 * Last resort: the only boundary that catches a throw in app/layout.tsx
 * itself, which it then replaces outright — hence the own <html>/<body>.
 *
 * Deliberately the one screen that does NOT use MessageScreen, Logo or
 * next/link. Every import this file doesn't have is a failure mode it can't
 * inherit, and by the time it renders the root layout has already failed.
 *
 * No next/font either: `--font-serif` is undefined app-wide, so `font-serif`
 * resolves to Georgia here exactly as it does on every other page. Body copy
 * falls back to the system sans instead of Inter — a difference nobody will
 * notice on a screen this rare, and worth it for a boundary with no font
 * machinery to break.
 *
 * `metadata` is not supported in a Client Component, so the tab title is set
 * with React's <title> element instead.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground m-0 antialiased">
        <title>Something went wrong | Jack The Jelli</title>

        <div
          role="alert"
          className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-24 text-center"
        >
          <p className="text-on-surface-variant text-[12px] font-semibold tracking-[0.1em] uppercase">
            Error
          </p>
          <h1 className="text-foreground mt-4 font-serif text-[40px] leading-[1.2] md:text-[56px] md:leading-[1.1]">
            Something went wrong
          </h1>
          <p className="text-on-surface-variant mt-4 text-[16px] leading-[1.6]">
            The page couldn&apos;t be loaded. Please try again.
            {error.digest ? (
              <span className="mt-6 block text-[12px]">
                Reference: {error.digest}
              </span>
            ) : null}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="border-foreground text-foreground hover:bg-foreground hover:text-background focus-visible:outline-foreground inline-flex min-h-11 cursor-pointer items-center justify-center rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Try Again
            </button>
            {/*
              A plain anchor, not next/link, on purpose: the root layout has
              failed, so this needs a full document request to rebuild the app
              from scratch. A soft navigation would re-enter the tree that just
              threw.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background focus-visible:outline-foreground inline-flex min-h-11 cursor-pointer items-center justify-center rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
