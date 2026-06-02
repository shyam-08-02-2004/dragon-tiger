// src/utils/voice.ts
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Win = window as any;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
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

export type SoundVariant = 'dragon' | 'tiger' | 'tie' | 'double' | 'clear' | 'notify' | 'win' | 'lose';

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
