"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookingRequestsSection } from "./BookingRequestsSection";

export function BookingSections({ onBookingAccepted }: { onBookingAccepted?: () => void }) {
  const t = useTranslations("user.instructor");
  const [refetchKey, setRefetchKey] = useState(0);

  async function acceptRequest(id: string) {
    const res = await fetch(`/api/instructor/booking-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    if (res.ok) {
      setRefetchKey((k) => k + 1);
      onBookingAccepted?.();
    }
  }

  async function declineRequest(id: string) {
    const res = await fetch(`/api/instructor/booking-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" }),
    });
    if (res.ok) setRefetchKey((k) => k + 1);
  }

  async function completeRequest(id: string) {
    const res = await fetch(`/api/instructor/booking-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) setRefetchKey((k) => k + 1);
  }

  return (
    <div className="space-y-8" key={refetchKey}>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">{t("pendingRequests")}</h2>
        <BookingRequestsSection status="pending" onAccept={acceptRequest} onDecline={declineRequest} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">{t("acceptedBookings")}</h2>
        <BookingRequestsSection status="accepted" onComplete={completeRequest} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">{t("completedBookings")}</h2>
        <BookingRequestsSection status="completed" />
      </section>
    </div>
  );
}
