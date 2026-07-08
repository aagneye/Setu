"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/hooks/useAuth";

export function UserMenu({ user }: { user: AuthUser | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">{user?.full_name ?? "User"}</p>
        <p className="text-xs text-muted-foreground">{user?.role ?? ""}</p>
      </div>
      <Button size="sm" variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
