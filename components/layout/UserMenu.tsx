"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

/**
 * Split on any whitespace rather than a literal space: a name of "\t" splits
 * into a single truthy part under `split(" ")`, and a tab initial renders as a
 * blank avatar. Returns "" when there is nothing usable, which the caller
 * treats as "fall through to the next fallback".
 */
function initials(name: string | null | undefined) {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function UserMenu() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    // Better Auth resolves with { data, error } instead of throwing, so an
    // unchecked call navigates away from a session that is still live and
    // tells the user they signed out when they didn't.
    const { error } = await authClient.signOut();

    if (error) {
      setIsSigningOut(false);
      toast.error(error.message ?? "Couldn't sign you out. Try again.");
      return;
    }

    router.replace("/");
    // The RSC cache still holds the signed-in render of "/" at this point.
    router.refresh();
  }

  // Height only, no width: the navbar cluster is anchored to the right edge, so
  // it grows leftward into empty space and neither branch below can displace
  // the cart beside it. Reserving a width here would only pad that empty space.
  if (isPending) {
    return <div className="h-8" aria-hidden="true" />;
  }

  if (!data) {
    return (
      <Button
        asChild
        variant="outline"
        className="hover:bg-secondary border-secondary h-8 rounded-none border bg-transparent text-xs tracking-widest uppercase hover:text-white max-sm:px-2"
      >
        <Link href="/login">
          <User className="size-4" aria-hidden="true" />
          {/* The word costs ~55px, which is enough to run this cluster into the
              centred logo at 320px. sr-only drops it out of flow below 40rem
              while keeping "Login" as the link's accessible name. */}
          <span className="max-sm:sr-only">Login</span>
        </Link>
      </Button>
    );
  }

  const { user } = data;
  // An account can reach here with a blank name (whitespace-only input, or an
  // OAuth profile that carried none), which used to render an empty circle.
  const fallback = initials(user.name) || user.email.trim()[0]?.toUpperCase();

  // Not modal: Radix's modal scroll-lock removes the page scrollbar, which
  // widens the viewport and shifts the fixed navbar 15px. Reserving the gutter
  // globally (scrollbar-gutter: stable) only moves that jump onto the page
  // content instead. A nav menu needs neither a focus trap nor an inert
  // background, so the lock buys nothing here.
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          // Negative margin keeps the 32px avatar visually where it was while
          // the padding lifts the hit area to 40px.
          className="focus-visible:ring-ring/50 -m-1 rounded-full p-1 outline-hidden focus-visible:ring-3"
        >
          <Avatar>
            {user.image && (
              // lh3.googleusercontent.com rejects some requests that carry a
              // referrer, which would silently drop every Google avatar to the
              // initials fallback.
              <AvatarImage
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
              />
            )}
            <AvatarFallback>
              {fallback ?? <User className="size-4" aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-foreground truncate text-sm">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Account</Link>
        </DropdownMenuItem>
        {/* Orders lands with the checkout/order-history phase — placeholder
            until then rather than a link to a page that doesn't exist. */}
        <DropdownMenuItem disabled>Orders</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onSelect={(event) => {
            // Closing the menu would unmount this item and strand both the
            // pending label and the error path with nowhere to render.
            event.preventDefault();
            void handleSignOut();
          }}
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
