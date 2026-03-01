# Samsung Galaxy S — Marketing KPI Dashboard

> Consulting-style KPI measurement system for a Samsung Galaxy S global flagship launch campaign

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Overview

The **Samsung Galaxy S Marketing KPI Dashboard** is a professional, interactive web application that operationalises a consulting-style KPI measurement system for a Samsung Galaxy S global flagship launch campaign. The campaign runs across **two waves** — **Wave 1 (Launch)** and **Wave 2 (Reinforcement)** — spanning multiple regions (Global, NA, EU, APAC) and channels. The dashboard provides campaign stakeholders with a single source of truth for tracking 14 KPIs across a four-layer measurement architecture (Input → Output → Outcome → Impact), enabling both real-time performance monitoring and what-if simulation of downstream effects.

---

## Key Features

- **Executive Scorecard** (`src/components/Scorecard.tsx`) — 4 headline KPI tiles: Market Share, Consideration vs Apple, Switching Intent, and ROMI for an at-a-glance campaign health summary.
- **KPI Architecture Flow** (`src/components/KpiFlow.tsx`) — Visual chain from Input → Output → Outcome → Impact, with each node color-coded by on-track / watch / off-track status.
- **Logic Flow Diagram** (`src/components/LogicFlow.tsx`) — Detailed interactive logic flow visualization showing relationships between KPIs.
- **KPI Control Table** (`src/components/KpiTable.tsx`) — All 14 KPIs displayed with actual vs. target values, gap analysis, and sortable/filterable columns.
- **KPI Drill-Down Panel** (`src/components/KpiDetail.tsx`) — Per-KPI detail view with trend charts (line chart for Formative KPIs, bar chart for Summative), plus channel and regional breakdowns.
- **Wave Comparison** (`src/components/WaveComparison.tsx`) — Side-by-side W1 vs. W2 bar charts for all outcome KPIs.
- **KPI Dictionary** (`src/components/KpiDictionary.tsx`) — Reference dictionary with definitions for all 14 KPIs.
- **Cascade Log** (`src/components/CascadeLog.tsx`) — Shows the propagation chain when simulating KPI changes, so users can trace which downstream KPIs are affected.
- **Simulation Mode** (`src/context/SimulationContext.tsx`) — What-if analysis tool: adjust any KPI value and instantly see cascading effects on all dependent downstream KPIs via the cascade model (`src/lib/cascadeModel.ts`).
- **Filters Bar** (`src/components/FiltersBar.tsx`) — Filter by Wave (All / W1 / W2), Region (Global / NA / EU / APAC), Channel (for Output KPIs), and free-text Search.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | ~5.9 | Type-safe development |
| **Vite** | 7 | Build tool & dev server |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Recharts** | 3 | Chart & data visualization |
| **ESLint** | 9 | Code linting |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)

### Installation

```bash
git clone https://github.com/sancharib-ship-it/KPI-.git
cd KPI-
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
KPI-/
├── public/
├── src/
│   ├── components/          # React UI components
│   │   ├── CascadeLog.tsx
│   │   ├── FiltersBar.tsx
│   │   ├── KpiDetail.tsx
│   │   ├── KpiDictionary.tsx
│   │   ├── KpiFlow.tsx
│   │   ├── KpiTable.tsx
│   │   ├── LogicFlow.tsx
│   │   ├── Scorecard.tsx
│   │   └── WaveComparison.tsx
│   ├── context/             # React context providers
│   │   └── SimulationContext.tsx
│   ├── data/                # Mock campaign data
│   │   └── mockData.ts
│   ├── lib/                 # Business logic
│   │   ├── cascadeModel.ts
│   │   └── kpiLogic.ts
│   ├── App.tsx              # Root application component
│   └── main.tsx             # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

---

## Architecture

The dashboard operationalizes a **KPI Measurement Architecture** flowing through four layers:

```
Input → Output → Outcome → Impact
```

- **Input**: Campaign investment and budget allocation — the controllable levers.
- **Output** (weekly, Formative): Reach, VTR, Feature Engagement, Branded Search — immediate, channel-level signals.
- **Outcome** (pre/post wave, Summative): Brand Lift, Consideration, Switching Intent, Purchase Intent — audience attitude shifts.
- **Impact** (post-campaign, Summative): Premium Market Share, ROMI — business results.

Each layer feeds the next, creating a causal chain from spend to business impact.

### Formative vs Summative

- **Formative** KPIs (Output layer) are tracked **weekly** to allow mid-campaign course correction.
- **Summative** KPIs (Outcome & Impact layers) measure **end-state** outcomes via pre/post brand tracker surveys conducted before and after each wave.

### Cascade / Simulation Model

The dashboard includes a **Simulation Mode** backed by a cascade model (`src/lib/cascadeModel.ts`). Users can adjust the value of any KPI and the model propagates the change downstream according to defined dependency relationships between KPIs. For example, improving Reach (Output) influences Brand Lift (Outcome), which in turn affects Market Share (Impact). The **Cascade Log** component displays the full propagation chain so users can trace every downstream effect of a simulated change.

---

## Status Logic

| Status | Condition (`higherIsBetter = true`) |
|---|---|
| **On Track** | actual ≥ target |
| **Watch** | actual ≥ target × 0.95 |
| **Off Track** | actual < target × 0.95 |

For KPIs where lower is better (e.g. cost metrics), the logic is inverted accordingly.

---

## Data

- **Mock campaign data**: `src/data/mockData.ts` — contains all 14 KPIs with per-wave, per-region, and per-channel breakdowns.
- **KPI logic**: `src/lib/kpiLogic.ts` — gap analysis, status computation, and helper utilities.
- **Cascade model**: `src/lib/cascadeModel.ts` — defines KPI dependency relationships and computes downstream effects for Simulation Mode.

---

## License

This project is licensed under the [MIT License](LICENSE).
