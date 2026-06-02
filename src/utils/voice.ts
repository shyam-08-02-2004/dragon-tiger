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

// Ambient background sound (soft, user-friendly)
let __ambientNodes: any = null;
export const startAmbient = (muted = false, volume = 0.03) => {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (__ambientNodes) return; // already running
    const gain = ctx.createGain();
    gain.gain.value = volume;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 60; // low warm hum

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 90; // subtle texture

    // gentle detune to avoid static tone
    osc2.detune.value = 7;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    // smooth fade-in
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 1.2);

    osc1.start();
    osc2.start();

    __ambientNodes = { ctx, gain, osc1, osc2 };
  } catch (e) {
    console.warn('Ambient start failed', e);
  }
};

export const stopAmbient = () => {
  const nodes = __ambientNodes;
  if (!nodes) return;
  try {
    const { ctx, gain, osc1, osc2 } = nodes;
    // smooth fade-out then stop
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    setTimeout(() => {
      try { osc1.stop(); } catch(e) {}
      try { osc2.stop(); } catch(e) {}
      try { gain.disconnect(); } catch(e) {}
      __ambientNodes = null;
    }, 900);
  } catch (e) {
    __ambientNodes = null;
  }
};

export const setAmbientVolume = (volume = 0.03) => {
  if (!__ambientNodes) return;
  try {
    const { ctx, gain } = __ambientNodes;
    gain.gain.setValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 0.05);
  } catch (e) {}
};
