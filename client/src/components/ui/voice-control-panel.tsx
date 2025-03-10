'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VoiceSelector } from '@/components/voice-select';
import { BroadcastButton } from '@/components/broadcast-button';
import { TokenUsageDisplay } from '@/components/token-usage';
import { MessageControls } from '@/components/message-controls';
import { StatusDisplay } from '@/components/status';
import { TextInput } from '@/components/text-input';
import type { Conversation } from '@/lib/conversations';

interface VoiceControlPanelProps {
  voice: string;
  setVoice: (voice: string) => void;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: { id: string; content: string; role: string }[];
  conversation: Conversation[];
  status: string;
  sendTextMessage?: (text: string) => void;
  showTextInput?: boolean;
}

export function VoiceControlPanel({
  voice,
  setVoice,
  isSessionActive,
  handleStartStopClick,
  msgs,
  conversation,
  status,
  sendTextMessage,
  showTextInput = false
}: VoiceControlPanelProps) {
  return (
    <motion.div 
      className="bg-card max-w-[400px] text-card-foreground rounded-3xl border shadow-sm p-6 space-y-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <VoiceSelector value={voice} onValueChange={setVoice} />
      
      <div className="flex flex-col items-center gap-4">
        <BroadcastButton 
          isSessionActive={isSessionActive} 
          onClick={handleStartStopClick}
        />
      </div>
      
      {msgs.length > 4 && <TokenUsageDisplay messages={msgs} />}
      
      {status && (
        <motion.div 
          className="w-full flex flex-col gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageControls conversation={conversation} msgs={msgs} />
          {showTextInput && sendTextMessage && (
            <TextInput 
              onSubmit={sendTextMessage}
              disabled={!isSessionActive}
            />
          )}
        </motion.div>
      )}
      
      {status && <StatusDisplay status={status} />}
    </motion.div>
  );
}
