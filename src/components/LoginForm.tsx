"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "student" | "instructor";

interface LoginFormProps {
  role: UserRole;
  title: string;
  roleBadge: string;
  emailLabel: string;
  passwordLabel: string;
  loginButton: string;
  authError: string;
  forgotPassword: string;
  wrongLoginType: string;
  noAccount: string;
  signUpLink: string;
}

export function LoginForm({
  role,
  title,
  roleBadge,
  emailLabel,
  passwordLabel,
  loginButton,
  authError,
  forgotPassword,
  wrongLoginType,
  noAccount,
  signUpLink,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const roleBadgeClass =
    role === "student"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Enforce role — make sure the account type matches this login page
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .single();

      const accountRole = profile?.role ?? "student";
      if (accountRole !== role) {
        await supabase.auth.signOut();
        throw new Error(wrongLoginType);
      }

      router.push("/user");
    } catch (err) {
      setError(err instanceof Error ? err.message : authError);
    } finally {
      setLoading(false);
    }
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <p className="text-sm text-amber-800">
          Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Role badge */}
      <div className="mb-4">
        <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${roleBadgeClass}`}>
          {roleBadge}
        </span>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            {emailLabel}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-powder-400"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {passwordLabel}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-powder-600 hover:text-powder-700 hover:underline"
            >
              {forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-powder-400"
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-powder-500 py-2.5 text-sm font-semibold text-white hover:bg-powder-600 disabled:opacity-50"
        >
          {loading ? "..." : loginButton}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        {noAccount}{" "}
        <Link href="/signup" className="font-medium text-powder-600 hover:underline">
          {signUpLink}
        </Link>
      </p>
    </div>
  );
}
