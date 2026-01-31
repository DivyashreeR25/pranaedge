import { createContext, useContext, useState, ReactNode } from 'react';

interface TrialErrorContextType {
  registerStopAnalysisCallback: (callback: () => void) => void;
  unregisterStopAnalysisCallback: () => void;
  stopAnalysis: () => void;
}

const TrialErrorContext = createContext<TrialErrorContextType | undefined>(undefined);

export const useTrialError = () => {
  const context = useContext(TrialErrorContext);
  if (context === undefined) {
    throw new Error('useTrialError must be used within a TrialErrorProvider');
  }
  return context;
};

interface TrialErrorProviderProps {
  children: ReactNode;
}

export const TrialErrorProvider = ({ children }: TrialErrorProviderProps) => {
  const [stopAnalysisCallback, setStopAnalysisCallback] = useState<(() => void) | null>(null);

  const registerStopAnalysisCallback = (callback: () => void) => {
    setStopAnalysisCallback(() => callback);
  };

  const unregisterStopAnalysisCallback = () => {
    setStopAnalysisCallback(null);
  };

  const stopAnalysis = () => {
    if (stopAnalysisCallback) {
      stopAnalysisCallback();
    }
  };

  return (
    <TrialErrorContext.Provider value={{
      registerStopAnalysisCallback,
      unregisterStopAnalysisCallback,
      stopAnalysis,
    }}>
      {children}
    </TrialErrorContext.Provider>
  );
};
