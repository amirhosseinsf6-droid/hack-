import React, { useEffect, useState } from 'react';
import { SecurityLevel } from '../types';

interface SystemMonitorProps {
  level: SecurityLevel;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ level }) => {
  const [cpu, setCpu] = useState(12);
  const [ram, setRam] = useState(24);
  const [network, setNetwork] = useState(45);

  useEffect(() => {
    const updateStats = () => {
      let volatility = 5;
      if (level === SecurityLevel.WARNING) volatility = 15;
      if (level === SecurityLevel.BREACH) volatility = 40;
      if (level === SecurityLevel.CRITICAL) volatility = 80;

      setCpu(prev => Math.min(100, Math.max(0, prev + (Math.random() * volatility - volatility/2))));
      setRam(prev => Math.min(100, Math.max(0, prev + (Math.random() * volatility - volatility/2))));
      setNetwork(prev => Math.min(100, Math.max(0, prev + (Math.random() * volatility - volatility/2))));
    };

    const interval = setInterval(updateStats, 200);
    return () => clearInterval(interval);
  }, [level]);

  const Bar: React.FC<{ label: string; val: number; color: string }> = ({ label, val, color }) => (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{val.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-900">
        <div 
            className={`h-full transition-all duration-200 ${color}`} 
            style={{ width: `${val}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 border border-green-900/50 bg-black/80 font-mono text-green-500 w-full">
      <div className="text-sm font-bold border-b border-green-900/50 mb-4 pb-1">SYSTEM RESOURCES</div>
      <Bar label="CPU LOAD" val={cpu} color={cpu > 80 ? 'bg-red-600' : 'bg-green-500'} />
      <Bar label="MEM USAGE" val={ram} color={ram > 80 ? 'bg-red-600' : 'bg-green-500'} />
      <Bar label="NET TRAFFIC" val={network} color={network > 80 ? 'bg-red-600' : 'bg-green-500'} />
      
      <div className="mt-6 text-xs space-y-1 opacity-70">
        <div className="flex justify-between">
            <span>PROC_ID:</span>
            <span>{Math.floor(Math.random() * 99999)}</span>
        </div>
        <div className="flex justify-between">
            <span>THREAD:</span>
            <span>DAEMON_ROOT</span>
        </div>
        <div className="flex justify-between">
            <span>PORT:</span>
            <span className={level === SecurityLevel.SAFE ? 'text-green-500' : 'text-red-500'}>
                {level === SecurityLevel.SAFE ? 'SECURE' : 'OPEN (22, 80, 443)'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;