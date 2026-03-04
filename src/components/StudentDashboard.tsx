"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StudentBookingsSection } from "./student/StudentBookingsSection";

interface StudentDashboardProps {
  email: string;
  displayName: string;
  gender: string | null;
  birthYear: number | null;
  birthMonth: number | null;
}

function calcAge(year: number, month: number): number {
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month) age--;
  return age;
}

function localMonthName(month: number, locale: string): string {
  const tag = locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US";
  return new Intl.DateTimeFormat(tag, { month: "long" }).format(new Date(2000, month - 1, 1));
}

export function StudentDashboard({ email, displayName, gender, birthYear, birthMonth }: StudentDashboardProps) {
  const t = useTranslations("user.student");
  const tSignup = useTranslations("signup");
  const locale = useLocale();

  const genderLabel = gender === "male" ? tSignup("genderMale") : gender === "female" ? tSignup("genderFemale") : null;
  const birthLabel = birthYear && birthMonth ? `${localMonthName(birthMonth, locale)} ${birthYear}` : null;
  const age = birthYear && birthMonth ? calcAge(birthYear, birthMonth) : null;
  const infoLine = [genderLabel, birthLabel, age !== null ? `${age} ${t("yearsOld")}` : null].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("welcome")}, {displayName}
        </h1>
        <p className="text-slate-600">{email}</p>
        {infoLine && <p className="mt-1 mb-6 text-sm text-slate-500">{infoLine}</p>}
        {!infoLine && <div className="mb-6" />}
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
              {t("declinedBookings")}
            </h3>
            <StudentBookingsSection status="declined" />
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
