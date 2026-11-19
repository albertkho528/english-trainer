import { S } from './store';

let voices: SpeechSynthesisVoice[] = [];
const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices();
}
if (synth) {
  loadVoices();
  synth.onvoiceschanged = loadVoices;
}

export function britishVoices(): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb'));
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const gb = britishVoices();
  if (S.settings.voice) {
    const v = voices.find((x) => x.voiceURI === S.settings.voice);
    if (v) return v;
  }
  // Prefer natural/online voices (Edge: "Microsoft Sonia Online (Natural)")
  return gb.find((v) => /natural|online|neural/i.test(v.name)) ?? gb.find((v) => /google/i.test(v.name)) ?? gb[0];
}

export function speak(text: string, slow = false) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = 'en-GB';
  u.rate = slow ? 0.55 : S.settings.rate;
  synth.speak(u);
}

export const hasSpeech = () => !!synth;
export const hasBritishVoice = () => britishVoices().length > 0;

// Optional speech recognition ("say it") — Chrome/Edge/Android Chrome.
export function listen(): Promise<string[]> {
  const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return Promise.reject(new Error('Speech recognition is not supported in this browser.'));
  return new Promise((resolve, reject) => {
    const r = new SR();
    r.lang = 'en-GB';
    r.maxAlternatives = 5;
    r.interimResults = false;
    r.onresult = (e: any) => resolve(Array.from(e.results[0]).map((a: any) => a.transcript.toLowerCase().trim()));
    r.onerror = (e: any) => reject(new Error(e.error || 'recognition error'));
    r.onnomatch = () => resolve([]);
    r.start();
  });
}
export const hasRecognition = () => !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
