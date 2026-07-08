import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white shadow-sm p-6">
        <div className="mb-6">
          <p className="text-sm text-primary font-semibold">Setu</p>
          <h1 className="text-2xl font-bold mt-1">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
