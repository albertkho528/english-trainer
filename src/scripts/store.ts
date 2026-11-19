// Local progress storage (per device) + spaced repetition + statistics log.

export type Card = { box: number; due: number; c: number; w: number; last: number };
export type Day = { xp: number; c: number; w: number; secs: number; lessons: number };

export type State = {
  v: 1;
  settings: { voice: string; rate: number; goal: number; keyboard: 'auto' | 'show' | 'hide' };
  days: Record<string, Day>;
  vocab: Record<string, Card>;
  ipaWords: Record<string, Card>;
  units: Record<number, number>; // unit id -> levels completed (0..3)
  ex: Record<string, { c: number; w: number }>; // accuracy per exercise type
  sym: Record<string, { c: number; w: number }>; // per IPA symbol accuracy
  conf: Record<string, number>; // "want>got" confusions
};

const KEY = 'english-trainer-v1';
const blank = (): State => ({
  v: 1,
  settings: { voice: '', rate: 0.9, goal: 50, keyboard: 'auto' },
  days: {}, vocab: {}, ipaWords: {}, units: {}, ex: {}, sym: {}, conf: {},
});

export let S: State = load();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch {}
  return blank();
}

let saveTimer: any;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  }, 150);
}

export function exportData(): string {
  return JSON.stringify(S);
}
export function importData(json: string) {
  const d = JSON.parse(json);
  if (!d || d.v !== 1) throw new Error('Not a valid backup file');
  S = { ...blank(), ...d };
  localStorage.setItem(KEY, JSON.stringify(S));
}
export function resetAll() {
  S = blank();
  localStorage.setItem(KEY, JSON.stringify(S));
}

// ---------- dates ----------
export const dayKey = (d = new Date()) => {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export function today(): Day {
  const k = dayKey();
  return (S.days[k] ??= { xp: 0, c: 0, w: 0, secs: 0, lessons: 0 });
}
export function streak(): number {
  let n = 0;
  const d = new Date();
  if (!S.days[dayKey(d)]?.xp) d.setDate(d.getDate() - 1); // today not done yet doesn't break streak
  while (S.days[dayKey(d)]?.xp) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export const totalXP = () => Object.values(S.days).reduce((a, d) => a + d.xp, 0);

// ---------- logging ----------
export function logAnswer(type: string, ok: boolean) {
  const t = today();
  ok ? t.c++ : t.w++;
  const e = (S.ex[type] ??= { c: 0, w: 0 });
  ok ? e.c++ : e.w++;
  save();
}
export function addXP(n: number) { today().xp += n; save(); }
export function logSymbol(want: string, got: string | null) {
  const s = (S.sym[want] ??= { c: 0, w: 0 });
  if (got === want) s.c++;
  else {
    s.w++;
    if (got) S.conf[`${want}>${got}`] = (S.conf[`${want}>${got}`] ?? 0) + 1;
  }
  save();
}
let tick: any;
export function startTimer() {
  clearInterval(tick);
  tick = setInterval(() => { if (document.visibilityState === 'visible') { today().secs += 10; save(); } }, 10000);
}

// ---------- spaced repetition (Leitner boxes) ----------
const DAY = 86400000;
const INTERVALS = [0, 1, 2, 4, 8, 16, 35]; // days for box 0..6
export const MASTER_BOX = 4;

export function grade(deck: Record<string, Card>, id: string, ok: boolean) {
  const now = Date.now();
  const c = (deck[id] ??= { box: 0, due: now, c: 0, w: 0, last: now });
  if (ok) { c.c++; c.box = Math.min(6, c.box + 1); }
  else { c.w++; c.box = Math.max(0, c.box - 2); }
  c.last = now;
  c.due = ok ? now + INTERVALS[c.box] * DAY : now + 10 * 60000; // wrong -> again in 10 min
  save();
}
export const isDue = (c?: Card) => !!c && c.due <= Date.now();
