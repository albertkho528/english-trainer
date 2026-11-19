import { SYMBOL_MAP } from '../data/phonetics';

// Multi-character phonemes first (longest match).
const MULTI = ['tʃ', 'dʒ', 'iː', 'uː', 'ɑː', 'ɔː', 'ɜː', 'eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'ɪə', 'eə', 'ʊə'];

export function normalize(s: string): string {
  return s
    .replace(/[\/\[\]]/g, '')
    .replace(/[’'‘`]/g, 'ˈ')
    .replace(/:/g, 'ː')
    .replace(/g/g, 'ɡ')
    .replace(/ɛ/g, 'e')
    .replace(/ɹ/g, 'r')
    .replace(/[()\.\s‿]/g, '')
    .replace(/̩/g, ''); // syllabic mark
}

export function tokenize(ipa: string): string[] {
  const s = normalize(ipa);
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (MULTI.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(s[i]);
      i += 1;
    }
  }
  return out;
}

export const isMark = (t: string) => t === 'ˈ' || t === 'ˌ';

export type DiffOp = { op: 'ok' | 'sub' | 'del' | 'ins'; want?: string; got?: string };

const VOWELISH = /[ɪeæʌɒʊəiuɑɔɜaː]/;
const cat = (t: string) => (t === 'ˈ' || t === 'ˌ' ? 'm' : VOWELISH.test(t) && !['j', 'w'].includes(t) ? 'v' : 'c');
const subCost = (a: string, b: string) => (a === b ? 0 : cat(a) === cat(b) ? (CONFUSE[a]?.includes(b) ? 0.5 : 0.7) : 1.6);

// Weighted Levenshtein alignment between correct (want) and user (got) token arrays.
export function diff(want: string[], got: string[]): DiffOp[] {
  const n = want.length, m = got.length;
  const d: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + subCost(want[i - 1], got[j - 1]));
  const ops: DiffOp[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && Math.abs(d[i][j] - (d[i - 1][j - 1] + subCost(want[i - 1], got[j - 1]))) < 1e-9) {
      ops.push(want[i - 1] === got[j - 1] ? { op: 'ok', want: want[i - 1], got: got[j - 1] } : { op: 'sub', want: want[i - 1], got: got[j - 1] });
      i--; j--;
    } else if (i > 0 && Math.abs(d[i][j] - (d[i - 1][j] + 1)) < 1e-9) {
      ops.push({ op: 'del', want: want[i - 1] });
      i--;
    } else {
      ops.push({ op: 'ins', got: got[j - 1] });
      j--;
    }
  }
  return ops.reverse();
}

export function stripStress(t: string[]) {
  return t.filter((x) => !isMark(x));
}

export function describe(sym: string): string {
  const s = SYMBOL_MAP[sym];
  if (!s) return `/${sym}/`;
  if (s.kind === 'mark') return `${s.name} mark`;
  return `/${sym}/ as in "${s.key}"`;
}

// Confusable symbols, used for distractors and mutations.
export const CONFUSE: Record<string, string[]> = {
  'ɪ': ['iː', 'e', 'i'], e: ['æ', 'ɪ', 'eɪ'], 'æ': ['e', 'ʌ', 'ɑː'], 'ʌ': ['æ', 'ɒ', 'ɑː', 'ə'], 'ɒ': ['ɔː', 'ʌ', 'əʊ'],
  'ʊ': ['uː', 'ʌ'], 'ə': ['ʌ', 'ɜː', 'e'], 'iː': ['ɪ', 'eɪ'], 'uː': ['ʊ', 'əʊ'], 'ɑː': ['ʌ', 'æ', 'ɔː'], 'ɔː': ['ɒ', 'əʊ', 'ɑː'],
  'ɜː': ['e', 'ɔː', 'ə'], 'θ': ['t', 's', 'f', 'ð'], 'ð': ['d', 'z', 'θ'], s: ['ʃ', 'z', 'θ'], z: ['s', 'ʒ'], 'ʃ': ['s', 'tʃ', 'ʒ'],
  'ʒ': ['ʃ', 'dʒ', 'z'], 'tʃ': ['ʃ', 'dʒ', 't'], 'dʒ': ['tʃ', 'ʒ', 'j'], v: ['f', 'w'], f: ['v', 'θ'], w: ['v'], j: ['dʒ'],
  r: ['l'], l: ['r'], 'ŋ': ['n', 'ɡ'], n: ['ŋ', 'm'], m: ['n'], p: ['b'], b: ['p'], t: ['d', 'θ'], d: ['t', 'ð'], k: ['ɡ'], 'ɡ': ['k', 'dʒ'],
  h: [], 'eɪ': ['e', 'aɪ', 'iː'], 'aɪ': ['eɪ', 'ɔɪ'], 'ɔɪ': ['aɪ', 'ɔː'], 'əʊ': ['ɒ', 'ɔː', 'aʊ'], 'aʊ': ['əʊ', 'ɑː'],
  'ɪə': ['iː', 'eə'], 'eə': ['ɪə', 'e'], 'ʊə': ['ɔː', 'uː'], i: ['ɪ', 'iː'], u: ['ʊ', 'uː'],
};

// ---------- Physical keyboard mapping (PC) ----------
// Press a key once -> first symbol. Press the same key again right away -> cycles to the next symbol.
export const KEYMAP: Record<string, string[]> = {
  a: ['æ', 'ʌ', 'ɑː', 'aɪ', 'aʊ'],
  e: ['e', 'ə', 'ɜː', 'eɪ', 'eə'],
  i: ['ɪ', 'iː', 'i', 'ɪə'],
  o: ['ɒ', 'ɔː', 'əʊ', 'ɔɪ'],
  u: ['ʊ', 'uː', 'u', 'ʊə', 'ʌ'],
  x: ['ə', 'ɜː', 'əʊ'],
  t: ['t', 'θ', 'tʃ'],
  d: ['d', 'ð', 'dʒ'],
  s: ['s', 'ʃ'],
  z: ['z', 'ʒ'],
  n: ['n', 'ŋ'],
  c: ['tʃ', 'ʃ'],
  j: ['dʒ', 'j'],
  y: ['j'],
  g: ['ɡ'],
  p: ['p'], b: ['b'], k: ['k'], f: ['f'], v: ['v'], h: ['h'], m: ['m'], l: ['l'], r: ['r'], w: ['w'],
  "'": ['ˈ'], ',': ['ˌ'], ';': ['ˈ', 'ˌ'], ':': ['ː'],
};

export const KEY_HINT = [
  ['a', 'æ ʌ ɑː aɪ aʊ'], ['e', 'e ə ɜː eɪ eə'], ['i', 'ɪ iː i ɪə'], ['o', 'ɒ ɔː əʊ ɔɪ'], ['u', 'ʊ uː u ʊə ʌ'], ['x', 'ə ɜː əʊ'],
  ['t', 't θ tʃ'], ['d', 'd ð dʒ'], ['s', 's ʃ'], ['z', 'z ʒ'], ['n', 'n ŋ'], ['c', 'tʃ ʃ'], ['j', 'dʒ j'], ['y', 'j'], ["'", 'ˈ'], [',', 'ˌ'],
];
