import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// baseURL omitted deliberately: client and auth server share an origin in
// this monolithic app, so Better Auth infers it from window.location.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
