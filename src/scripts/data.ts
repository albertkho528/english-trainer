import v1 from '../data/vocab1.txt?raw';
import v2 from '../data/vocab2.txt?raw';
import v3 from '../data/vocab3.txt?raw';
import v4 from '../data/vocab4.txt?raw';
import v5 from '../data/vocab5.txt?raw';
import ph from '../data/phrases.txt?raw';

export type Entry = {
  id: string;
  word: string;
  pos: string; // n v adj adv prep phr
  ipa: string;
  def: string;
  syn: string[];
  ant: string[];
  sents: { text: string; form: string }[]; // text with [form]
  set: number; // learning set (20 entries each)
};

const POS_NAME: Record<string, string> = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', prep: 'preposition', phr: 'phrase' };
export const posName = (p: string) => POS_NAME[p] ?? p;

function parse(raw: string): Entry[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [word, pos, ipa, def, syn, ant, s1, s2] = l.split('|');
      const sents = [s1, s2].filter(Boolean).map((t) => ({ text: t, form: (t.match(/\[([^\]]+)\]/) ?? ['', word])[1] }));
      return {
        id: word, word, pos, ipa, def,
        syn: syn ? syn.split(',').map((s) => s.trim()).filter(Boolean) : [],
        ant: ant ? ant.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sents, set: 0,
      };
    });
}

// Deterministic shuffle so learning sets mix the alphabet but stay stable between visits.
function seeded<T>(a: T[], seed: number): T[] {
  const b = a.slice();
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const words = seeded([v1, v2, v3, v4, v5].flatMap(parse), 528);
const phrases = seeded(parse(ph), 2025);

// Interleave so each set of 20 mixes words (alphabetical) and some phrases.
export const ENTRIES: Entry[] = [];
{
  let wi = 0, pi = 0;
  while (wi < words.length || pi < phrases.length) {
    for (let k = 0; k < 16 && wi < words.length; k++) ENTRIES.push(words[wi++]);
    for (let k = 0; k < 4 && pi < phrases.length; k++) ENTRIES.push(phrases[pi++]);
  }
  ENTRIES.forEach((e, i) => (e.set = Math.floor(i / 20) + 1));
}
export const BY_ID: Record<string, Entry> = Object.fromEntries(ENTRIES.map((e) => [e.id, e]));
export const SET_COUNT = Math.max(...ENTRIES.map((e) => e.set));

// Entries with a single-word IPA usable for transcription drills
export const IPA_ENTRIES = ENTRIES.filter((e) => e.ipa && !/\s/.test(e.ipa) && e.pos !== 'phr');
