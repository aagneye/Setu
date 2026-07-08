import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthPlaceholder } from "@/components/auth/GoogleAuthPlaceholder";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Create your PM/Engineer account for Setu dashboard access."
    >
      <SignupForm />
      <div className="my-4" />
      <GoogleAuthPlaceholder />
    </AuthShell>
  );
}
