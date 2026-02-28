"use client";

import { useState, useRef, useEffect } from "react";

type FilterOperator = "and" | "or";

export interface MultiSelectOption {
  id: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  operator: FilterOperator;
  placeholder?: string;
  locale: string;
  matchLabel?: string;
  andAll?: string;
  orAny?: string;
  onSelectionChange: (ids: string[], operator: FilterOperator) => void;
}

function getLocalizedName(
  item: { name_en: string; name_zh: string | null; name_ja: string | null },
  locale: string
): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  if (locale === "ja" && item.name_ja) return item.name_ja;
  return item.name_en;
}

export function MultiSelectFilter({
  label,
  options,
  selectedIds,
  operator,
  placeholder = "All",
  locale,
  matchLabel = "Match:",
  andAll = "AND (all)",
  orAny = "OR (any)",
  onSelectionChange,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectionChange(next, operator);
  };

  const displayText =
    selectedIds.length === 0
      ? placeholder
      : selectedIds
          .map((id) => options.find((o) => o.id === id))
          .filter(Boolean)
          .map((o) => getLocalizedName(o!, locale))
          .join(operator === "and" ? " + " : " / ");

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-56 overflow-auto rounded border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm">{getLocalizedName(opt, locale)}</span>
            </label>
          ))}
          {selectedIds.length > 1 && (
            <div className="border-t border-slate-100 px-3 py-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">{matchLabel}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectionChange(selectedIds, "and")}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    operator === "and"
                      ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {andAll}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectionChange(selectedIds, "or")}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    operator === "or"
                      ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {orAny}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
