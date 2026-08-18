# Known bugs

Running list of bugs found on the live site. Not fixed yet — logged only.

---

## 1. "Create an account to track your order" does not work (guest checkout)

**Status:** open — not investigated yet
**Found:** 2026-08-13
**Where:** guest checkout → order confirmation

**Steps to reproduce**

1. Browse the storefront as a guest (not signed in)
2. Add an item to the cart and complete checkout
3. On the order confirmation / success screen, click **Create an account to track your order**

**Expected:** the guest is taken through account creation and the just-placed order is attached to the new account, so it shows up in their order history.

**Actual:** the feature does not work.

**Notes**

- Needs a proper diagnosis — capture the exact failure (error message, redirect, silent no-op, console/network errors, Vercel logs) before attempting a fix.
- Likely touches `features/checkout/` and the guest-order → user-account claiming path.

---

## 2. Product images are too big on the product details page

**Status:** fixed — 2026-08-18
**Found:** 2026-08-13
**Where:** product details page

**Root cause:** `ProductDetailView.tsx` wrapped the whole two-column row (image + info) in a `lg:max-w-[calc((100svh-14rem)*4/3+3rem)]` cap meant to stop the gallery image from exceeding one screen's height. Capping the *row* instead of just the image meant the info column — and the row's own centering — paid for a constraint that was only about the image; at ordinary desktop heights (measured 1920×855) the whole row shrank to 889px inside a 1312px-wide container, leaving ~210px of dead symmetric margin on each side.

**Fix:** removed the row-level wrapper; the height cap now lives directly on the gallery's main-slide box in `ProductGallery.tsx` (`lg:max-w-[calc(100svh-14rem)]`), so only the image shrinks on short viewports and the row always uses the full page container width like every other section. See also #7 below — the slide also moved from `aspect-4/5` to `aspect-square` as part of the same pass.

---

## 3. Page transitions are abrupt — no loading state between routes

**Status:** open — polish, not a functional break
**Found:** 2026-08-13
**Where:** site-wide navigation

**Steps to reproduce**

1. Navigate between pages (e.g. homepage → product details → cart)

**Expected:** the transition reads as deliberate — a loading indicator or a brief fade so the change of page feels continuous.

**Actual:** pages swap abruptly with nothing in between. Feels jarring rather than considered.

**Notes**

- Two separate things to decide: a *loading state* (something shown while the next route's data resolves) and a *transition* (visual easing between the old and new page). They can be done independently.
- App Router handles the first with `loading.tsx` boundaries — check which routes have one.
- Any animation must stay inside the "Quiet Luxury Editorial" direction — restrained, no bounce or slide-in flourish.

---

## 4. "Add to cart" toast — description text opacity is too low

**Status:** open — not investigated yet
**Found:** 2026-08-14
**Where:** "Added to your cart." toast, shown after tapping **Add to cart** (`features/products/components/AddToCartButton.tsx:52-55`)

**Steps to reproduce**

1. On a product card or the product details page, click **Add to cart**
2. Look at the toast that appears bottom of screen: "Added to your cart." with the product name underneath (e.g. "Flame Blue n White")

**Expected:** the product name (the toast's `description`) reads as secondary text — dimmer than the "Added to your cart." title — but still clearly legible, using a solid secondary color rather than a low-opacity one.

**Actual:** the description text's opacity is too low, making it hard to read.

**Notes**

- Sonner applies its own default opacity to `[data-description]` text; the toast is wired up in `components/ui/sonner.tsx` (shadcn `Toaster` wrapper) via `toastOptions.classNames`.
- Fix should replace the opacity-based dimming with a solid secondary/muted-foreground color token, not just raise the opacity value.
- Check other toasts in the app (`features/admin/components/*`, `components/layout/UserMenu.tsx`) use the same `description` pattern — fixing it at the `Toaster` level (`components/ui/sonner.tsx`) fixes all of them at once.

---

## 5. Font audit — EB Garamond never actually renders anywhere

**Status:** confirmed by code trace, not yet fixed
**Found:** 2026-08-14
**Where:** app-wide typography (`app/layout.tsx`, `app/globals.css`, every `font-serif` / `font-heading` / `font-mono` usage)

CLAUDE.md documents the type system as *"EB Garamond for display/headings and Inter for body text ... applied with `font-(--font-garamond)` / `font-(--font-inter)` Tailwind utilities."* That's not what the code actually does.

**What's actually loaded** (`app/layout.tsx:6-16`)

- `EB_Garamond` → CSS variable `--font-garamond`
- `Inter` → CSS variable `--font-inter`, applied directly to `<body>` via `font-(--font-inter)` ([app/layout.tsx:34](app/layout.tsx#L34))

**What's actually used in components** — nothing in `features/**` or `app/**` (outside `app/layout.tsx` itself) references `font-(--font-garamond)`. Instead, headings across the codebase use two different Tailwind utilities, both of which are wired to the wrong thing:

- **`font-serif`** (site-wide storefront headings: `HeroSection`, `ProductCard`, `CheckoutView`, `CraftsmanshipGrid`, `OrderReceipt`, `my-orders`, etc. — dozens of call sites) → Tailwind's `--font-serif` custom property is **never defined anywhere** in `app/globals.css` or the imported `shadcn/tailwind.css`. With no value to resolve, it falls back to Tailwind's built-in default serif stack — **Georgia**, not EB Garamond. `app/global-error.tsx:13-17` even says this out loud in a comment: *"`--font-serif` is undefined app-wide, so `font-serif` resolves to Georgia here exactly as it does on every other page."*
- **`font-heading`** (admin dashboard + all auth forms: `LoginForm`, `RegisterForm`, `AccountForm`, `OrderTable`, `ProductEditor`, etc.) → `app/globals.css:13` maps it to `--font-sans`, but `app/globals.css:11` defines `--font-sans: var(--font-sans)` — a **self-referential/circular** custom property. That's an invalid value, so the browser drops it and the element just inherits whatever font-family it already had — which is Inter, from `<body>`. So "headings" in admin/auth render as plain Inter, indistinguishable from body text.
- **`font-mono`** (one spot: `app/admin/products/page.tsx:131`, a SKU-like value) → `app/globals.css:12` maps it to `--font-geist-mono`, but no Geist Mono font is loaded anywhere (`app/layout.tsx` only loads EB Garamond and Inter). Same failure mode — invalid value, falls back to inherited Inter.
- **Transactional emails** (`lib/email.ts:44`) hardcode `font-family: Georgia, 'Times New Roman', serif` inline — unrelated to the Tailwind/next-font setup (correct on its own, since email clients need inline styles, but it does mean the emails coincidentally land on the same Georgia the storefront gets by accident).

**Net result:** EB Garamond is downloaded (extra font weight shipped to every visitor) but **never rendered** anywhere on the site. Every "serif display heading" the design is built around is actually the browser's default Georgia. Every admin/auth "heading" is actually just Inter at whatever size/weight was set, with no typeface distinction from body copy at all.

**Fix direction (not yet applied):** either map `--font-serif` → `var(--font-garamond)` and `--font-heading` → `var(--font-garamond)` in `app/globals.css`, or replace the `font-serif` / `font-heading` call sites with the documented `font-(--font-garamond)` utility directly. Also decide whether `font-mono` should be deleted (nothing needs a monospace face) or given a real font.

---

## 6. Not properly responsive above ~1920×1080 (2K/ultrawide/4K)

**Status:** open — audited via code, not yet visually tested on a real large monitor
**Found:** 2026-08-14
**Where:** site-wide, but the concrete offender is `features/homepage/components/HeroSection.tsx`

Mobile and standard desktop (up to ~1920px) hold up fine. Above that — 2560×1440, 3440×1440 ultrawide, 3840×2160 4K — is where it breaks down.

**Audit — what the code shows**

- Nearly every content section (`ProductSection`, `Footer`, `CraftsmanshipGrid`, `CollectionHero`, `CollectionGrid`, `RelatedProducts`, `ProductDetailView`, `CheckoutView`, `admin/layout.tsx`, `NavBar`'s inner row) is wrapped in the same `mx-auto max-w-360 px-5 md:px-16` container — a hard 1440px cap, centered. That part is actually fine at any width: on a 3840px screen these sections just sit centered with ~1200px of even whitespace on each side, which is a legitimate, common large-screen pattern, not breakage.
- **The one true full-bleed element is the homepage hero** ([features/homepage/components/HeroSection.tsx:14-34](features/homepage/components/HeroSection.tsx#L14-L34)): `h-screen w-full` with a `next/image fill` at `sizes="100vw"` and `object-cover`. No max-width, no aspect-ratio cap. This is the only place in the codebase where an image is asked to cover the full viewport at `100vh` regardless of aspect ratio.
- `object-cover` at `100vw × 100vh` means the crop window's aspect ratio *is* the browser window's aspect ratio. The image (`public/hero-image.webp`, "a cinematic close-up of a handcrafted leather wallet") was almost certainly framed and exported for a roughly 16:9-or-taller desktop window. At 3440×1440 (2.39:1) or an ultrawide monitor, the crop window gets dramatically wider and shorter than that — `object-cover` will zoom in and slice off top/bottom to fill it, likely cropping the wallet itself out of frame or centering on empty stone pedestal instead of the product.
- The hero headline (`text-[64px]` at `md:`, fixed) doesn't scale past that — proportionally it gets smaller relative to the hero canvas the wider the screen gets, since nothing in the type scale grows past the `md:` breakpoint.
- No `2xl:`/`min-width` styles exist anywhere in the codebase (confirmed by search) — there is no large-screen-specific styling at all today. Whatever happens above 1920px is whatever the `md:`/`lg:` rules happen to produce, untested for that range.

**Fix plan** (using the `frontend-design` skill's framing — the hero is the page's thesis and has to hold at every viewport, and the "responsive down to mobile" quality floor should read as "responsive across the full range," not just downward)

1. **Fix the hero's crop behavior first — it's the only real breakage.** Options, in order of effort:
   - Cap the hero's rendered height so it stops growing indefinitely with viewport height beyond a point (e.g. `h-screen` → `h-screen max-h-[900px]` or similar), so ultrawide/4K get a shorter, letterboxed band instead of a proportionally taller crop demand.
   - Add an `object-position` tuned to keep the wallet in frame at wide aspect ratios, or swap to a second, wider-framed export of the hero image served above a `min-width` breakpoint via `<picture>`/`next/image` art direction, so the composition is intentional at 21:9+ instead of an automatic crop.
   - Whichever is chosen, verify by actually opening the homepage at 2560×1440, 3440×1440, and 3840×2160 (real monitor or browser devtools responsive mode set to those exact sizes) — this can't be signed off from code reading alone.
2. **Decide the container strategy on purpose, then document it.** The `max-w-360` (1440px) cap is already the de facto answer for every non-hero section and looks intentional — confirm that's the actual decision (vs. an accident of copy-pasting the same container class everywhere) and write it down (e.g. in CLAUDE.md's design-system section) so it's not accidentally "fixed" into full-bleed later.
3. **Consider fluid type for the hero headline only.** Since it's the one element meant to dominate the screen, swap the fixed `text-[40px] md:text-[64px]` for a `clamp()`-based size (e.g. `clamp(2.5rem, 4vw + 1rem, 4.5rem)`) so it keeps a deliberate relationship to viewport width past `md:` instead of pinning flat. Leave body copy and other headings on the fixed scale — per the skill's restraint principle, don't fluid-scale everything just because one element needs it.
4. **Sweep the rest for viewport-relative units without a cap** — grep for `vw` and `h-screen` (already done above; only `HeroSection` and the two `sizes="100vw"` image hints qualify, and the `sizes` ones are just responsive-image hints, not layout, so they're fine as-is).
5. **Re-test the full checklist at large sizes**, not just the hero: nav bar spacing, footer, product grid column counts (`CollectionGrid`), and the admin `min-h-screen` shell (`app/admin/layout.tsx:14-17`), since those weren't visually checked here — only confirmed by code that they're inside the same 1440px cap.

Steps 1 and its verification sub-step are the only ones that need an actual browser at real large-monitor resolutions — everything else here was reasoned from the container/class patterns in the code, not observed on screen, so treat the container-cap conclusion (step 2) as provisional until someone looks at it live too.

---

## 7. Image upload/display audit — no cropping at upload, inconsistent crops at display

**Status:** confirmed by code trace, not yet fixed
**Found:** 2026-08-15
**Where:** upload pipeline (`lib/cloudinary.ts`, `app/api/cloudinary/sign/route.ts`, `features/admin/components/ProductMediaUploader.tsx`) and every place a product image is rendered site-wide

Checked whether uploaded images are being cropped or resized somewhere in the pipeline. Short answer: **not at upload** — but the exact same original file is displayed at several different fixed aspect ratios across the site with no guidance to the admin about which one matters, so it *looks* cropped differently in different places.

**Upload — nothing is cropped or resized here**

- Images go browser → Cloudinary directly ([features/admin/components/ProductMediaUploader.tsx:82-121](features/admin/components/ProductMediaUploader.tsx#L82-L121)), bypassing the Next.js server entirely (comment at line 75-76 explains this is because Server Actions cap request bodies at 1 MB).
- The only params signed server-side are `folder` and `timestamp` ([app/api/cloudinary/sign/route.ts:33-35](app/api/cloudinary/sign/route.ts#L33-L35); `lib/cloudinary.ts:29-34`). No `crop`, `width`, `height`, `gravity`, or `eager` transformation is ever signed or sent with the upload.
- So whatever file the admin picks — any resolution, any aspect ratio — lands in Cloudinary byte-for-byte as `secure_url`, and that exact URL is what gets saved to the product's `images` array. No server-side normalization step exists.

**Display — the same source image is cropped differently depending on where it's shown**, because each consumer wraps it in a fixed-ratio box with `object-cover` and no two boxes agree:

| Location | Box shape |
|---|---|
| `ProductGallery` main slide ([ProductGallery.tsx:49](features/products/components/ProductGallery.tsx#L49)) | `aspect-4/5` |
| `ProductGallery` thumbnail strip ([ProductGallery.tsx:96](features/products/components/ProductGallery.tsx#L96)) | `aspect-square` |
| `ProductCard`, both variants ([ProductCard.tsx:28](features/products/components/ProductCard.tsx#L28), [:55](features/products/components/ProductCard.tsx#L55)) | `aspect-4/5` |
| Homepage `ProductSection` tiles ([ProductSection.tsx:90](features/homepage/components/ProductSection.tsx#L90)) | `aspect-4/5` |
| `CartLine` thumbnail ([CartLine.tsx:42](features/cart/components/CartLine.tsx#L42)) | fixed `h-24 w-20` (5:6) |
| `CheckoutSummary` line item ([CheckoutSummary.tsx:69](features/checkout/components/CheckoutSummary.tsx#L69)) | fixed `h-16 w-14` (7:8) |
| Admin `ProductMediaUploader` preview tile ([ProductMediaUploader.tsx:348](features/admin/components/ProductMediaUploader.tsx#L348)) | `aspect-square` |

That's at least three distinct crop ratios (4:5, 1:1, and two different near-square-but-not-quite box shapes) applied to one uploaded file, with no preview anywhere in the admin UI showing how a given photo will actually crop in the gallery vs. the cart vs. the checkout line. An admin who frames a product tightly for the square uploader thumbnail can easily get the product's edges sliced off in the 4:5 product card, or vice versa.

**Net result:** nothing is destructively cropped or re-encoded — the original upload is preserved untouched on Cloudinary, and Next's built-in image optimizer resizing (via `sizes` on each `next/image`) is normal responsive-image behavior, not a bug. The actual problem is purely presentational: inconsistent `object-cover` box ratios across components, with no upload-time cropping tool or aspect-ratio guidance to help the admin pick a source photo that survives all of them.

**Fix direction (not yet applied):** either (a) standardize on a single aspect ratio for all product-image boxes site-wide, or (b) add a crop/preview step to `ProductMediaUploader` so the admin can see and adjust the framing for the ratios actually in use before publishing, or (c) at minimum document the required source aspect ratio (e.g. "shoot/crop to 4:5 before uploading") next to the dropzone.

**Partial fix, 2026-08-18:** `ProductGallery`'s main slide moved from `aspect-4/5` to `aspect-square`, so it now matches its own thumbnail strip and `ProductCard` — one fewer distinct ratio in the table above. What's left is genuinely a content problem, not layout: e.g. "Classic Silverrrrr"'s source photo has a lot of white padding baked into the file itself (product occupies a small fraction of the frame) versus "Flame Yellow n White" filling its frame edge-to-edge — confirmed live that the gallery box itself renders pixel-identical between the two, so the size difference visitors see is the photo's own framing, not the box. (b) or (c) above is still the real fix for that.

Also noted while touching `ProductGallery.tsx`: the main slide's `sizes` hint (`"(min-width: 1440px) 760px, (min-width: 1024px) 60vw, 100vw"`) was tuned to the old 60%-of-row column width. Now that the box is height-capped via `calc(100svh-14rem)` on many viewports, the actual rendered width is often smaller than that hint, so Next may fetch a slightly larger source image than needed. Not a visual bug, just a minor over-fetch — worth revisiting the `sizes` value if this component gets touched again.

---

## Planned fixes

Changes decided on but not yet made. Logged only, per [[no-worktrees-in-this-repo|not worked on until asked]].

### F1. NavBar — always-on blurred background instead of scroll-tracked

**Status:** planned, not applied
**Found:** 2026-08-14
**Where:** `components/layout/NavBar.tsx`

**Current behaviour:** [components/layout/NavBar.tsx:12-30](components/layout/NavBar.tsx#L12-L30) tracks scroll position in state (`useState` + a `scroll` event listener in `useEffect`) and toggles between `bg-transparent` and `bg-background/60 backdrop-blur-md` depending on whether `window.scrollY > 50`, animated with a 500ms transition on `background-color`/`backdrop-filter`.

**Planned fix:** drop the scroll tracking entirely — the navbar keeps the blurred background (`bg-background/60 backdrop-blur-md`) permanently, at every scroll position, including at the top of the page.

**What that removes:**

- The `scrolled` state, the `useState`/`useEffect` scroll listener, and the `onScroll` handler
- The `transition-[background-color,backdrop-filter] duration-500` animation and its scrollbar-jump workaround comment ([components/layout/NavBar.tsx:25-27](components/layout/NavBar.tsx#L25-L27))
- The client-only reason this component needs `"use client"` for scroll tracking specifically — worth checking afterward whether anything else in the file still requires it (`UserMenu`/`CartButton`/`CartSheet` may have their own client needs regardless)

**Open question:** confirm the always-blurred look reads correctly over the hero image at the very top of the homepage before treating this as done — that's the one spot the scroll-triggered version was protecting against (transparent nav over a busy hero, opaque everywhere else).
