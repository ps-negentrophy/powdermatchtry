"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { InstructorProfileSection } from "@/components/instructor/InstructorProfileSection";
import { BookingSections } from "@/components/instructor/BookingSections";

interface InstructorDashboardProps {
  email: string;
  displayName: string;
  gender: string | null;
  birthYear: number | null;
  birthMonth: number | null;
  certificationBody?: string | null;
  certificationNumber?: string | null;
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

export function InstructorDashboard({
  email,
  displayName,
  gender,
  birthYear,
  birthMonth,
  certificationBody = null,
  certificationNumber = null,
}: InstructorDashboardProps) {
  const t = useTranslations("user.instructor");
  const tSignup = useTranslations("signup");
  const locale = useLocale();

  const [slotsVersion, setSlotsVersion] = useState(0);

  // Trigger sync of certification from signup metadata to DB (so Eligible Lessons shows it)
  useEffect(() => {
    fetch("/api/instructor/me").catch(() => {});
  }, []);

  const genderLabel = gender === "male" ? tSignup("genderMale") : gender === "female" ? tSignup("genderFemale") : null;
  const birthLabel = birthYear && birthMonth ? `${localMonthName(birthMonth, locale)} ${birthYear}` : null;
  const age = birthYear && birthMonth ? calcAge(birthYear, birthMonth) : null;
  const infoParts = [genderLabel, birthLabel, age !== null ? `${age} ${t("yearsOld")}` : null].filter(Boolean);
  const infoLine = infoParts.length > 0 ? infoParts.join(" · ") : null;
  const hasQualification = certificationBody || certificationNumber;

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("welcome")}, {displayName}
        </h1>
        <p className="text-slate-600">{email}</p>
        {(infoLine || hasQualification) && (
          <div className="mt-1 mb-6 space-y-0.5 text-sm text-slate-500">
            {infoLine && <p>{infoLine}</p>}
            {certificationBody && <p>{certificationBody}</p>}
            {certificationNumber && <p>{certificationNumber}</p>}
          </div>
        )}
        {!infoLine && !hasQualification && <div className="mb-6" />}
        <Link
          href="/"
          className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("backHome")}
        </Link>
      </div>

      {/* reloadTrigger changes when a booking is accepted, causing the slots to re-fetch */}
      <InstructorProfileSection reloadTrigger={slotsVersion} />

      <BookingSections onBookingAccepted={() => setSlotsVersion((v) => v + 1)} />
    </div>
  );
}
