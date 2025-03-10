'use client';

import { createContext, useState, type ReactNode } from 'react';
import type { Conversation } from '@/lib/conversations';

interface TranscriptionContextType {
  conversation: Conversation[];
  setConversation: (conversation: Conversation[]) => void;
  addMessage: (message: Conversation) => void;
  clearConversation: () => void;
}

export const TranscriptionContext = createContext<TranscriptionContextType>({
  conversation: [],
  setConversation: () => {},
  addMessage: () => {},
  clearConversation: () => {},
});

interface TranscriptionProviderProps {
  children: ReactNode;
}

export function TranscriptionProvider({ children }: TranscriptionProviderProps) {
  const [conversation, setConversation] = useState<Conversation[]>([]);

  const addMessage = (message: Conversation) => {
    setConversation((prev) => [...prev, message]);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <TranscriptionContext.Provider
      value={{
        conversation,
        setConversation,
        addMessage,
        clearConversation,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
}
