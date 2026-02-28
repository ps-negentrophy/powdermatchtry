"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface BookingModalProps {
  instructorId: string;
  instructorName: string;
  slotId?: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
  onClose: () => void;
}

type AuthState = "loading" | "not-logged-in" | "not-student" | "ready";

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function BookingModal({
  instructorId,
  instructorName,
  slotId,
  defaultStartDate,
  defaultEndDate,
  onClose,
}: BookingModalProps) {
  const t = useTranslations("booking");
  const today = new Date().toISOString().slice(0, 10);

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [startDate, setStartDate] = useState(defaultStartDate ?? "");
  const [endDate, setEndDate] = useState(defaultEndDate ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      if (!supabase) { setAuthState("not-logged-in"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthState("not-logged-in"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (profile?.role !== "student") { setAuthState("not-student"); return; }
      setAuthState("ready");
    }
    checkAuth();
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!startDate || !endDate) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/student/booking-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instructor_id: instructorId,
        start_date: startDate,
        end_date: endDate,
        message: message.trim() || undefined,
        availability_slot_id: slotId ?? undefined,
      }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(onClose, 2500);
    } else if (res.status === 401) {
      setAuthState("not-logged-in");
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? t("error"));
    }
    setSubmitting(false);
  }, [startDate, endDate, message, instructorId, onClose, t]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("title")} <span className="text-powder-600">{instructorName}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {authState === "loading" && (
            <p className="text-sm text-slate-500">{t("checking")}</p>
          )}

          {authState === "not-logged-in" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {t("loginRequired")}{" "}
              <a href="/en/login/student" className="font-semibold underline hover:text-amber-900">
                {t("loginLink")}
              </a>
            </div>
          )}

          {authState === "not-student" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {t("studentRequired")}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
              {t("success")}
            </div>
          )}

          {authState === "ready" && !success && (
            <>
              {/* Date range */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">{t("datesLabel")}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">{t("startDate")}</label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                      }}
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">{t("endDate")}</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                {startDate && endDate && startDate !== endDate && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    {formatDateDisplay(startDate)} – {formatDateDisplay(endDate)}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t("messageLabel")}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  rows={3}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-powder-400"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        {authState === "ready" && !success && (
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!startDate || !endDate || submitting}
              className="rounded-lg bg-powder-500 px-5 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
            >
              {submitting ? "..." : t("submit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
