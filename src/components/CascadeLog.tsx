import React, { useState } from "react";
import type { CascadeLogEntry } from "../lib/cascadeModel";

interface CascadeLogProps {
  log: CascadeLogEntry[];
}

export const CascadeLog: React.FC<CascadeLogProps> = ({ log }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (log.length === 0) {
    return (
      <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-200 flex items-center gap-2">
        <span className="text-indigo-600 text-xs">🔗</span>
        <span className="text-indigo-700 text-xs font-semibold">Linked Cascade Active</span>
        <span className="text-indigo-500 text-xs">— Edit an upstream KPI value to see cascade effects.</span>
      </div>
    );
  }

  // Deduplicate: keep the last entry per (source → target) pair
  const seen = new Set<string>();
  const deduped = [...log].reverse().filter((e) => {
    const key = `${e.sourceKpiId}→${e.targetKpiId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).reverse();

  return (
    <div className="bg-indigo-50 border-b border-indigo-200">
      <div
        className="px-6 py-2 flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="text-indigo-600 text-xs">🔗</span>
        <span className="text-indigo-700 text-xs font-semibold">Cascade Effects</span>
        <span className="text-indigo-500 text-xs">— {deduped.length} downstream KPI{deduped.length !== 1 ? "s" : ""} auto-adjusted</span>
        <span className="ml-auto text-indigo-400 text-xs">{collapsed ? "▶ Show" : "▼ Hide"}</span>
      </div>
      {!collapsed && (
        <div className="px-6 pb-3 space-y-1">
          {deduped.map((entry, i) => {
            const sign = entry.pctChange >= 0 ? "+" : "";
            return (
              <div key={i} className="flex items-center gap-1 text-xs text-indigo-700">
                <span className="font-semibold">{entry.sourceName}</span>
                <span className="text-indigo-400">→</span>
                <span className="font-semibold">{entry.targetName}</span>
                <span className={`font-mono ml-1 ${entry.pctChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {sign}{entry.pctChange.toFixed(1)}%
                </span>
                <span className="text-indigo-400 ml-1 hidden sm:inline">· {entry.description}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
