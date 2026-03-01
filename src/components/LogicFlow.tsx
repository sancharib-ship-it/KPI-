import { useState, useRef, useEffect } from "react";
import { kpis } from "../data/mockData";
import { cascadeRelationships } from "../lib/cascadeModel";

interface LogicFlowProps {
  onGoToDashboard: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────
function getStatus(actual: number, target: number): { label: string; color: string; emoji: string; pct: number } {
  if (target === 0) return { label: "N/A", color: "text-gray-500", emoji: "—", pct: 0 };
  const pct = (actual / target) * 100;
  if (actual >= target) return { label: "On Track", color: "text-green-700", emoji: "✅", pct };
  if (pct >= 95) return { label: "Watch", color: "text-amber-700", emoji: "⚠️", pct };
  return { label: "Off Track", color: "text-red-700", emoji: "❌", pct };
}

// ─── Layer colours ───────────────────────────────────────────────────────────
const LAYER_STYLE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Input:   { bg: "bg-gray-100",   border: "border-gray-300",   text: "text-gray-700",   dot: "bg-gray-400"   },
  Output:  { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  Outcome: { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  Impact:  { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500"  },
};

const LAYER_META: Record<string, { icon: string; label: string; tagline: string; description: string; typeInfo: string }> = {
  Input:   { icon: "💰", label: "INPUT",   tagline: '"What we spend"',    description: "Input KPIs measure what we invest — budget, media spend, and wave allocation. These are controllable variables set by the marketing team.", typeInfo: "Formative — set before the campaign, adjustable." },
  Output:  { icon: "📢", label: "OUTPUT",  tagline: '"What we deliver"',  description: "Output KPIs measure what the campaign delivers in market — reach, video views, engagement. Tracked weekly and optimizable in-flight.", typeInfo: "Formative — tracked weekly, can be optimized in-flight." },
  Outcome: { icon: "🧠", label: "OUTCOME", tagline: '"What changes"',     description: "Outcome KPIs measure what changes in consumers' minds — brand lift, consideration, and intent. Measured via brand tracker surveys pre/post wave.", typeInfo: "Summative — measured pre/post wave via brand tracker (Kantar)." },
  Impact:  { icon: "📈", label: "IMPACT",  tagline: '"What it\'s worth"', description: "Impact KPIs measure what the campaign is ultimately worth — market share gained and return on marketing investment.", typeInfo: "Summative — evaluated at end of each wave via GfK/IDC and MMM." },
};

// ─── Accordion wrapper ───────────────────────────────────────────────────────
function AccordionSection({
  id,
  title,
  children,
  openId,
  onToggle,
}: {
  id: number;
  title: string;
  children: React.ReactNode;
  openId: number | null;
  onToggle: (id: number) => void;
}) {
  const isOpen = openId === id;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? `${bodyRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => onToggle(id)}
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: height, overflow: "hidden", transition: "max-height 0.35s ease" }}
      >
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — Measurement Architecture
// ═══════════════════════════════════════════════════════════════════════════
function ArchitectureSection() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const layers = ["Input", "Output", "Outcome", "Impact"] as const;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        The Samsung Galaxy S KPI framework is structured in four layers — each layer feeds the next.
        Click any layer to explore its KPIs.
      </p>

      {/* Horizontal flow */}
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {layers.map((layer, i) => {
          const meta = LAYER_META[layer];
          const style = LAYER_STYLE[layer];
          const layerKpis = kpis.filter((k) => k.layer === layer);
          const isActive = activeLayer === layer;
          return (
            <div key={layer} className="flex items-start">
              {/* Card */}
              <button
                onClick={() => setActiveLayer(isActive ? null : layer)}
                className={`flex flex-col items-center rounded-xl border-2 p-4 min-w-[140px] cursor-pointer transition-all duration-200 ${style.bg} ${style.border} ${isActive ? "ring-2 ring-offset-2 ring-blue-400 shadow-md" : "hover:shadow-md"}`}
              >
                <span className="text-2xl mb-1">{meta.icon}</span>
                <span className={`text-xs font-bold tracking-wide ${style.text}`}>{meta.label}</span>
                <span className="text-xs text-gray-500 mt-1 font-medium">
                  {meta.tagline}
                </span>
                <span className="text-xs text-gray-400 mt-2">{layerKpis.length} KPIs</span>
              </button>
              {/* Arrow */}
              {i < layers.length - 1 && (
                <div className="flex items-center self-center px-1">
                  <svg width="36" height="16" viewBox="0 0 36 16" className="text-gray-400">
                    <path d="M0 8 H28 M22 2 L34 8 L22 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {activeLayer && (() => {
        const meta = LAYER_META[activeLayer];
        const style = LAYER_STYLE[activeLayer];
        const layerKpis = kpis.filter((k) => k.layer === activeLayer);
        return (
          <div className={`mt-4 rounded-xl border-2 p-5 ${style.bg} ${style.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{meta.icon}</span>
              <span className={`font-bold text-sm ${style.text}`}>{meta.label}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{meta.description}</p>
            <p className="text-xs text-gray-500 italic mb-3">{meta.typeInfo}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {layerKpis.map((k) => (
                <div key={k.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <div className="text-xs font-semibold text-gray-800">{k.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Target: {k.unit === "currency" ? `$${(k.target / 1e6).toFixed(1)}M` : `${k.target}${k.unit === "%" ? "%" : k.unit === "pts" ? " pts" : k.unit === "ratio" ? "x" : ""}`}
                    {" · "}{k.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — KPI Relationship Map
// ═══════════════════════════════════════════════════════════════════════════

const LAYER_NODE_FILL: Record<string, string> = {
  Input: "#e5e7eb", Output: "#dbeafe", Outcome: "#ede9fe", Impact: "#dcfce7",
};
const LAYER_NODE_STROKE: Record<string, string> = {
  Input: "#d1d5db", Output: "#bfdbfe", Outcome: "#ddd6fe", Impact: "#bbf7d0",
};

function nodeColors(
  layer: string,
  isActive: boolean,
  isDimmed: boolean,
): { fill: string; stroke: string } {
  if (isDimmed) return { fill: "#f9fafb", stroke: "#e5e7eb" };
  if (isActive) return { fill: LAYER_NODE_FILL[layer] ?? "#f3f4f6", stroke: "#6366f1" };
  return { fill: "white", stroke: LAYER_NODE_STROKE[layer] ?? "#e5e7eb" };
}
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "total-investment":   { x: 60,  y: 80  },
  "budget-allocation":  { x: 60,  y: 180 },
  "reach-1plus":        { x: 230, y: 40  },
  "reach-3plus":        { x: 230, y: 120 },
  "vtr":                { x: 230, y: 200 },
  "feature-engagement": { x: 230, y: 280 },
  "branded-search":     { x: 230, y: 360 },
  "innovation-lift":    { x: 420, y: 60  },
  "camera-lift":        { x: 420, y: 140 },
  "consideration-apple":{ x: 420, y: 220 },
  "switching-intent":   { x: 420, y: 300 },
  "purchase-intent":    { x: 420, y: 380 },
  "market-share":       { x: 600, y: 160 },
  "romi":               { x: 600, y: 280 },
};

const KPI_LAYERS: Record<string, string> = {};
kpis.forEach((k) => { KPI_LAYERS[k.id] = k.layer; });

function KpiRelationshipMap() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const SVG_W = 720;
  const SVG_H = 440;
  const NODE_W = 110;
  const NODE_H = 34;

  const connectedEdges = activeNode
    ? cascadeRelationships.reduce<number[]>((acc, r, i) => {
        if (r.sourceKpiId === activeNode || r.targetKpiId === activeNode) acc.push(i);
        return acc;
      }, [])
    : [];

  const connectedNodes = activeNode
    ? new Set(
        connectedEdges.flatMap((i) => [cascadeRelationships[i].sourceKpiId, cascadeRelationships[i].targetKpiId])
      )
    : new Set<string>();

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Click any KPI node to highlight its connections. Click any arrow to see the elasticity relationship.
      </p>
      <div className="overflow-x-auto">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="block"
          onClick={(e) => {
            // deselect if clicking empty space
            const target = e.target as SVGElement;
            if (target.tagName === "svg") { setActiveNode(null); setActiveEdge(null); setTooltip(null); }
          }}
        >
          {/* Edges */}
          {cascadeRelationships.map((rel, i) => {
            const src = NODE_POSITIONS[rel.sourceKpiId];
            const tgt = NODE_POSITIONS[rel.targetKpiId];
            if (!src || !tgt) return null;
            const x1 = src.x + NODE_W;
            const y1 = src.y + NODE_H / 2;
            const x2 = tgt.x;
            const y2 = tgt.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            const isHighlighted = connectedEdges.includes(i) || activeEdge === i;
            const isDimmed = (activeNode !== null || activeEdge !== null) && !isHighlighted;
            return (
              <g key={i} className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEdge(activeEdge === i ? null : i);
                  setActiveNode(null);
                  const midX = mx - 80;
                  const midY = Math.min(y1, y2) - 10;
                  setTooltip({
                    x: midX,
                    y: midY,
                    text: `${rel.description} (elasticity: ${rel.elasticity > 0 ? "+" : ""}${rel.elasticity})`,
                  });
                }}
              >
                <path
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={isHighlighted ? "#6366f1" : isDimmed ? "#e5e7eb" : "#cbd5e1"}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  markerEnd={isHighlighted ? "url(#arrowHighlight)" : "url(#arrow)"}
                />
                {/* Invisible wider hit area */}
                <path
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                />
                {/* Elasticity label */}
                {isHighlighted && (
                  <text x={mx} y={(y1 + y2) / 2 - 4} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">
                    {rel.elasticity > 0 ? "+" : ""}{rel.elasticity}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow markers */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
            </marker>
            <marker id="arrowHighlight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
            </marker>
          </defs>

          {/* Nodes */}
          {kpis.map((k) => {
            const pos = NODE_POSITIONS[k.id];
            if (!pos) return null;
            const style = LAYER_STYLE[k.layer];
            const isActive = activeNode === k.id;
            const isDimmed = activeNode !== null && !connectedNodes.has(k.id) && activeNode !== k.id;
            return (
              <g
                key={k.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNode(activeNode === k.id ? null : k.id);
                  setActiveEdge(null);
                  setTooltip(null);
                }}
              >
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={6}
                  className={`transition-all ${style.bg} ${style.border}`}
                  fill={nodeColors(k.layer, isActive, isDimmed).fill}
                  stroke={nodeColors(k.layer, isActive, isDimmed).stroke}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <text
                  x={pos.x + NODE_W / 2}
                  y={pos.y + 13}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isDimmed ? "#d1d5db" : isActive ? "#4f46e5" : "#374151"}
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {k.name.length > 18 ? k.name.slice(0, 18) + "…" : k.name}
                </text>
                <text
                  x={pos.x + NODE_W / 2}
                  y={pos.y + 25}
                  textAnchor="middle"
                  fontSize="8"
                  fill={isDimmed ? "#e5e7eb" : "#9ca3af"}
                >
                  {k.layer}
                </text>
              </g>
            );
          })}

          {/* Edge tooltip */}
          {tooltip && (
            <foreignObject x={Math.max(0, tooltip.x)} y={Math.max(0, tooltip.y - 44)} width="180" height="52">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-tight pointer-events-none">
                {tooltip.text}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Layer legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {(["Input", "Output", "Outcome", "Impact"] as const).map((l) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm inline-block ${LAYER_STYLE[l].dot}`} />
            <span className="text-xs text-gray-600">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-6 h-px bg-indigo-400 inline-block" />
          <span className="text-xs text-gray-600">Cascade relationship</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — Traffic Light Status
// ═══════════════════════════════════════════════════════════════════════════
const STATUS_EXAMPLES = [
  { name: "Reach 1+", actual: 73, target: 72 },
  { name: "Innovation Lift", actual: 5.2, target: 6.0 },
  { name: "Market Share", actual: 1.2, target: 1.5 },
];

function TrafficLightSection() {
  const [actual, setActual] = useState("");
  const [target, setTarget] = useState("");

  const calcStatus = actual !== "" && target !== "" && Number(target) !== 0
    ? getStatus(Number(actual), Number(target))
    : null;

  return (
    <div className="space-y-5">
      {/* Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { emoji: "✅", label: "On Track", rule: "Actual ≥ Target", bg: "bg-green-50 border-green-200" },
          { emoji: "⚠️", label: "Watch", rule: "Actual ≥ 95% of Target but < Target", bg: "bg-amber-50 border-amber-200" },
          { emoji: "❌", label: "Off Track", rule: "Actual < 95% of Target", bg: "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg border p-3 ${s.bg}`}>
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="text-sm font-semibold text-gray-800">{s.label}</div>
            <div className="text-xs text-gray-500 mt-1">{s.rule}</div>
          </div>
        ))}
      </div>

      {/* Live calculator */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">🧮 Live Status Calculator</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Actual</label>
            <input
              type="number"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="e.g. 73"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Target</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 72"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {calcStatus && (
            <div className="flex items-center gap-2 pb-0.5">
              <span className="text-xl">{calcStatus.emoji}</span>
              <div>
                <div className={`text-sm font-bold ${calcStatus.color}`}>{calcStatus.label}</div>
                <div className="text-xs text-gray-500">{calcStatus.pct.toFixed(1)}% of target</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Worked examples */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Worked Examples</p>
        <div className="space-y-2">
          {STATUS_EXAMPLES.map((ex) => {
            const s = getStatus(ex.actual, ex.target);
            return (
              <div key={ex.name} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
                <span className="text-base">{s.emoji}</span>
                <span className="text-gray-700 flex-1">
                  <strong>{ex.name}</strong> actual {ex.actual} vs target {ex.target}
                </span>
                <span className={`font-semibold text-xs ${s.color}`}>{s.label} ({s.pct.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — Reading the Dashboard
// ═══════════════════════════════════════════════════════════════════════════
const DASHBOARD_STEPS = [
  {
    num: 1,
    icon: "📊",
    title: "Start with the Scorecard",
    desc: "Check the 4 headline KPIs at the top. Are Market Share, Consideration, Switching, and ROMI healthy? Green = good, red = needs action.",
  },
  {
    num: 2,
    icon: "🔗",
    title: "Scan the KPI Flow",
    desc: "Follow the chain from Input → ROMI. Color-coded nodes show where the bottleneck is. Click any node to drill down.",
  },
  {
    num: 3,
    icon: "📋",
    title: "Dive into the Table",
    desc: "Sort by worst gap to find the most underperforming KPIs. Expand decision rules to see recommended actions.",
  },
  {
    num: 4,
    icon: "🔍",
    title: "Read the Detail Panel",
    desc: "Click any KPI to see trend charts, channel breakdowns, and auto-generated interpretation with management implications.",
  },
  {
    num: 5,
    icon: "🔬",
    title: "Run a Simulation",
    desc: "Toggle Simulation Mode, edit a value, and watch the cascade. See how changing budget ripples through to ROMI.",
  },
];

function DashboardGuideSection({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="space-y-3">
      {DASHBOARD_STEPS.map((step) => (
        <div key={step.num} className="flex gap-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {step.num}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{step.icon}</span>
              <span className="text-sm font-semibold text-gray-800">{step.title}</span>
            </div>
            <p className="text-xs text-gray-600">{step.desc}</p>
          </div>
          <button
            onClick={onGoToDashboard}
            className="flex-shrink-0 self-center text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — Simulation & Cascade Guide
// ═══════════════════════════════════════════════════════════════════════════
const CASCADE_STEPS = [
  { label: "💰 Budget",       from: "$44.2M",  to: "$50M",   note: "+13% — Manual edit",            color: "bg-gray-100 border-gray-300"   },
  { label: "📢 Reach 1+",     from: "73%",      to: "78.7%",  note: "🔗 auto (+7.8%)",               color: "bg-blue-50 border-blue-200"    },
  { label: "🧠 Consideration", from: "+3.2 pts", to: "+3.7 pts", note: "🔗 auto via Reach 1+",       color: "bg-purple-50 border-purple-200" },
  { label: "🏆 Market Share",  from: "+1.2 pts", to: "+1.4 pts", note: "🔗 auto via Consideration",  color: "bg-green-50 border-green-200"   },
  { label: "📈 ROMI",         from: "1.7x",     to: "1.5x",  note: "🔗 auto — higher spend, diminishing returns", color: "bg-green-50 border-green-200" },
];

function SimulationGuideSection() {
  const [revealed, setRevealed] = useState(0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Approach A — Manual Edits</p>
          <p className="text-sm text-gray-700">Edit any KPI's actual or target value. Gap, status, charts, and interpretation recalculate instantly. No downstream propagation.</p>
        </div>
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Approach B — Linked Cascade 🔗</p>
          <p className="text-sm text-gray-700">When enabled, changing an upstream KPI automatically adjusts downstream KPIs through 27 elasticity relationships in the cascade model.</p>
        </div>
      </div>

      {/* Animated cascade */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cascade Example: Budget +13%</p>
        <div className="space-y-2">
          {CASCADE_STEPS.slice(0, revealed + 1).map((step, i) => (
            <div key={i} className={`rounded-lg border px-4 py-3 flex items-center gap-4 ${step.color} transition-all duration-300`}>
              <span className="text-sm font-semibold text-gray-800 w-40 flex-shrink-0">{step.label}</span>
              <span className="text-xs text-gray-500 line-through">{step.from}</span>
              <span className="text-lg">→</span>
              <span className="text-sm font-bold text-gray-800">{step.to}</span>
              <span className="text-xs text-gray-500 ml-auto">{step.note}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          {revealed < CASCADE_STEPS.length - 1 && (
            <button
              onClick={() => setRevealed((r) => Math.min(r + 1, CASCADE_STEPS.length - 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Next Step →
            </button>
          )}
          {revealed > 0 && (
            <button
              onClick={() => setRevealed(0)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              ↩ Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — Glossary
// ═══════════════════════════════════════════════════════════════════════════
const GLOSSARY = [
  { term: "Formative Metric",  def: "Tracked during the campaign. Can be optimized in-flight (e.g., weekly reach)." },
  { term: "Summative Metric",  def: "Measured pre/post wave. Evaluates overall campaign effectiveness." },
  { term: "Wave 1 (Launch)",   def: "Initial campaign burst focused on awareness and reach." },
  { term: "Wave 2 (Reinforcement)", def: "Follow-up campaign wave to deepen engagement and conversion." },
  { term: "Gap Analysis",      def: "Comparison of actual performance vs target, expressed as absolute difference." },
  { term: "Decision Rule",     def: "Pre-defined action to take if a KPI falls below its threshold." },
  { term: "ROMI",              def: "Return on Marketing Investment — incremental revenue ÷ campaign spend." },
  { term: "Elasticity",        def: "The sensitivity of one KPI to changes in another (e.g., 0.6 means a 10% change causes a 6% effect)." },
  { term: "Cascade",           def: "The automatic propagation of changes from upstream to downstream KPIs." },
  { term: "Brand Tracker",     def: "Periodic consumer survey (e.g., Kantar) measuring brand perception shifts." },
];

function GlossarySection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {GLOSSARY.map((item) => (
        <div key={item.term} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-800 mb-1">{item.term}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{item.def}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function LogicFlow({ onGoToDashboard }: LogicFlowProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  const handleToggle = (id: number) => {
    setOpenSection((prev) => (prev === id ? null : id));
    setVisited((prev) => new Set(prev).add(id));
  };

  const totalSections = 6;
  const visitedCount = visited.size;

  const sections = [
    {
      id: 1,
      title: "📐 Section 1 — Measurement Architecture Explainer",
      content: <ArchitectureSection />,
    },
    {
      id: 2,
      title: "🔗 Section 2 — KPI Relationship Map",
      content: <KpiRelationshipMap />,
    },
    {
      id: 3,
      title: "🚦 Section 3 — How Status Works (Traffic Light System)",
      content: <TrafficLightSection />,
    },
    {
      id: 4,
      title: "📖 Section 4 — Reading the Dashboard — Step-by-Step Guide",
      content: <DashboardGuideSection onGoToDashboard={onGoToDashboard} />,
    },
    {
      id: 5,
      title: "🔬 Section 5 — Simulation & Cascade Guide",
      content: <SimulationGuideSection />,
    },
    {
      id: 6,
      title: "📝 Section 6 — Glossary of Key Terms",
      content: <GlossarySection />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">📐 How It Works</h2>
        <p className="text-sm text-gray-500">
          An interactive guide to reading, understanding, and using the Samsung Galaxy S KPI Dashboard.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-6 flex items-center gap-4">
        <div className="flex gap-2">
          {Array.from({ length: totalSections }, (_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${visited.has(i + 1) ? "bg-blue-500" : "bg-gray-200"}`}
              title={`Section ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          You've explored <strong className="text-blue-600">{visitedCount}</strong> of {totalSections} sections
        </span>
        {visitedCount === totalSections && (
          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            ✅ Complete!
          </span>
        )}
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {sections.map((s) => (
          <AccordionSection
            key={s.id}
            id={s.id}
            title={s.title}
            openId={openSection}
            onToggle={handleToggle}
          >
            {s.content}
          </AccordionSection>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={onGoToDashboard}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          Go to Dashboard →
        </button>
        <p className="text-xs text-gray-400 mt-2">Ready to explore the data? Switch to the Dashboard tab.</p>
      </div>
    </div>
  );
}
