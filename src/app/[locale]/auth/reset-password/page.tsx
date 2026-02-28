"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const locale = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setError(null);
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/user`), 2000);
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
          <p className="text-slate-600">{t("success")}</p>
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
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {t("newPassword")}
          </label>
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
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-powder-500 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>
      </div>
    </div>
  );
}
