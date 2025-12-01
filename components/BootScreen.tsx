import React, { useState, useEffect, useRef } from 'react';
import Scanlines from './Scanlines';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "BIOS DATE 01/01/85 14:22:56 VER 1.02",
  "CPU: GEMINI QUANTUM CORE @ 8MHz",
  "DETECTING PRIMARY MASTER ... 20MB HDD",
  "DETECTING PRIMARY SLAVE ... NONE",
  "640K RAM SYSTEM 640K OK",
  "INITIALIZING VIDEO ADAPTER...... OK",
  "LOADING KERNEL...",
  "MOUNTING VIRTUAL DRIVES...",
  "CHECKING PERIPHERALS...",
  "KEYBOARD DETECTED",
  "LOADING NEURAL NETWORKS...",
  "ESTABLISHING UPLINK...",
  "HANDSHAKE INITIATED...",
  "DECRYPTING PROTOCOLS...",
  "SYSTEM READY."
];

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: number;
    // We use a local variable to track progress inside the closure ensuring
    // we don't need 'progress' as a dependency, preventing re-renders from restarting logic.
    let currentProgress = 0;

    const runBootSequence = () => {
      if (currentProgress >= 100) {
        // Animation complete, give it a moment to show "100%" then finish
        setTimeout(onComplete, 800);
        return;
      }

      const r = Math.random();
      let increment = 0;
      let delay = 0;

      // LOGIC: Randomly decide behavior for this step
      
      // 1. STALL (5% chance): Simulate hanging on a heavy process (Rare)
      if (r < 0.05 && currentProgress < 90) {
        increment = 0; // Stop completely
        delay = Math.random() * 800 + 400; // Hang for 0.4s to 1.2s
      } 
      // 2. BURST (15% chance): Load a chunk of data quickly
      else if (r < 0.20) {
        increment = Math.random() * 8 + 2; // Jump 2% to 10%
        delay = Math.random() * 120 + 30;   // Fast tick
      } 
      // 3. NORMAL: Slow, steady loading (80% chance)
      else {
        increment = Math.random() * 1.5 + 0.1; // Very small increments (0.1% to 1.6%)
        delay = Math.random() * 150 + 30; // Quick ticks but slow progress
      }

      // Update progress locally and in state
      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      // Determine how many logs to show based on progress percentage
      const totalLogs = BOOT_LOGS.length;
      // Map progress 0-100 to log index
      const logIndex = Math.floor((currentProgress / 100) * totalLogs);
      const safeIndex = Math.min(logIndex + 1, totalLogs);
      
      setLogs(BOOT_LOGS.slice(0, safeIndex));

      // Schedule next step
      timeoutId = window.setTimeout(runBootSequence, delay);
    };

    // Start the sequence after a brief initial pause
    timeoutId = window.setTimeout(runBootSequence, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onComplete]);

  // Auto scroll logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-terminal overflow-hidden flex flex-col items-center justify-center z-50 selection:bg-green-500 selection:text-black">
      <Scanlines />
      
      <div className="w-full max-w-3xl p-8 z-10 flex flex-col gap-8">
        {/* Header Info */}
        <div className="flex justify-between border-b-2 border-green-800 pb-2 mb-4 uppercase tracking-widest text-xl">
            <span>RetroBIOS v2.5</span>
            <span>Mem: 640K</span>
        </div>

        {/* Logs Area */}
        <div 
          ref={containerRef}
          className="h-72 overflow-y-auto font-mono text-xl flex flex-col gap-1 scrollbar-hide border border-green-900 bg-black bg-opacity-50 p-4 shadow-[0_0_15px_rgba(0,255,0,0.1)]"
        >
          {logs.map((log, index) => (
            <div key={index} className="whitespace-nowrap">
              <span className="opacity-50 mr-4">[{new Date(Date.now() - (logs.length - index) * 1000).toLocaleTimeString('en-US', {hour12:false})}]</span>
              {log}
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full border-2 border-green-800 p-1 mt-auto shadow-[0_0_10px_rgba(0,255,0,0.2)]">
          <div 
            className="h-8 bg-green-600 relative overflow-hidden transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          >
             {/* Striped pattern for the progress bar */}
             <div className="absolute inset-0 w-full h-full" 
                  style={{
                    backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)',
                    backgroundSize: '20px 20px'
                  }} 
             />
          </div>
        </div>
        
        <div className="flex justify-between text-lg uppercase tracking-widest mt-2">
            <span className="animate-pulse">
              {progress < 100 ? "BOOTING SYSTEM..." : "SYSTEM READY"}
            </span>
            <span>{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;