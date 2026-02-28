"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StudentBookingsSection } from "./student/StudentBookingsSection";

interface StudentDashboardProps {
  email: string;
  displayName: string;
}

export function StudentDashboard({ email, displayName }: StudentDashboardProps) {
  const t = useTranslations("user.student");

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("welcome")}, {displayName}
        </h1>
        <p className="mb-6 text-slate-600">{email}</p>
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("myBookings")}</h2>
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("pendingBookings")}
            </h3>
            <StudentBookingsSection status="pending" />
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("acceptedBookings")}
            </h3>
            <StudentBookingsSection status="accepted" />
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("completedBookings")}
            </h3>
            <StudentBookingsSection status="completed" />
          </section>
        </div>
      </div>
    </div>
  );
}
