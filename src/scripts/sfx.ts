// Synthesized sound effects (Web Audio API) — no audio files needed, works offline.
let ctx: AudioContext | null = null;
let enabled = true;
try { enabled = localStorage.getItem('sfx') !== '0'; } catch {}

export const sfxOn = () => enabled;
export function setSfx(on: boolean) { enabled = on; try { localStorage.setItem('sfx', on ? '1' : '0'); } catch {} }

function ac(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const C = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx!.state === 'suspended') ctx!.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap() { tone(520, 0, 0.05, 'triangle', 0.08); },
  correct() { tone(660, 0, 0.12, 'sine', 0.2); tone(990, 0.09, 0.22, 'sine', 0.2); },
  wrong() { tone(220, 0, 0.18, 'square', 0.07, 160); tone(150, 0.12, 0.25, 'square', 0.06, 110); },
  combo(n: number) { const base = 600 + Math.min(n, 10) * 40; tone(base, 0, 0.08, 'triangle', 0.12); tone(base * 1.5, 0.07, 0.12, 'triangle', 0.12); },
  finish() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.5 : 0.18, 'triangle', 0.18)); },
  unlock() { tone(784, 0, 0.1, 'sine', 0.15); tone(1175, 0.1, 0.3, 'sine', 0.15); },
  key() { tone(880, 0, 0.03, 'triangle', 0.05); },
};
