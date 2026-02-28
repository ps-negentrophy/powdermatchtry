"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPasswordPage");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = baseUrl
        ? `${baseUrl}/${locale}/auth/reset-password`
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (!supabase) {
    return (
      <div className="py-12">
      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{t("title")}</h2>
        <p className="text-sm text-amber-800">
          Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </p>
      </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-12">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{t("title")}</h2>
        <p className="mb-6 text-slate-600">{t("success")}</p>
        <Link
          href="/login/student"
          className="text-sm font-medium text-powder-600 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="py-12">
    <div className="mx-auto max-w-md rounded-lg border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">{t("title")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {t("emailLabel")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder={t("emailPlaceholder")}
            required
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
          className="w-full rounded-lg bg-powder-500 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        <Link
          href="/login/student"
          className="font-medium text-powder-600 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
    </div>
  );
}
