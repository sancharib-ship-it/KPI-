import React, { useState, useMemo } from "react";
import { kpis } from "../data/mockData";
import { latestActual, computeGap, computeStatus, formatValue, type Filters, type StatusType } from "../lib/kpiLogic";
import { useSimulation } from "../context/SimulationContext";
import type { KpiConfig } from "../data/mockData";

type SortKey = "gap" | "layer" | "status";

const STATUS_BADGE: Record<StatusType, string> = {
  "On Track": "text-emerald-700",
  "Watch": "text-amber-700",
  "Off Track": "text-red-600",
  "No Data": "text-gray-500",
};

const STATUS_DOT: Record<StatusType, string> = {
  "On Track": "bg-emerald-500",
  "Watch": "bg-amber-400",
  "Off Track": "bg-red-500",
  "No Data": "bg-gray-400",
};

const LAYER_BADGE: Record<string, string> = {
  Input: "bg-gray-100 text-gray-700",
  Output: "bg-blue-50 text-blue-600",
  Outcome: "bg-purple-50 text-purple-700",
  Impact: "bg-emerald-50 text-emerald-700",
};

const LAYER_ORDER = { Input: 0, Output: 1, Outcome: 2, Impact: 3 };
const STATUS_ORDER: Record<StatusType, number> = { "Off Track": 0, "Watch": 1, "On Track": 2, "No Data": 3 };

function stepForKpi(kpi: KpiConfig): number {
  if (kpi.unit === "currency") return 100000;
  if (kpi.unit === "ratio") return 0.01;
  return 0.1;
}

interface KpiTableProps {
  filters: Filters;
  search: string;
  selectedKpiId: string | null;
  onSelectKpi: (kpiId: string) => void;
}

export const KpiTable: React.FC<KpiTableProps> = ({ filters, search, selectedKpiId, onSelectKpi }) => {
  const [sortKey, setSortKey] = useState<SortKey>("layer");
  const [layerFilter, setLayerFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const { enabled: simEnabled, overrides, setOverride, cascadeEnabled, cascadedKpiIds, triggerCascade } = useSimulation();

  // Pre-compute all base actuals for cascade propagation
  const allBaseActuals = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const k of kpis) {
      map[k.id] = latestActual(k.id, filters);
    }
    return map;
  }, [filters]);

  const rows = useMemo(() => {
    return kpis
      .filter((k) => {
        if (layerFilter !== "All" && k.layer !== layerFilter) return false;
        if (typeFilter !== "All" && k.type !== typeFilter) return false;
        if (search && !k.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .map((k) => {
        const baseActual = latestActual(k.id, filters);
        const simOverride = overrides[k.id];
        const actual = simEnabled && simOverride?.actual !== undefined ? simOverride.actual : baseActual;
        const target = simEnabled && simOverride?.target !== undefined ? simOverride.target : k.target;
        const gap = computeGap(actual, target);
        const status = computeStatus(actual, target, k.higherIsBetter);
        return { kpi: k, actual, baseActual, target, gap, status };
      })
      .sort((a, b) => {
        if (sortKey === "gap") {
          const aGap = a.gap ?? -Infinity;
          const bGap = b.gap ?? -Infinity;
          return aGap - bGap; // worst gap first
        }
        if (sortKey === "layer") return LAYER_ORDER[a.kpi.layer] - LAYER_ORDER[b.kpi.layer];
        if (sortKey === "status") return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return 0;
      });
  }, [filters, search, sortKey, layerFilter, typeFilter, simEnabled, overrides]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">KPI Control Table</h2>
        <div className="flex items-center gap-2">
          <select
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none"
          >
            {["All", "Input", "Output", "Outcome", "Impact"].map((l) => <option key={l}>{l}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none"
          >
            {["All", "Formative", "Summative"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <span className="text-xs text-gray-400">Sort:</span>
          {(["layer", "status", "gap"] as SortKey[]).map((sk) => (
            <button
              key={sk}
              onClick={() => setSortKey(sk)}
              className={`text-xs px-2 py-1.5 rounded-lg ${sortKey === sk ? "bg-indigo-50 text-indigo-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              {sk === "gap" ? "Worst Gap" : sk.charAt(0).toUpperCase() + sk.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["KPI", "Layer", "Type", "Cadence", "Target", "Actual", "Gap", "Status", "Source", "Decision Rule"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">No KPIs match the current filters</td>
                </tr>
              ) : rows.map(({ kpi, actual, target, gap, status }, rowIdx) => {
                const isExpanded = expandedRules.has(kpi.id);
                const isSelected = selectedKpiId === kpi.id;
                const step = stepForKpi(kpi);
                const isCascaded = simEnabled && cascadeEnabled && cascadedKpiIds.has(kpi.id);
                const isEven = rowIdx % 2 === 0;
                return (
                  <tr
                    key={kpi.id}
                    className={`cursor-pointer transition-colors border-b border-gray-100 ${
                      isSelected ? "bg-indigo-50 border-l-2 border-l-indigo-400" :
                      isCascaded ? "bg-indigo-50" :
                      isEven ? "bg-white hover:bg-blue-50/40" : "bg-gray-50/50 hover:bg-blue-50/40"
                    }`}
                    onClick={() => onSelectKpi(kpi.id)}
                  >
                    <td className="px-3 py-4 font-medium text-indigo-600 hover:underline whitespace-nowrap">
                      {kpi.name}
                      {isCascaded && (
                        <span title="Auto-calculated from upstream KPI change" className="ml-1 text-indigo-400 cursor-help">🔗</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${LAYER_BADGE[kpi.layer] ?? "bg-gray-100 text-gray-600"}`}>{kpi.layer}</span>
                    </td>
                    <td className="px-3 py-4 text-gray-500 text-xs">{kpi.type}</td>
                    <td className="px-3 py-4 text-gray-400 text-xs">{kpi.cadence}</td>
                    <td className="px-3 py-4 text-gray-600 font-mono text-xs" onClick={(e) => simEnabled && e.stopPropagation()}>
                      {simEnabled ? (
                        <input
                          type="number"
                          step={step}
                          value={target}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) setOverride(kpi.id, { target: v });
                          }}
                          className="w-24 px-1.5 py-0.5 text-xs border border-purple-200 rounded-lg bg-purple-50 font-mono focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      ) : (
                        formatValue(kpi.target, kpi)
                      )}
                    </td>
                    <td className="px-3 py-4 text-gray-800 font-semibold font-mono text-xs" onClick={(e) => simEnabled && e.stopPropagation()}>
                      {simEnabled ? (
                        <div className="relative inline-flex items-center gap-1">
                          <input
                            type="number"
                            step={step}
                            value={actual ?? ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) {
                                const prev = actual ?? 0;
                                setOverride(kpi.id, { actual: v });
                                if (cascadeEnabled && prev !== 0) {
                                  triggerCascade(kpi.id, v, prev, allBaseActuals);
                                }
                              }
                            }}
                            className={`w-24 px-1.5 py-0.5 text-xs border rounded-lg font-mono focus:outline-none focus:ring-1 ${
                              isCascaded
                                ? "border-indigo-200 bg-indigo-50 focus:ring-indigo-400"
                                : "border-purple-200 bg-purple-50 focus:ring-purple-400"
                            }`}
                          />
                          {isCascaded && (
                            <span title="Auto-calculated from upstream KPI change" className="text-indigo-400 text-[10px]">🔗</span>
                          )}
                        </div>
                      ) : (
                        formatValue(actual, kpi)
                      )}
                    </td>
                    <td className={`px-3 py-4 font-mono font-medium text-xs ${gap !== null && gap >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {gap !== null ? (gap >= 0 ? "+" : "") + formatValue(gap, kpi) : "—"}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-gray-400 text-xs max-w-[120px] truncate">{kpi.source}</td>
                    <td className="px-3 py-4 text-xs text-gray-500 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={isExpanded ? "" : "line-clamp-1"}
                        title={kpi.decisionRule}
                      >
                        {kpi.decisionRule}
                      </span>
                      <button
                        className="text-indigo-400 hover:text-indigo-600 ml-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRules((prev) => {
                            const next = new Set(prev);
                            if (next.has(kpi.id)) next.delete(kpi.id); else next.add(kpi.id);
                            return next;
                          });
                        }}
                      >
                        {isExpanded ? "less" : "more"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
