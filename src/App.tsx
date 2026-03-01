import { useState } from "react";
import { FiltersBar } from "./components/FiltersBar";
import { Scorecard } from "./components/Scorecard";
import { KpiFlow } from "./components/KpiFlow";
import { KpiTable } from "./components/KpiTable";
import { KpiDetail } from "./components/KpiDetail";
import { WaveComparison } from "./components/WaveComparison";
import { KpiDictionary } from "./components/KpiDictionary";
import { CascadeLog } from "./components/CascadeLog";
import type { WaveLabel, RegionLabel, ChannelLabel } from "./data/mockData";
import { kpis } from "./data/mockData";
import { useSimulation } from "./context/SimulationContext";

type WaveOption = "All" | WaveLabel;
type RegionOption = "All" | RegionLabel;
type ChannelOption = "All" | ChannelLabel;
type TabOption = "dashboard" | "dictionary";

function App() {
  const [activeTab, setActiveTab] = useState<TabOption>("dashboard");
  const [wave, setWave] = useState<WaveOption>("All");
  const [region, setRegion] = useState<RegionOption>("Global");
  const [channel, setChannel] = useState<ChannelOption>("All");
  const [search, setSearch] = useState("");
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>("market-share");
  const {
    enabled: simEnabled,
    setEnabled: setSimEnabled,
    resetOverrides,
    cascadeEnabled,
    setCascadeEnabled,
    cascadeLog,
  } = useSimulation();

  const selectedKpi = selectedKpiId ? kpis.find((k) => k.id === selectedKpiId) : null;
  const isOutputKpi = selectedKpi?.layer === "Output";

  const filters = {
    wave,
    region,
    channel: isOutputKpi ? channel : "All" as ChannelOption,
  };

  const handleToggleSim = () => {
    if (simEnabled) {
      resetOverrides();
    }
    setSimEnabled(!simEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Samsung Galaxy S — Global Launch</h1>
                <p className="text-xs text-gray-500">Marketing KPI Dashboard · Wave 1: Launch · Wave 2: Reinforcement</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {simEnabled && (
              <button
                onClick={() => { resetOverrides(); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors"
              >
                ↩ Reset to Defaults
              </button>
            )}
            <button
              onClick={handleToggleSim}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                simEnabled
                  ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              🔬 Simulation Mode
            </button>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Input → Output → Outcome → Impact</span>
          </div>
        </div>

        {/* Simulation Mode Banner */}
        {simEnabled && (
          <div className="px-6 py-2 bg-purple-50 border-b border-purple-200 flex items-center gap-2 flex-wrap">
            <span className="text-purple-700 text-xs font-semibold">🔬 Simulation Mode Active</span>
            <span className="text-purple-500 text-xs">— Edit Actual and Target values to explore scenarios in real-time.</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-purple-600 text-xs font-semibold">🔗 Linked Cascade:</span>
              <button
                onClick={() => setCascadeEnabled(!cascadeEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  cascadeEnabled ? "bg-indigo-500" : "bg-gray-300"
                }`}
                title={cascadeEnabled ? "Cascade ON — downstream KPIs auto-adjust" : "Cascade OFF — manual edits only"}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    cascadeEnabled ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-xs text-indigo-600 font-semibold">{cascadeEnabled ? "ON" : "OFF"}</span>
            </div>
          </div>
        )}
        {/* Cascade Log Panel */}
        {simEnabled && cascadeEnabled && (
          <CascadeLog log={cascadeLog} />
        )}

        <FiltersBar
          wave={wave}
          region={region}
          channel={channel}
          search={search}
          showChannel={isOutputKpi && activeTab === "dashboard"}
          onWaveChange={setWave}
          onRegionChange={setRegion}
          onChannelChange={setChannel}
          onSearchChange={setSearch}
        />
        {/* Tab bar */}
        <div className="px-6 flex gap-0 border-t border-gray-100">
          {(["dashboard", "dictionary"] as TabOption[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize
                ${activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab === "dashboard" ? "Dashboard" : "KPI Dictionary"}
            </button>
          ))}
        </div>
      </header>

      {/* Simulation mode outer border */}
      <div className={simEnabled ? "ring-4 ring-purple-400 ring-inset" : ""}>
        {activeTab === "dashboard" ? (
          <main className="max-w-screen-2xl mx-auto">
            {/* Executive Scorecard */}
            <section className="border-b border-gray-200">
              <div className="px-6 pt-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Executive Scorecard</h2>
              </div>
              <Scorecard filters={filters} onSelectKpi={setSelectedKpiId} />
            </section>

            {/* KPI Architecture Flow */}
            <section className="border-b border-gray-200 bg-white">
              <KpiFlow
                filters={filters}
                selectedKpiId={selectedKpiId}
                onSelectKpi={setSelectedKpiId}
              />
            </section>

            {/* Main Content: Table + Detail */}
            <div className="flex gap-0 lg:gap-0 flex-col lg:flex-row">
              <div className="flex-1 min-w-0 border-r border-gray-200">
                <KpiTable
                  filters={filters}
                  search={search}
                  selectedKpiId={selectedKpiId}
                  onSelectKpi={setSelectedKpiId}
                />
              </div>

              {selectedKpiId && (
                <div className="w-full lg:w-[420px] flex-shrink-0 px-6 py-4">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">KPI Detail</h2>
                  <KpiDetail
                    kpiId={selectedKpiId}
                    filters={filters}
                  />
                </div>
              )}
            </div>

            {/* Wave Comparison */}
            <section className="border-t border-gray-200 bg-white">
              <WaveComparison region={region} />
            </section>
          </main>
        ) : (
          <main>
            <KpiDictionary />
          </main>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 mt-4 bg-white">
        Samsung Galaxy S KPI Dashboard · Marketing Measurement System · Confidential
      </footer>
    </div>
  );
}

export default App;
