'use client';

import React, { useState, useContext, useEffect } from 'react';
import { VoiceControlPanel } from '@/components/ui/voice-control-panel';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { tools } from '@/lib/tools';
import { TranscriptionContext } from '@/lib/transcription-context';

export function VoiceIntegration() {
  // State for voice selection
  const [voice, setVoice] = useState("ash");

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage
  } = useWebRTCAudioSession(voice, tools);

  // Получаем контекст трансляции
  const { setConversation: setGlobalConversation } = useContext(TranscriptionContext);

  // Обновляем глобальный контекст трансляции при изменении разговора
  useEffect(() => {
    if (conversation && conversation.length > 0) {
      setGlobalConversation(conversation);
    }
  }, [conversation, setGlobalConversation]);

  return (
    <div className="mb-6">
      <VoiceControlPanel
        voice={voice}
        setVoice={setVoice}
        isSessionActive={isSessionActive}
        handleStartStopClick={handleStartStopClick}
        msgs={msgs}
        conversation={conversation}
        status={status}
        sendTextMessage={sendTextMessage}
        showTextInput={true}
      />
    </div>
  );
}
