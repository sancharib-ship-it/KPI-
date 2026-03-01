import React from "react";
import type { WaveLabel, RegionLabel, ChannelLabel } from "../data/mockData";

type WaveOption = "All" | WaveLabel;
type RegionOption = "All" | RegionLabel;
type ChannelOption = "All" | ChannelLabel;

interface FiltersBarProps {
  wave: WaveOption;
  region: RegionOption;
  channel: ChannelOption;
  search: string;
  showChannel: boolean;
  onWaveChange: (v: WaveOption) => void;
  onRegionChange: (v: RegionOption) => void;
  onChannelChange: (v: ChannelOption) => void;
  onSearchChange: (v: string) => void;
}

const WAVES: WaveOption[] = ["All", "Wave 1", "Wave 2"];
const REGIONS: RegionOption[] = ["All", "Global", "NA", "EU", "APAC"];
const CHANNELS: ChannelOption[] = ["All", "CTV", "YouTube", "Social", "Search", "Influencers", "CRM", "Retail"];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  wave, region, channel, search, showChannel,
  onWaveChange, onRegionChange, onChannelChange, onSearchChange,
}) => (
  <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 px-6 py-3 bg-white border-b border-gray-100">
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Wave</label>
      <div className="flex gap-1">
        {WAVES.map((w) => (
          <button
            key={w}
            onClick={() => onWaveChange(w)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              wave === w ? "bg-indigo-50 text-indigo-700 border border-transparent" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Region</label>
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value as RegionOption)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>

    {showChannel && (
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Channel</label>
        <select
          value={channel}
          onChange={(e) => onChannelChange(e.target.value as ChannelOption)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    )}

    <div className="flex items-center gap-2 ml-auto">
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search KPIs…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300"
      />
    </div>
  </div>
);
