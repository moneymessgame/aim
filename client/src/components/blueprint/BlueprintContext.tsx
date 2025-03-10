'use client';

import React, { createContext, useState, ReactNode } from 'react';

// Тип для активного соединения
export interface ActiveConnection {
  nodeId: string;
  handleId: string;
  isInput: boolean;
}

// Интерфейс контекста блупринтов
interface BlueprintContextType {
  activeConnection: ActiveConnection | null;
  setActiveConnection: (connection: ActiveConnection | null) => void;
}

// Создаем контекст с начальным значением null
export const BlueprintContext = createContext<BlueprintContextType | null>(null);

// Провайдер контекста
interface BlueprintProviderProps {
  children: ReactNode;
}

export function BlueprintProvider({ children }: BlueprintProviderProps) {
  // Состояние для хранения активного соединения, доступного для всех блупринтов
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  return (
    <BlueprintContext.Provider value={{ activeConnection, setActiveConnection }}>
      {children}
    </BlueprintContext.Provider>
  );
}
