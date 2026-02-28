"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function AvailabilityCalendar({ onSaved }: { onSaved?: () => void }) {
  const t = useTranslations("user.instructor.profile");
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/instructor/availability")
      .then((r) => r.json())
      .then((data) => setDates(Array.isArray(data) ? data.map((d: { available_date: string }) => d.available_date) : []))
      .finally(() => setLoading(false));
  }, []);

  async function addDate() {
    if (!newDate || dates.includes(newDate)) return;
    setSaving(true);
    const res = await fetch("/api/instructor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: [...dates, newDate] }),
    });
    if (res.ok) {
      setDates([...dates, newDate].sort());
      setNewDate("");
      onSaved?.();
    }
    setSaving(false);
  }

  async function removeDate(date: string) {
    setSaving(true);
    const res = await fetch(`/api/instructor/availability?date=${date}`, { method: "DELETE" });
    if (res.ok) {
      setDates(dates.filter((d) => d !== date));
      onSaved?.();
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="date" value={newDate} min={today} onChange={(e) => setNewDate(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        <button type="button" onClick={addDate} disabled={!newDate || saving} className="rounded-lg bg-powder-500 px-4 py-2 text-sm text-white">{t("addDate")}</button>
      </div>
      {dates.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <li key={d} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
              {d}
              <button type="button" onClick={() => removeDate(d)} disabled={saving}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
