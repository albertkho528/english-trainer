import { icon } from './icons';
import { ENTRIES, BY_ID, SET_COUNT, posName, type Entry } from './data';
import { S, grade, isDue, MASTER_BOX } from './store';
import { $, $$, esc, shuffle, pick, sample, uniqueBy, sayBtn, slowBtn, markSentence, blankSentence, plainSentence, toast } from './ui';
import { runSession, mcq, setKeyHandler, type Ex } from './session';
import { listen, hasRecognition } from './speech';
import { sfx } from './sfx';

const card = (e: Entry) => S.vocab[e.id];
const others = (e: Entry, samePos = true) => {
  const pool = ENTRIES.filter((x) => x.id !== e.id && (!samePos || x.pos === e.pos || (e.pos === 'phr') === (x.pos === 'phr')));
  return pool.length >= 3 ? pool : ENTRIES.filter((x) => x.id !== e.id);
};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z\- ']/g, '').replace(/\s+/g, ' ').trim();
const wordHtml = (e: Entry) => `<span class="w">${esc(e.word)}</span>`;
const ipaLine = (e: Entry) => (e.ipa ? `<span class="ipa">/${esc(e.ipa)}/</span>` : '');
const sayText = (e: Entry) => e.word.replace(/sb\.|sth\./g, '').replace(/\s*\/\s*/g, ' ').replace(/[()]/g, '').replace(/\s+/g, ' ').trim();

function reveal(e: Entry, s?: { text: string }) {
  return `<div class="reveal">${wordHtml(e)} ${ipaLine(e)} ${sayBtn(sayText(e))}<div class="muted">${posName(e.pos)} — ${esc(e.def)}</div>${s ? `<div class="sent">${markSentence(s.text)} ${sayBtn(plainSentence(s.text))}</div>` : ''}</div>`;
}

// ---------------- exercise generators ----------------
type Gen = (e: Entry) => Ex | null;

const wrapEx = (type: string, label: string, e: Entry, gen: Gen, render: Ex['render']): Ex => ({
  type, label, item: e.id, render,
  retry: () => makeEx(e, true),
  onResult: (ok, first) => { if (first) grade(S.vocab, e.id, ok); },
});

const defToWord: Gen = (e) => wrapEx('def2word', 'Meaning → word', e, defToWord, (el, done) => {
  el.innerHTML = `<div class="q-label">Which word or phrase matches this meaning?</div><div class="prompt">${esc(e.def)}</div>`;
  const opts = shuffle([e, ...sample(others(e), 3)]);
  mcq(el, opts.map((o) => ({ html: esc(o.word), ok: o === e })), (ok) => done({ ok, answer: esc(e.word), html: reveal(e, pick(e.sents)) }));
});

const wordToDef: Gen = (e) => wrapEx('word2def', 'Word → meaning', e, wordToDef, (el, done) => {
  el.innerHTML = `<div class="q-label">What does this mean?</div><div class="prompt big">${wordHtml(e)} ${sayBtn(sayText(e))}</div>`;
  const opts = shuffle([e, ...sample(others(e), 3)]);
  mcq(el, opts.map((o) => ({ html: esc(o.def), ok: o === e })), (ok) => done({ ok, answer: esc(e.def), html: reveal(e, pick(e.sents)) }), 'long');
});

const synonym: Gen = (e) => {
  if (!e.syn.length) return null;
  return wrapEx('synonym', 'Choose the synonym', e, synonym, (el, done) => {
    const right = pick(e.syn);
    const bad = new Set([...e.syn, e.word].map(norm));
    const pool = uniqueBy(shuffle(others(e).flatMap((o) => o.syn)).filter((s) => !bad.has(norm(s))), norm);
    const opts = shuffle([right, ...pool.slice(0, 3)]);
    el.innerHTML = `<div class="q-label">Which is closest in meaning to…</div><div class="prompt big">${wordHtml(e)} ${sayBtn(sayText(e))}</div>`;
    mcq(el, opts.map((o) => ({ html: esc(o), ok: o === right })), (ok) =>
      done({ ok, answer: esc(right), html: `${reveal(e)}<div class="muted">All synonyms: ${esc(e.syn.join(', '))}</div>` }));
  });
};

const antonym: Gen = (e) => {
  if (!e.ant.length) return null;
  return wrapEx('antonym', 'Choose the opposite', e, antonym, (el, done) => {
    const right = pick(e.ant);
    const bad = new Set([...e.ant, e.word].map(norm));
    const pool = uniqueBy(shuffle([...e.syn, ...others(e).flatMap((o) => o.ant)]).filter((s) => !bad.has(norm(s))), norm);
    const opts = shuffle([right, ...pool.slice(0, 3)]);
    el.innerHTML = `<div class="q-label">Which is the OPPOSITE of…</div><div class="prompt big">${wordHtml(e)} ${sayBtn(sayText(e))}</div>`;
    mcq(el, opts.map((o) => ({ html: esc(o), ok: o === right })), (ok) =>
      done({ ok, answer: esc(right), html: `${reveal(e)}<div class="muted">Opposites: ${esc(e.ant.join(', '))} · Synonyms: ${esc(e.syn.join(', ') || '—')}</div>` }));
  });
};

const synToWord: Gen = (e) => {
  if (e.syn.length < 2) return null;
  return wrapEx('syn2word', 'Synonyms → word', e, synToWord, (el, done) => {
    const shown = sample(e.syn, 2);
    const bad = new Set(e.syn.map(norm));
    const opts = shuffle([e, ...sample(others(e).filter((o) => !bad.has(norm(o.word))), 3)]);
    el.innerHTML = `<div class="q-label">Which word means the same as these?</div><div class="prompt">${shown.map((s) => `<span class="chip">${esc(s)}</span>`).join(' ')}</div>`;
    mcq(el, opts.map((o) => ({ html: esc(o.word), ok: o === e })), (ok) => done({ ok, answer: esc(e.word), html: reveal(e) }));
  });
};

const gapMCQ: Gen = (e) => wrapEx('gap', 'Fill the gap', e, gapMCQ, (el, done) => {
  const s = pick(e.sents);
  const forms = uniqueBy(shuffle(others(e).flatMap((o) => o.sents.map((x) => x.form))).filter((f) => norm(f) !== norm(s.form)), norm);
  const opts = shuffle([s.form, ...forms.slice(0, 3)]);
  el.innerHTML = `<div class="q-label">Complete the sentence</div><div class="prompt">${blankSentence(s.text)}</div>`;
  mcq(el, opts.map((o) => ({ html: esc(o), ok: o === s.form })), (ok) => done({ ok, answer: esc(s.form), html: reveal(e, s) }));
});

const gapType: Gen = (e) => {
  if (e.pos === 'phr') return null;
  return wrapEx('gaptype', 'Type the missing word', e, gapType, (el, done) => {
    const s = pick(e.sents);
    const hint = s.form[0] + s.form.slice(1).replace(/[a-zA-Z]/g, '_');
    el.innerHTML = `<div class="q-label">Type the missing word</div><div class="prompt">${blankSentence(s.text)}</div>
      <div class="hint">Hint: <code>${esc(hint)}</code> · ${esc(e.def)}</div>
      <form class="typeform"><input class="txt" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type here…"><button class="btn primary">Check</button></form>`;
    const f = $('form', el) as HTMLFormElement, inp = $('input', el) as HTMLInputElement;
    setTimeout(() => inp.focus(), 50);
    f.onsubmit = (ev) => {
      ev.preventDefault();
      if (!inp.value.trim()) return;
      const v = norm(inp.value);
      const ok = v === norm(s.form);
      const close = !ok && v === norm(e.word);
      inp.disabled = true;
      done({ ok, answer: esc(s.form), html: (close ? `<div class="muted">Right word — but this sentence needs the form <b>${esc(s.form)}</b>.</div>` : '') + reveal(e, s) });
    };
  });
};

const usage: Gen = (e) => wrapEx('usage', 'Correct usage', e, usage, (el, done) => {
  const [good, alt] = shuffle(e.sents);
  const insert = (alt ?? good).form;
  const wrongs = sample(others(e), 3).map((o) => pick(o.sents).text.replace(/\[[^\]]+\]/, `[${insert}]`));
  const opts = shuffle([{ t: good.text, ok: true }, ...wrongs.map((t) => ({ t, ok: false }))]);
  el.innerHTML = `<div class="q-label">Which sentence uses <b>${esc(e.word)}</b> correctly?</div>`;
  mcq(el, opts.map((o) => ({ html: markSentence(o.t), ok: o.ok })), (ok) => done({ ok, html: reveal(e, good) }), 'long');
});

const listenSpell: Gen = (e) => {
  if (e.pos === 'phr' || /\s/.test(e.word)) return null;
  return wrapEx('listen', 'Listen & spell', e, listenSpell, (el, done) => {
    el.innerHTML = `<div class="q-label">Listen and type the word</div>
      <div class="prompt center">${sayBtn(e.word, 'Play', 'huge')} ${slowBtn(e.word)}</div>
      <div class="hint">Meaning: ${esc(e.def)}</div>
      <form class="typeform"><input class="txt" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type what you hear…"><button class="btn primary">Check</button></form>`;
    setTimeout(() => ($('[data-say]', el) as HTMLElement).click(), 250);
    const f = $('form', el) as HTMLFormElement, inp = $('input', el) as HTMLInputElement;
    setTimeout(() => inp.focus(), 50);
    f.onsubmit = (ev) => {
      ev.preventDefault();
      if (!inp.value.trim()) return;
      inp.disabled = true;
      done({ ok: norm(inp.value) === norm(e.word), answer: esc(e.word), html: reveal(e) });
    };
  });
};

const trueFalse: Gen = (e) => wrapEx('truefalse', 'True or false', e, trueFalse, (el, done) => {
  const truth = Math.random() < 0.5;
  const d = truth ? e.def : pick(others(e)).def;
  el.innerHTML = `<div class="q-label">True or false?</div><div class="prompt">${wordHtml(e)} ${sayBtn(sayText(e))} means:<br><i>“${esc(d)}”</i></div>`;
  mcq(el, [{ html: 'True', ok: truth }, { html: 'False', ok: !truth }], (ok) => done({ ok, html: reveal(e) }), 'row');
});

function matchEx(items: Entry[]): Ex {
  return {
    type: 'match', label: 'Match pairs',
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Tap the matching pairs</div><div class="match"><div class="col a"></div><div class="col b"></div></div>`;
      const A = $('.col.a', el), B = $('.col.b', el);
      let sel: HTMLElement | null = null, mistakes = 0, left = items.length;
      const mk = (txt: string, id: string, side: string) => {
        const b = document.createElement('button');
        b.className = `tile ${side}`; b.type = 'button'; b.dataset.id = id; b.innerHTML = txt;
        b.onclick = () => {
          if (b.classList.contains('gone')) return;
          if (!sel || sel.classList.contains(side)) { sel?.classList.remove('sel'); sel = b; b.classList.add('sel'); sfx.tap(); return; }
          if (sel.dataset.id === id) {
            [sel, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('gone'); });
            sfx.key(); sel = null; left--;
            if (!left) done({ ok: mistakes === 0, html: mistakes ? `${mistakes} mismatch${mistakes > 1 ? 'es' : ''} — review these words.` : '' });
          } else {
            mistakes++; sfx.wrong();
            [sel, b].forEach((x) => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake', 'sel'), 400); });
            sel = null;
          }
        };
        return b;
      };
      shuffle(items).forEach((e) => A.appendChild(mk(esc(e.word), e.id, 'a')));
      shuffle(items).forEach((e) => B.appendChild(mk(esc(e.def), e.id, 'b')));
    },
  };
}

const EASY: Gen[] = [defToWord, wordToDef, trueFalse, synToWord, gapMCQ];
const MID: Gen[] = [synonym, antonym, gapMCQ, usage, listenSpell, synToWord, defToWord];
const HARD: Gen[] = [gapType, usage, synonym, antonym, listenSpell, gapType];

function makeEx(e: Entry, retry = false): Ex {
  const box = card(e)?.box ?? 0;
  const pool = retry ? [...EASY, ...MID] : box <= 1 ? EASY : box <= 3 ? MID : HARD;
  for (let i = 0; i < 20; i++) {
    const x = pick(pool)(e);
    if (x) return x;
  }
  return defToWord(e)!;
}

// Teaching card for a new word
function teachEx(e: Entry): Ex {
  return {
    type: 'teach', label: 'New word', silent: true,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">New ${e.pos === 'phr' ? 'phrase' : 'word'}</div>${wordCard(e)}
        <button class="btn primary big gotit">Got it</button>`;
      bindCard(el, e);
      const b = $('.gotit', el);
      const go = () => { setKeyHandler(null); done({ ok: true }); };
      b.onclick = go;
      setKeyHandler((ev) => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
    },
  };
}

export function wordCard(e: Entry) {
  return `<div class="wcard">
    <div class="wc-head"><div><div class="wc-word">${esc(e.word)}</div><div class="wc-meta">${posName(e.pos)} ${ipaLine(e)}</div></div>
      <div class="wc-play">${sayBtn(sayText(e))}${slowBtn(sayText(e))}${hasRecognition() && e.pos !== 'phr' ? `<button class="say mic" type="button" aria-label="Say it" title="Say it">${icon('mic')}</button>` : ''}</div></div>
    <div class="mic-out"></div>
    <div class="wc-def">${esc(e.def)}</div>
    ${e.syn.length ? `<div class="wc-row"><span class="lbl">≈ Synonyms</span>${e.syn.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
    ${e.ant.length ? `<div class="wc-row"><span class="lbl">≠ Opposites</span>${e.ant.map((s) => `<span class="chip ant">${esc(s)}</span>`).join('')}</div>` : ''}
    <div class="wc-sents">${e.sents.map((s) => `<div class="sent">${markSentence(s.text)} ${sayBtn(plainSentence(s.text))}</div>`).join('')}</div>
  </div>`;
}
export function bindCard(el: HTMLElement, e: Entry) {
  const mic = $('.mic', el);
  if (!mic) return;
  mic.onclick = async () => {
    const out = $('.mic-out', el);
    out.textContent = 'Listening… say the word';
    try {
      const alts = await listen();
      const ok = alts.some((a) => norm(a).includes(norm(e.word)));
      out.innerHTML = ok ? `<span class="okc">${icon('check')} Recognised “${esc(alts[0] ?? '')}” — sounds right.</span>` : `<span class="badc">${icon('x')} Heard “${esc(alts[0] ?? '(nothing)')}”. Listen again and compare the IPA.</span>`;
      ok ? sfx.correct() : sfx.wrong();
    } catch (err: any) { out.textContent = err.message; }
  };
}

// ---------------- sessions ----------------
export function newWords(n = 5): Entry[] {
  return ENTRIES.filter((e) => !card(e)).slice(0, n);
}
export const dueWords = () => ENTRIES.filter((e) => isDue(card(e)));
export const weakWords = () => ENTRIES.filter((e) => card(e) && card(e).w > 0).sort((a, b) => (card(b).w - card(b).c * 0.3) - (card(a).w - card(a).c * 0.3));

export function learnSession(root: HTMLElement, back: () => void, words = newWords(5)) {
  if (!words.length) { toast('You have started every word! Review instead.'); return back(); }
  const ex: Ex[] = [];
  words.forEach((e) => ex.push(teachEx(e)));
  // quiz: easy types first, then a match round, then mid
  shuffle(words).forEach((e) => ex.push(pick([defToWord, wordToDef, trueFalse])(e)!));
  if (words.length >= 4) ex.push(matchEx(words));
  shuffle(words).forEach((e) => ex.push((pick([gapMCQ, synonym, usage])(e) ?? gapMCQ(e))!));
  // SRS: register new words
  words.forEach((e) => { S.vocab[e.id] ??= { box: 0, due: Date.now(), c: 0, w: 0, last: Date.now() }; });
  runSession(root, ex, { title: 'New words', back });
}

export function reviewSession(root: HTMLElement, back: () => void, items?: Entry[], title = 'Review') {
  let pool = items ?? dueWords();
  if (!pool.length) { toast('Nothing due right now — learn new words or practise weak ones.'); return back(); }
  pool = shuffle(pool).slice(0, 12);
  const ex: Ex[] = pool.map((e) => makeEx(e));
  if (pool.length >= 5) ex.splice(Math.floor(ex.length / 2), 0, matchEx(sample(pool, 5)));
  runSession(root, ex, { title, back });
}

// ---------------- screens ----------------
export function vocabHome(root: HTMLElement, nav: (r: string) => void) {
  const seen = ENTRIES.filter((e) => card(e)).length;
  const mastered = ENTRIES.filter((e) => (card(e)?.box ?? 0) >= MASTER_BOX).length;
  const due = dueWords().length;
  const weak = weakWords().length;
  root.innerHTML = `
    <h1>Vocabulary</h1>
    <div class="kpis">
      <div class="kpi"><b>${seen}</b><span>started / ${ENTRIES.length}</span></div>
      <div class="kpi"><b>${mastered}</b><span>mastered</span></div>
      <div class="kpi"><b>${due}</b><span>due now</span></div>
    </div>
    <div class="actions">
      <button class="act primary" data-go="vocab/learn"><span class="ai">${icon('plus')}</span><div><b>Learn 5 new words</b><small>Cards first, then quizzes</small></div></button>
      <button class="act ${due ? 'hot' : ''}" data-go="vocab/review"><span class="ai">${icon('repeat')}</span><div><b>Review due (${due})</b><small>Spaced repetition — mixed question types</small></div></button>
      <button class="act" data-go="vocab/weak" ${weak ? '' : 'disabled'}><span class="ai">${icon('target')}</span><div><b>Weak words (${weak})</b><small>Words you got wrong most</small></div></button>
      <button class="act" data-go="vocab/mixed" ${seen >= 4 ? '' : 'disabled'}><span class="ai">${icon('shuffle')}</span><div><b>Mixed practice</b><small>Random words you've started</small></div></button>
    </div>
    <h2>Sets</h2>
    <div class="sets">${Array.from({ length: SET_COUNT }, (_, i) => {
      const s = i + 1, es = ENTRIES.filter((e) => e.set === s);
      const st = es.filter((e) => card(e)).length, ms = es.filter((e) => (card(e)?.box ?? 0) >= MASTER_BOX).length;
      return `<button class="set" data-go="vocab/set/${s}"><b>Set ${s}</b><div class="mini"><i style="width:${(st / es.length) * 100}%"></i><i class="m" style="width:${(ms / es.length) * 100}%"></i></div><small>${ms}/${es.length} mastered</small></button>`;
    }).join('')}</div>
    <h2>Dictionary</h2>
    <input class="txt search" placeholder="Search ${ENTRIES.length} words & phrases…">
    <div class="dict"></div>`;
  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
  const inp = $('.search', root) as HTMLInputElement, dict = $('.dict', root);
  inp.oninput = () => {
    const q = inp.value.trim().toLowerCase();
    dict.innerHTML = q ? ENTRIES.filter((e) => e.word.toLowerCase().includes(q) || e.def.toLowerCase().includes(q) || e.syn.some((s) => s.includes(q))).slice(0, 15)
      .map((e) => `<button class="drow" data-go="vocab/word/${encodeURIComponent(e.id)}"><b>${esc(e.word)}</b> ${ipaLine(e)}<small>${esc(e.def)}</small></button>`).join('') : '';
    $$('[data-go]', dict).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
  };
}

export function setPage(root: HTMLElement, s: number, nav: (r: string) => void) {
  const es = ENTRIES.filter((e) => e.set === s);
  const lvl = (e: Entry) => { const c = card(e); if (!c) return ['new', 'New']; if (c.box >= MASTER_BOX) return ['mast', 'Mastered']; if (c.box >= 2) return ['fam', 'Familiar']; return ['lrn', 'Learning']; };
  root.innerHTML = `<button class="back" data-go="vocab">${icon('left')}Vocabulary</button><h1>Set ${s}</h1>
    <div class="actions">
      <button class="act primary" data-act="learn"><span class="ai">${icon('plus')}</span><div><b>Learn new from this set</b><small>${es.filter((e) => !card(e)).length} not started</small></div></button>
      <button class="act" data-act="practice"><span class="ai">${icon('shuffle')}</span><div><b>Practise this set</b><small>Words you've started here</small></div></button>
    </div>
    <div class="dict">${es.map((e) => { const [c, l] = lvl(e); return `<button class="drow" data-go="vocab/word/${encodeURIComponent(e.id)}"><b>${esc(e.word)}</b> ${ipaLine(e)} <span class="lvl ${c}">${l}</span><small>${esc(e.def)}</small></button>`; }).join('')}</div>`;
  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
  $('[data-act=learn]', root).onclick = () => { const w = es.filter((e) => !card(e)).slice(0, 5); w.length ? learnSession(root, () => nav(`vocab/set/${s}`), w) : toast('All words in this set are started.'); };
  $('[data-act=practice]', root).onclick = () => { const w = es.filter((e) => card(e)); w.length >= 2 ? reviewSession(root, () => nav(`vocab/set/${s}`), w, `Set ${s}`) : toast('Learn some words from this set first.'); };
}

export function wordPage(root: HTMLElement, id: string, nav: (r: string) => void) {
  const e = BY_ID[id];
  if (!e) return nav('vocab');
  const c = card(e);
  root.innerHTML = `<button class="back" data-go="vocab/set/${e.set}">${icon('left')}Set ${e.set}</button>${wordCard(e)}
    <p class="muted">${c ? `Correct ${c.c} · Wrong ${c.w} · Level ${c.box}/6 · Next review ${c.due <= Date.now() ? 'now' : new Date(c.due).toLocaleDateString()}` : 'Not started yet.'}</p>
    ${e.ipa && !/\s/.test(e.ipa) ? `<button class="btn" data-go="phon/word/${encodeURIComponent(e.id)}">Practise the IPA of this word ${icon('arrow')}</button>` : ''}`;
  bindCard(root, e);
  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
}
