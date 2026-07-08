import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthPlaceholder } from "@/components/auth/GoogleAuthPlaceholder";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to open the project tracking dashboard."
    >
      <LoginForm />
      <div className="my-4" />
      <GoogleAuthPlaceholder />
    </AuthShell>
  );
}
