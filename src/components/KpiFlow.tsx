import React from "react";
import { kpis } from "../data/mockData";
import { latestActual, computeStatus, type Filters, type StatusType } from "../lib/kpiLogic";

const STATUS_BG: Record<StatusType, string> = {
  "On Track": "bg-green-500 border-green-600",
  "Watch": "bg-yellow-400 border-yellow-500",
  "Off Track": "bg-red-500 border-red-600",
  "No Data": "bg-gray-300 border-gray-400",
};

const STATUS_TEXT: Record<StatusType, string> = {
  "On Track": "text-white",
  "Watch": "text-yellow-900",
  "Off Track": "text-white",
  "No Data": "text-gray-600",
};

const FLOW_NODES = [
  { id: "total-investment", label: "Investment", sub: "Input" },
  { id: "reach-1plus", label: "Reach 1+", sub: "Output" },
  { id: "reach-3plus", label: "Reach 3+", sub: "Output" },
  { id: "vtr", label: "VTR", sub: "Output" },
  { id: "innovation-lift", label: "Innovation Assoc.", sub: "Outcome" },
  { id: "camera-lift", label: "Camera Assoc.", sub: "Outcome" },
  { id: "consideration-apple", label: "Consideration", sub: "Outcome" },
  { id: "switching-intent", label: "Switching", sub: "Outcome" },
  { id: "market-share", label: "Market Share", sub: "Impact" },
  { id: "romi", label: "ROMI", sub: "Impact" },
];

interface KpiFlowProps {
  filters: Filters;
  selectedKpiId: string | null;
  onSelectKpi: (kpiId: string) => void;
}

export const KpiFlow: React.FC<KpiFlowProps> = ({ filters, selectedKpiId, onSelectKpi }) => {
  return (
    <div className="px-6 py-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        KPI Architecture Flow
      </h2>
      <div className="flex items-center flex-wrap gap-1 overflow-x-auto pb-2">
        {FLOW_NODES.map((node, idx) => {
          const kpi = kpis.find((k) => k.id === node.id);
          if (!kpi) return null;
          const actual = latestActual(node.id, filters);
          const status = computeStatus(actual, kpi.target, kpi.higherIsBetter);
          const isSelected = selectedKpiId === node.id;

          return (
            <React.Fragment key={node.id}>
              <button
                onClick={() => onSelectKpi(node.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 text-center min-w-[90px] transition-all ${STATUS_BG[status]} ${STATUS_TEXT[status]} ${
                  isSelected ? "ring-4 ring-blue-400 ring-offset-1 scale-105" : "hover:scale-105 hover:shadow-md"
                }`}
              >
                <span className="text-xs font-bold leading-tight">{node.label}</span>
                <span className="text-[10px] opacity-75 mt-0.5">{node.sub}</span>
              </button>
              {idx < FLOW_NODES.length - 1 && (
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2">
        {(["On Track", "Watch", "Off Track", "No Data"] as StatusType[]).map((s) => (
          <span key={s} className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-3 h-3 rounded ${STATUS_BG[s]}`} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};
