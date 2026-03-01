import React, { createContext, useContext, useState } from "react";

export interface SimulationOverride {
  actual?: number;
  target?: number;
}

interface SimulationState {
  enabled: boolean;
  overrides: Record<string, SimulationOverride>;
  setEnabled: (enabled: boolean) => void;
  setOverride: (kpiId: string, override: Partial<SimulationOverride>) => void;
  resetOverrides: () => void;
}

const SimulationContext = createContext<SimulationState>({
  enabled: false,
  overrides: {},
  setEnabled: () => {},
  setOverride: () => {},
  resetOverrides: () => {},
});

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, SimulationOverride>>({});

  const setOverride = (kpiId: string, override: Partial<SimulationOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], ...override },
    }));
  };

  const resetOverrides = () => {
    setOverrides({});
  };

  return (
    <SimulationContext.Provider value={{ enabled, overrides, setEnabled, setOverride, resetOverrides }}>
      {children}
    </SimulationContext.Provider>
  );
};
