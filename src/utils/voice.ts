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

const playTone = (frequency: number, duration = 0.12, volume = 0.16, type: OscillatorType = 'sine', detune = 0) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.detune.value = detune;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration + 0.05);
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
  
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.start();
};

export const speak = (text: string, muted: boolean) => {
  if (muted) return;
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.pitch = 1.1;
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  }
};

export type SoundVariant = BetType | GameResult | 'double' | 'clear' | 'notify' | 'win' | 'lose' | 'shuffle' | 'deal' | 'chip' | 'button' | 'countdown' | 'coin' | 'jackpot' | 'congrats';

/* PREMIUM LUXURY CASINO SOUND EFFECTS */
export const playSound = (variant: SoundVariant, muted: boolean) => {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  ctx.resume?.();

  switch (variant) {
    case 'dragon':
      // Deep majestic gong-like
      playTone(220, 0.4, 0.2, 'sine');
      playTone(330, 0.4, 0.1, 'triangle', 5);
      break;
    case 'tiger':
      // Bright sharp bell-like
      playTone(440, 0.4, 0.15, 'sine');
      playTone(660, 0.4, 0.1, 'triangle', -5);
      break;
    case 'tie':
      // Harmonious chord
      playTone(261.63, 0.5, 0.15, 'sine'); // C4
      playTone(329.63, 0.5, 0.15, 'sine'); // E4
      playTone(392.00, 0.5, 0.15, 'triangle'); // G4
      break;
    case 'double':
      playTone(523.25, 0.2, 0.15, 'sine');
      setTimeout(() => playTone(659.25, 0.3, 0.15, 'sine'), 100);
      break;
    case 'clear':
      playNoiseBurst(0.1, 0.15, 3000);
      playTone(300, 0.1, 0.1, 'triangle');
      break;
    case 'notify':
      playTone(880, 0.1, 0.1, 'sine');
      setTimeout(() => playTone(1760, 0.2, 0.1, 'sine'), 100);
      break;
    case 'win':
      // Premium ascending arpeggio
      playTone(523.25, 0.15, 0.2, 'triangle'); // C5
      setTimeout(() => playTone(659.25, 0.15, 0.2, 'triangle'), 80); // E5
      setTimeout(() => playTone(783.99, 0.15, 0.2, 'triangle'), 160); // G5
      setTimeout(() => playTone(1046.50, 0.4, 0.2, 'sine'), 240); // C6
      break;
    case 'congrats':
      // Grand VIP casino win flourish
      playTone(440, 0.2, 0.2, 'sine');
      setTimeout(() => playTone(554.37, 0.2, 0.2, 'sine'), 100);
      setTimeout(() => playTone(659.25, 0.2, 0.2, 'sine'), 200);
      setTimeout(() => {
        playTone(880, 0.6, 0.25, 'triangle');
        playTone(1108.73, 0.6, 0.2, 'sine');
        playNoiseBurst(0.4, 0.05, 4000); // Shimmer
      }, 300);
      break;
    case 'lose':
      playTone(349.23, 0.3, 0.2, 'sine');
      setTimeout(() => playTone(329.63, 0.3, 0.2, 'sine'), 200);
      setTimeout(() => playTone(293.66, 0.5, 0.2, 'triangle'), 400);
      break;
    case 'shuffle':
      // Smooth card shuffle
      for(let i=0; i<6; i++) {
        setTimeout(() => playNoiseBurst(0.04, 0.1, 2000), i * 40);
      }
      break;
    case 'deal':
      // Crisp card slide on felt
      playNoiseBurst(0.06, 0.15, 1000);
      playTone(1200, 0.02, 0.05, 'sine');
      break;
    case 'chip':
      // High-end ceramic casino chip clink
      playTone(3500, 0.05, 0.1, 'sine');
      playTone(4800, 0.08, 0.08, 'sine');
      break;
    case 'button':
      // Soft modern UI click
      playTone(600, 0.03, 0.1, 'triangle');
      playNoiseBurst(0.02, 0.05, 3000);
      break;
    case 'countdown':
      // Tension tick
      playTone(800, 0.05, 0.1, 'sine');
      break;
    case 'coin':
      // Gold coin jingle
      playTone(2500, 0.15, 0.15, 'sine');
      setTimeout(() => playTone(3000, 0.2, 0.15, 'sine'), 40);
      break;
    case 'jackpot':
      // Massive explosion of coins
      for(let i=0; i<15; i++) {
        setTimeout(() => {
          playTone(2000 + Math.random()*1000, 0.1, 0.1, 'sine');
          playNoiseBurst(0.05, 0.05, 3000);
        }, i * 60);
      }
      break;
    default:
      playTone(440, 0.1, 0.1, 'sine');
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
