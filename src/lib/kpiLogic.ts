import { kpis, observations, type KpiConfig, type Observation, type WaveLabel, type RegionLabel, type ChannelLabel } from "../data/mockData";

export interface Filters {
  wave?: WaveLabel | "All";
  region?: RegionLabel | "All";
  channel?: ChannelLabel | "All";
}

export function getKpi(kpiId: string): KpiConfig | undefined {
  return kpis.find((k) => k.id === kpiId);
}

export function filterObservations(kpiId: string, filters: Filters): Observation[] {
  return observations.filter((o) => {
    if (o.kpiId !== kpiId) return false;
    if (filters.wave && filters.wave !== "All" && o.wave !== filters.wave) return false;
    if (filters.region && filters.region !== "All" && o.region !== filters.region) return false;
    if (filters.channel && filters.channel !== "All") {
      if (o.channel !== filters.channel) return false;
    } else {
      // when no channel filter, only include observations without channel (aggregated)
      if (o.channel) return false;
    }
    return true;
  });
}

export function latestActual(kpiId: string, filters: Filters): number | null {
  const obs = filterObservations(kpiId, filters);
  if (obs.length === 0) return null;
  obs.sort((a, b) => a.date.localeCompare(b.date));
  return obs[obs.length - 1].value;
}

export function computeGap(actual: number | null, target: number): number | null {
  if (actual === null) return null;
  return actual - target;
}

export type StatusType = "On Track" | "Watch" | "Off Track" | "No Data";

export function computeStatus(actual: number | null, target: number, higherIsBetter: boolean): StatusType {
  if (actual === null) return "No Data";
  if (higherIsBetter) {
    if (actual >= target) return "On Track";
    if (actual >= target * 0.95) return "Watch";
    return "Off Track";
  } else {
    if (actual <= target) return "On Track";
    if (actual <= target * 1.05) return "Watch";
    return "Off Track";
  }
}

export function percentGap(actual: number | null, target: number): string {
  if (actual === null || target === 0) return "N/A";
  const pct = ((actual - target) / Math.abs(target)) * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export function formatValue(value: number | null, kpi: KpiConfig): string {
  if (value === null) return "—";
  if (kpi.unit === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
  }
  const formatted = value.toFixed(kpi.decimals);
  if (kpi.unit === "%") return `${formatted}%`;
  if (kpi.unit === "pts") return `${formatted} pts`;
  if (kpi.unit === "ratio") return `${formatted}x`;
  return formatted;
}

export function getTrendData(kpiId: string, filters: Filters): Array<{ date: string; value: number }> {
  const obs = filterObservations(kpiId, filters);
  obs.sort((a, b) => a.date.localeCompare(b.date));
  return obs.map((o) => ({ date: o.date.slice(5), value: o.value })); // MM-DD
}

export function getChannelBreakdown(kpiId: string, filters: Filters): Array<{ channel: string; value: number }> {
  const channelObs = observations.filter((o) => {
    if (o.kpiId !== kpiId) return false;
    if (!o.channel) return false;
    if (filters.wave && filters.wave !== "All" && o.wave !== filters.wave) return false;
    if (filters.region && filters.region !== "All" && o.region !== filters.region) return false;
    return true;
  });
  // Group by channel, take latest
  const map = new Map<string, { date: string; value: number }>();
  for (const o of channelObs) {
    const existing = map.get(o.channel!);
    if (!existing || o.date > existing.date) {
      map.set(o.channel!, { date: o.date, value: o.value });
    }
  }
  return Array.from(map.entries()).map(([channel, { value }]) => ({ channel, value }));
}

export function getRegionBreakdown(kpiId: string, filters: Filters): Array<{ region: string; value: number }> {
  const regions: RegionLabel[] = ["Global", "NA", "EU", "APAC"];
  const result: Array<{ region: string; value: number }> = [];
  for (const region of regions) {
    const val = latestActual(kpiId, { ...filters, region });
    if (val !== null) result.push({ region, value: val });
  }
  return result;
}
