import { createContext, useContext, type ReactNode } from 'react';

import { useMidnight, type UseMidnightReturn } from '../hooks/useMidnight';

const MidnightContext = createContext<UseMidnightReturn | null>(null);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const midnight = useMidnight();
  return <MidnightContext.Provider value={midnight}>{children}</MidnightContext.Provider>;
}

export function useMidnightContext(): UseMidnightReturn {
  const ctx = useContext(MidnightContext);
  if (!ctx) {
    throw new Error('useMidnightContext must be used within MidnightProvider');
  }
  return ctx;
}