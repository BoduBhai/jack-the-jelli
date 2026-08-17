"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // Falls back to "light", not "system". No next-themes provider is mounted and
  // nothing ever adds the `.dark` class, so the app renders light at every OS
  // setting. Under "system" Sonner reads `prefers-color-scheme` on its own and
  // switched to its dark palette while the toast kept the light `--popover`
  // background set below — which is what made the description unreadable. Mount
  // a ThemeProvider and this follows the app again without further changes.
  const { theme = "light" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // The description is the one slot Sonner colours with a hardcoded hex
          // instead of the `--normal-*` vars above, so it has to be pinned here
          // to stay on-palette: #444748 on #f9f8f6 is ~8.8:1, clearly secondary
          // to the ~16:1 title but well past AA for 13px text.
          //
          // `!` is load-bearing. Sonner appends its stylesheet to <head> at
          // runtime — after Tailwind's, and unlayered — so its
          // `[data-description] { color }` rule outranks a plain utility class
          // on both source order and layer precedence.
          description: "text-on-surface-variant!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
