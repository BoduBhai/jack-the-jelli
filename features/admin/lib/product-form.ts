// Shared styling + option lists for the admin product forms (create + edit),
// so both pages stay visually identical as fields are added.

export const fieldLabelClassName =
  "text-muted-foreground text-xs font-semibold tracking-widest uppercase";

// Bottom-border-only field, used by the edit-product panel.
export const underlineInputClassName =
  "border-b-border h-12 rounded-none border-t-0 border-r-0 border-b border-l-0";

// Boxed field on a tinted surface, used by the create-product form.
export const boxedInputClassName =
  "border-border bg-muted/50 focus-visible:bg-card focus-visible:border-foreground h-12 rounded-none border px-5 text-base transition-colors";

// Categories are admin-managed rows in MongoDB (D7), never a hardcoded list —
// both product forms take them as a prop loaded server-side. See
// features/admin/lib/categories.ts.
