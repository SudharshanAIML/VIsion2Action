import { getLanguage } from './languageService';

export const speak = (text: string, onEnd?: () => void) => {
  if (!window.speechSynthesis) {
    if (onEnd) setTimeout(onEnd, 100);
    return;
  }

  if (!text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const currentLang = getLanguage();
  
  // Set language
  utterance.lang = currentLang.code;
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  
  // Attempt to find a matching voice for this language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(currentLang.code.split('-')[0]));
  
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  
  utterance.onerror = (e) => {
    // console.warn("Speech error or interruption", e);
  };

  window.speechSynthesis.speak(utterance);
};

export const vibrate = (pattern: number | number[] = 200) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const announce = (text: string) => {
  speak(text);
};

export const playEarcon = (type: 'listen' | 'stop' | 'processing') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'listen') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'stop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'processing') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.warn("Audio context error", e);
  }
};