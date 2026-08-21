import { LEGAL_LAST_UPDATED } from "@/features/legal/lib/legal-info";

/**
 * The shell both legal pages render into.
 *
 * Typography is applied here with descendant variants rather than in each page
 * so the documents stay as plain prose JSX — the pages carry wording, this
 * carries the type scale. It follows /track: serif display heading, Inter body,
 * one measure-limited column.
 */
export default function LegalDocument({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col px-5 pt-32 pb-32 md:px-16 md:pt-40">
      <header className="mb-16 text-center">
        <h1 className="text-foreground font-serif text-[40px] leading-[1.1] tracking-tight md:text-[56px]">
          {title}
        </h1>
        <p className="text-on-surface-variant mx-auto mt-4 max-w-md text-[18px] leading-relaxed">
          {intro}
        </p>
        <p className="text-on-surface-variant mt-6 text-[10px] font-semibold tracking-[0.25em] uppercase">
          Last updated {LEGAL_LAST_UPDATED}
        </p>
      </header>

      <article
        className={[
          "text-on-surface-variant text-[16px] leading-relaxed",
          // Section headings.
          "[&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-[24px] [&_h2]:leading-tight [&_h2]:first:mt-0",
          "[&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[16px]",
          // Body copy and lists.
          "[&_p]:mt-4 [&_p]:first:mt-0",
          "[&_li]:list-disc [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5",
          // Inline emphasis: no 500 weight is loaded, so lift colour instead.
          "[&_strong]:text-foreground [&_strong]:font-normal",
          "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
        ].join(" ")}
      >
        {children}
      </article>
    </div>
  );
}
