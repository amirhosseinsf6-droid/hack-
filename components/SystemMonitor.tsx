
import React, { useEffect, useState } from 'react';
import { SecurityLevel } from '../types';

interface SystemMonitorProps {
  level: SecurityLevel;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ level }) => {
  const [vitals, setVitals] = useState({ pulse: 72, corruption: 5, breach: 12 });

  useEffect(() => {
    const update = () => {
      setVitals(prev => ({
        pulse: 70 + Math.random() * 40 + (level === SecurityLevel.CRITICAL ? 60 : 0),
        corruption: Math.min(100, prev.corruption + Math.random() * 2),
        breach: Math.min(100, Math.max(0, prev.breach + (Math.random() * 10 - 4)))
      }));
    };
    const itv = setInterval(update, 500);
    return () => clearInterval(itv);
  }, [level]);

  const Metric = ({ label, val, color }: any) => (
    <div className="mb-3">
        <div className="flex justify-between text-[10px] uppercase mb-0.5 tracking-tighter">
            <span>{label}</span>
            <span className={color}>{val.toFixed(1)}</span>
        </div>
        <div className="h-1 w-full bg-red-950/30 overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ${color.replace('text', 'bg')}`} 
                style={{ width: `${val}%` }}
            />
        </div>
    </div>
  );

  return (
    <div className="p-3 border border-red-900/40 bg-black/90 font-mono text-red-600 w-full blood-border">
      <div className="text-[10px] font-bold border-b border-red-900/40 mb-3 pb-1 flex justify-between">
        <span>VITAL_TELEMETRY</span>
        <span className="animate-pulse">ONLINE</span>
      </div>
      
      <Metric label="Sanguine Flow" val={vitals.pulse % 100} color="text-red-500" />
      <Metric label="Data Corruption" val={vitals.corruption} color="text-red-600" />
      <Metric label="Mem-Purge Depth" val={vitals.breach} color="text-orange-600" />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="border border-red-900/20 p-1 text-[8px] bg-red-950/10">
            <p className="opacity-50">HEARTBEAT</p>
            <p className="text-red-400 font-bold">{vitals.pulse.toFixed(0)} BPM</p>
        </div>
        <div className="border border-red-900/20 p-1 text-[8px] bg-red-950/10">
            <p className="opacity-50">SYNC_STATUS</p>
            <p className="text-red-400 font-bold uppercase">{level}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
