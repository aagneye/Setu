import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <DashboardNav />
      </div>
      {children}
    </div>
  );
}
