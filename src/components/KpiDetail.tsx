import React, { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { kpis } from "../data/mockData";
import {
  getTrendData, getChannelBreakdown, getRegionBreakdown,
  formatValue, computeStatus, latestActual, generateInterpretation, type Filters, type StatusType,
} from "../lib/kpiLogic";
import type { KpiConfig } from "../data/mockData";
import { useSimulation } from "../context/SimulationContext";

const STATUS_COLOR: Record<StatusType, string> = {
  "On Track": "#22c55e",
  "Watch": "#eab308",
  "Off Track": "#ef4444",
  "No Data": "#9ca3af",
};

function makeFormatter(kpi: KpiConfig) {
  return (v: number | undefined): [string, string] => [formatValue(v ?? null, kpi), kpi.name];
}

function stepForKpi(kpi: KpiConfig): number {
  if (kpi.unit === "currency") return 100000;
  if (kpi.unit === "ratio") return 0.01;
  return 0.1;
}

interface KpiDetailProps {
  kpiId: string;
  filters: Filters;
}

export const KpiDetail: React.FC<KpiDetailProps> = ({ kpiId, filters }) => {
  const kpi = kpis.find((k) => k.id === kpiId);
  const { enabled: simEnabled, overrides, setOverride, cascadeEnabled, cascadedKpiIds, triggerCascade } = useSimulation();

  if (!kpi) return <div className="p-6 text-gray-400">Select a KPI to see details.</div>;

  const baseActual = latestActual(kpiId, filters);
  const simOverride = overrides[kpiId];
  const actual = simEnabled && simOverride?.actual !== undefined ? simOverride.actual : baseActual;
  const target = simEnabled && simOverride?.target !== undefined ? simOverride.target : kpi.target;

  const isCascaded = simEnabled && cascadeEnabled && cascadedKpiIds.has(kpiId);

  // Pre-compute base actuals for all KPIs (used by cascade engine)
  const allBaseActuals = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const k of kpis) {
      map[k.id] = latestActual(k.id, filters);
    }
    return map;
  }, [filters]);

  const status = computeStatus(actual, target, kpi.higherIsBetter);
  const statusColor = STATUS_COLOR[status];

  const trendData = getTrendData(kpiId, filters);
  const channelData = getChannelBreakdown(kpiId, filters);
  const regionData = getRegionBreakdown(kpiId, filters);

  const hasChannelData = channelData.length > 0;
  const showBreakdown = hasChannelData ? channelData : regionData;
  const breakdownLabel = hasChannelData ? "Channel Breakdown" : "Regional Breakdown";
  const breakdownKey = hasChannelData ? "channel" : "region";

  const tooltipFormatter = makeFormatter(kpi);
  const { interpretation, implication } = generateInterpretation(kpiId, actual, filters, simEnabled ? target : undefined);
  const step = stepForKpi(kpi);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{kpi.name}</h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{kpi.layer}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{kpi.type}</span>
            <span className="text-xs text-gray-400">{kpi.cadence}</span>
            {isCascaded && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium" title="Auto-calculated from upstream KPI change">
                🔗 Auto-cascaded
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {simEnabled ? (
            <div className="space-y-1">
              <div>
                <label className="text-xs text-gray-400 block">Actual</label>
                <input
                  type="number"
                  step={step}
                  value={actual ?? ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) {
                      const prev = actual ?? 0;
                      setOverride(kpiId, { actual: v });
                      if (cascadeEnabled && prev !== 0) {
                        triggerCascade(kpiId, v, prev, allBaseActuals);
                      }
                    }
                  }}
                  className={`w-28 px-2 py-1 text-xl font-bold border rounded-lg text-right focus:outline-none focus:ring-1 ${
                    isCascaded
                      ? "border-indigo-200 bg-indigo-50 focus:ring-indigo-400"
                      : "border-purple-200 bg-purple-50 focus:ring-purple-400"
                  }`}
                  style={{ color: statusColor }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block">Target</label>
                <input
                  type="number"
                  step={step}
                  value={target}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setOverride(kpiId, { target: v });
                  }}
                  className="w-28 px-2 py-1 text-sm border border-purple-200 rounded-lg bg-purple-50 text-right focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold" style={{ color: statusColor }}>{formatValue(actual, kpi)}</div>
              <div className="text-sm text-gray-400 mt-0.5">Target: {formatValue(kpi.target, kpi)}</div>
            </>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 py-3 border-y border-gray-100">
        <div><span className="font-medium text-gray-600">Source:</span> {kpi.source}</div>
        <div><span className="font-medium text-gray-600">Unit:</span> {kpi.unit}</div>
      </div>

      {/* Decision Rule */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
        <span className="font-semibold">Decision Rule: </span>{kpi.decisionRule}
      </div>

      {/* Interpretation */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-2">
        <div className="text-sm font-semibold text-blue-800">📊 Interpretation</div>
        <p className={`text-sm ${actual === null ? "text-gray-500 italic" : "text-blue-900"}`}>{interpretation}</p>
        {implication && (
          <p className="text-sm text-blue-700 italic bg-white/60 rounded-lg px-2 py-1">{implication}</p>
        )}
      </div>

      {/* Trend Chart */}
      {trendData.length > 0 ? (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {kpi.type === "Formative" ? "Weekly Trend" : "Pre/Post Comparison"}
          </h4>
          {kpi.type === "Formative" ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={tooltipFormatter} />
                <ReferenceLine y={target} stroke="#818cf8" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#818cf8" }} />
                <Line type="monotone" dataKey="value" stroke={statusColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={tooltipFormatter} />
                <ReferenceLine y={target} stroke="#818cf8" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#818cf8" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {trendData.map((_, idx) => (
                    <Cell key={idx} fill={idx === trendData.length - 1 ? statusColor : "#bfdbfe"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">No trend data for current filters</div>
      )}

      {/* Breakdown Chart */}
      {showBreakdown.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{breakdownLabel}</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={showBreakdown} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey={breakdownKey} type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
