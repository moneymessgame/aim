import { motion } from "framer-motion";
import { useState } from "react";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { BroadcastButton } from "@/components/broadcast-button";
import { VoiceSelector } from "@/components/voice-select";
import { TokenUsageDisplay } from "@/components/token-usage";
import { MessageControls } from "@/components/message-controls";
import { StatusDisplay } from "@/components/status";
import { availableRoutes } from "@/lib/navigation-utils";
import { AlertCircle } from "lucide-react";

export function VoiceControlAside() {
  const [voice, setVoice] = useState("ash");
  const { 
    isSessionActive, 
    handleStartStopClick, 
    status, 
    conversation, 
    msgs 
  } = useWebRTCAudioSession(voice, []);
  
  // Функция для отображения списка доступных команд навигации
  const renderNavigationCommands = () => {
    return (
      <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
          <AlertCircle size={16} />
          <span>Доступные команды навигации:</span>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          {Object.entries(availableRoutes).map(([key, path]) => (
            <div key={`route-${key}`} className="flex justify-between">
              <span>"{key}"</span>
              <span className="text-slate-400">{path}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500 italic">
          Пример: "перейди на страницу тест"
        </div>
      </div>
    );
  };

  return (
    <aside className="z-50">
      <motion.div 
        className="text-card-foreground w-[370px] space-y-4"
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
            <MessageControls 
              conversation={conversation.map(msg => {
                // Выделяем команды навигации особым стилем
                if (msg.isCommand) {
                  return {
                    ...msg,
                    className: "bg-blue-50 border-l-2 border-blue-400 pl-2"
                  };
                }
                return msg;
              })} 
              msgs={msgs} 
            />
            {/* Закомментированный текстовый ввод 
            <TextInput 
              onSubmit={sendTextMessage}
              disabled={!isSessionActive}
            />
            */}
          </motion.div>
        )}
        
        {status && <StatusDisplay status={status} />}
        
        {/* Отображение доступных команд навигации */}
        {isSessionActive && renderNavigationCommands()}
      </motion.div>
    </aside>
  );
}
