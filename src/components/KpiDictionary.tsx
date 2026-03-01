import React, { useState, useMemo } from "react";
import { kpis } from "../data/mockData";
import type { KpiLayer, KpiType, KpiCadence } from "../data/mockData";
import { formatValue } from "../lib/kpiLogic";

const LAYER_ORDER: KpiLayer[] = ["Input", "Output", "Outcome", "Impact"];

const LAYER_COLORS: Record<KpiLayer, { bg: string; text: string; border: string; header: string }> = {
  Input:   { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300",  header: "bg-gray-200 text-gray-800" },
  Output:  { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300",  header: "bg-blue-100 text-blue-800" },
  Outcome: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300",header: "bg-purple-100 text-purple-800" },
  Impact:  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300", header: "bg-green-100 text-green-800" },
};

const TYPE_COLORS: Record<KpiType, { bg: string; text: string }> = {
  Formative:  { bg: "bg-teal-100",   text: "text-teal-700" },
  Summative:  { bg: "bg-orange-100", text: "text-orange-700" },
};

const CADENCE_LABEL: Record<KpiCadence, string> = {
  "one-time":     "One-Time",
  "weekly":       "Weekly",
  "pre/post wave":"Pre/Post Wave",
};

export const KpiDictionary: React.FC = () => {
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<KpiLayer | "All">("All");
  const [typeFilter, setTypeFilter] = useState<KpiType | "All">("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kpis.filter((k) => {
      if (q && !k.name.toLowerCase().includes(q) && !k.id.toLowerCase().includes(q)) return false;
      if (layerFilter !== "All" && k.layer !== layerFilter) return false;
      if (typeFilter !== "All" && k.type !== typeFilter) return false;
      return true;
    });
  }, [search, layerFilter, typeFilter]);

  const grouped = useMemo(() => {
    return LAYER_ORDER.map((layer) => ({
      layer,
      items: filtered.filter((k) => k.layer === layer),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
      {/* Search & filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search KPIs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
        />

        {/* Layer chips */}
        <div className="flex flex-wrap gap-1">
          {(["All", ...LAYER_ORDER] as (KpiLayer | "All")[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayerFilter(l)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${layerFilter === l
                  ? l === "All"
                    ? "bg-gray-700 text-white border-gray-700"
                    : `${LAYER_COLORS[l as KpiLayer].bg} ${LAYER_COLORS[l as KpiLayer].text} ${LAYER_COLORS[l as KpiLayer].border}`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-1">
          {(["All", "Formative", "Summative"] as (KpiType | "All")[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${typeFilter === t
                  ? t === "All"
                    ? "bg-gray-700 text-white border-gray-700"
                    : `${TYPE_COLORS[t as KpiType].bg} ${TYPE_COLORS[t as KpiType].text} border-current`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {kpis.length} KPIs</span>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No KPIs match your filters.</div>
      )}

      {/* Grouped sections */}
      {grouped.map(({ layer, items }) => {
        const lc = LAYER_COLORS[layer];
        return (
          <section key={layer}>
            {/* Layer header */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-3 ${lc.header}`}>
              <span className="text-sm font-bold uppercase tracking-wide">{layer}</span>
              <span className="text-xs font-medium opacity-70">({items.length} KPI{items.length !== 1 ? "s" : ""})</span>
            </div>

            <div className="space-y-3">
              {items.map((kpi) => {
                const tc = TYPE_COLORS[kpi.type];
                return (
                  <div
                    key={kpi.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3"
                  >
                    {/* Card header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{kpi.name}</h3>
                        <span className="text-xs text-gray-400 font-mono">{kpi.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${lc.bg} ${lc.text}`}>{kpi.layer}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tc.bg} ${tc.text}`}>{kpi.type}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600">{kpi.description}</p>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Cadence</div>
                        <div className="text-sm text-gray-700">{CADENCE_LABEL[kpi.cadence]}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unit</div>
                        <div className="text-sm text-gray-700">{kpi.unit}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Target</div>
                        <div className="text-sm text-gray-700">{formatValue(kpi.target, kpi)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Higher is Better</div>
                        <div className={`text-sm font-semibold ${kpi.higherIsBetter ? "text-green-600" : "text-red-500"}`}>
                          {kpi.higherIsBetter ? "Yes ↑" : "No ↓"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Source</div>
                        <div className="text-sm text-gray-700">{kpi.source}</div>
                      </div>
                    </div>

                    {/* Decision rule */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-800">
                      <span className="font-semibold">Decision Rule: </span>{kpi.decisionRule}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
