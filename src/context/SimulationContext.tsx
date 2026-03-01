import React, { createContext, useContext, useState } from "react";
import { calculateCascade, type CascadeLogEntry } from "../lib/cascadeModel";

export interface SimulationOverride {
  actual?: number;
  target?: number;
}

interface SimulationState {
  enabled: boolean;
  overrides: Record<string, SimulationOverride>;
  cascadeEnabled: boolean;
  cascadeLog: CascadeLogEntry[];
  cascadedKpiIds: Set<string>;
  setEnabled: (enabled: boolean) => void;
  setCascadeEnabled: (enabled: boolean) => void;
  setOverride: (kpiId: string, override: Partial<SimulationOverride>) => void;
  triggerCascade: (
    changedKpiId: string,
    newValue: number,
    originalValue: number,
    baseActuals: Record<string, number | null>,
  ) => void;
  resetOverrides: () => void;
}

const SimulationContext = createContext<SimulationState>({
  enabled: false,
  overrides: {},
  cascadeEnabled: true,
  cascadeLog: [],
  cascadedKpiIds: new Set(),
  setEnabled: () => {},
  setCascadeEnabled: () => {},
  setOverride: () => {},
  triggerCascade: () => {},
  resetOverrides: () => {},
});

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(false);
  const [cascadeEnabled, setCascadeEnabled] = useState(true);
  const [overrides, setOverrides] = useState<Record<string, SimulationOverride>>({});
  const [cascadeLog, setCascadeLog] = useState<CascadeLogEntry[]>([]);
  const [cascadedKpiIds, setCascadedKpiIds] = useState<Set<string>>(new Set());

  const setOverride = (kpiId: string, override: Partial<SimulationOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], ...override },
    }));
  };

  const triggerCascade = (
    changedKpiId: string,
    newValue: number,
    originalValue: number,
    baseActuals: Record<string, number | null>,
  ) => {
    setOverrides((prev) => {
      const { newOverrides, log } = calculateCascade(
        changedKpiId,
        newValue,
        originalValue,
        prev,
        baseActuals,
      );
      // Collect all downstream KPI IDs that were affected (exclude the one the user directly changed)
      const downstream = new Set(log.map((e) => e.targetKpiId));
      setCascadedKpiIds(downstream);
      setCascadeLog(log);
      return newOverrides;
    });
  };

  const resetOverrides = () => {
    setOverrides({});
    setCascadeLog([]);
    setCascadedKpiIds(new Set());
  };

  return (
    <SimulationContext.Provider
      value={{
        enabled,
        overrides,
        cascadeEnabled,
        cascadeLog,
        cascadedKpiIds,
        setEnabled,
        setCascadeEnabled,
        setOverride,
        triggerCascade,
        resetOverrides,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
