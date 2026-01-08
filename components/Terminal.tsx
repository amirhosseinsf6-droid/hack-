
import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, SecurityLevel } from '../types';
import { soundEngine } from '../utils/sound';
import { GoogleGenAI } from "@google/genai";

interface TerminalProps {
  level: SecurityLevel;
  setLevel: (l: SecurityLevel) => void;
  location?: { lat: number; lng: number };
}

const Terminal: React.FC<TerminalProps> = ({ level, setLevel, location }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const d = new Date();
    const timestamp = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => [...prev.slice(-60), {
      id: Math.random().toString(36),
      text,
      type,
      timestamp
    }]);
  };

  useEffect(() => {
    const generateLogs = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a dark-net infiltration terminal. 
      Generate 8-12 aggressive, cinematic cybersecurity breach logs.
      Themes: Sanguine corruption, deep-state bypass, biometric harvesting, memory purging.
      Current Security Level: ${level}.
      User Location: ${location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'UNKNOWN_VOID'}.
      DO NOT MENTION AI OR GEMINI.
      Return ONLY a JSON array of strings.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const cleanText = response.text?.replace(/```json|```/g, '').trim() || "[]";
        let newLogs = [];
        try {
            newLogs = JSON.parse(cleanText);
        } catch (e) {
            newLogs = ["PROTOCOL_ERROR: CORRUPT_PAYLOAD", "RETRYING_INFILTRATION..."];
        }
        
        for (const logText of newLogs) {
          await new Promise(r => setTimeout(r, Math.random() * 800 + 200));
          
          let type: LogEntry['type'] = 'info';
          const lower = logText.toLowerCase();
          if (lower.includes('purge') || lower.includes('bypass') || lower.includes('warning')) type = 'warning';
          if (lower.includes('critical') || lower.includes('breach') || lower.includes('corrupt')) type = 'error';
          if (lower.includes('success') || lower.includes('harvested')) type = 'success';
          
          addLog(logText, type);
          soundEngine.playBeep(200 + Math.random() * 200, 'sawtooth', 0.03);
        }
      } catch (e) {
        addLog("SYSTEM_ALERT: Connection to the void lost.", 'error');
      }
    };

    generateLogs();
    const interval = setInterval(generateLogs, 12000);
    return () => clearInterval(interval);
  }, [level, location]);

  return (
    <div className="flex flex-col h-full bg-black/60 p-3 md:p-4 font-mono text-[11px] md:text-sm border border-red-500/30 backdrop-blur-xl relative overflow-hidden blood-border">
      <div className="absolute top-0 left-0 w-full bg-red-950/40 p-1 px-2 border-b border-red-500/20 text-[9px] flex justify-between uppercase tracking-widest z-20">
        <span className="text-red-500 font-bold">[ SYSTEM_CORE_LOG ]</span>
        <span className="animate-pulse text-red-400">{level}</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-6 space-y-1 relative" ref={scrollRef}>
        {logs.map(log => (
          <div key={log.id} className="flex gap-2 transition-all animate-[fadeIn_0.2s_ease-out]">
            <span className="text-red-900 shrink-0">[{log.timestamp}]</span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-600 font-black shadow-red-500/50 shadow-sm' : 
              log.type === 'warning' ? 'text-orange-500' : 
              log.type === 'success' ? 'text-red-400 italic' : 
              'text-red-500/80'
            }`}>
              {log.text}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-red-600 font-bold">#SNGN></span>
          <div className="w-2 h-4 bg-red-600 animate-[pulse_0.4s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
