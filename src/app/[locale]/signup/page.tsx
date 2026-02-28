"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "student" | "instructor";

// ── Step 1: Role selection ────────────────────────────────────────────────────

function RoleCard({
  role,
  title,
  description,
  icon,
  onSelect,
}: {
  role: Role;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: (r: Role) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-powder-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-powder-400"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-powder-50 text-powder-600 group-hover:bg-powder-100">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <span className="mt-auto rounded-full bg-powder-500 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-powder-600">
        {title} →
      </span>
    </button>
  );
}

// ── Step 2: Account creation form ────────────────────────────────────────────

function SignupForm({ role, onBack }: { role: Role; onBack: () => void }) {
  const t = useTranslations("signup");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roleLabel = role === "student" ? t("studentLabel") : t("instructorLabel");
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
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const nextPath = `/${locale}/user`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, display_name: displayName },
          emailRedirectTo: baseUrl
            ? `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`
            : undefined,
        },
      });
      if (signUpError) throw signUpError;
      // If session is returned directly (email confirmation disabled), redirect
      if (data?.session) {
        window.location.href = `/${locale}/user`;
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t("success")}</h2>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href={role === "student" ? "/login/student" : "/login/instructor"}
            className="rounded-lg bg-powder-500 px-5 py-2 text-sm font-medium text-white hover:bg-powder-600"
          >
            {role === "student" ? t("loginStudent") : t("loginInstructor")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-12">
      {/* Role badge + back button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-slate-700"
        >
          {t("changeRole")}
        </button>
        <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${roleBadgeClass}`}>
          {roleLabel}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">{t("creatingAs")}</h1>
        <p className={`mb-6 text-base font-semibold ${role === "student" ? "text-sky-700" : "text-emerald-700"}`}>
          {roleLabel}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-slate-700">
              {t("displayName")}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-powder-400"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              {t("email")}
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-powder-400"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-400">{t("passwordHint")}</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !displayName || !email || !password}
            className="w-full rounded-lg bg-powder-500 py-2.5 text-sm font-semibold text-white hover:bg-powder-600 disabled:opacity-50"
          >
            {loading ? "..." : t("submit")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {t("hasAccount")}{" "}
          <Link
            href={role === "student" ? "/login/student" : "/login/instructor"}
            className="font-medium text-powder-600 hover:underline"
          >
            {role === "student" ? t("loginStudent") : t("loginInstructor")}
          </Link>
        </p>
      </div>

      {/* Supabase not configured warning */}
      {!supabase && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {tAuth("authError")}
        </p>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const t = useTranslations("signup");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (selectedRole) {
    return <SignupForm role={selectedRole} onBack={() => setSelectedRole(null)} />;
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{t("chooseRole")}</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <RoleCard
          role="student"
          title={t("studentCard")}
          description={t("studentCardDesc")}
          onSelect={setSelectedRole}
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          }
        />
        <RoleCard
          role="instructor"
          title={t("instructorCard")}
          description={t("instructorCardDesc")}
          onSelect={setSelectedRole}
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
