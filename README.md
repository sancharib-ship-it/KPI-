# Samsung Galaxy S — Marketing KPI Dashboard

A professional interactive web dashboard for a Marketing Metrics & KPI System (consulting-style) for a Samsung Galaxy S global flagship launch campaign with **two waves**: Wave 1 (Launch) and Wave 2 (Reinforcement).

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Architecture

The dashboard operationalizes a **KPI Measurement Architecture** flowing through four layers:

```
Input → Output → Outcome → Impact
```

- **Input**: Campaign investment and budget allocation
- **Output** (weekly, Formative): Reach, VTR, Feature Engagement, Branded Search
- **Outcome** (pre/post wave, Summative): Brand lift, Consideration, Switching Intent, Purchase Intent
- **Impact** (post-campaign, Summative): Premium Market Share, ROMI

### Formative vs Summative

- **Formative** KPIs are tracked weekly to allow mid-campaign optimization
- **Summative** KPIs measure end-state outcomes via pre/post brand tracker surveys

## Features

- **Executive Scorecard**: 4 headline tiles (Market Share, Consideration vs Apple, Switching Intent, ROMI)
- **KPI Architecture Flow**: Visual chain from Input → Impact, color-coded by status
- **KPI Control Table**: All 14 KPIs with actual vs target, gap analysis, sortable/filterable
- **Drill-Down Panel**: Trend charts (line for Formative, bar for Summative), channel & regional breakdowns
- **Wave Comparison**: Side-by-side W1 vs W2 bars for outcome KPIs
- **Filters**: Wave (All/W1/W2), Region (Global/NA/EU/APAC), Channel (for Output KPIs), Search

## Data

Mock data is in `src/data/mockData.ts`. KPI logic (gap analysis, status computation) is in `src/lib/kpiLogic.ts`.

## Status Logic

| Status | Condition (higherIsBetter=true) |
|--------|--------------------------------|
| On Track | actual ≥ target |
| Watch | actual ≥ target × 0.95 |
| Off Track | actual < target × 0.95 |
