import React, { useState } from 'react';
import MatrixRain from './components/MatrixRain';
import Terminal from './components/Terminal';
import NetworkGraph from './components/NetworkGraph';
import SystemMonitor from './components/SystemMonitor';
import { SecurityLevel } from './types';
import { soundEngine } from './utils/sound';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.SAFE);

  const startHack = () => {
    soundEngine.init();
    soundEngine.playBeep(600, 'sine', 0.2);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <MatrixRain />
        <div className="z-10 text-center space-y-6 max-w-md p-8 border border-green-500/30 bg-black/80 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold text-green-500 font-mono tracking-tighter">
            SYSTEM LOCKED
          </h1>
          <p className="text-green-400/70 font-mono">
            SECURE CONNECTION REQUIRED FOR DIAGNOSTICS
          </p>
          <button 
            onClick={startHack}
            className="group relative px-8 py-4 bg-transparent border-2 border-green-500 text-green-500 font-mono font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all duration-300"
          >
            <span className="absolute inset-0 w-full h-full bg-green-500/10 group-hover:bg-transparent transition-all"></span>
            Initialize
          </button>
        </div>
        <div className="scanlines"></div>
      </div>
    );
  }

  // Visual effects based on level
  const isCritical = securityLevel === SecurityLevel.CRITICAL;
  const isBreach = securityLevel === SecurityLevel.BREACH || isCritical;
  
  const borderColor = isBreach ? 'border-red-600' : 'border-green-600';
  const textColor = isBreach ? 'text-red-500' : 'text-green-500';
  const bgColor = isCritical ? 'bg-red-900/10' : 'bg-black';

  return (
    <div className={`w-full h-screen ${bgColor} ${isCritical ? 'shake' : ''} transition-colors duration-1000 overflow-hidden relative flex flex-col`}>
      {/* Background Effect */}
      <MatrixRain color={isBreach ? '#F00' : '#0F0'} />
      <div className="scanlines"></div>

      {/* FLASHING RED ALERT OVERLAY */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-600/20 z-40 pointer-events-none animate-pulse flex items-center justify-center">
            <h1 className="text-6xl md:text-9xl font-black text-red-600 tracking-widest opacity-50 rotate-12 border-4 border-red-600 p-10">
                LOCKED
            </h1>
        </div>
      )}

      {/* Header */}
      <header className={`relative z-10 flex justify-between items-center p-4 border-b ${borderColor} bg-black/80 backdrop-blur`}>
        <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isBreach ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
            <h1 className={`text-xl font-mono font-bold ${textColor}`}>
                {isCritical ? 'SYSTEM FAILURE // CRITICAL ERROR' : 'SECURE TERMINAL V.4.0.2'}
            </h1>
        </div>
        <div className={`text-xs font-mono ${textColor}`}>
            IP: {isBreach ? '10.22.44.1 [EXPOSED]' : '192.168.x.x [MASKED]'}
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 flex-1 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
        
        {/* Left Col - Stats & Map */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-4">
            <div className="flex-1 min-h-0">
                <NetworkGraph level={securityLevel} />
            </div>
            <div className="flex-1 min-h-0">
                <SystemMonitor level={securityLevel} />
            </div>
        </div>

        {/* Center - Terminal */}
        <div className="col-span-1 md:col-span-6 h-full min-h-[300px]">
            <Terminal level={securityLevel} setLevel={setSecurityLevel} />
        </div>

        {/* Right Col - Visual Data */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-4">
             {/* Fake file system view */}
            <div className={`flex-1 border ${borderColor} bg-black/80 p-4 font-mono text-xs overflow-hidden`}>
                <div className={`border-b ${borderColor} mb-2 pb-1 ${textColor}`}>DIRECTORY LISTING</div>
                <div className={`${isBreach ? 'text-red-400' : 'text-green-400'} space-y-1`}>
                    <p>drwx------ root /etc/shadow</p>
                    <p>drwx------ root /home/admin/.ssh</p>
                    <p>drwxr-xr-x user /var/www/html</p>
                    {isBreach && (
                        <>
                        <p className="animate-pulse text-red-500 font-bold">{'>'} UPLOADING: bank_details.dat</p>
                        <p className="animate-pulse text-red-500 font-bold">{'>'} UPLOADING: passwords.txt</p>
                        <p className="animate-pulse text-red-500 font-bold">{'>'} DELETING: sys_boot.ini</p>
                        </>
                    )}
                </div>
            </div>

            {/* Fake Image Analysis */}
            <div className={`h-1/3 border ${borderColor} bg-black/80 p-2 relative overflow-hidden`}>
                <div className={`absolute top-2 left-2 text-[10px] ${textColor}`}>CAM_01 [REC]</div>
                {/* Random noise boxes suggesting image recognition */}
                <div className={`absolute top-1/2 left-1/3 w-12 h-12 border-2 ${borderColor} opacity-50 animate-bounce`}></div>
                <div className="w-full h-full bg-[url('https://picsum.photos/400/300?grayscale')] bg-cover opacity-20 bg-center"></div>
            </div>
        </div>

        {/* Mobile-only visible blocks (simplified) */}
        <div className="md:hidden col-span-1 h-32">
             <SystemMonitor level={securityLevel} />
        </div>

      </main>

        {/* Footer */}
      <footer className={`relative z-10 p-2 border-t ${borderColor} bg-black text-[10px] ${textColor} font-mono flex justify-between uppercase`}>
        <span>SESSION_ID: {Math.random().toString(36).substring(7)}</span>
        <span className={isCritical ? "animate-pulse font-bold" : ""}>
            STATUS: {securityLevel}
        </span>
      </footer>
    </div>
  );
};

export default App;