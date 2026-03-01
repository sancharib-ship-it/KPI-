import { useState } from "react";
import { FiltersBar } from "./components/FiltersBar";
import { Scorecard } from "./components/Scorecard";
import { KpiFlow } from "./components/KpiFlow";
import { KpiTable } from "./components/KpiTable";
import { KpiDetail } from "./components/KpiDetail";
import { WaveComparison } from "./components/WaveComparison";
import type { WaveLabel, RegionLabel, ChannelLabel } from "./data/mockData";
import { kpis } from "./data/mockData";

type WaveOption = "All" | WaveLabel;
type RegionOption = "All" | RegionLabel;
type ChannelOption = "All" | ChannelLabel;

function App() {
  const [wave, setWave] = useState<WaveOption>("All");
  const [region, setRegion] = useState<RegionOption>("Global");
  const [channel, setChannel] = useState<ChannelOption>("All");
  const [search, setSearch] = useState("");
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>("market-share");

  const selectedKpi = selectedKpiId ? kpis.find((k) => k.id === selectedKpiId) : null;
  const isOutputKpi = selectedKpi?.layer === "Output";

  const filters = {
    wave,
    region,
    channel: isOutputKpi ? channel : "All" as ChannelOption,
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
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Input → Output → Outcome → Impact</span>
          </div>
        </div>
        <FiltersBar
          wave={wave}
          region={region}
          channel={channel}
          search={search}
          showChannel={isOutputKpi}
          onWaveChange={setWave}
          onRegionChange={setRegion}
          onChannelChange={setChannel}
          onSearchChange={setSearch}
        />
      </header>

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

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 mt-4 bg-white">
        Samsung Galaxy S KPI Dashboard · Marketing Measurement System · Confidential
      </footer>
    </div>
  );
}

export default App;
