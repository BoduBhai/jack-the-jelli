import AdminSidebar from "@/features/admin/components/AdminSidebar";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // proxy.ts only redirects logged-out visitors (cookie presence, §3.4) — the
  // role check that turns away a logged-in customer has to happen here.
  await requireAdmin("/admin");

  return (
    <div className="bg-background text-foreground min-h-screen">
      <AdminSidebar />
      <main className="w-full flex-1 md:pl-64">
        <div className="mx-auto flex min-h-screen w-full max-w-360 flex-col px-5 py-8 pt-20 md:px-16 md:py-16 md:pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}
