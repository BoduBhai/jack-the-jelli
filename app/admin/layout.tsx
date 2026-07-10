import AdminSidebar from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
