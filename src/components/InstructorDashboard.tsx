"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { InstructorProfileSection } from "@/components/instructor/InstructorProfileSection";
import { BookingSections } from "@/components/instructor/BookingSections";

interface InstructorDashboardProps {
  email: string;
  displayName: string;
}

export function InstructorDashboard({ email, displayName }: InstructorDashboardProps) {
  const t = useTranslations("user.instructor");

  // Incremented whenever a booking is accepted so InstructorProfileSection re-fetches slots
  const [slotsVersion, setSlotsVersion] = useState(0);

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {t("welcome")}, {displayName}
        </h1>
        <p className="mb-6 text-slate-600">{email}</p>
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
