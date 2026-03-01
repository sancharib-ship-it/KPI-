import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { kpis } from "../data/mockData";
import { latestActual, formatValue } from "../lib/kpiLogic";
import type { RegionLabel } from "../data/mockData";

const COMPARISON_KPIS = [
  { id: "innovation-lift", label: "Innovation Assoc." },
  { id: "camera-lift", label: "Camera Assoc." },
  { id: "consideration-apple", label: "Consideration vs Apple" },
  { id: "switching-intent", label: "Switching Intent" },
];

interface WaveComparisonProps {
  region: RegionLabel | "All";
}

export const WaveComparison: React.FC<WaveComparisonProps> = ({ region }) => {
  const data = COMPARISON_KPIS.map(({ id, label }) => {
    const kpi = kpis.find((k) => k.id === id)!;
    const w1 = latestActual(id, { wave: "Wave 1", region });
    const w2 = latestActual(id, { wave: "Wave 2", region });
    return { label, w1: w1 ?? 0, w2: w2 ?? 0, target: kpi.target };
  });

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Wave Comparison</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} label={{ value: "Lift (pts)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip formatter={(v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(1)} pts`, name ?? ""]} />
            <Legend wrapperStyle={{ fontSize: "13px", color: "#6b7280" }} />
            <Bar dataKey="w1" name="Wave 1" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            <Bar dataKey="w2" name="Wave 2" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-4">
          {data.map(({ label, target }) => {
            const kpi = kpis.find((k) => COMPARISON_KPIS.find((c) => c.label === label && c.id === k.id))!;
            return (
              <div key={label} className="text-xs text-gray-400 flex items-center gap-1">
                <span className="font-medium text-gray-600">{label}:</span>
                <span>Target {formatValue(target, kpi)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
