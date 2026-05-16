import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Finance Tracker 1.0</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
