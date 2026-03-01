export interface CascadeRelationship {
  sourceKpiId: string;
  targetKpiId: string;
  elasticity: number; // multiplier: 1% source change → elasticity% target change
  description: string; // e.g., "Reach drives brand awareness"
}

export interface CascadeLogEntry {
  sourceKpiId: string;
  targetKpiId: string;
  sourceName: string;
  targetName: string;
  pctChange: number; // percentage points, e.g. 6.0 means +6%
  description: string;
}

// All cascade relationships across the 4-layer architecture:
// Input → Output → Outcome → Impact
export const cascadeRelationships: CascadeRelationship[] = [
  // Input → Output (diminishing returns: elasticity 0.6)
  { sourceKpiId: "total-investment", targetKpiId: "reach-1plus",       elasticity: 0.6, description: "Budget drives broader reach coverage" },
  { sourceKpiId: "total-investment", targetKpiId: "reach-3plus",       elasticity: 0.6, description: "Budget drives deeper frequency" },
  { sourceKpiId: "total-investment", targetKpiId: "vtr",               elasticity: 0.6, description: "Budget improves video completion" },
  { sourceKpiId: "total-investment", targetKpiId: "feature-engagement",elasticity: 0.6, description: "Budget increases feature engagement" },
  { sourceKpiId: "total-investment", targetKpiId: "branded-search",    elasticity: 0.6, description: "Budget amplifies branded search" },
  // Budget allocation (W1%) → Output KPIs (smaller effect, wave allocation shift)
  { sourceKpiId: "budget-allocation", targetKpiId: "reach-1plus",       elasticity: 0.3, description: "Wave 1 allocation drives launch reach" },
  { sourceKpiId: "budget-allocation", targetKpiId: "reach-3plus",       elasticity: 0.3, description: "Wave 1 allocation drives launch frequency" },
  { sourceKpiId: "budget-allocation", targetKpiId: "vtr",               elasticity: 0.2, description: "Wave 1 allocation affects video completion" },
  // Output → Outcome
  { sourceKpiId: "reach-1plus",        targetKpiId: "innovation-lift",      elasticity: 0.4, description: "Reach drives innovation association" },
  { sourceKpiId: "reach-1plus",        targetKpiId: "camera-lift",          elasticity: 0.4, description: "Reach drives camera association" },
  { sourceKpiId: "reach-1plus",        targetKpiId: "consideration-apple",  elasticity: 0.4, description: "Reach drives consideration vs. Apple" },
  { sourceKpiId: "reach-3plus",        targetKpiId: "consideration-apple",  elasticity: 0.5, description: "Frequency drives deeper consideration" },
  { sourceKpiId: "reach-3plus",        targetKpiId: "switching-intent",     elasticity: 0.5, description: "Frequency drives switching intent" },
  { sourceKpiId: "vtr",                targetKpiId: "innovation-lift",      elasticity: 0.3, description: "Video completion drives innovation association" },
  { sourceKpiId: "vtr",                targetKpiId: "camera-lift",          elasticity: 0.3, description: "Video completion drives camera association" },
  { sourceKpiId: "feature-engagement", targetKpiId: "camera-lift",          elasticity: 0.6, description: "Feature engagement drives camera lift" },
  { sourceKpiId: "feature-engagement", targetKpiId: "purchase-intent",      elasticity: 0.6, description: "Feature engagement drives purchase intent" },
  { sourceKpiId: "branded-search",     targetKpiId: "consideration-apple",  elasticity: 0.5, description: "Search intent drives consideration" },
  { sourceKpiId: "branded-search",     targetKpiId: "purchase-intent",      elasticity: 0.5, description: "Branded search drives purchase intent" },
  // Outcome → Impact
  { sourceKpiId: "consideration-apple", targetKpiId: "market-share", elasticity: 0.3, description: "Consideration drives market share" },
  { sourceKpiId: "switching-intent",    targetKpiId: "market-share", elasticity: 0.4, description: "Switching intent drives market share" },
  { sourceKpiId: "purchase-intent",     targetKpiId: "market-share", elasticity: 0.5, description: "Purchase intent drives market share" },
  { sourceKpiId: "market-share",        targetKpiId: "romi",         elasticity: 0.7, description: "Market share directly drives ROMI" },
  // Investment (inverse) → ROMI: higher spend with same returns = lower ROMI
  { sourceKpiId: "total-investment",    targetKpiId: "romi",         elasticity: -0.5, description: "Higher investment reduces ROMI if revenue is unchanged" },
];

// Human-readable KPI names for log display
export const KPI_NAMES: Record<string, string> = {
  "total-investment":  "Total Investment",
  "budget-allocation": "Budget Allocation (W1%)",
  "reach-1plus":       "Reach 1+",
  "reach-3plus":       "Reach 3+",
  "vtr":               "VTR",
  "feature-engagement":"Feature Engagement",
  "branded-search":    "Branded Search",
  "innovation-lift":   "Innovation Lift",
  "camera-lift":       "Camera Lift",
  "consideration-apple":"Consideration vs. Apple",
  "switching-intent":  "Switching Intent",
  "purchase-intent":   "Purchase Intent",
  "market-share":      "Market Share",
  "romi":              "ROMI",
};

/**
 * Calculate the full cascade of KPI value changes, starting from a single
 * upstream KPI change and propagating downstream through the relationship graph.
 *
 * @param changedKpiId  - ID of the KPI the user manually changed
 * @param newValue      - New actual value set by the user
 * @param originalValue - Previous actual value before the user's edit
 * @param currentOverrides - Existing simulation overrides (actual/target) per KPI
 * @param baseActuals   - Base (unoverridden) actual values per KPI
 * @returns newOverrides (merged updates for all affected KPIs) and a log of changes
 */
export function calculateCascade(
  changedKpiId: string,
  newValue: number,
  originalValue: number,
  currentOverrides: Record<string, { actual?: number; target?: number }>,
  baseActuals: Record<string, number | null>,
): { newOverrides: Record<string, { actual?: number; target?: number }>; log: CascadeLogEntry[] } {
  const newOverrides = { ...currentOverrides };
  const log: CascadeLogEntry[] = [];

  if (originalValue === 0) return { newOverrides, log };

  const rootPctChange = (newValue - originalValue) / Math.abs(originalValue);

  // BFS: propagate % change through the graph
  const queue: Array<{ kpiId: string; pctChange: number }> = [
    { kpiId: changedKpiId, pctChange: rootPctChange },
  ];
  const visited = new Set<string>();
  visited.add(changedKpiId);

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { kpiId: sourceId, pctChange: sourcePctChange } = item;

    const rels = cascadeRelationships.filter((r) => r.sourceKpiId === sourceId);

    for (const rel of rels) {
      const targetId = rel.targetKpiId;
      const targetPctChange = sourcePctChange * rel.elasticity;

      // Determine current actual for target (prefer existing override, else base)
      const existingActual =
        newOverrides[targetId]?.actual !== undefined
          ? newOverrides[targetId].actual!
          : (baseActuals[targetId] ?? null);

      if (existingActual !== null && existingActual !== 0) {
        const newActual = parseFloat((existingActual * (1 + targetPctChange)).toFixed(4));
        newOverrides[targetId] = {
          ...newOverrides[targetId],
          actual: newActual,
        };

        log.push({
          sourceKpiId: sourceId,
          targetKpiId: targetId,
          sourceName: KPI_NAMES[sourceId] ?? sourceId,
          targetName: KPI_NAMES[targetId] ?? targetId,
          pctChange: parseFloat((targetPctChange * 100).toFixed(2)),
          description: rel.description,
        });

        // Continue BFS only if this target hasn't already been visited
        if (!visited.has(targetId)) {
          visited.add(targetId);
          queue.push({ kpiId: targetId, pctChange: targetPctChange });
        }
      }
    }
  }

  return { newOverrides, log };
}
