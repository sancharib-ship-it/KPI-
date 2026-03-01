import React from "react";
import { kpis } from "../data/mockData";
import { latestActual, computeGap, computeStatus, formatValue, type Filters, type StatusType } from "../lib/kpiLogic";
import { useSimulation } from "../context/SimulationContext";
import type { KpiConfig } from "../data/mockData";

const STATUS_STYLES: Record<StatusType, string> = {
  "On Track": "bg-emerald-50 text-emerald-700",
  "Watch": "bg-amber-50 text-amber-700",
  "Off Track": "bg-red-50 text-red-700",
  "No Data": "bg-gray-100 text-gray-500",
};

const STATUS_DOT: Record<StatusType, string> = {
  "On Track": "bg-emerald-500",
  "Watch": "bg-amber-400",
  "Off Track": "bg-red-500",
  "No Data": "bg-gray-400",
};

const STATUS_BORDER: Record<StatusType, string> = {
  "On Track": "border-l-emerald-400",
  "Watch": "border-l-amber-400",
  "Off Track": "border-l-red-400",
  "No Data": "border-l-gray-300",
};

const TILE_KPI_IDS = ["market-share", "consideration-apple", "switching-intent", "romi"];

function stepForKpi(kpi: KpiConfig): number {
  if (kpi.unit === "currency") return 100000;
  if (kpi.unit === "ratio") return 0.01;
  return 0.1;
}

interface ScorecardProps {
  filters: Filters;
  onSelectKpi: (kpiId: string) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({ filters, onSelectKpi }) => {
  const { enabled: simEnabled, overrides, setOverride } = useSimulation();

  const tiles = TILE_KPI_IDS.map((id) => {
    const kpi = kpis.find((k) => k.id === id)!;
    const baseActual = latestActual(id, filters);
    const simOverride = overrides[id];
    const actual = simEnabled && simOverride?.actual !== undefined ? simOverride.actual : baseActual;
    const target = simEnabled && simOverride?.target !== undefined ? simOverride.target : kpi.target;
    const gap = computeGap(actual, target);
    const status = computeStatus(actual, target, kpi.higherIsBetter);
    return { kpi, actual, target, gap, status };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {tiles.map(({ kpi, actual, target, gap, status }) => {
        const step = stepForKpi(kpi);
        return (
          <div
            key={kpi.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectKpi(kpi.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectKpi(kpi.id); }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${STATUS_BORDER[status]} p-6 text-left hover:shadow-md transition-all group cursor-pointer min-h-[180px] flex flex-col`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{kpi.layer}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                {status}
              </span>
            </div>
            {simEnabled ? (
              <div className="mb-0.5" onClick={(e) => e.stopPropagation()}>
                <label className="text-xs text-gray-400">Actual</label>
                <input
                  type="number"
                  step={step}
                  value={actual ?? ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setOverride(kpi.id, { actual: v });
                  }}
                  className="block w-full mt-0.5 px-2 py-1 text-2xl font-bold border border-purple-200 rounded-lg bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatValue(actual, kpi)}
              </div>
            )}
            <div className="text-sm font-medium text-gray-600 mb-4">{kpi.name}</div>
            <div className="flex items-center justify-between" onClick={(e) => simEnabled && e.stopPropagation()}>
              {simEnabled ? (
                <div className="flex items-center gap-1 w-full">
                  <label className="text-xs text-gray-400 whitespace-nowrap">Target:</label>
                  <input
                    type="number"
                    step={step}
                    value={target}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setOverride(kpi.id, { target: v });
                    }}
                    className="w-full px-1.5 py-0.5 text-xs border border-purple-200 rounded-lg bg-purple-50 font-mono focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              ) : (
                <>
                  <span className="text-xs text-gray-400">Target: {formatValue(kpi.target, kpi)}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${gap !== null && gap >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {gap !== null ? (gap >= 0 ? "+" : "") + formatValue(gap, kpi) : "—"}
                  </span>
                </>
              )}
            </div>
            {simEnabled && (
              <div className="mt-1 flex justify-end text-xs">
                <span className={gap !== null && gap >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                  Gap: {gap !== null ? (gap >= 0 ? "+" : "") + formatValue(gap, kpi) : "—"}
                </span>
              </div>
            )}
            <div className="mt-3 text-xs text-gray-400 italic line-clamp-2 group-hover:text-gray-500 transition-colors">
              {kpi.decisionRule}
            </div>
          </div>
        );
      })}
    </div>
  );
};
