"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BookingRecord {
  id: string;
  instructor_id: string;
  instructor_name: string;
  start_date: string;
  end_date: string;
  message?: string;
  status: "pending" | "accepted" | "declined" | "completed";
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  accepted:  "bg-green-100 text-green-800",
  declined:  "bg-red-100 text-red-800",
  completed: "bg-slate-100 text-slate-600",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function StudentBookingsSection({
  status,
}: {
  status: "pending" | "accepted" | "declined" | "completed";
}) {
  const t = useTranslations("user.student");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/booking-requests?status=${status}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (bookings.length === 0)
    return <p className="text-sm text-slate-400">{t("noBookings")}</p>;

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-slate-900">{b.instructor_name}</p>
            <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status] ?? ""}`}>
              {t(`status.${b.status}`)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {formatDate(b.start_date)}
            {b.end_date && b.end_date !== b.start_date && (
              <> &ndash; {formatDate(b.end_date)}</>
            )}
          </p>
          {b.message && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{b.message}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
