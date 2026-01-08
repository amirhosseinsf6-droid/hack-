
import React, { useState, useEffect, useRef } from 'react';
import BloodRain from './components/BloodRain';
import Terminal from './components/Terminal';
import NetworkGraph from './components/NetworkGraph';
import SystemMonitor from './components/SystemMonitor';
import { SecurityLevel } from './types';
import { soundEngine } from './utils/sound';

const App: React.FC = () => {
  const [phase, setPhase] = useState<'landing' | 'scanning' | 'terminal'>('landing');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.SAFE);
  const [location, setLocation] = useState<{ lat: number, lng: number } | undefined>();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase === 'terminal' || phase === 'scanning') {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }
  }, [phase, cameraStream]);

  const startSequence = async () => {
    soundEngine.init();
    soundEngine.playBeep(400, 'sawtooth', 0.4);
    setPhase('scanning');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    } catch (e) {
      console.log("Biometrics unavailable - manual override active");
    }

    setTimeout(() => {
      setPhase('terminal');
      setSecurityLevel(SecurityLevel.WARNING);
      soundEngine.playAlarm();
      
      // Gradually increase threat level
      setTimeout(() => setSecurityLevel(SecurityLevel.BREACH), 10000);
      setTimeout(() => setSecurityLevel(SecurityLevel.CRITICAL), 25000);
    }, 5000);
  };

  if (phase === 'landing') {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden p-6">
        <BloodRain color="#400" />
        <div className="z-10 text-center space-y-6 max-w-md w-full p-8 md:p-12 border border-red-500/30 bg-black/90 backdrop-blur-3xl shadow-[0_0_80px_rgba(150,0,0,0.2)] blood-border">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter glitch">SANGUINE</h1>
            <p className="text-red-500/40 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase">Biological System Protocol // Zero Trust</p>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
          <button 
            onClick={startSequence}
            className="w-full py-5 border border-red-600 text-red-600 font-mono text-sm tracking-widest hover:bg-red-600 hover:text-black transition-all duration-700 active:scale-95 shadow-[0_0_20px_rgba(255,0,0,0.1)]"
          >
            BLEED INTO THE NETWORK
          </button>
          <p className="text-[9px] text-red-900 uppercase font-mono animate-pulse">Warning: User biometrics will be harvested for session stabilization.</p>
        </div>
      </div>
    );
  }

  if (phase === 'scanning') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative font-mono p-4">
        <div className="w-56 h-56 md:w-72 md:h-72 border-2 border-red-600/50 relative overflow-hidden rounded-full bg-black/80 shadow-[0_0_40px_rgba(255,0,0,0.3)]">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-70 grayscale scale-x-[-1] contrast-150" />
          <div className="scanner-line"></div>
          <div className="absolute inset-0 border-[15px] border-black/40 rounded-full"></div>
        </div>
        <div className="mt-10 space-y-3 text-center">
          <p className="text-red-600 animate-pulse text-lg font-bold tracking-[0.2em] shadow-sm">ANALYZING_DNA_SEQUENCE...</p>
          <div className="text-[10px] text-red-900 uppercase space-y-1">
             <p>{location ? `LATENCY_COORDS: ${location.lat.toFixed(6)}` : 'EXTRACTING_GEOLOC...'}</p>
             <p>IDENTITY_PURGE: 44% COMPLETE</p>
          </div>
        </div>
      </div>
    );
  }

  const isCritical = securityLevel === SecurityLevel.CRITICAL;
  const isBreach = securityLevel === SecurityLevel.BREACH || isCritical;

  return (
    <div className={`w-full h-screen bg-black transition-colors duration-1000 overflow-hidden relative flex flex-col font-mono`}>
      <BloodRain color={isBreach ? '#800' : '#400'} />

      {isCritical && <div className="absolute inset-0 bg-red-950/20 z-50 pointer-events-none animate-pulse"></div>}

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-3 md:p-4 border-b border-red-900/40 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isBreach ? 'bg-red-600 animate-ping' : 'bg-red-900'}`}></div>
            <h1 className={`text-base md:text-xl font-black tracking-tighter uppercase ${isBreach ? 'text-red-600' : 'text-red-900'}`}>
                {isCritical ? 'PROTOCOL_HELLGATE' : 'SANGUINE_SESSION_ACTIVE'}
            </h1>
        </div>
        <div className="text-[9px] text-red-900 font-bold hidden sm:block">
            {location ? `${location.lat.toFixed(2)}N / ${location.lng.toFixed(2)}E` : 'LOCAL_UPLINK'} // CORE_v9.0
        </div>
      </header>

      {/* Main Grid - Mobile Responsive */}
      <main className="relative z-10 flex-1 p-2 md:p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 overflow-hidden">
        
        {/* Left Col - Dashboard (Hidden on small mobile if screen is too small, or stacked) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-hidden">
            <NetworkGraph level={securityLevel} />
            <SystemMonitor level={securityLevel} />
            <div className="flex-1 border border-red-900/30 bg-black/60 p-3 text-[10px] blood-border overflow-hidden">
                <p className="text-red-900 border-b border-red-900/20 mb-2 pb-1 font-bold">ACTIVE_INFECTIONS</p>
                <div className="space-y-1 text-red-600/60 leading-tight">
                    <p className="animate-pulse"># bypass-auth-v2.exe</p>
                    <p># harvest_credentials.py</p>
                    <p className="text-red-500"># inject_malware.payload</p>
                    {isBreach && <p className="text-white font-bold animate-bounce mt-2 text-center bg-red-900/20">!! EXFILTRATING_DATA !!</p>}
                </div>
            </div>
        </div>

        {/* Center - Terminal (The core) */}
        <div className="flex-1 md:col-span-12 lg:col-span-6 h-full min-h-[50vh] overflow-hidden">
            <Terminal level={securityLevel} setLevel={setSecurityLevel} location={location} />
        </div>

        {/* Right Col - Biometrics & Visuals */}
        <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col gap-4 overflow-hidden">
            <div className="h-1/2 border border-red-900/30 bg-black/60 relative overflow-hidden blood-border group">
                 <div className="absolute top-1 left-2 text-[8px] z-10 bg-black/60 px-2 border border-red-900/40 text-red-500 font-bold">BIOMETRIC_FEED_01</div>
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-40 grayscale contrast-150 brightness-50" />
                 <div className="absolute inset-0 bg-red-900/10 mix-blend-color group-hover:opacity-0 transition-opacity"></div>
            </div>
            
            <div className="flex-1 border border-red-900/30 bg-black/60 p-4 blood-border">
                <div className="text-[10px] text-red-800 mb-2 border-b border-red-900/20 pb-1">BREACH_PROBABILITY</div>
                <div className="flex items-center justify-center h-full">
                    <span className={`text-5xl font-black ${isBreach ? 'text-red-600 animate-pulse' : 'text-red-900'}`}>
                        {isCritical ? '99.9%' : isBreach ? '74.2%' : '12.4%'}
                    </span>
                </div>
            </div>
        </div>

        {/* Mobile-only Bottom Dash */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
             <div className="h-32">
                <SystemMonitor level={securityLevel} />
             </div>
             <div className="h-32 border border-red-900/30 bg-black relative overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-40 grayscale" />
                <div className="absolute bottom-1 left-1 text-[8px] text-red-600">USER_CAM</div>
             </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 p-2 md:p-3 border-t border-red-900/40 bg-black text-[10px] text-red-900 flex justify-between uppercase font-bold tracking-widest">
        <div className="flex gap-4">
            <span className="animate-pulse">UPLINK: SECURE_V3</span>
            <span className="hidden sm:inline">NODES: {isCritical ? 'ALL_COMPROMISED' : 'STABLE'}</span>
        </div>
        <div className={isCritical ? "text-red-600 animate-pulse" : ""}>
            THREAT_ASSESSMENT: {securityLevel}
        </div>
      </footer>
    </div>
  );
};

export default App;
