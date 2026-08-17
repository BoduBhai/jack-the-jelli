# Production deployment checklist

You deployed with your local `.env.local` values copied verbatim. Most of them are correct as-is — but **three are wrong for production and will break sign-up, sign-in, and email**, one is dead weight, and two required changes live outside Vercel entirely.

Work through the sections in order. Anything marked 🔴 breaks the live site until fixed.

> **Read this once before you start:** changing an environment variable on Vercel does **not** affect the running site. You must redeploy afterwards (Deployments → latest → ⋯ → **Redeploy**). Do all your edits first, then redeploy once at the end (Step 7).

Throughout, replace `<YOUR-DOMAIN>` with your live URL — likely `jack-the-jelli.vercel.app`, or your custom domain if you've attached one. Check Vercel → **Domains** to confirm which.

---

## Comparison at a glance

| Variable                            | Local value             | Production  | Action                                 |
| ----------------------------------- | ----------------------- | ----------- | -------------------------------------- |
| `MONGODB_URI`                       | Atlas cluster0          | ✅ same     | Keep — but see Step 4 (Atlas firewall) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dlqnpara5`             | ✅ same     | Keep                                   |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`    | `656211…`               | ✅ same     | Keep                                   |
| `CLOUDINARY_API_SECRET`             | `fTBCQ3…`               | ✅ same     | Keep                                   |
| `JWT_SECRET`                        | `your_jwt_secret_key`   | ❌ dead     | **Delete** (Step 5)                    |
| `BETTER_AUTH_SECRET`                | random base64           | ⚠️ reused   | Rotate (Step 6, optional)              |
| `BETTER_AUTH_URL`                   | `http://localhost:3000` | 🔴**wrong** | **Change** (Step 1)                    |
| `RESEND_API_KEY`                    | `re_D4Smz…`             | ✅ same     | Keep                                   |
| `EMAIL_FROM`                        | `onboarding@resend.dev` | 🔴**wrong** | **Change** (Step 2)                    |
| `DEV_INBOX`                         | your gmail              | ⚠️ no-op    | Harmless, leave it                     |
| `GOOGLE_CLIENT_ID`                  | `10791696…`             | ✅ same     | Keep — but see Step 3                  |
| `GOOGLE_CLIENT_SECRET`              | `GOCSPX-…`              | ✅ same     | Keep — but see Step 3                  |

Not in Vercel, not needed: nothing missing. Your list is complete.

---

## 🔴 Step 1 — Fix `BETTER_AUTH_URL` (most important)

**Current value:** `http://localhost:3000`

This is the single most damaging one. `lib/auth.ts:27` passes it to Better Auth as `baseURL`, which is the origin used to build **every** link and redirect the auth system generates. Pointing at localhost right now means:

- Google sign-in fails or bounces the user to `http://localhost:3000`
- Email verification links point to localhost — and since `requireEmailVerification: true` (`lib/auth.ts:30`), **nobody can complete sign-up**
- Password reset links point to localhost
- The "Track this order" button in order confirmation emails points to localhost (`lib/email.ts:218`)

### How to fix

1. Vercel → your project → **Settings** → **Environment Variables**
2. Find `BETTER_AUTH_URL`, click the **⋯** menu on its row → **Edit**
3. Set the value to your live URL with `https://` and **no trailing slash**:

   ```
   https://<YOUR-DOMAIN>
   ```

   ✅ `https://jack-the-jelli.vercel.app`
   ❌ `https://jack-the-jelli.vercel.app/` (trailing slash)
   ❌ `http://…` (must be https)
   ❌ `jack-the-jelli.vercel.app` (must include the scheme)

4. **Important — scope it to Production only.** Right now it's set for _"Production and Preview"_. Uncheck **Preview** before saving.
   _Why:_ every preview branch deployment gets its own URL. If Preview inherits the production URL, preview auth redirects will throw users onto the live site. With it unset for Preview, Better Auth falls back to deriving the origin from the incoming request, which is the right behaviour there.
5. Save.

---

## 🔴 Step 2 — Fix `EMAIL_FROM` (verify a sending domain in Resend)

**Current value:** `onboarding@resend.dev`

`onboarding@resend.dev` is Resend's shared sandbox sender. It is only allowed to deliver to **the Resend account holder's own address** — every other recipient gets a 403 rejection.

Locally this never bit you, because `lib/email.ts:89` short-circuits: outside production, mail to anyone other than `DEV_INBOX` is just logged as `[email:dev] …` instead of being sent. On Vercel `NODE_ENV=production`, so that escape hatch is gone and **every** email hits Resend for real.

Result on the live site today: any customer who is not `bodruddozaaraf@gmail.com` cannot sign up (verification email 403s), cannot reset a password, and gets no order confirmation.

### How to fix

You need a domain you own. If you have one:

1. Go to [https://resend.com/domains](https://resend.com/domains) → **Add Domain**
2. Enter your domain (e.g. `jackthejelli.com`) and pick a region
3. Resend shows you DNS records — typically an `MX` + `TXT` (SPF) pair on a `send` subdomain, and a `TXT` (DKIM) record
4. Add every record exactly as shown at your domain registrar / DNS host
5. Back in Resend, click **Verify DNS Records**. Wait until the domain shows **Verified** (usually minutes; can take up to a few hours)
6. Vercel → Environment Variables → edit `EMAIL_FROM` to an address on that verified domain. A display name is supported and looks better in inboxes:
   ```
   Jack The Jelli <orders@jackthejelli.com>
   ```
7. Save.

**If you don't have a domain yet:** leave `EMAIL_FROM` as `onboarding@resend.dev` and understand that the live site can only email you. That's fine for a solo test deploy — it is not fine once you share the URL with anyone. Buy a domain before launch.

**Verifying it worked:** after redeploying, sign up on the live site with a second email address you control and confirm the verification mail arrives. If it doesn't, Vercel → **Logs** will show the exact Resend rejection — `lib/email.ts:116` logs it as `[email] Resend rejected …`.

---

## 🔴 Step 3 — Register the production callback URL with Google

This isn't a Vercel variable, but Google sign-in stays broken without it even after Step 1. Your OAuth client currently only trusts `localhost`, so Google will refuse the live site with **`Error 400: redirect_uri_mismatch`**.

Your `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` values themselves are correct — don't change them.

1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Pick the project that owns client ID `1079169649898-kb0dl…`
3. Click that **OAuth 2.0 Client ID** to edit it
4. Under **Authorized JavaScript origins**, click **+ ADD URI**:
   ```
   https://<YOUR-DOMAIN>
   ```
5. Under **Authorized redirect URIs**, click **+ ADD URI**:

   ```
   https://<YOUR-DOMAIN>/api/auth/callback/google
   ```

   That exact path is what Better Auth mounts at `app/api/auth/[...all]/route.ts`. It must match character for character — no trailing slash.

6. **Leave the existing localhost entries in place** so local dev keeps working.
7. **Save.** Google's changes can take a few minutes to propagate.
8. If your app is still in **Testing** on the OAuth consent screen, only accounts on the test-users list can sign in. Publish it (**OAuth consent screen** → **Publish app**) before real customers arrive.

---

## 🔴 Step 4 — Open the MongoDB Atlas firewall to Vercel

Also not a Vercel variable. Your `MONGODB_URI` is correct and needs no change — but Atlas rejects connections from IPs not on its allowlist, and your local machine's IP is almost certainly the only one on it. Vercel's serverless functions have no fixed IP.

Symptom if you skip this: every page that touches the database times out or 500s.

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → your project → **Network Access**
2. **+ ADD IP ADDRESS** → **ALLOW ACCESS FROM ANYWHERE** (this fills in `0.0.0.0/0`)
3. Comment it `Vercel serverless` and **Confirm**

This is the standard setup for Vercel Hobby — static-IP egress is a paid Vercel feature. Your database is still protected by the username/password in the connection string, which is why that string must never be committed. (Optional polish: the URI ends in `appName=localcluster`; changing that to `appName=vercel-prod` on the Vercel copy makes production traffic easy to spot in Atlas metrics. Purely cosmetic.)

---

## Step 5 — Delete `JWT_SECRET`

Its value is the literal placeholder `your_jwt_secret_key`, and **nothing in the codebase reads `process.env.JWT_SECRET`** — it's a leftover. It does no harm sitting there, but it's a trap for future-you, who will assume something depends on it.

1. Vercel → Environment Variables → `JWT_SECRET` row → **⋯** → **Remove**
2. Delete line 11 from your local `.env.local` too, so the two stay in sync

---

## Step 6 — Rotate `BETTER_AUTH_SECRET` (recommended, not required)

The production secret is currently the same string that has been sitting in a plaintext file on your laptop. It signs session tokens _and_ the checkout receipt cookie (`features/checkout/lib/receipt.ts:29`), so anyone who obtains it can forge both. Giving production its own value is good hygiene.

**Consequence of rotating:** every existing session and every issued guest-checkout receipt cookie becomes invalid — users get signed out, and guests lose the cookie that lets them view their recent order. Do it now while the site is new, or not at all.

1. Generate a fresh 32-byte secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
2. Vercel → Environment Variables → edit `BETTER_AUTH_SECRET` → paste the new value → Save
3. Leave your local `.env.local` value alone — dev and production having different secrets is correct and intentional

---

## Step 7 — Redeploy, then verify

None of the above takes effect until a new deployment is built. The Cloudinary `NEXT_PUBLIC_*` values in particular are compiled into the browser bundle at build time, so a redeploy is the only way any env change reaches the client.

1. Vercel → **Deployments** → newest deployment → **⋯** → **Redeploy**
2. **Uncheck "Use existing Build Cache"** to force a clean build
3. Wait for it to go green

Then walk the live site:

- [x] Homepage and a product page load, and product images render (Cloudinary + Atlas both working)
- [x] Sign up with a fresh email → verification email arrives → link opens **your live domain**, not localhost
- [ ] Sign in with Google → lands back on your site signed in, no `redirect_uri_mismatch`
- [x] Forgot password → reset link points at the live domain
- [ ] Place a test order as a guest → confirmation email arrives with a working "Track this order" button
- [ ] Sign in as your admin account → `/admin` loads (if it 403s, that account's `role` field isn't `"admin"` — Better Auth blocks self-assignment by design, so set it directly on the `user` document in Atlas)

If anything fails, Vercel → **Logs**, filter to the failing request. The email path logs its own failures with a `[email]` prefix.

---

## Summary — the short version

| #   | Do this                                                               | Where                |
| --- | --------------------------------------------------------------------- | -------------------- |
| 1   | `BETTER_AUTH_URL` → `https://<YOUR-DOMAIN>`, Production scope only    | Vercel               |
| 2   | Verify a domain in Resend, point`EMAIL_FROM` at it                    | Resend + Vercel      |
| 3   | Add`https://<YOUR-DOMAIN>/api/auth/callback/google` as a redirect URI | Google Cloud Console |
| 4   | Allow`0.0.0.0/0` in Network Access                                    | MongoDB Atlas        |
| 5   | Delete`JWT_SECRET`                                                    | Vercel +`.env.local` |
| 6   | Rotate`BETTER_AUTH_SECRET`                                            | Vercel               |
| 7   | Redeploy without build cache, then run the checklist                  | Vercel               |

---

## One security note

Your `.env.local` is gitignored and stays that way — good. But every secret in it (Atlas password, Cloudinary secret, Resend key, Google client secret) is now also pasted into this session's history and into Vercel. Vercel storage is fine. If any of those values has ever been pasted somewhere public — a screenshot, a chat, a commit — rotate that specific credential at its source. The Atlas database password is the one worth being most careful with, since it's the only thing standing between the internet and your data now that the IP allowlist is open.
