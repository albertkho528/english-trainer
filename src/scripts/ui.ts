import { icon } from './icons';
import { speak } from './speech';

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[];

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
export const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export function sample<T>(a: T[], n: number): T[] { return shuffle(a).slice(0, n); }
export function uniqueBy<T>(a: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  return a.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; });
}

// Speaker button markup; click handled globally via data-say
export const sayBtn = (text: string, label = '', cls = '') =>
  `<button class="say ${cls}" data-say="${esc(text)}" aria-label="Play ${esc(text)}" title="Play" type="button">${icon('volume')}${label ? '<span>' + esc(label) + '</span>' : ''}</button>`;
export const slowBtn = (text: string) => `<button class="say slow" data-say="${esc(text)}" data-slow="1" type="button" aria-label="Play slowly" title="Play slowly">${icon('volume')}<span>0.5×</span></button>`;

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('[data-say]') as HTMLElement | null;
  if (b) {
    e.stopPropagation();
    speak(b.dataset.say!, b.dataset.slow === '1');
  }
}, true);

export function toast(msg: string) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

export const isTouch = () => matchMedia('(pointer: coarse)').matches;

// Highlight [form] inside a sentence
export const markSentence = (t: string) => esc(t).replace(/\[([^\]]+)\]/g, '<b>$1</b>');
export const blankSentence = (t: string) => esc(t).replace(/\[([^\]]+)\]/g, '<span class="blank">_____</span>');
export const plainSentence = (t: string) => t.replace(/\[([^\]]+)\]/g, '$1');
