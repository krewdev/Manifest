import React, { createContext, useContext, useState } from 'react';

type AppState = {
  groupId: string | null;
  setGroupId: (id: string | null) => void;
};

const Ctx = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groupId, setGroupId] = useState<string | null>(null);
  return <Ctx.Provider value={{ groupId, setGroupId }}>{children}</Ctx.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};


