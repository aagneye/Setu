"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/vendors", label: "Vendors" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/alerts", label: "Alerts" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 mb-4">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
