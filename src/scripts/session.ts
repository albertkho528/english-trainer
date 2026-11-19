// Generic Duolingo-style lesson runner.
import { icon } from './icons';
import { $, esc } from './ui';
import { addXP, logAnswer, today, save } from './store';
import { sfx } from './sfx';

export type Feedback = { ok: boolean; answer?: string; html?: string };
export type Ex = {
  type: string; // exercise type key (for stats)
  label: string; // human name
  item?: string; // SRS item id
  render: (el: HTMLElement, done: (fb: Feedback) => void) => void;
  retry?: () => Ex; // a fresh exercise on the same item (for mistakes)
  onResult?: (ok: boolean, first: boolean) => void;
  silent?: boolean; // teaching card: no grading, no feedback panel
};

export const EX_NAMES: Record<string, string> = {};

type Opts = { title: string; xpPer?: number; onFinish?: (r: { correct: number; wrong: number; xp: number }) => void; back: () => void };

let keyHandler: ((e: KeyboardEvent) => void) | null = null;
export function setKeyHandler(h: ((e: KeyboardEvent) => void) | null) { keyHandler = h; }
document.addEventListener('keydown', (e) => keyHandler?.(e));

export function runSession(root: HTMLElement, exercises: Ex[], o: Opts) {
  exercises.forEach((x) => (EX_NAMES[x.type] = x.label));
  const queue = exercises.slice();
  const total = queue.filter((x) => !x.silent).length;
  let doneCount = 0, correct = 0, wrong = 0, combo = 0, xp = 0;
  const firstTry = new Set<Ex>(exercises);
  const mistakes: string[] = [];
  const start = Date.now();

  root.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon-btn quit" aria-label="Quit">${icon('x')}</button>
        <div class="bar"><div class="bar-fill"></div></div>
        <div class="combo"></div>
      </div>
      <div class="ex-area"></div>
      <div class="fb"></div>
    </div>`;
  const area = $('.ex-area', root), fb = $('.fb', root), fill = $('.bar-fill', root), comboEl = $('.combo', root);
  $('.quit', root).onclick = () => { if (confirm('Quit this lesson? Progress in this lesson is lost.')) { setKeyHandler(null); o.back(); } };

  function next() {
    fill.style.width = `${(doneCount / exercises.length) * 100}%`;
    fb.className = 'fb';
    fb.innerHTML = '';
    if (!queue.length) return finish();
    const ex = queue.shift()!;
    area.innerHTML = '';
    area.scrollTop = 0;
    const box = document.createElement('div');
    box.className = 'ex';
    area.appendChild(box);
    let answered = false;
    setKeyHandler(null);
    ex.render(box, (f) => {
      if (answered) return;
      answered = true;
      if (ex.silent) { doneCount++; return next(); }
      const first = firstTry.has(ex);
      logAnswer(ex.type, f.ok);
      ex.onResult?.(f.ok, first);
      if (f.ok) {
        combo++;
        correct += first ? 1 : 0;
        doneCount++;
        const gain = (o.xpPer ?? 2) + (combo >= 5 ? 1 : 0);
        xp += gain;
      } else {
        combo = 0;
        wrong++;
        if (ex.item) mistakes.push(ex.item);
        // retry later with a different exercise on the same item
        const r = (ex.retry && ex.retry()) || ex;
        firstTry.delete(r);
        queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 3)), 0, r);
      }
      comboEl.innerHTML = combo >= 3 ? `${icon('flame')}<span>${combo}</span>` : '';
      if (f.ok) { if (combo >= 3 && combo % 5 === 0) sfx.combo(combo); else sfx.correct(); } else sfx.wrong();
      box.classList.add('locked');
      fb.className = `fb show ${f.ok ? 'good' : 'bad'}`;
      fb.innerHTML = `
        <div class="fb-inner">
          <div class="fb-title">${icon(f.ok ? 'check' : 'x', 'fb-ic')}${f.ok ? pickPraise() : 'Not quite'}</div>
          ${!f.ok && f.answer ? `<div class="fb-ans">Correct answer: <b>${f.answer}</b></div>` : ''}
          ${f.html ? `<div class="fb-more">${f.html}</div>` : ''}
          <button class="btn primary cont">Continue</button>
        </div>`;
      const cont = $('.cont', fb);
      cont.onclick = () => next();
      setTimeout(() => cont.focus(), 30);
      setKeyHandler((e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    });
  }

  function finish() {
    setKeyHandler(null);
    sfx.finish();
    addXP(xp);
    today().lessons++;
    save();
    const acc = Math.round((correct / Math.max(1, total)) * 100);
    const secs = Math.round((Date.now() - start) / 1000);
    root.innerHTML = `
      <div class="finish">
        <div class="finish-badge ${acc >= 90 ? 'gold' : acc >= 70 ? 'good' : 'ok'}">${icon(acc >= 90 ? 'trophy' : acc >= 70 ? 'star' : 'zap')}</div>
        <h2>${esc(o.title)} complete!</h2>
        <div class="finish-stats">
          <div><b>+${xp}</b><span>XP</span></div>
          <div><b>${acc}%</b><span>first-try accuracy</span></div>
          <div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b><span>time</span></div>
        </div>
        ${mistakes.length ? `<p class="muted">Practise again: ${[...new Set(mistakes)].slice(0, 12).map(esc).join(', ')}</p>` : '<p class="muted">Perfect run — no mistakes!</p>'}
        <button class="btn primary big done">Continue</button>
      </div>`;
    o.onFinish?.({ correct, wrong, xp });
    const b = $('.done', root);
    b.onclick = () => o.back();
    setKeyHandler((e) => { if (e.key === 'Enter') { setKeyHandler(null); o.back(); } });
  }

  next();
}

const PRAISE = ['Correct!', 'Nice!', 'Great job!', 'Excellent!', 'Well done!', 'Spot on!'];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

// ---------- common exercise widgets ----------
export function mcq(el: HTMLElement, opts: { html: string; ok: boolean; key?: string }[], done: (ok: boolean, chosen: number) => void, cls = '') {
  const wrap = document.createElement('div');
  wrap.className = `options ${cls}`;
  opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.type = 'button';
    b.innerHTML = `<span class="k">${i + 1}</span><span class="t">${o.html}</span>`;
    b.onclick = (e) => {
      if ((e.target as HTMLElement).closest('[data-say]')) return;
      choose(i);
    };
    wrap.appendChild(b);
  });
  el.appendChild(wrap);
  let locked = false;
  function choose(i: number) {
    if (locked) return;
    locked = true;
    const btns = Array.from(wrap.children) as HTMLElement[];
    btns.forEach((b, j) => {
      if (opts[j].ok) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
    });
    done(opts[i].ok, i);
  }
  setKeyHandler((e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= opts.length) choose(n - 1);
  });
}
