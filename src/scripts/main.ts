import { icon } from './icons';
import { S, save, today, streak, totalXP, exportData, importData, resetAll, startTimer, isDue } from './store';
import { $, $$, esc, toast } from './ui';
import { vocabHome, learnSession, reviewSession, setPage, wordPage, weakWords, dueWords, newWords } from './vocab';
import { phonHome, phonLesson, library, pairsTrainer, vocabDrill, unitUnlocked } from './phon';
import { statsPage } from './stats';
import { britishVoices, speak, hasSpeech } from './speech';
import { setKeyHandler } from './session';
import { sfxOn, setSfx, sfx } from './sfx';
import { UNITS } from '../data/phonetics';
import { ENTRIES, IPA_ENTRIES } from './data';
import { shuffle } from './ui';

const app = $('#app');
const nav = (r: string) => { if (location.hash === '#' + r) route(); else location.hash = r; };

function setTab(t: string) {
  $$('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === t));
}

function route() {
  setKeyHandler(null);
  window.speechSynthesis?.cancel();
  const r = decodeURIComponent(location.hash.slice(1)) || 'home';
  const p = r.split('/');
  document.body.classList.toggle('in-lesson', false);
  const lesson = () => document.body.classList.add('in-lesson');
  window.scrollTo(0, 0);
  setTab(p[0]);
  switch (p[0]) {
    case 'vocab':
      if (p[1] === 'learn') { lesson(); return learnSession(app, () => nav('vocab')); }
      if (p[1] === 'review') { lesson(); return reviewSession(app, () => nav('vocab')); }
      if (p[1] === 'weak') { lesson(); return reviewSession(app, () => nav('vocab'), weakWords().slice(0, 12), 'Weak words'); }
      if (p[1] === 'mixed') { lesson(); return reviewSession(app, () => nav('vocab'), shuffle(ENTRIES.filter((e) => S.vocab[e.id])).slice(0, 12), 'Mixed practice'); }
      if (p[1] === 'set') return setPage(app, +p[2], nav);
      if (p[1] === 'word') return wordPage(app, p.slice(2).join('/'), nav);
      return vocabHome(app, nav);
    case 'phon':
      if (p[1] === 'lesson') { lesson(); return phonLesson(app, +p[2], +p[3], nav); }
      if (p[1] === 'library') return library(app, nav, p[2]);
      if (p[1] === 'pairs') { lesson(); return pairsTrainer(app, nav); }
      if (p[1] === 'drill') { lesson(); return vocabDrill(app, nav); }
      if (p[1] === 'word') { lesson(); return vocabDrill(app, nav, p.slice(2).join('/')); }
      return phonHome(app, nav);
    case 'stats':
      return statsPage(app, nav);
    case 'settings':
      return settings();
    default:
      return home();
  }
}

function nextPhonLesson(): string | null {
  for (const u of UNITS) {
    const lv = S.units[u.id] ?? 0;
    if (lv < 3 && unitUnlocked(u.id)) return `phon/lesson/${u.id}/${lv + 1}`;
  }
  return null;
}

function home() {
  const t = today();
  const goal = S.settings.goal;
  const pct = Math.min(1, t.xp / goal);
  const due = dueWords().length;
  const nl = nextPhonLesson();
  const nlUnit = nl ? UNITS.find((u) => u.id === +nl.split('/')[2]) : null;
  const ipaDue = IPA_ENTRIES.filter((e) => isDue(S.ipaWords[e.id])).length;
  const R = 34, C = 2 * Math.PI * R;
  app.innerHTML = `
    <div class="hero">
      <div><h1>Hi, Albert</h1><p class="muted">${t.xp >= goal ? 'Daily goal reached — great work!' : `${goal - t.xp} XP to reach today's goal.`}</p>
        <div class="streak"><span>${icon('flame')}<b>${streak()}</b> day streak</span><span>${icon('star')}<b>${totalXP()}</b> XP total</span></div></div>
      <svg viewBox="0 0 80 80" class="ring"><circle cx="40" cy="40" r="${R}" class="ring-bg"/><circle cx="40" cy="40" r="${R}" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/><text x="40" y="38" text-anchor="middle" class="ring-t">${t.xp}</text><text x="40" y="52" text-anchor="middle" class="ring-s">/ ${goal} XP</text></svg>
    </div>
    ${!hasSpeech() ? `<div class="warn">${icon('alert')} This browser has no speech audio. Use Chrome or Edge.</div>` : ''}
    <h2>Today</h2>
    <div class="actions">
      ${nl ? `<button class="act primary" data-go="${nl}"><span class="ai">${icon('wave')}</span><div><b>Continue phonetics</b><small>Unit ${nlUnit!.id}: ${esc(nlUnit!.title)} · ${['Discover', 'Practise', 'Master'][+nl.split('/')[3] - 1]}</small></div></button>` : ''}
      <button class="act ${due ? 'hot' : ''}" data-go="${due ? 'vocab/review' : 'vocab/learn'}"><span class="ai">${icon(due ? 'repeat' : 'plus')}</span><div><b>${due ? `Review ${due} vocab word${due > 1 ? 's' : ''}` : 'Learn 5 new words'}</b><small>${due ? 'Due today by spaced repetition' : `${newWords(9999).length} words waiting`}</small></div></button>
      ${due ? `<button class="act" data-go="vocab/learn"><span class="ai">${icon('plus')}</span><div><b>Learn 5 new words</b><small>${newWords(9999).length} words waiting</small></div></button>` : ''}
      ${ipaDue ? `<button class="act" data-go="phon/drill"><span class="ai">${icon('pen')}</span><div><b>Transcribe ${ipaDue} vocab word${ipaDue > 1 ? 's' : ''}</b><small>IPA review due</small></div></button>` : ''}
      <button class="act" data-go="phon/pairs"><span class="ai">${icon('headphones')}</span><div><b>Ear training</b><small>Minimal pairs, 15 questions</small></div></button>
    </div>
    <p class="muted center small">Two separate systems: <a href="#vocab">Vocabulary</a> (meaning, synonyms, usage) and <a href="#phon">Phonetics</a> (sounds and British IPA).</p>`;
  $$('[data-go]', app).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
}

function settings() {
  const vs = britishVoices();
  app.innerHTML = `
    <h1>Settings</h1>
    <section class="panel">
      <h3>Voice (British)</h3>
      ${vs.length ? `<select class="txt voice"><option value="">Automatic (best British voice)</option>${vs.map((v) => `<option value="${esc(v.voiceURI)}" ${S.settings.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>` : `<p class="warn">No British (en-GB) voice found on this device. On Android: Settings → Text-to-speech → Google → install "English (United Kingdom)". On Windows: Settings → Time & language → Speech → add "English (United Kingdom)". Edge has the best natural voices.</p>`}
      <label class="row">Speed <input type="range" class="rate" min="0.5" max="1.2" step="0.05" value="${S.settings.rate}"> <span class="rv">${S.settings.rate}</span></label>
      <button class="btn test">${icon('volume')}<span>Test voice</span></button>
    </section>
    <section class="panel">
      <h3>Learning</h3>
      <label class="row">Daily goal <select class="txt goal">${[20, 30, 50, 80, 120].map((g) => `<option ${g === S.settings.goal ? 'selected' : ''}>${g}</option>`).join('')}</select> XP</label>
      <label class="row">IPA on-screen keyboard <select class="txt kb"><option value="auto" ${S.settings.keyboard === 'auto' ? 'selected' : ''}>Auto (phone: show, PC: hide)</option><option value="show" ${S.settings.keyboard === 'show' ? 'selected' : ''}>Always show</option><option value="hide" ${S.settings.keyboard === 'hide' ? 'selected' : ''}>Always hide</option></select></label>
      <label class="row"><input type="checkbox" class="sfx" ${sfxOn() ? 'checked' : ''}> Sound effects</label>
    </section>
    <section class="panel">
      <h3>Backup & move progress</h3>
      <p class="muted">Progress is saved on this device. To move it between your phone and PC, export here and import on the other device.</p>
      <button class="btn exp">${icon('download')}<span>Export progress</span></button>
      <label class="btn">${icon('upload')}<span>Import progress</span><input type="file" class="imp" accept=".json" hidden></label>
      <button class="btn danger rst">Reset everything</button>
    </section>
    <p class="muted small">${ENTRIES.length} vocabulary entries · ${UNITS.length} phonetics units · works offline once loaded.</p>`;
  const vSel = $('.voice', app) as HTMLSelectElement | null;
  if (vSel) vSel.onchange = () => { S.settings.voice = vSel.value; save(); speak('Hello, this is my voice.'); };
  const rate = $('.rate', app) as HTMLInputElement;
  rate.oninput = () => { S.settings.rate = +rate.value; $('.rv', app).textContent = rate.value; save(); };
  $('.test', app).onclick = () => speak('The schedule is in the laboratory.');
  ($('.goal', app) as HTMLSelectElement).onchange = (e) => { S.settings.goal = +(e.target as HTMLSelectElement).value; save(); };
  ($('.kb', app) as HTMLSelectElement).onchange = (e) => { S.settings.keyboard = (e.target as HTMLSelectElement).value as any; save(); };
  ($('.sfx', app) as HTMLInputElement).onchange = (e) => { setSfx((e.target as HTMLInputElement).checked); sfx.correct(); };
  $('.exp', app).onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    a.download = `english-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  ($('.imp', app) as HTMLInputElement).onchange = async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { importData(await f.text()); toast('Progress imported'); location.reload(); } catch (err: any) { toast(err.message); }
  };
  $('.rst', app).onclick = () => { if (confirm('Delete ALL progress on this device?')) { resetAll(); location.reload(); } };
}

// voices load async; refresh settings page when they arrive
if (hasSpeech()) window.speechSynthesis.addEventListener?.('voiceschanged', () => { if (location.hash === '#settings') settings(); });

window.addEventListener('hashchange', route);
route();
startTimer();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
