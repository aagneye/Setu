"use client";

import { DashboardNav } from "@/components/DashboardNav";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between">
        <DashboardNav />
        <UserMenu user={user} />
      </div>
      {children}
    </div>
  );
}
