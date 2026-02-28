"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "student" | "instructor";

interface LoginFormProps {
  role: UserRole;
  title: string;
  signUpTitle: string;
  emailLabel: string;
  passwordLabel: string;
  loginButton: string;
  signUpButton: string;
  noAccount: string;
  hasAccount: string;
  authError: string;
  signUpSuccess: string;
  displayNameLabel: string;
  forgotPassword: string;
  wrongLoginType: string;
}

export function LoginForm({
  role,
  title,
  signUpTitle,
  emailLabel,
  passwordLabel,
  loginButton,
  signUpButton,
  noAccount,
  hasAccount,
  authError,
  signUpSuccess,
  displayNameLabel,
  forgotPassword,
  wrongLoginType,
}: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const userPath = `/${locale}/user`;

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, display_name: displayName },
            emailRedirectTo: baseUrl ? `${baseUrl}/auth/callback?next=${encodeURIComponent(userPath)}` : undefined,
          },
        });
        if (signUpError) throw signUpError;
        if (data?.session) {
          router.push("/user");
        } else {
          setSuccess(signUpSuccess);
        }
      } else {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : authError);
    } finally {
      setLoading(false);
    }
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          {isSignUp ? signUpTitle : title}
        </h2>
        <p className="text-sm text-amber-800">
          Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        {isSignUp ? signUpTitle : title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-slate-700">
              {displayNameLabel}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              required={isSignUp}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            {emailLabel}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {passwordLabel}
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-sm text-powder-600 hover:text-powder-700 hover:underline"
              >
                {forgotPassword}
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-powder-500 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
        >
          {loading ? "..." : isSignUp ? signUpButton : loginButton}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {isSignUp ? (
          <>
            {hasAccount}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className="font-medium text-powder-600 hover:underline"
            >
              {loginButton}
            </button>
          </>
        ) : (
          <>
            {noAccount}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className="font-medium text-powder-600 hover:underline"
            >
              {signUpButton}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
