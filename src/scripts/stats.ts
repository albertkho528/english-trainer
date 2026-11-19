import { icon } from './icons';
import { S, dayKey, streak, totalXP, MASTER_BOX } from './store';
import { ENTRIES, BY_ID } from './data';
import { SYMBOLS, UNITS } from '../data/phonetics';
import { EX_NAMES } from './session';
import { $, $$, esc } from './ui';

const LABELS: Record<string, string> = {
  def2word: 'Meaning → word', word2def: 'Word → meaning', synonym: 'Synonym', antonym: 'Opposite', syn2word: 'Synonyms → word',
  gap: 'Fill the gap', gaptype: 'Type the word', usage: 'Correct usage', listen: 'Listen & spell', truefalse: 'True / false', match: 'Match pairs',
  'p-sym': 'Which sound?', 'p-word': 'Find the sound', 'p-pair': 'Minimal pairs', 'p-read': 'Read IPA', 'p-pick': 'Choose transcription',
  'p-edge': 'First / last sound', 'p-build': 'Build transcription', 'p-type': 'Type IPA',
};
const SEQ = ['#e3edfa', '#b7d1f3', '#86b3ea', '#4f93e0', '#2a78d6', '#1d5aa6'];

function lastDays(n: number) {
  const out: { k: string; d: Date }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) { out.push({ k: dayKey(d), d: new Date(d) }); d.setDate(d.getDate() + 1); }
  return out;
}

function barChart(data: { label: string; v: number; tip: string }[], h = 140) {
  const w = 600, pad = 24, bw = (w - pad) / data.length;
  const max = Math.max(1, ...data.map((d) => d.v));
  const nice = Math.ceil(max / 10) * 10 || 10;
  const y = (v: number) => h - 20 - (v / nice) * (h - 36);
  return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img">
    <line x1="${pad}" x2="${w}" y1="${y(0)}" y2="${y(0)}" class="axis"/>
    <line x1="${pad}" x2="${w}" y1="${y(nice)}" y2="${y(nice)}" class="grid"/>
    <text x="${pad - 4}" y="${y(nice) + 4}" class="tick" text-anchor="end">${nice}</text>
    <text x="${pad - 4}" y="${y(0) + 4}" class="tick" text-anchor="end">0</text>
    ${data.map((d, i) => {
      const x = pad + i * bw + bw * 0.18, bwid = bw * 0.64, top = y(d.v), hh = y(0) - top;
      return `<g class="hov" data-tip="${esc(d.tip)}"><rect x="${pad + i * bw}" y="0" width="${bw}" height="${h}" fill="transparent"/>
        ${d.v > 0 ? `<path d="M${x},${y(0)} V${top + 4} q0,-4 4,-4 h${bwid - 8} q4,0 4,4 V${y(0)} Z" class="bar"/>` : ''}
        ${i % 2 === data.length % 2 ? '' : `<text x="${x + bwid / 2}" y="${h - 5}" class="tick" text-anchor="middle">${esc(d.label)}</text>`}</g>`;
    }).join('')}
  </svg>`;
}

function hbars(rows: { label: string; pct: number; n: number }[]) {
  return `<div class="hbars">${rows.map((r) => `<div class="hb hov" data-tip="${esc(r.label)}: ${r.pct}% correct (${r.n} answers)"><span class="hb-l">${esc(r.label)}</span><span class="hb-t"><i style="width:${r.pct}%"></i></span><span class="hb-v">${r.pct}%</span></div>`).join('')}</div>`;
}

export function statsPage(root: HTMLElement, nav: (r: string) => void) {
  const days = lastDays(14);
  const all = Object.values(S.days);
  const answers = all.reduce((a, d) => a + d.c + d.w, 0);
  const corr = all.reduce((a, d) => a + d.c, 0);
  const secs = all.reduce((a, d) => a + d.secs, 0);
  const cards = Object.values(S.vocab);
  const lv = { New: ENTRIES.length - cards.length, Learning: cards.filter((c) => c.box < 2).length, Familiar: cards.filter((c) => c.box >= 2 && c.box < MASTER_BOX).length, Mastered: cards.filter((c) => c.box >= MASTER_BOX).length };
  const levelsDone = Object.values(S.units).reduce((a, b) => a + b, 0);
  const weak = Object.entries(S.vocab).filter(([, c]) => c.w > 0).sort((a, b) => (b[1].w - b[1].c * 0.3) - (a[1].w - a[1].c * 0.3)).slice(0, 8);
  const conf = Object.entries(S.conf).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const exRows = Object.entries(S.ex).filter(([k]) => k !== 'teach').map(([k, v]) => ({ label: LABELS[k] ?? EX_NAMES[k] ?? k, pct: Math.round((v.c / Math.max(1, v.c + v.w)) * 100), n: v.c + v.w })).sort((a, b) => a.pct - b.pct);

  // heatmap: 12 weeks
  const hm = lastDays(84);
  const maxXp = Math.max(1, ...hm.map((d) => S.days[d.k]?.xp ?? 0));
  const offset = (hm[0].d.getDay() + 6) % 7;

  root.innerHTML = `
    <h1>Statistics</h1>
    <div class="kpis four">
      <div class="kpi"><b>${streak()}</b><span>day streak</span></div>
      <div class="kpi"><b>${totalXP()}</b><span>total XP</span></div>
      <div class="kpi"><b>${answers ? Math.round((corr / answers) * 100) : 0}%</b><span>accuracy (${answers} answers)</span></div>
      <div class="kpi"><b>${Math.round(secs / 60)}</b><span>minutes studied</span></div>
    </div>

    <section class="panel"><h3>XP — last 14 days</h3>${barChart(days.map(({ k, d }) => ({ label: `${d.getDate()}/${d.getMonth() + 1}`, v: S.days[k]?.xp ?? 0, tip: `${d.toDateString()}: ${S.days[k]?.xp ?? 0} XP · ${S.days[k]?.lessons ?? 0} lessons · ${Math.round((S.days[k]?.secs ?? 0) / 60)} min` })))}</section>

    <section class="panel"><h3>Accuracy — last 14 days</h3>${barChart(days.map(({ k, d }) => { const x = S.days[k]; const n = x ? x.c + x.w : 0; const p = n ? Math.round((x!.c / n) * 100) : 0; return { label: `${d.getDate()}/${d.getMonth() + 1}`, v: p, tip: `${d.toDateString()}: ${n ? p + '% of ' + n + ' answers' : 'no practice'}` }; }))}</section>

    <section class="panel"><h3>Activity — last 12 weeks</h3>
      <div class="heat" style="--off:${offset}">${'<i class="pad"></i>'.repeat(offset)}${hm.map(({ k, d }) => { const x = S.days[k]?.xp ?? 0; const lvl = x ? Math.min(5, 1 + Math.floor((x / maxXp) * 4.99)) : 0; return `<i class="hov" style="background:${x ? SEQ[lvl] : 'var(--empty)'}" data-tip="${d.toDateString()}: ${x} XP"></i>`; }).join('')}</div>
      <div class="legend-row"><small>Less</small>${SEQ.slice(1).map((c) => `<i style="background:${c}"></i>`).join('')}<small>More</small></div>
    </section>

    <section class="panel"><h3>Vocabulary mastery <small class="muted">(${ENTRIES.length} words & phrases)</small></h3>
      <div class="stack">${Object.entries(lv).map(([k, v], i) => v ? `<i class="hov" style="flex:${v};background:${['var(--empty)', SEQ[2], SEQ[3], SEQ[5]][i]}" data-tip="${k}: ${v}"></i>` : '').join('')}</div>
      <div class="legend-row">${Object.entries(lv).map(([k, v], i) => `<span><i style="background:${['var(--empty)', SEQ[2], SEQ[3], SEQ[5]][i]}"></i>${k} <b>${v}</b></span>`).join('')}</div>
    </section>

    <div class="two">
      <section class="panel"><h3>Accuracy by exercise type</h3>${exRows.length ? hbars(exRows) : '<p class="muted">No answers yet.</p>'}</section>
      <section class="panel"><h3>Weakest words</h3>${weak.length ? `<div class="dict">${weak.map(([id, c]) => `<button class="drow" data-go="vocab/word/${encodeURIComponent(id)}"><b>${esc(BY_ID[id]?.word ?? id)}</b><small>Wrong ${c.w} · Correct ${c.c}</small></button>`).join('')}</div><button class="btn" data-go="vocab/weak">Practise weak words ${icon('arrow')}</button>` : '<p class="muted">No mistakes yet.</p>'}</section>
    </div>

    <section class="panel"><h3>Phonetics — course</h3>
      ${hbars([{ label: 'Levels completed', pct: Math.round((levelsDone / (UNITS.length * 3)) * 100), n: levelsDone }])}
      <p class="muted">${levelsDone} of ${UNITS.length * 3} levels · ${Object.keys(S.ipaWords).length} textbook words transcribed</p>
    </section>

    <div class="two">
      <section class="panel"><h3>Sound accuracy</h3><p class="muted">Tap a sound to study it. Grey = not practised.</p>
        <div class="symgrid sm">${SYMBOLS.filter((s) => s.kind !== 'mark').map((s) => { const st = S.sym[s.sym]; const n = st ? st.c + st.w : 0; const a = n ? st.c / n : -1; return `<button class="symbtn hov ${a < 0 ? '' : a >= 0.85 ? 'g' : a >= 0.6 ? 'y' : 'r'}" data-go="phon/library/${encodeURIComponent(s.sym)}" data-tip="/${esc(s.sym)}/ ${n ? Math.round(a * 100) + '% of ' + n : 'not practised'}"><b>${esc(s.sym)}</b></button>`; }).join('')}</div>
        <div class="legend-row"><span><i class="lg g"></i>≥85%</span><span><i class="lg y"></i>60–84%</span><span><i class="lg r"></i>&lt;60%</span></div>
      </section>
      <section class="panel"><h3>Sounds you confuse most</h3>${conf.length ? `<table class="tbl"><tr><th>Correct</th><th>You wrote</th><th>Times</th></tr>${conf.map(([k, n]) => { const [a, b] = k.split('>'); return `<tr><td><b>/${esc(a)}/</b></td><td>/${esc(b)}/</td><td>${n}</td></tr>`; }).join('')}</table>` : '<p class="muted">No confusions recorded yet.</p>'}</section>
    </div>
    <div class="tip-float"></div>`;

  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
  const tip = $('.tip-float', root);
  $$('.hov', root).forEach((el) => {
    const show = (e: PointerEvent) => { tip.textContent = el.dataset.tip ?? ''; tip.style.display = tip.textContent ? 'block' : 'none'; tip.style.left = `${Math.min(e.clientX + 12, innerWidth - 220)}px`; tip.style.top = `${e.clientY + 14}px`; };
    el.addEventListener('pointermove', show as any);
    el.addEventListener('pointerdown', show as any);
    el.addEventListener('pointerleave', () => (tip.style.display = 'none'));
  });
}
