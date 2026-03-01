"use client";

import { useState } from "react";

interface SlotTagsDisplayProps {
  /** Always-visible tags: Discipline, Resort, Language */
  primaryTags: string[];
  /** Revealed on expand: Skill Level, Area to Improve */
  expandedTags: string[];
  tagClassName?: string;
}

export function SlotTagsDisplay({
  primaryTags,
  expandedTags,
  tagClassName = "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600",
}: SlotTagsDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = expandedTags.length > 0;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {primaryTags.map((tag) => (
        <span key={tag} className={tagClassName}>{tag}</span>
      ))}
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 transition-colors"
        >
          &bull;&bull;&bull;
        </button>
      )}
      {hasMore && expanded && (
        <>
          {expandedTags.map((tag) => (
            <span key={tag} className={tagClassName}>{tag}</span>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 transition-colors"
          >
            &lsaquo;&lsaquo;
          </button>
        </>
      )}
    </div>
  );
}
