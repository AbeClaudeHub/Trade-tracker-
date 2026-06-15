"use client";

import { NAFS_CATEGORIES, NAFS_LABELS, type NafsCategory } from "@/domain/types";
import { cn } from "@/lib/utils";

/** Multi-select of nafs categories — the root cause behind a breach. */
export function NafsPicker({
  selected,
  onChange,
  suggested = [],
}: {
  selected: NafsCategory[];
  onChange: (next: NafsCategory[]) => void;
  suggested?: NafsCategory[];
}) {
  function toggle(c: NafsCategory) {
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {NAFS_CATEGORIES.map((c) => {
        const active = selected.includes(c);
        const hint = suggested.includes(c) && !active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-all",
              active
                ? "border-breach/50 bg-breachsoft text-breach"
                : hint
                  ? "border-caution/40 bg-cautionsoft text-ink"
                  : "border-line bg-surface text-muted hover:bg-raised",
            )}
          >
            {NAFS_LABELS[c]}
          </button>
        );
      })}
    </div>
  );
}
