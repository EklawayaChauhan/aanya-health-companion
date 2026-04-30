// Voice/accent helpers for multilingual TTS with proper Indian accents.

export type LangCode = 'en' | 'hi' | 'mr';

export const langToBCP47: Record<LangCode, string> = {
  en: 'en-IN', // Indian English accent
  hi: 'hi-IN',
  mr: 'mr-IN',
};

let cachedVoices: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    const handler = () => {
      cachedVoices = synth.getVoices();
      synth.removeEventListener('voiceschanged', handler);
      resolve(cachedVoices);
    };
    synth.addEventListener('voiceschanged', handler);
    // Safety timeout
    setTimeout(() => resolve(synth.getVoices()), 1500);
  });
}

/** Detect language from text using Devanagari script + language markers. */
export function detectLang(text: string): LangCode {
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  const total = text.replace(/\s/g, '').length;
  if (total === 0) return 'en';
  if (devanagari / total > 0.25) {
    // Marathi-specific markers
    const marathi = /\b(आहे|आहेत|करा|तुम्ही|आम्ही|नाही|होते|असते|मला|तुला|काय|कसे|कसं|माझ|त्याच|छान)\b/;
    return marathi.test(text) ? 'mr' : 'hi';
  }
  return 'en';
}

/** Pick the best voice for a given BCP-47 lang code, with sensible fallbacks. */
export function pickVoice(bcp47: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  const prefix = bcp47.split('-')[0];

  // 1. Exact match (e.g. mr-IN)
  let match = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase());
  if (match) return match;

  // 2. Prefer female-sounding Indian voices for Aanya
  const femaleHints = /(female|woman|aanya|priya|swara|kalpana|heera|veena|raveena|google.*india)/i;

  // 3. Same language prefix
  const sameLang = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  match = sameLang.find((v) => femaleHints.test(v.name)) || sameLang[0];
  if (match) return match;

  // 4. Marathi fallback → Hindi voice (closest acoustic match)
  if (prefix === 'mr') {
    const hindi = voices.filter((v) => v.lang.toLowerCase().startsWith('hi'));
    match = hindi.find((v) => femaleHints.test(v.name)) || hindi[0];
    if (match) return match;
  }

  // 5. Indian English fallback for English
  if (prefix === 'en') {
    const enIn = voices.find((v) => v.lang.toLowerCase() === 'en-in');
    if (enIn) return enIn;
  }

  return undefined;
}

/** Configure utterance with proper accent + tuning per language. */
export function configureUtterance(utter: SpeechSynthesisUtterance, lang: LangCode) {
  const bcp47 = langToBCP47[lang];
  utter.lang = bcp47;
  const voice = pickVoice(bcp47);
  if (voice) utter.voice = voice;

  // Per-language tuning for a natural, warm "Aanya" feel
  switch (lang) {
    case 'hi':
      utter.rate = 0.92;
      utter.pitch = 1.05;
      break;
    case 'mr':
      utter.rate = 0.9;
      utter.pitch = 1.05;
      break;
    case 'en':
    default:
      utter.rate = 0.95;
      utter.pitch = 1.02;
  }
}
