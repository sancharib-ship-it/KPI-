export type KpiLayer = "Input" | "Output" | "Outcome" | "Impact";
export type KpiType = "Formative" | "Summative";
export type KpiCadence = "one-time" | "weekly" | "pre/post wave";
export type WaveLabel = "Wave 1" | "Wave 2";
export type RegionLabel = "Global" | "NA" | "EU" | "APAC";
export type ChannelLabel = "CTV" | "YouTube" | "Social" | "Search" | "Influencers" | "CRM" | "Retail";

export interface KpiConfig {
  id: string;
  name: string;
  layer: KpiLayer;
  type: KpiType;
  cadence: KpiCadence;
  source: string;
  target: number;
  higherIsBetter: boolean;
  decisionRule: string;
  unit: "%" | "pts" | "ratio" | "currency";
  decimals: number;
}

export interface Observation {
  date: string;
  wave: WaveLabel;
  region: RegionLabel;
  channel?: ChannelLabel;
  kpiId: string;
  value: number;
}

export const kpis: KpiConfig[] = [
  {
    id: "total-investment",
    name: "Total Campaign Investment",
    layer: "Input",
    type: "Formative",
    cadence: "one-time",
    source: "Finance / Media Plan",
    target: 45000000,
    higherIsBetter: false,
    decisionRule: "If over budget by >5%, flag for reallocation review with CMO.",
    unit: "currency",
    decimals: 0,
  },
  {
    id: "budget-allocation",
    name: "Budget Allocation by Wave (W1 %)",
    layer: "Input",
    type: "Formative",
    cadence: "one-time",
    source: "Finance / Media Plan",
    target: 60,
    higherIsBetter: true,
    decisionRule: "If W1 share drops below 55%, re-evaluate launch momentum strategy.",
    unit: "%",
    decimals: 1,
  },
  {
    id: "reach-1plus",
    name: "Reach 1+ (Premium Target)",
    layer: "Output",
    type: "Formative",
    cadence: "weekly",
    source: "DV360 / Nielson DAR",
    target: 72,
    higherIsBetter: true,
    decisionRule: "If <68%, expand premium inventory buys; review audience targeting segments.",
    unit: "%",
    decimals: 1,
  },
  {
    id: "reach-3plus",
    name: "Reach 3+",
    layer: "Output",
    type: "Formative",
    cadence: "weekly",
    source: "DV360 / Nielson DAR",
    target: 48,
    higherIsBetter: true,
    decisionRule: "If <45%, increase frequency caps on premium segments or add retargeting layer.",
    unit: "%",
    decimals: 1,
  },
  {
    id: "vtr",
    name: "Video Completion Rate (VTR)",
    layer: "Output",
    type: "Formative",
    cadence: "weekly",
    source: "YouTube / CTV Analytics",
    target: 38,
    higherIsBetter: true,
    decisionRule: "If <36%, A/B test shorter cuts (6s bumpers) or revise first-5-second hook.",
    unit: "%",
    decimals: 1,
  },
  {
    id: "feature-engagement",
    name: "Feature Engagement Rate (AI/Camera)",
    layer: "Output",
    type: "Formative",
    cadence: "weekly",
    source: "Samsung.com / Landing Page Analytics",
    target: 2.5,
    higherIsBetter: true,
    decisionRule: "If <2.3%, promote feature-specific CTAs and demo videos more prominently.",
    unit: "%",
    decimals: 2,
  },
  {
    id: "branded-search",
    name: "Branded Search Uplift",
    layer: "Output",
    type: "Formative",
    cadence: "weekly",
    source: "Google Trends / SEM Platform",
    target: 30,
    higherIsBetter: true,
    decisionRule: "If <25%, increase SEM brand bidding and activate influencer unboxing content.",
    unit: "%",
    decimals: 1,
  },
  {
    id: "innovation-lift",
    name: "Innovation Leader Association Lift",
    layer: "Outcome",
    type: "Summative",
    cadence: "pre/post wave",
    source: "Brand Tracker (Kantar)",
    target: 6,
    higherIsBetter: true,
    decisionRule: "If <4 pts, amplify AI feature storytelling in Wave 2 creative.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "camera-lift",
    name: "Best Camera Association Lift",
    layer: "Outcome",
    type: "Summative",
    cadence: "pre/post wave",
    source: "Brand Tracker (Kantar)",
    target: 5,
    higherIsBetter: true,
    decisionRule: "If <3 pts after Wave 1, increase camera demo content in Wave 2.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "consideration-apple",
    name: "Consideration vs Apple",
    layer: "Outcome",
    type: "Summative",
    cadence: "pre/post wave",
    source: "Brand Tracker (Kantar)",
    target: 4,
    higherIsBetter: true,
    decisionRule: "If <2 pts, activate competitive comparative messaging in digital and CRM.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "switching-intent",
    name: "Switching Intention (among Apple users)",
    layer: "Outcome",
    type: "Summative",
    cadence: "pre/post wave",
    source: "Brand Tracker (Kantar)",
    target: 3,
    higherIsBetter: true,
    decisionRule: "If <1.5 pts, deploy targeted Apple-switcher offer via CRM and retail.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "purchase-intent",
    name: "Purchase Intent (next 3 months)",
    layer: "Outcome",
    type: "Summative",
    cadence: "pre/post wave",
    source: "Brand Tracker (Kantar)",
    target: 5,
    higherIsBetter: true,
    decisionRule: "If <3 pts, increase bottom-funnel activations: promotions, retail endcaps.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "market-share",
    name: "Premium Market Share Change",
    layer: "Impact",
    type: "Summative",
    cadence: "pre/post wave",
    source: "GfK / IDC Premium Segment",
    target: 1.5,
    higherIsBetter: true,
    decisionRule: "If <0.8 pts at end of Wave 1, escalate to exec team for commercial review.",
    unit: "pts",
    decimals: 1,
  },
  {
    id: "romi",
    name: "ROMI",
    layer: "Impact",
    type: "Summative",
    cadence: "pre/post wave",
    source: "MMM / Finance",
    target: 1.9,
    higherIsBetter: true,
    decisionRule: "If <1.5, shift budget toward highest-ROMI channels identified in MMM model.",
    unit: "ratio",
    decimals: 2,
  },
];

export const observations: Observation[] = [
  // ─── INPUT KPIs ─────────────────────────────────────────────────────────────
  // Total Campaign Investment (one-time, global)
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "total-investment", value: 44200000 },
  // Budget Allocation W1 %
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "budget-allocation", value: 61 },

  // ─── OUTPUT KPIs – Wave 1 weekly Global ──────────────────────────────────
  // Reach 1+
  { date: "2024-01-22", wave: "Wave 1", region: "Global", kpiId: "reach-1plus", value: 55 },
  { date: "2024-01-29", wave: "Wave 1", region: "Global", kpiId: "reach-1plus", value: 63 },
  { date: "2024-02-05", wave: "Wave 1", region: "Global", kpiId: "reach-1plus", value: 68 },
  { date: "2024-02-12", wave: "Wave 1", region: "Global", kpiId: "reach-1plus", value: 71 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "reach-1plus", value: 73 },

  // Reach 3+
  { date: "2024-01-22", wave: "Wave 1", region: "Global", kpiId: "reach-3plus", value: 32 },
  { date: "2024-01-29", wave: "Wave 1", region: "Global", kpiId: "reach-3plus", value: 39 },
  { date: "2024-02-05", wave: "Wave 1", region: "Global", kpiId: "reach-3plus", value: 44 },
  { date: "2024-02-12", wave: "Wave 1", region: "Global", kpiId: "reach-3plus", value: 47 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "reach-3plus", value: 50 },

  // VTR
  { date: "2024-01-22", wave: "Wave 1", region: "Global", kpiId: "vtr", value: 29 },
  { date: "2024-01-29", wave: "Wave 1", region: "Global", kpiId: "vtr", value: 33 },
  { date: "2024-02-05", wave: "Wave 1", region: "Global", kpiId: "vtr", value: 36 },
  { date: "2024-02-12", wave: "Wave 1", region: "Global", kpiId: "vtr", value: 37 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "vtr", value: 38 },

  // Feature Engagement
  { date: "2024-01-22", wave: "Wave 1", region: "Global", kpiId: "feature-engagement", value: 1.8 },
  { date: "2024-01-29", wave: "Wave 1", region: "Global", kpiId: "feature-engagement", value: 2.1 },
  { date: "2024-02-05", wave: "Wave 1", region: "Global", kpiId: "feature-engagement", value: 2.3 },
  { date: "2024-02-12", wave: "Wave 1", region: "Global", kpiId: "feature-engagement", value: 2.4 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "feature-engagement", value: 2.6 },

  // Branded Search Uplift
  { date: "2024-01-22", wave: "Wave 1", region: "Global", kpiId: "branded-search", value: 18 },
  { date: "2024-01-29", wave: "Wave 1", region: "Global", kpiId: "branded-search", value: 23 },
  { date: "2024-02-05", wave: "Wave 1", region: "Global", kpiId: "branded-search", value: 27 },
  { date: "2024-02-12", wave: "Wave 1", region: "Global", kpiId: "branded-search", value: 31 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "branded-search", value: 34 },

  // ─── OUTPUT KPIs – Wave 2 weekly Global ──────────────────────────────────
  // Reach 1+
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "reach-1plus", value: 58 },
  { date: "2024-04-08", wave: "Wave 2", region: "Global", kpiId: "reach-1plus", value: 64 },
  { date: "2024-04-15", wave: "Wave 2", region: "Global", kpiId: "reach-1plus", value: 69 },
  { date: "2024-04-22", wave: "Wave 2", region: "Global", kpiId: "reach-1plus", value: 72 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "reach-1plus", value: 75 },

  // Reach 3+
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "reach-3plus", value: 35 },
  { date: "2024-04-08", wave: "Wave 2", region: "Global", kpiId: "reach-3plus", value: 41 },
  { date: "2024-04-15", wave: "Wave 2", region: "Global", kpiId: "reach-3plus", value: 45 },
  { date: "2024-04-22", wave: "Wave 2", region: "Global", kpiId: "reach-3plus", value: 49 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "reach-3plus", value: 52 },

  // VTR
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "vtr", value: 31 },
  { date: "2024-04-08", wave: "Wave 2", region: "Global", kpiId: "vtr", value: 35 },
  { date: "2024-04-15", wave: "Wave 2", region: "Global", kpiId: "vtr", value: 38 },
  { date: "2024-04-22", wave: "Wave 2", region: "Global", kpiId: "vtr", value: 39 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "vtr", value: 40 },

  // Feature Engagement
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "feature-engagement", value: 2.0 },
  { date: "2024-04-08", wave: "Wave 2", region: "Global", kpiId: "feature-engagement", value: 2.3 },
  { date: "2024-04-15", wave: "Wave 2", region: "Global", kpiId: "feature-engagement", value: 2.5 },
  { date: "2024-04-22", wave: "Wave 2", region: "Global", kpiId: "feature-engagement", value: 2.7 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "feature-engagement", value: 2.8 },

  // Branded Search Uplift
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "branded-search", value: 22 },
  { date: "2024-04-08", wave: "Wave 2", region: "Global", kpiId: "branded-search", value: 26 },
  { date: "2024-04-15", wave: "Wave 2", region: "Global", kpiId: "branded-search", value: 30 },
  { date: "2024-04-22", wave: "Wave 2", region: "Global", kpiId: "branded-search", value: 33 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "branded-search", value: 36 },

  // ─── OUTPUT KPIs by CHANNEL – Wave 1 (latest week) ───────────────────────
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "CTV",        kpiId: "reach-1plus", value: 28 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "YouTube",    kpiId: "reach-1plus", value: 22 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Social",     kpiId: "reach-1plus", value: 15 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Search",     kpiId: "reach-1plus", value: 8 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "CTV",        kpiId: "vtr", value: 42 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "YouTube",    kpiId: "vtr", value: 38 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Social",     kpiId: "vtr", value: 28 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Search",     kpiId: "branded-search", value: 34 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Influencers",kpiId: "branded-search", value: 18 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "Social",     kpiId: "feature-engagement", value: 2.9 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "YouTube",    kpiId: "feature-engagement", value: 2.4 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", channel: "CRM",        kpiId: "feature-engagement", value: 3.1 },

  // ─── OUTPUT KPIs by CHANNEL – Wave 2 (latest week) ───────────────────────
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "CTV",        kpiId: "reach-1plus", value: 30 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "YouTube",    kpiId: "reach-1plus", value: 24 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "Social",     kpiId: "reach-1plus", value: 17 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "Search",     kpiId: "reach-1plus", value: 10 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "CTV",        kpiId: "vtr", value: 44 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "YouTube",    kpiId: "vtr", value: 40 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "Social",     kpiId: "vtr", value: 30 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "Search",     kpiId: "branded-search", value: 36 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", channel: "Influencers",kpiId: "branded-search", value: 22 },

  // ─── OUTPUT by REGION – Wave 1 latest ────────────────────────────────────
  { date: "2024-02-19", wave: "Wave 1", region: "NA",   kpiId: "reach-1plus", value: 76 },
  { date: "2024-02-19", wave: "Wave 1", region: "EU",   kpiId: "reach-1plus", value: 70 },
  { date: "2024-02-19", wave: "Wave 1", region: "APAC", kpiId: "reach-1plus", value: 68 },
  { date: "2024-02-19", wave: "Wave 1", region: "NA",   kpiId: "vtr", value: 41 },
  { date: "2024-02-19", wave: "Wave 1", region: "EU",   kpiId: "vtr", value: 36 },
  { date: "2024-02-19", wave: "Wave 1", region: "APAC", kpiId: "vtr", value: 35 },
  { date: "2024-02-19", wave: "Wave 1", region: "NA",   kpiId: "branded-search", value: 38 },
  { date: "2024-02-19", wave: "Wave 1", region: "EU",   kpiId: "branded-search", value: 31 },
  { date: "2024-02-19", wave: "Wave 1", region: "APAC", kpiId: "branded-search", value: 28 },

  // ─── OUTCOME KPIs – Wave 1 pre/post ──────────────────────────────────────
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "innovation-lift", value: 0 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "innovation-lift", value: 5.2 },
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "camera-lift", value: 0 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "camera-lift", value: 4.1 },
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "consideration-apple", value: 0 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "consideration-apple", value: 3.2 },
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "switching-intent", value: 0 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "switching-intent", value: 2.0 },
  { date: "2024-01-15", wave: "Wave 1", region: "Global", kpiId: "purchase-intent", value: 0 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "purchase-intent", value: 3.8 },

  // ─── OUTCOME KPIs – Wave 2 pre/post ──────────────────────────────────────
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "innovation-lift", value: 5.2 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "innovation-lift", value: 7.1 },
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "camera-lift", value: 4.1 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "camera-lift", value: 5.8 },
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "consideration-apple", value: 3.2 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "consideration-apple", value: 4.9 },
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "switching-intent", value: 2.0 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "switching-intent", value: 3.4 },
  { date: "2024-04-01", wave: "Wave 2", region: "Global", kpiId: "purchase-intent", value: 3.8 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "purchase-intent", value: 5.2 },

  // ─── IMPACT KPIs – end of Wave 2 ─────────────────────────────────────────
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "market-share", value: 1.2 },
  { date: "2024-04-29", wave: "Wave 2", region: "Global", kpiId: "romi", value: 1.7 },

  // ─── IMPACT KPIs – end of Wave 1 (partial) ───────────────────────────────
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "market-share", value: 0.6 },
  { date: "2024-02-19", wave: "Wave 1", region: "Global", kpiId: "romi", value: 1.4 },
];
