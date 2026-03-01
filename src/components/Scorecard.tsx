import React from "react";
import { kpis } from "../data/mockData";
import { latestActual, computeGap, computeStatus, formatValue, type Filters, type StatusType } from "../lib/kpiLogic";

const STATUS_STYLES: Record<StatusType, string> = {
  "On Track": "bg-green-100 text-green-800",
  "Watch": "bg-yellow-100 text-yellow-800",
  "Off Track": "bg-red-100 text-red-800",
  "No Data": "bg-gray-100 text-gray-500",
};

const STATUS_DOT: Record<StatusType, string> = {
  "On Track": "bg-green-500",
  "Watch": "bg-yellow-400",
  "Off Track": "bg-red-500",
  "No Data": "bg-gray-400",
};

const TILE_KPI_IDS = ["market-share", "consideration-apple", "switching-intent", "romi"];

interface ScorecardProps {
  filters: Filters;
  onSelectKpi: (kpiId: string) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({ filters, onSelectKpi }) => {
  const tiles = TILE_KPI_IDS.map((id) => {
    const kpi = kpis.find((k) => k.id === id)!;
    const actual = latestActual(id, filters);
    const gap = computeGap(actual, kpi.target);
    const status = computeStatus(actual, kpi.target, kpi.higherIsBetter);
    return { kpi, actual, gap, status };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
      {tiles.map(({ kpi, actual, gap, status }) => (
        <button
          key={kpi.id}
          onClick={() => onSelectKpi(kpi.id)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{kpi.layer}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
              {status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-0.5">
            {formatValue(actual, kpi)}
          </div>
          <div className="text-sm text-gray-500 mb-3 font-medium">{kpi.name}</div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Target: {formatValue(kpi.target, kpi)}</span>
            <span className={gap !== null && gap >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
              {gap !== null ? (gap >= 0 ? "+" : "") + formatValue(gap, kpi) : "—"}
            </span>
          </div>
          <div className="mt-3 text-xs text-gray-400 italic line-clamp-2 group-hover:text-gray-600 transition-colors">
            {kpi.decisionRule}
          </div>
        </button>
      ))}
    </div>
  );
};
