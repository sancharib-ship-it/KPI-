import React, { useState, useMemo } from "react";
import { kpis } from "../data/mockData";
import { latestActual, computeGap, computeStatus, formatValue, type Filters, type StatusType } from "../lib/kpiLogic";
import { useSimulation } from "../context/SimulationContext";
import type { KpiConfig } from "../data/mockData";

type SortKey = "gap" | "layer" | "status";

const STATUS_BADGE: Record<StatusType, string> = {
  "On Track": "bg-green-100 text-green-800",
  "Watch": "bg-yellow-100 text-yellow-800",
  "Off Track": "bg-red-100 text-red-800",
  "No Data": "bg-gray-100 text-gray-500",
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
  const { enabled: simEnabled, overrides, setOverride } = useSimulation();

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
    <div className="px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">KPI Control Table</h2>
        <div className="flex items-center gap-2">
          <select
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-600"
          >
            {["All", "Input", "Output", "Outcome", "Impact"].map((l) => <option key={l}>{l}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-600"
          >
            {["All", "Formative", "Summative"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <span className="text-xs text-gray-400">Sort:</span>
          {(["layer", "status", "gap"] as SortKey[]).map((sk) => (
            <button
              key={sk}
              onClick={() => setSortKey(sk)}
              className={`text-xs px-2 py-1 rounded ${sortKey === sk ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {sk === "gap" ? "Worst Gap" : sk.charAt(0).toUpperCase() + sk.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["KPI", "Layer", "Type", "Cadence", "Target", "Actual", "Gap", "Status", "Source", "Decision Rule"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">No KPIs match the current filters</td>
                </tr>
              ) : rows.map(({ kpi, actual, target, gap, status }) => {
                const isExpanded = expandedRules.has(kpi.id);
                const isSelected = selectedKpiId === kpi.id;
                const step = stepForKpi(kpi);
                return (
                  <tr
                    key={kpi.id}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                    onClick={() => onSelectKpi(kpi.id)}
                  >
                    <td className="px-3 py-2.5 font-medium text-blue-700 hover:underline whitespace-nowrap">{kpi.name}</td>
                    <td className="px-3 py-2.5 text-gray-600">{kpi.layer}</td>
                    <td className="px-3 py-2.5 text-gray-600">{kpi.type}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{kpi.cadence}</td>
                    <td className="px-3 py-2.5 text-gray-700 font-mono" onClick={(e) => simEnabled && e.stopPropagation()}>
                      {simEnabled ? (
                        <input
                          type="number"
                          step={step}
                          value={target}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) setOverride(kpi.id, { target: v });
                          }}
                          className="w-24 px-1.5 py-0.5 text-xs border border-purple-300 rounded bg-purple-50 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        formatValue(kpi.target, kpi)
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-900 font-semibold font-mono" onClick={(e) => simEnabled && e.stopPropagation()}>
                      {simEnabled ? (
                        <input
                          type="number"
                          step={step}
                          value={actual ?? ""}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) setOverride(kpi.id, { actual: v });
                          }}
                          className="w-24 px-1.5 py-0.5 text-xs border border-purple-300 rounded bg-purple-50 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      ) : (
                        formatValue(actual, kpi)
                      )}
                    </td>
                    <td className={`px-3 py-2.5 font-mono font-semibold ${gap !== null && gap >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {gap !== null ? (gap >= 0 ? "+" : "") + formatValue(gap, kpi) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[status]}`}>{status}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[120px] truncate">{kpi.source}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <span className={isExpanded ? "" : "line-clamp-1"}>{kpi.decisionRule}</span>
                      <button
                        className="text-blue-500 hover:underline ml-1"
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
