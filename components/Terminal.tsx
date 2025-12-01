import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, SecurityLevel } from '../types';
import { soundEngine } from '../utils/sound';

const HACK_LOGS = [
  "Initializing handshake protocol...",
  "Routing through proxy chain: 192.168.0.1 -> 10.0.0.5...",
  "Target identified: SYSTEM_ROOT",
  "Attempting SSH injection...",
  "Password hash detected. Decrypting...",
  "Brute force algorithm active. Threads: 128",
  "Bypassing firewall rules...",
  "Port 22 open. Port 80 open.",
  "Injecting payload: trojan_v4.exe",
  "Accessing /home/user/documents...",
  "Encrypting filesystem...",
  "Uploading private keys...",
  "Camera initialized. Recording...",
  "Microphone initialized. Recording...",
  "Location data acquired.",
  "Sending packet to remote server...",
  "Clearing logs...",
  "Root access granted.",
  "SYSTEM COMPROMISED."
];

interface TerminalProps {
  level: SecurityLevel;
  setLevel: (l: SecurityLevel) => void;
}

const Terminal: React.FC<TerminalProps> = ({ level, setLevel }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Determine speed based on level
    let speed = 800;
    if (level === SecurityLevel.WARNING) speed = 300;
    if (level === SecurityLevel.BREACH) speed = 100;
    if (level === SecurityLevel.CRITICAL) speed = 50;

    const interval = setInterval(() => {
      if (indexRef.current >= HACK_LOGS.length) {
         // Loop or random junk after main sequence
         const randomHex = Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
         addLog(`MEM_DUMP: 0x${randomHex}`, 'info');
         return;
      }

      const txt = HACK_LOGS[indexRef.current];
      
      // Determine type/level change based on text content
      let type: LogEntry['type'] = 'info';
      if (txt.includes("Decrypting") || txt.includes("Bypassing")) {
        type = 'warning';
        if (level === SecurityLevel.SAFE) setLevel(SecurityLevel.WARNING);
      }
      if (txt.includes("Injecting") || txt.includes("Accessing")) {
        type = 'error';
        if (level !== SecurityLevel.BREACH) setLevel(SecurityLevel.BREACH);
      }
      if (txt.includes("COMPROMISED") || txt.includes("Root access")) {
        type = 'success'; // ironic success
        setLevel(SecurityLevel.CRITICAL);
      }

      addLog(txt, type);
      
      // Sound effects
      if (level === SecurityLevel.SAFE) soundEngine.playBeep(800, 'sine', 0.05);
      if (level === SecurityLevel.WARNING) soundEngine.playBeep(400, 'square', 0.05);
      if (level === SecurityLevel.BREACH) soundEngine.playBeep(200, 'sawtooth', 0.1);
      if (level === SecurityLevel.CRITICAL) soundEngine.playAlarm();

      indexRef.current++;

    }, speed);

    return () => clearInterval(interval);
  }, [level, setLevel]);

  const addLog = (text: string, type: LogEntry['type']) => {
    const d = new Date();
    // Manual format to avoid TS error with fractionalSecondDigits which is not in all TS env definitions
    const timestamp = `${d.toLocaleTimeString('en-US', { hour12: false })}.${d.getMilliseconds().toString().padStart(3, '0')}`;
    
    setLogs(prev => [...prev.slice(-20), { // Keep last 20
      id: Math.random().toString(36),
      text,
      type,
      timestamp
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-black/90 p-4 font-mono text-sm border border-green-800 relative shadow-[0_0_20px_rgba(0,255,0,0.2)]">
      <div className="absolute top-0 left-0 w-full bg-green-900/20 p-1 px-2 border-b border-green-800 text-xs text-green-400 flex justify-between">
        <span>TERMINAL_ROOT_ACCESS</span>
        <span>{level}</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mt-6 space-y-1" ref={scrollRef}>
        {logs.map(log => (
          <div key={log.id} className="flex gap-3">
            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-500 font-bold' : 
              log.type === 'warning' ? 'text-yellow-400' : 
              log.type === 'success' ? 'text-red-600 bg-red-900/20' : 
              'text-green-500'
            }`}>
              {log.type === 'info' && '> '}
              {log.text}
            </span>
          </div>
        ))}
        {/* Blinking Cursor */}
        <div className="animate-pulse text-green-500 font-bold">_</div>
      </div>
    </div>
  );
};

export default Terminal;