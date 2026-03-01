import React from "react";
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

const STATUS_COLOR: Record<StatusType, string> = {
  "On Track": "#22c55e",
  "Watch": "#eab308",
  "Off Track": "#ef4444",
  "No Data": "#9ca3af",
};

function makeFormatter(kpi: KpiConfig) {
  return (v: number | undefined): [string, string] => [formatValue(v ?? null, kpi), kpi.name];
}

interface KpiDetailProps {
  kpiId: string;
  filters: Filters;
}

export const KpiDetail: React.FC<KpiDetailProps> = ({ kpiId, filters }) => {
  const kpi = kpis.find((k) => k.id === kpiId);
  if (!kpi) return <div className="p-6 text-gray-400">Select a KPI to see details.</div>;

  const actual = latestActual(kpiId, filters);
  const status = computeStatus(actual, kpi.target, kpi.higherIsBetter);
  const statusColor = STATUS_COLOR[status];

  const trendData = getTrendData(kpiId, filters);
  const channelData = getChannelBreakdown(kpiId, filters);
  const regionData = getRegionBreakdown(kpiId, filters);

  const hasChannelData = channelData.length > 0;
  const showBreakdown = hasChannelData ? channelData : regionData;
  const breakdownLabel = hasChannelData ? "Channel Breakdown" : "Regional Breakdown";
  const breakdownKey = hasChannelData ? "channel" : "region";

  const tooltipFormatter = makeFormatter(kpi);
  const { interpretation, implication } = generateInterpretation(kpiId, actual, filters);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{kpi.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{kpi.layer}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">{kpi.type}</span>
            <span className="text-xs text-gray-400">{kpi.cadence}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: statusColor }}>{formatValue(actual, kpi)}</div>
          <div className="text-xs text-gray-400 mt-0.5">Target: {formatValue(kpi.target, kpi)}</div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div><span className="font-semibold text-gray-700">Source:</span> {kpi.source}</div>
        <div><span className="font-semibold text-gray-700">Unit:</span> {kpi.unit}</div>
      </div>

      {/* Decision Rule */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <span className="font-semibold">Decision Rule: </span>{kpi.decisionRule}
      </div>

      {/* Interpretation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <div className="text-sm font-bold text-blue-900">📊 Interpretation</div>
        <p className={`text-sm ${actual === null ? "text-gray-500 italic" : "text-blue-900"}`}>{interpretation}</p>
        {implication && (
          <p className="text-sm text-blue-700 italic bg-white/60 rounded px-2 py-1">{implication}</p>
        )}
      </div>

      {/* Trend Chart */}
      {trendData.length > 0 ? (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {kpi.type === "Formative" ? "Weekly Trend" : "Pre/Post Comparison"}
          </h4>
          {kpi.type === "Formative" ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={tooltipFormatter} />
                <ReferenceLine y={kpi.target} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#3b82f6" }} />
                <Line type="monotone" dataKey="value" stroke={statusColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={tooltipFormatter} />
                <ReferenceLine y={kpi.target} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#3b82f6" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {trendData.map((_, idx) => (
                    <Cell key={idx} fill={idx === trendData.length - 1 ? statusColor : "#93c5fd"} />
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
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{breakdownLabel}</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={showBreakdown} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey={breakdownKey} type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
