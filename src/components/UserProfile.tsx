"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { UserRole } from "./LoginForm";

interface UserProfileProps {
  email: string;
  displayName: string;
  role: UserRole;
}

export function UserProfile({ email, displayName, role }: UserProfileProps) {
  const t = useTranslations("user");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        {t("welcome")}, {displayName}
      </h1>
      <p className="mb-1 text-slate-600">{email}</p>
      <p className="mb-6 text-sm text-slate-500">
        {t("role")}: {t(`role_${role}`)}
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/find"
          className="rounded-lg bg-powder-500 px-4 py-2 text-sm font-medium text-white hover:bg-powder-600"
        >
          {t("findInstructor")}
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("backHome")}
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-400">{t("placeholder")}</p>
    </div>
  );
}
