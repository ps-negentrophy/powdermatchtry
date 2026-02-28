"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BookingRequest {
  id: string;
  student_name?: string;
  requested_date: string;
  requested_time_slot?: string;
  message?: string;
  status: string;
}

export function BookingRequestsSection({ status, onAccept, onDecline, onComplete }: {
  status: "pending" | "accepted" | "completed";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const t = useTranslations("user.instructor");
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructor/booking-requests?status=${status}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (bookings.length === 0) return <p className="text-sm text-slate-500">{t("noBookings")}</p>;

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-lg border p-4">
          <p className="font-medium">{b.student_name ?? "Student"}</p>
          <p className="text-sm text-slate-600">{b.requested_date} {b.requested_time_slot && `- ${b.requested_time_slot}`}</p>
          {b.message && <p className="text-sm text-slate-500">{b.message}</p>}
          {status === "pending" && onAccept && onDecline && (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => onAccept(b.id)} className="rounded bg-green-600 px-3 py-1 text-sm text-white">Accept</button>
              <button type="button" onClick={() => onDecline(b.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">Decline</button>
            </div>
          )}
          {status === "accepted" && onComplete && (
            <button type="button" onClick={() => onComplete(b.id)} className="mt-2 rounded bg-powder-500 px-3 py-1 text-sm text-white">Mark Complete</button>
          )}
        </li>
      ))}
    </ul>
  );
}
