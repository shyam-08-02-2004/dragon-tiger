// src/utils/voice.ts
import type { BetType, GameResult } from '../types/game';

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Win = window as any;
  const AudioCtx = Win.AudioContext || Win.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!Win.__dtAudioContext) {
    Win.__dtAudioContext = new AudioCtx();
  }
  return Win.__dtAudioContext;
};

const playTone = (frequency: number, duration = 0.12, volume = 0.16, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration + 0.02);
};

export const speak = (text: string, muted: boolean) => {
  if (muted) return;
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }
};

export type SoundVariant = BetType | GameResult | 'double' | 'clear' | 'notify' | 'win' | 'lose';

export const playSound = (variant: SoundVariant, muted: boolean) => {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  ctx.resume?.();

  switch (variant) {
    case 'dragon':
      playTone(420, 0.12, 0.18, 'triangle');
      setTimeout(() => playTone(620, 0.1, 0.14, 'triangle'), 80);
      break;
    case 'tiger':
      playTone(520, 0.12, 0.18, 'square');
      setTimeout(() => playTone(720, 0.1, 0.14, 'square'), 80);
      break;
    case 'tie':
      playTone(460, 0.12, 0.16, 'sine');
      setTimeout(() => playTone(580, 0.1, 0.16, 'sine'), 80);
      break;
    case 'double':
      playTone(560, 0.14, 0.18, 'triangle');
      break;
    case 'clear':
      playTone(260, 0.14, 0.16, 'sine');
      break;
    case 'notify':
      playTone(700, 0.12, 0.15, 'triangle');
      break;
    case 'win':
      playTone(780, 0.18, 0.22, 'triangle');
      setTimeout(() => playTone(980, 0.13, 0.16, 'triangle'), 100);
      break;
    case 'lose':
      playTone(220, 0.18, 0.2, 'sine');
      break;
    default:
      playTone(440, 0.12, 0.15, 'sine');
  }
};

// Ambient background music (user-friendly, slow, musical)
let __ambientNodes: any = null;
export const startAmbient = (muted = false, volume = 0.06) => {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (__ambientNodes) return; // already running

    const masterGain = ctx.createGain();
    masterGain.gain.value = Math.max(0.0001, volume);

    // Create harmonic pad with musical frequencies (D minor chord)
    const frequencies = [
      { freq: 73.42, type: 'sine' as OscillatorType },      // D2 - root
      { freq: 110, type: 'sine' as OscillatorType },        // A2 - fifth
      { freq: 146.83, type: 'triangle' as OscillatorType }, // D3 - octave
      { freq: 220, type: 'sine' as OscillatorType },        // A3 - octave + fifth
    ];

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    frequencies.forEach(({ freq, type }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.value = volume / frequencies.length; // distribute volume across oscillators
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      oscillators.push(osc);
      gains.push(gain);
      osc.start();
    });

    // Gentle low-frequency oscillator for breathing movement (slow wobble)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07; // ~0.07 Hz (very slow breathing)
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = Math.max(0.0008, volume * 0.6);

    // Low-pass filter for smooth, warm tone
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800; // smooth, warm cutoff
    lp.Q.value = 0.5;

    // Additional high-pass filter to reduce rumble
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 20;

    // Signal chain: oscillators → HP → LP → master gain → destination
    masterGain.connect(hp);
    hp.connect(lp);
    lp.connect(ctx.destination);

    // LFO modulates master gain for breathing effect
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    // Smooth fade-in (slower for musical quality)
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 2.5);

    lfo.start();

    __ambientNodes = { ctx, masterGain, lp, hp, oscillators, lfo, lfoGain, gains };
  } catch (e) {
    console.warn('Ambient start failed', e);
  }
};

export const stopAmbient = () => {
  const nodes = __ambientNodes;
  if (!nodes) return;
  try {
    const { ctx, masterGain, oscillators, lfo } = nodes;
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    setTimeout(() => {
      try {
        oscillators.forEach((osc: OscillatorNode) => osc.stop());
      } catch (e) {}
      try { lfo.stop(); } catch (e) {}
      try { masterGain.disconnect(); } catch (e) {}
      __ambientNodes = null;
    }, 1000);
  } catch (e) {
    __ambientNodes = null;
  }
};

export const setAmbientVolume = (volume = 0.02) => {
  if (!__ambientNodes) return;
  try {
    const { ctx, masterGain } = __ambientNodes;
    masterGain.gain.setValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 0.05);
  } catch (e) {}
};
