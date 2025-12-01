
// A simple Web Audio API wrapper for retro synthesizer sounds

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.1; // Default volume (10%)
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const toggleMute = (muted: boolean) => {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.1;
  }
};

export const playBootSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(masterGain!);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

export const playKeystrokeSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  
  // Create a short, high-pitched "click"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Vary pitch slightly for realism
  const randomDetune = Math.random() * 200 - 100;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800 + randomDetune, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

export const playIncomingDataSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  
  // Softer, lower blip for AI typing
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.02, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
};
