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
  const aiRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const d = new Date();
    const timestamp = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
    
    setLogs(prev => [...prev.slice(-40), {
      id: Math.random().toString(36),
      text,
      type,
      timestamp
    }]);
  };

  useEffect(() => {
    const generateLogs = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate a sequence of 10 realistic-sounding cybersecurity breach logs.
      Current Security Level: ${level}.
      Context: A high-level bypass of local defenses.
      User Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}.
      Format: Return only a raw JSON array of strings, no extra text.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const cleanText = response.text?.replace(/```json|```/g, '').trim() || "[]";
        const newLogs = JSON.parse(cleanText);
        
        for (const logText of newLogs) {
          await new Promise(r => setTimeout(r, Math.random() * 1500 + 500));
          
          let type: LogEntry['type'] = 'info';
          if (logText.toLowerCase().includes('bypass') || logText.toLowerCase().includes('warning')) type = 'warning';
          if (logText.toLowerCase().includes('critical') || logText.toLowerCase().includes('injected')) type = 'error';
          
          addLog(logText, type);
          soundEngine.playBeep(400 + Math.random() * 400, 'sine', 0.05);
        }
      } catch (e) {
        addLog("Manual fallback: Connection sequence initiated...", 'info');
      }
    };

    generateLogs();
    const interval = setInterval(generateLogs, 15000);
    return () => clearInterval(interval);
  }, [level, location]);

  return (
    <div className="flex flex-col h-full bg-black/40 p-4 font-mono text-xs md:text-sm border border-green-500/30 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full bg-green-500/10 p-1 px-2 border-b border-green-500/20 text-[10px] flex justify-between uppercase tracking-widest">
        <span>[ Console_Output ]</span>
        <span className="animate-pulse">{level}</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-6 space-y-1" ref={scrollRef}>
        {logs.map(log => (
          <div key={log.id} className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-green-500/40 shrink-0">[{log.timestamp}]</span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-400 font-bold' : 
              log.type === 'warning' ? 'text-yellow-300' : 
              log.type === 'success' ? 'text-blue-400' : 
              'text-green-400'
            }`}>
              {log.type === 'info' && <span className="mr-1 opacity-50">#</span>}
              {log.text}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-green-500">$</span>
          <div className="w-2 h-4 bg-green-500 animate-[pulse_0.5s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;