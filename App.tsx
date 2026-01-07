import React, { useState, useEffect, useRef } from 'react';
import MatrixRain from './components/MatrixRain';
import Terminal from './components/Terminal';
import NetworkGraph from './components/NetworkGraph';
import SystemMonitor from './components/SystemMonitor';
import { SecurityLevel } from './types';
import { soundEngine } from './utils/sound';

const App: React.FC = () => {
  const [phase, setPhase] = useState<'landing' | 'scanning' | 'terminal'>('landing');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.SAFE);
  const [location, setLocation] = useState<{ lat: number, lng: number } | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSequence = async () => {
    soundEngine.init();
    soundEngine.playBeep(800, 'square', 0.2);
    setPhase('scanning');

    // Request permissions for immersion
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    } catch (e) {
      console.log("Permissions denied - continuing in simulation mode");
    }

    // Progress to terminal after "scan"
    setTimeout(() => {
      setPhase('terminal');
      soundEngine.playAlarm();
    }, 4000);
  };

  if (phase === 'landing') {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <MatrixRain color="#030" />
        <div className="z-10 text-center space-y-8 p-12 border border-green-500/20 bg-black/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,0,0.1)]">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-green-500 tracking-[0.2em] glitch">RESTRICTED</h1>
            <p className="text-green-500/50 font-mono text-sm tracking-widest">AUTHORIZED PERSONNEL ONLY // LEVEL 4 CLEARANCE</p>
          </div>
          <button 
            onClick={startSequence}
            className="px-12 py-4 border border-green-500 text-green-500 font-mono hover:bg-green-500 hover:text-black transition-all duration-500 group"
          >
            INITIALIZE UPLINK
            <div className="h-[1px] w-0 bg-current group-hover:w-full transition-all duration-500 mt-1"></div>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'scanning') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative font-mono">
        <div className="w-64 h-64 border-2 border-green-500/50 relative overflow-hidden rounded-lg bg-black/80">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 grayscale scale-x-[-1]" />
          <div className="scanner-line"></div>
          <div className="absolute inset-0 border-[20px] border-black/20"></div>
        </div>
        <div className="mt-8 space-y-2 text-center">
          <p className="text-green-500 animate-pulse tracking-widest">BIOMETRIC_SCAN_IN_PROGRESS...</p>
          <div className="text-[10px] text-green-500/40 uppercase">
             {location ? `LOC: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'GATHERING_COORDINATES...'}
          </div>
        </div>
      </div>
    );
  }

  const isCritical = securityLevel === SecurityLevel.CRITICAL;
  const isBreach = securityLevel === SecurityLevel.BREACH || isCritical;

  return (
    <div className={`w-full h-screen bg-black transition-colors duration-1000 overflow-hidden relative flex flex-col`}>
      <MatrixRain color={isBreach ? '#600' : '#030'} />

      {isCritical && <div className="absolute inset-0 bg-red-900/10 z-50 pointer-events-none animate-pulse"></div>}

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-3 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isBreach ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
            <h1 className={`text-sm md:text-lg font-bold tracking-tighter ${isBreach ? 'text-red-500' : 'text-green-500'}`}>
                {isCritical ? 'CRITICAL_SYSTEM_FAILURE' : 'CORE_NETWORK_TERMINAL'}
            </h1>
        </div>
        <div className="text-[10px] opacity-40">
            {new Date().toLocaleTimeString()} // v7.0.4-BETA
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 overflow-hidden">
        
        {/* Left Col */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-4 overflow-hidden">
            <NetworkGraph level={securityLevel} />
            <SystemMonitor level={securityLevel} />
        </div>

        {/* Center */}
        <div className="col-span-1 md:col-span-6 h-full overflow-hidden">
            <Terminal level={securityLevel} setLevel={setSecurityLevel} location={location} />
        </div>

        {/* Right Col */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-4 overflow-hidden">
            <div className="flex-1 border border-white/10 bg-black/40 p-3 font-mono text-[10px] uppercase">
                <div className="border-b border-white/10 mb-2 pb-1 text-green-500/60">ACTIVE_PROCESSES</div>
                <div className="space-y-1 text-green-500/40">
                    <p>sh -i /bin/bash</p>
                    <p>python3 payload.py --inject</p>
                    <p>nc -lvp 4444</p>
                    {isBreach && <p className="text-red-500 animate-bounce">! DATA_EXFIL_STARTED</p>}
                </div>
            </div>
            <div className="h-48 border border-white/10 bg-black/40 relative overflow-hidden">
                 <div className="absolute top-1 left-1 text-[8px] z-10 bg-black/80 px-1">SURVEILLANCE_NODE_01</div>
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-30 grayscale contrast-150" />
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 p-2 border-t border-white/10 bg-black/80 text-[9px] text-green-500/50 flex justify-between uppercase font-mono">
        <div className="flex gap-4">
            <span>NODE: {location ? `${location.lat.toFixed(2)}N` : 'PROXY_01'}</span>
            <span>UPLINK: ACTIVE</span>
        </div>
        <div className={isCritical ? "text-red-500 font-bold" : ""}>
            THREAT_LEVEL: {securityLevel}
        </div>
      </footer>
    </div>
  );
};

export default App;