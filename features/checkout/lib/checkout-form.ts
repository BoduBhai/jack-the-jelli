// Shared styling for the checkout form.
//
// Deliberately not the boxed inputs used by auth/account: the design system's
// input is bottom-border only with a label-caps label sitting above it, and
// the checkout mock is the page that actually shows that treatment. The two
// styles coexist rather than one overriding the other — an account settings
// panel and a single-column purchase flow don't have to look identical.

export const fieldLabelClassName =
  "text-on-surface-variant text-[12px] font-semibold tracking-[0.1em] uppercase";

export const underlineInputClassName =
  "border-outline-variant/50 focus-visible:border-foreground h-11 rounded-none border-0 border-b bg-transparent px-0 text-[16px] shadow-none transition-colors focus-visible:ring-0 aria-invalid:border-destructive";

export const underlineSelectClassName =
  "border-outline-variant/50 focus-visible:border-foreground h-11 w-full rounded-none border-0 border-b bg-transparent px-0 text-[16px] shadow-none transition-colors focus-visible:ring-0 aria-invalid:border-destructive";

/** The hairline-ruled section heading that separates the form's three blocks. */
export const sectionHeadingClassName =
  "border-outline-variant/20 text-on-surface-variant border-b pb-3 text-[12px] font-semibold tracking-[0.1em] uppercase";
