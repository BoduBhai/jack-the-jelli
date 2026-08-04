"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserMenu() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  // Same footprint as the signed-in avatar trigger so the icon doesn't jump
  // once the session resolves.
  if (isPending) {
    return <div className="size-8" aria-hidden="true" />;
  }

  if (!data) {
    return (
      <Button
        asChild
        variant="ghost"
        className="h-8 rounded-none text-xs tracking-widest uppercase"
      >
        <Link href="/login">
          <User className="size-4" aria-hidden="true" />
          Login
        </Link>
      </Button>
    );
  }

  const { user } = data;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-foreground truncate text-sm">
            {user.name}
          </span>
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
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
