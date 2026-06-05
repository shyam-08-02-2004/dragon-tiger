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

const playNoiseBurst = (duration = 0.08, volume = 0.16, highpass = 1200) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * volume;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
};

export const speak = (text: string, muted: boolean) => {
  if (muted) return;
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }
};

export type SoundVariant = BetType | GameResult | 'double' | 'clear' | 'notify' | 'win' | 'lose' | 'shuffle' | 'deal' | 'chip' | 'button' | 'countdown' | 'coin' | 'jackpot' | 'congrats';

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
      playTone(280, 0.12, 0.16, 'sine');
      break;
    case 'notify':
      playTone(740, 0.1, 0.16, 'triangle');
      setTimeout(() => playTone(880, 0.08, 0.14, 'triangle'), 90);
      break;
    case 'win':
      playTone(880, 0.18, 0.24, 'triangle');
      setTimeout(() => playTone(1020, 0.15, 0.18, 'triangle'), 120);
      setTimeout(() => playTone(1180, 0.1, 0.16, 'triangle'), 240);
      break;
    case 'congrats':
      playTone(960, 0.16, 0.22, 'triangle');
      setTimeout(() => playTone(1120, 0.12, 0.18, 'triangle'), 110);
      setTimeout(() => playTone(1280, 0.1, 0.16, 'triangle'), 220);
      setTimeout(() => playNoiseBurst(0.12, 0.14, 2400), 100);
      break;
    case 'lose':
      playTone(240, 0.16, 0.2, 'sine');
      setTimeout(() => playTone(180, 0.08, 0.14, 'sine'), 100);
      break;
    case 'shuffle':
      playNoiseBurst(0.06, 0.14, 1800);
      setTimeout(() => playNoiseBurst(0.05, 0.08, 2200), 50);
      break;
    case 'deal':
      playTone(1040, 0.08, 0.14, 'triangle');
      setTimeout(() => playTone(760, 0.06, 0.12, 'triangle'), 70);
      break;
    case 'chip':
      playTone(980, 0.04, 0.18, 'square');
      setTimeout(() => playTone(660, 0.08, 0.12, 'triangle'), 35);
      break;
    case 'button':
      playTone(1120, 0.04, 0.18, 'square');
      break;
    case 'countdown':
      playTone(720, 0.08, 0.16, 'square');
      setTimeout(() => playTone(660, 0.08, 0.14, 'square'), 150);
      setTimeout(() => playTone(600, 0.08, 0.12, 'square'), 300);
      break;
    case 'coin':
      playNoiseBurst(0.1, 0.12, 2800);
      playTone(1280, 0.1, 0.12, 'triangle');
      break;
    case 'jackpot':
      playTone(1040, 0.12, 0.2, 'triangle');
      setTimeout(() => playTone(1240, 0.1, 0.18, 'triangle'), 90);
      setTimeout(() => playTone(1440, 0.08, 0.16, 'triangle'), 180);
      setTimeout(() => playNoiseBurst(0.18, 0.18, 2400), 120);
      break;
    default:
      playTone(440, 0.12, 0.15, 'sine');
  }
};

// Ambient background music - Rich Electronic Casino Soundtrack (Web Audio API Synthesizer)
let __ambientNodes: any = null;
let __ambientGain: GainNode | null = null;

export const startAmbient = (muted = false, volume = 0.035) => {
  if (muted) return;
  if (__ambientNodes) return; // Already playing

  const ctx = getAudioContext();
  if (!ctx) return;
  ctx.resume?.();

  try {
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    __ambientGain = masterGain;

    const nodes: AudioNode[] = [];

    // === Layer 1: Deep bass pulse ===
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 48;
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 110;
    bassFilter.Q.value = 8;
    bassGain.gain.value = 0.38;
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    const bassLFO = ctx.createOscillator();
    const bassLFOGain = ctx.createGain();
    bassLFO.type = 'sine';
    bassLFO.frequency.value = 0.28;
    bassLFOGain.gain.value = 0.15;
    bassLFO.connect(bassLFOGain);
    bassLFOGain.connect(bassGain.gain);
    bassOsc.start();
    bassLFO.start();
    nodes.push(bassOsc, bassLFO);

    // === Layer 2: Subsonic body ===
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();
    subOsc.type = 'sine';
    subOsc.frequency.value = 32;
    subFilter.type = 'lowpass';
    subFilter.frequency.value = 72;
    subGain.gain.value = 0.22;
    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    nodes.push(subOsc);

    // === Layer 3: Warm casino pad ===
    const padFreqs = [130.81, 164.81, 196.0, 261.63];
    padFreqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (index - 1.5) * 10;
      filter.type = 'lowpass';
      filter.frequency.value = 950;
      filter.Q.value = 1.1;
      gain.gain.value = 0.07;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
      nodes.push(osc);
    });

    // === Layer 4: Velvet shimmer ===
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    const shimmerFilter = ctx.createBiquadFilter();
    shimmerOsc.type = 'triangle';
    shimmerOsc.frequency.value = 660;
    shimmerFilter.type = 'bandpass';
    shimmerFilter.frequency.value = 1200;
    shimmerFilter.Q.value = 2;
    shimmerGain.gain.value = 0.05;
    shimmerOsc.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    const shimmerLFO = ctx.createOscillator();
    const shimmerLFOGain = ctx.createGain();
    shimmerLFO.type = 'sine';
    shimmerLFO.frequency.value = 0.08;
    shimmerLFOGain.gain.value = 0.028;
    shimmerLFO.connect(shimmerLFOGain);
    shimmerLFOGain.connect(shimmerGain.gain);
    shimmerOsc.start();
    shimmerLFO.start();
    nodes.push(shimmerOsc, shimmerLFO);

    // === Layer 5: Metallic sparkle ===
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    const sparkleFilter = ctx.createBiquadFilter();
    sparkleOsc.type = 'square';
    sparkleOsc.frequency.value = 420;
    sparkleFilter.type = 'highpass';
    sparkleFilter.frequency.value = 1300;
    sparkleGain.gain.value = 0.02;
    sparkleOsc.connect(sparkleFilter);
    sparkleFilter.connect(sparkleGain);
    sparkleGain.connect(masterGain);
    const sparkleLFO = ctx.createOscillator();
    const sparkleLFOGain = ctx.createGain();
    sparkleLFO.type = 'sine';
    sparkleLFO.frequency.value = 0.74;
    sparkleLFOGain.gain.value = 0.01;
    sparkleLFO.connect(sparkleLFOGain);
    sparkleLFOGain.connect(sparkleGain.gain);
    sparkleOsc.start();
    sparkleLFO.start();
    nodes.push(sparkleOsc, sparkleLFO);

    // === Layer 6: Luxury ambience noise ===
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2400;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.02;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();
    nodes.push(noiseSource);

    __ambientNodes = nodes;
  } catch (e) {
    console.warn('Ambient start failed', e);
  }
};

export const stopAmbient = () => {
  if (!__ambientNodes) return;
  try {
    __ambientNodes.forEach((n: any) => {
      if (typeof n.stop === 'function') {
        try { n.stop(); } catch (e) {}
      }
    });
  } catch (e) {
    console.warn('Ambient stop failed', e);
  }
  __ambientNodes = null;
  __ambientGain = null;
};

export const setAmbientVolume = (volume = 0.035) => {
  if (!__ambientGain) return;
  try {
    __ambientGain.gain.value = Math.max(0, Math.min(1, volume));
  } catch (e) {}
};
