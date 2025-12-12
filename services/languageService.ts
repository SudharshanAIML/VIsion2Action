import { LanguageDefinition, TranslationKey } from '../types';

const STORAGE_KEY = 'v2a_language';

export const LANGUAGES: LanguageDefinition[] = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' }
];

const TRANSLATIONS: Record<string, Record<TranslationKey, string>> = {
  'en-US': {
    listening: 'Listening...',
    processing: 'Thinking...',
    paused: 'Paused',
    monitoring: 'Monitoring',
    hazard: 'HAZARD DETECTED',
    nav_active: 'Navigation Active',
    tap_start: 'Tap to Start',
    tap_pause: 'Tap to Pause',
    hold_ask: 'Hold to Ask',
    scanning: 'Scanning...',
    mic_error: 'Microphone Error',
    welcome: 'Vision to Action. Tap anywhere to start.'
  },
  'es-ES': {
    listening: 'Escuchando...',
    processing: 'Pensando...',
    paused: 'Pausado',
    monitoring: 'Monitorizando',
    hazard: 'PELIGRO DETECTADO',
    nav_active: 'Navegación Activa',
    tap_start: 'Toca para Iniciar',
    tap_pause: 'Toca para Pausar',
    hold_ask: 'Mantén para Preguntar',
    scanning: 'Escaneando...',
    mic_error: 'Error de Micrófono',
    welcome: 'Visión a Acción. Toca para comenzar.'
  },
  'fr-FR': {
    listening: 'Écoute...',
    processing: 'Réflexion...',
    paused: 'En pause',
    monitoring: 'Surveillance',
    hazard: 'DANGER DÉTECTÉ',
    nav_active: 'Navigation Active',
    tap_start: 'Appuyez pour Démarrer',
    tap_pause: 'Appuyez pour Pauser',
    hold_ask: 'Maintenez pour Demander',
    scanning: 'Scan en cours...',
    mic_error: 'Erreur Microphone',
    welcome: 'Vision vers Action. Appuyez pour commencer.'
  },
  'hi-IN': {
    listening: 'सुन रहा हूँ...',
    processing: 'सोच रहा हूँ...',
    paused: 'रुका हुआ',
    monitoring: 'निगरानी',
    hazard: 'खतरा है',
    nav_active: 'नेविगेशन सक्रिय',
    tap_start: 'शुरू करने के लिए दबाएं',
    tap_pause: 'रुकने के लिए दबाएं',
    hold_ask: 'पूछने के लिए दबाए रखें',
    scanning: 'स्कैनिंग...',
    mic_error: 'माइक्रोफ़ोन त्रुटि',
    welcome: 'विजन टू एक्शन। शुरू करने के लिए कहीं भी टैप करें।'
  },
  'de-DE': {
    listening: 'Zuhören...',
    processing: 'Nachdenken...',
    paused: 'Pausiert',
    monitoring: 'Überwachung',
    hazard: 'GEFAHR ERKANNT',
    nav_active: 'Navigation Aktiv',
    tap_start: 'Tippen zum Starten',
    tap_pause: 'Tippen zum Pausieren',
    hold_ask: 'Halten zum Fragen',
    scanning: 'Scannen...',
    mic_error: 'Mikrofonfehler',
    welcome: 'Vision zu Aktion. Tippen Sie zum Starten.'
  },
  'ja-JP': {
    listening: '聞いています...',
    processing: '考え中...',
    paused: '一時停止',
    monitoring: '監視中',
    hazard: '危険を検知',
    nav_active: 'ナビゲーション開始',
    tap_start: 'タップして開始',
    tap_pause: 'タップして停止',
    hold_ask: '長押しで質問',
    scanning: 'スキャン中...',
    mic_error: 'マイクエラー',
    welcome: 'Vision to Action。画面をタップして開始。'
  }
};

let currentLanguage = LANGUAGES[0]; // Default English

// Initialize from storage
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const found = LANGUAGES.find(l => l.code === stored);
    if (found) currentLanguage = found;
  }
} catch (e) {
  console.warn("Could not load language preference");
}

export const getLanguage = () => currentLanguage;

export const setLanguage = (code: string) => {
  const found = LANGUAGES.find(l => l.code === code);
  if (found) {
    currentLanguage = found;
    localStorage.setItem(STORAGE_KEY, code);
  }
  return currentLanguage;
};

export const cycleLanguage = () => {
  const currentIndex = LANGUAGES.findIndex(l => l.code === currentLanguage.code);
  const nextIndex = (currentIndex + 1) % LANGUAGES.length;
  return setLanguage(LANGUAGES[nextIndex].code);
};

export const t = (key: TranslationKey): string => {
  const langPack = TRANSLATIONS[currentLanguage.code] || TRANSLATIONS['en-US'];
  return langPack[key] || TRANSLATIONS['en-US'][key];
};
