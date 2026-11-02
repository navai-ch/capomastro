/* MyColor Gestionale – estensioni v7: analisi KPI mese per mese con regressione e filtro date,
   dettaglio bollettino, entità cliccabili ovunque (persone, clienti, fornitori, cantieri, offerte, fatture) */

// ---------- analisi KPI ----------
const ML = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const ymLabel = (ym) => ML[+ym.slice(5, 7) - 1] + ' ' + ym.slice(2, 4);
const KPIS = {
  margine: { l: 'Margine', ic: 'trending', unit: 'chf', desc: 'Fatturato meno costi di ore, materiale, terzi e struttura. Il margine è ciò che resta: qui si vede mese per mese se cresce davvero.', val: (m) => m.fatturato - m.costi, line: { l: 'Margine %', v: (m) => (m.fatturato - m.costi) / m.fatturato * 100, unit: 'pct', axis2: true }, additive: true },
  chfora: { l: 'CHF per ora', ic: 'clock', unit: 'chf1', desc: 'Fatturato diviso ore lavorate. Confrontato con break-even e tariffa di vendita: sotto il break-even si lavora in perdita.', val: (m) => m.fatturato / m.ore, refs: () => [['break-even ' + P.breakEvenOra, P.breakEvenOra, 'var(--bad)'], ['tariffa ' + P.tariffaVenditaOra, P.tariffaVenditaOra, 'var(--good)']], additive: false },
  fatturato: { l: 'Fatturato', ic: 'coins', unit: 'chf', desc: 'Fatturato emesso per mese, con i costi sovrapposti: la distanza tra le due linee è il margine.', val: (m) => m.fatturato, line: { l: 'Costi', v: (m) => m.costi, unit: 'chf' }, additive: true },
  ore: { l: 'Ore lavorate', ic: 'clock', unit: 'h', desc: 'Ore dai bollettini approvati. Serve a leggere stagionalità e capacità: quante ore vendibili abbiamo davvero.', val: (m) => m.ore, line: { l: 'Bollettini', v: (m) => m.bollettini, unit: 'n', axis2: true }, additive: true },
  bollettini: { l: 'Bollettini', ic: 'clipboard', unit: 'n', desc: 'Bollettini inviati dagli operai per mese. Un calo con le stesse ore vuol dire bollettini cumulati: ore meno affidabili.', val: (m) => m.bollettini, additive: true },
  fatture: { l: 'Incassi e scoperto', ic: 'receipt', unit: 'chf', desc: 'Scoperto clienti a fine mese (barre) e incassato nel mese (linea). Se lo scoperto cresce più del fatturato, i clienti pagano più tardi.', val: (m) => m.aperto, line: { l: 'Incassato', v: (m) => m.incassato, unit: 'chf' }, additive: false },
  pipeline: { l: 'Offerte', ic: 'quote', unit: 'chf', desc: 'Valore delle offerte emesse per mese (barre) e numero di offerte vinte (linea). Il tasso di chiusura dice quanto vale ogni sopralluogo.', val: (m) => m.offerteChf, line: { l: 'Vinte', v: (m) => m.vinte, unit: 'n', axis2: true }, additive: true },
};
function fmtU(v, unit) { return unit === 'chf' ? chf(v) : unit === 'chf1' ? chf(v, 1) : unit === 'pct' ? pct(v) : unit === 'h' ? n0(v) + ' h' : n0(v); }
function regress(ys, skip = []) { const pts = ys.map((y, i) => [i, y]).filter((p) => !skip[p[0]]); const n = pts.length; if (n < 2) return { a: 0, b: ys[0] || 0, r2: 0, my: ys[0] || 0 }; const xs = pts.map((p) => p[0]); ys = pts.map((p) => p[1]); const mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n; let sxy = 0, sxx = 0, sst = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); sst += (ys[i] - my) * (ys[i] - my); }); const a = sxx ? sxy / sxx : 0; const b = my - a * mx; let sse = 0; ys.forEach((y, i) => { const f = a * xs[i] + b; sse += (y - f) * (y - f); }); return { a, b, r2: sst ? Math.max(0, 1 - sse / sst) : 1, my }; }
function anaState() { return S.ana || (S.ana = { from: '2025-12', to: '2026-11', gran: 'm', cmp: false }); }
function anaRows(key) {
  const A = anaState(); const def = KPIS[key]; const all = D.MESI_STORICO;
  let rows = all.filter((m) => m.ym >= A.from && m.ym <= A.to).map((m) => ({ ym: m.ym, label: ymLabel(m.ym), v: def.val(m), l: def.line ? def.line.v(m) : null, parziale: !!m.parziale, raw: m }));
  if (A.gran === 'q') { const q = {}; rows.forEach((r) => { const k = r.ym.slice(0, 4) + '-Q' + Math.ceil(+r.ym.slice(5, 7) / 3); (q[k] = q[k] || { ym: k, label: k.slice(5) + ' ' + k.slice(2, 4), items: [] }).items.push(r); }); rows = Object.values(q).map((g) => { const agg = (f) => g.items.reduce((s, r) => s + f(r.raw), 0); const raw = { fatturato: agg((m) => m.fatturato), costi: agg((m) => m.costi), ore: agg((m) => m.ore), bollettini: agg((m) => m.bollettini), offerte: agg((m) => m.offerte), offerteChf: agg((m) => m.offerteChf), vinte: agg((m) => m.vinte), incassato: agg((m) => m.incassato), aperto: g.items[g.items.length - 1].raw.aperto }; return { ym: g.ym, label: g.label, v: def.val(raw), l: def.line ? def.line.v(raw) : null, parziale: g.items.some((r) => r.parziale), raw, n: g.items.length }; }); }
  return rows;
}
function anaChart(key, rows) {
  const def = KPIS[key]; const A = anaState(); const W = 860, H = 320, pl = 64, pr = def.line && def.line.axis2 ? 64 : 16, pt = 20, pb = 36; const iw = W - pl - pr, ih = H - pt - pb;
  const ys = rows.map((r) => r.v); const reg = regress(ys, rows.map((r) => r.parziale)); const fc = 3; const n = rows.length; const total = n + fc;
  const fcVals = Array.from({ length: fc }, (_, i) => reg.a * (n + i) + reg.b);
  const refs = def.refs ? def.refs() : [];
  const cmp = A.cmp && A.gran === 'm' ? rows.map((r) => { const py = (+r.ym.slice(0, 4) - 1) + r.ym.slice(4); const m = D.MESI_STORICO.find((x) => x.ym === py); return m ? def.val(m) : null; }) : [];
  const allV = [...ys, ...fcVals, ...refs.map((r) => r[1]), ...cmp.filter((x) => x != null), ...(def.line && !def.line.axis2 ? rows.map((r) => r.l) : [])];
  const maxV = Math.max(...allV, 1) * 1.12; const minV = Math.min(0, ...allV);
  const y = (v) => pt + ih - (v - minV) / (maxV - minV) * ih; const bw = iw / total; const x = (i) => pl + i * bw + bw / 2;
  const lv = def.line ? rows.map((r) => r.l) : []; const lmax = def.line && def.line.axis2 ? Math.max(...lv, 1) * 1.15 : maxV; const y2 = (v) => def.line && def.line.axis2 ? pt + ih - v / lmax * ih : y(v);
  const ticks = 5; const step = (maxV - minV) / ticks;
  let s = `<svg class="svgchart ana" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(def.l)} per periodo">`;
  for (let i = 0; i <= ticks; i++) { const v = minV + step * i; s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${def.unit === 'chf' ? n0(v / 1000) + 'k' : def.unit === 'chf1' ? n0(v) : n0(v)}</text>`; }
  if (def.line && def.line.axis2) for (let i = 0; i <= ticks; i++) { const v = lmax / ticks * i; s += `<text x="${W - pr + 8}" y="${y2(v) + 4}" style="fill:var(--info)">${def.line.unit === 'pct' ? n0(v) + '%' : n0(v)}</text>`; }
  rows.forEach((r, i) => {
    const prev = i ? rows[i - 1].v : null; const d = prev ? (r.v - prev) / Math.abs(prev) * 100 : null; const regV = reg.a * i + reg.b;
    const tip = `${r.label}${r.parziale ? ' (in corso)' : ''}\n${def.l}: ${fmtU(r.v, def.unit)}${d != null ? '\nvs periodo precedente: ' + (d >= 0 ? '+' : '') + pct(d) : ''}\ntrend atteso: ${fmtU(regV, def.unit)} (${r.v >= regV ? 'sopra' : 'sotto'} la linea)${def.line ? '\n' + def.line.l + ': ' + fmtU(r.l, def.line.unit) : ''}${cmp[i] != null ? '\nanno precedente: ' + fmtU(cmp[i], def.unit) : ''}`;
    s += `<g class="hb" data-tip="${esc(tip)}"><rect x="${x(i) - bw * 0.32}" y="${y(Math.max(r.v, 0))}" width="${bw * 0.64}" height="${Math.abs(y(r.v) - y(0))}" rx="3" fill="${r.v >= regV ? 'var(--brand)' : 'var(--muted)'}" ${r.parziale ? 'opacity=".5" stroke="var(--brand)" stroke-dasharray="3 2"' : ''}/><text class="lab" x="${x(i)}" y="${y(Math.max(r.v, 0)) - 6}" text-anchor="middle">${def.unit === 'chf' ? n0(r.v / 1000) + 'k' : fmtU(r.v, def.unit)}</text><text x="${x(i)}" y="${H - pb + 16}" text-anchor="middle" ${total > 16 && i % 2 ? 'style="opacity:0"' : ''}>${esc(r.label)}</text></g>`;
  });
  fcVals.forEach((v, j) => { const i = n + j; const ym = rows[n - 1] ? rows[n - 1].ym : ''; const lab = A.gran === 'q' ? '+' + (j + 1) + ' trim.' : (() => { const d = new Date(ym.slice(0, 4), +ym.slice(5, 7) - 1 + j + 1, 1); return ML[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2); })(); s += `<g class="hb" data-tip="${esc(lab + '\nProiezione dal trend: ' + fmtU(v, def.unit))}"><rect x="${x(i) - bw * 0.32}" y="${y(Math.max(v, 0))}" width="${bw * 0.64}" height="${Math.abs(y(v) - y(0))}" rx="3" fill="none" stroke="var(--muted)" stroke-dasharray="4 3"/><text x="${x(i)}" y="${H - pb + 16}" text-anchor="middle" style="fill:var(--muted)">${lab}</text></g>`; });
  // regressione
  s += `<line x1="${x(0)}" y1="${y(reg.b)}" x2="${x(n - 1)}" y2="${y(reg.a * (n - 1) + reg.b)}" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>`;
  s += `<line x1="${x(n - 1)}" y1="${y(reg.a * (n - 1) + reg.b)}" x2="${x(total - 1)}" y2="${y(reg.a * (total - 1) + reg.b)}" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" opacity=".7"/>`;
  if (def.line) { s += `<polyline points="${rows.map((r, i) => x(i) + ',' + y2(r.l)).join(' ')}" fill="none" stroke="var(--info)" stroke-width="2.5" stroke-linejoin="round"/>${rows.map((r, i) => `<circle cx="${x(i)}" cy="${y2(r.l)}" r="3.5" fill="var(--info)" stroke="var(--surface)" stroke-width="2"><title>${esc(def.line.l + ': ' + fmtU(r.l, def.line.unit))}</title></circle>`).join('')}`; }
  if (cmp.length) s += `<polyline points="${rows.map((r, i) => cmp[i] != null ? x(i) + ',' + y(cmp[i]) : '').filter(Boolean).join(' ')}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="2 3"/>`;
  refs.forEach((r) => { s += `<line class="ref" x1="${pl}" x2="${W - pr}" y1="${y(r[1])}" y2="${y(r[1])}" style="stroke:${r[2]}"/><text x="${pl + 4}" y="${y(r[1]) - 4}" style="fill:${r[2]};font-weight:600">${esc(r[0])}</text>`; });
  s += `<text x="${x(total - 1)}" y="${y(reg.a * (total - 1) + reg.b) - 8}" text-anchor="end" style="font-weight:700;fill:var(--ink)">trend ${reg.a >= 0 ? '+' : ''}${def.unit === 'chf' ? chf(reg.a) : fmtU(reg.a, def.unit)}/${A.gran === 'q' ? 'trim.' : 'mese'}</text>`;
  return s + '</svg>';
}
function vKpi() {
  const key = KPIS[S.id] ? S.id : 'margine'; S.id = key; const def = KPIS[key]; const A = anaState();
  const rows = anaRows(key); const ys = rows.map((r) => r.v); const reg = regress(ys, rows.map((r) => r.parziale)); const n = rows.length;
  const tot = ys.reduce((a, b) => a + b, 0); const media = n ? tot / n : 0; const full = rows.filter((r) => !r.parziale); const best = full.reduce((a, r) => !a || r.v > a.v ? r : a, null); const worst = full.reduce((a, r) => !a || r.v < a.v ? r : a, null);
  const slopePct = media ? reg.a / Math.abs(media) * 100 : 0; const next = reg.a * n + reg.b; const fine = [0, 1, 2].reduce((a, i) => a + reg.a * (n + i) + reg.b, 0);
  const all = D.MESI_STORICO; const minYm = all[0].ym, maxYm = all[all.length - 1].ym;
  const presets = [['6m', 'Ultimi 6 mesi', '2026-06', '2026-11'], ['12m', 'Ultimi 12 mesi', '2025-12', '2026-11'], ['2026', '2026', '2026-01', '2026-11'], ['2025', '2025', '2025-01', '2025-12'], ['all', 'Tutto', minYm, maxYm]];
  const r2Lab = reg.r2 >= 0.7 ? 'trend affidabile' : reg.r2 >= 0.4 ? 'trend indicativo' : 'molto variabile, trend poco affidabile';
  const csv = () => ['Periodo;' + def.l + (def.line ? ';' + def.line.l : '') + ';Trend', ...rows.map((r, i) => r.label + ';' + Math.round(r.v * 100) / 100 + (def.line ? ';' + Math.round(r.l * 100) / 100 : '') + ';' + Math.round((reg.a * i + reg.b) * 100) / 100)].join('\n');
  return `<div class="pagehead"><div><div class="eyebrow"><button class="lnk" data-act="nav" data-id="home">Dashboard</button> › Analisi</div><h1>${I(def.ic)} ${esc(def.l)}</h1><p class="muted">${esc(def.desc)}</p></div><div class="row"><button class="btn" data-act="ana-csv" data-csv="${esc(csv())}" data-name="${key}">${I('download')} Esporta CSV</button><button class="btn" data-act="nav" data-id="contabilita">Contabilità</button></div></div>
  <div class="chips">${Object.entries(KPIS).map(([k, d]) => `<button data-act="open-kpi" data-id="${k}" class="${k === key ? 'on' : ''}">${I(d.ic)} ${esc(d.l)}</button>`).join('')}</div>
  <div class="card anaf"><div class="row between"><div class="row"><span class="small muted">Periodo:</span>${presets.map((p) => `<button class="btn sm ${A.from === p[2] && A.to === p[3] ? 'primary' : ''}" data-act="ana-preset" data-id="${p[2]}|${p[3]}">${p[1]}</button>`).join('')}<label class="row nowrap small" style="gap:6px">da <input type="month" value="${A.from}" min="${minYm}" max="${maxYm}" data-act-change="ana-from" style="width:auto"></label><label class="row nowrap small" style="gap:6px">a <input type="month" value="${A.to}" min="${minYm}" max="${maxYm}" data-act-change="ana-to" style="width:auto"></label></div><div class="row"><span class="seg">${[['m', 'Mese'], ['q', 'Trimestre']].map((g) => `<button type="button" class="${A.gran === g[0] ? 'on' : ''}" data-act="ana-gran" data-id="${g[0]}">${g[1]}</button>`).join('')}</span><label class="row nowrap small" style="gap:6px;cursor:pointer"><input type="checkbox" ${A.cmp ? 'checked' : ''} data-act-change="ana-cmp" ${A.gran === 'q' ? 'disabled' : ''}> Confronta con anno precedente</label></div></div></div>
  <div class="kpis">
    ${kpi2({ l: def.additive ? 'Totale periodo' : 'Media periodo', v: fmtU(def.additive ? tot : media, def.unit), sub: n + (A.gran === 'q' ? ' trimestri' : ' mesi') + (def.additive ? ' · media ' + fmtU(media, def.unit) : ''), tip: 'Dal ' + ymLabel(A.from) + ' al ' + ymLabel(A.to) })}
    ${kpi2({ l: 'Trend', v: (reg.a >= 0 ? '+' : '') + fmtU(reg.a, def.unit) + '/' + (A.gran === 'q' ? 'trim.' : 'mese'), sub: (slopePct >= 0 ? '+' : '') + pct(slopePct) + ' al mese sulla media', tn: reg.a >= 0 ? 'good' : 'bad', tip: 'Pendenza della retta di regressione lineare (minimi quadrati) sul periodo scelto' })}
    ${kpi2({ l: 'Affidabilità del trend', v: 'R² ' + n2(reg.r2), sub: r2Lab, tn: reg.r2 >= 0.7 ? 'good' : reg.r2 >= 0.4 ? 'warn' : 'bad', tip: 'R² vicino a 1: i valori seguono la retta. Vicino a 0: oscillano molto, il trend dice poco' })}
    ${kpi2({ l: 'Prossimo periodo (proiezione)', v: fmtU(next, def.unit), sub: def.additive ? 'prossimi 3: ' + fmtU(fine, def.unit) : 'se il trend continua', tip: 'Valore atteso prolungando la retta di regressione' })}
    ${kpi2({ l: 'Miglior periodo', v: best ? fmtU(best.v, def.unit) : '–', sub: best ? best.label : '', tn: 'good' })}
    ${kpi2({ l: 'Peggior periodo', v: worst ? fmtU(worst.v, def.unit) : '–', sub: worst ? worst.label : '', tn: 'bad' })}
  </div>
  <div class="card"><div class="row between"><h3>${esc(def.l)} ${A.gran === 'q' ? 'per trimestre' : 'mese per mese'} · ${ymLabel(A.from)} – ${ymLabel(A.to)}</h3><span class="small muted">passa sulle barre per i dettagli</span></div>${n ? anaChart(key, rows) : '<p class="muted">Nessun dato nel periodo</p>'}<div class="legend"><span><i style="background:var(--brand)"></i>${esc(def.l)} sopra il trend</span><span><i style="background:var(--muted)"></i>sotto il trend</span><span><i style="background:var(--ink);height:3px;border-radius:2px"></i>regressione lineare</span><span><i style="border:1px dashed var(--muted);background:none"></i>proiezione 3 periodi</span>${def.line ? `<span><i style="background:var(--info)"></i>${esc(def.line.l)}${def.line.axis2 ? ' (asse destro)' : ''}</span>` : ''}${A.cmp && A.gran === 'm' ? '<span><i style="background:var(--muted);height:2px"></i>anno precedente</span>' : ''}${def.refs ? def.refs().map((r) => `<span><i style="background:${r[2]};height:2px"></i>${esc(r[0])}</span>`).join('') : ''}</div></div>
  <div class="card pad0"><div class="cardhd"><h3>Valori per periodo</h3><span class="small muted">clic su una riga per i dettagli del mese</span></div>${table([{ h: 'Periodo' }, { h: def.l, cls: 'right num' }, { h: 'vs precedente', cls: 'right num' }, { h: 'vs anno prec.', cls: 'right num' }, ...(def.line ? [{ h: def.line.l, cls: 'right num' }] : []), { h: 'Trend', cls: 'right num' }, { h: 'Scarto', cls: 'right num' }], rows.map((r, i) => { const prev = i ? rows[i - 1].v : null; const d = prev ? (r.v - prev) / Math.abs(prev) * 100 : null; const py = A.gran === 'm' ? all.find((x) => x.ym === (+r.ym.slice(0, 4) - 1) + r.ym.slice(4)) : null; const dy = py ? (r.v - def.val(py)) / Math.abs(def.val(py)) * 100 : null; const regV = reg.a * i + reg.b; const sc = r.v - regV; const col = (v) => v == null ? '–' : `<span style="color:${v >= 0 ? 'var(--good)' : 'var(--bad)'}">${v >= 0 ? '+' : ''}${pct(v)}</span>`; return { act: 'ana-month', id: r.ym, cls: 'click', c: [`<span class="b">${esc(r.label)}</span>${r.parziale ? ' <span class="pill warn">in corso</span>' : ''}`, `<span class="b">${fmtU(r.v, def.unit)}</span>`, col(d), col(dy), ...(def.line ? [fmtU(r.l, def.line.unit)] : []), fmtU(regV, def.unit), `<span style="color:${sc >= 0 ? 'var(--good)' : 'var(--bad)'}">${sc >= 0 ? '+' : ''}${fmtU(sc, def.unit)}</span>`] }; }))}</div>
  <p class="small muted">Metodo: regressione lineare ai minimi quadrati sui periodi completi selezionati (il mese in corso è escluso dal calcolo); la proiezione prolunga la retta e non considera stagionalità. Dati 2025 importati da SelectLine, 2026 dal gestionale; il mese in corso è parziale.</p>`;
}
function anaMonthModal(m) {
  const r = D.MESI_STORICO.find((x) => x.ym === m.ym) || D.MESI_STORICO.filter((x) => x.ym.startsWith(m.ym.slice(0, 4))).reduce((a, x) => ({ ym: m.ym, fatturato: a.fatturato + x.fatturato, costi: a.costi + x.costi, ore: a.ore + x.ore, bollettini: a.bollettini + x.bollettini, offerte: a.offerte + x.offerte, offerteChf: a.offerteChf + x.offerteChf, vinte: a.vinte + x.vinte, incassato: a.incassato + x.incassato, aperto: x.aperto }), { fatturato: 0, costi: 0, ore: 0, bollettini: 0, offerte: 0, offerteChf: 0, vinte: 0, incassato: 0, aperto: 0 });
  const marg = r.fatturato - r.costi;
  return `<div class="row between"><h2>${esc(/Q/.test(m.ym) ? m.ym.slice(5) + ' ' + m.ym.slice(0, 4) : ML[+m.ym.slice(5, 7) - 1] + ' ' + m.ym.slice(0, 4))}</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="kpis">${kpi2({ l: 'Fatturato', v: chf(r.fatturato) })}${kpi2({ l: 'Costi', v: chf(r.costi) })}${kpi2({ l: 'Margine', v: chf(marg), sub: pct(marg / r.fatturato * 100), tn: marg / r.fatturato > 0.15 ? 'good' : 'warn' })}${kpi2({ l: 'CHF/ora', v: chf(r.fatturato / r.ore, 1), tn: chfTone(r.fatturato / r.ore) })}${kpi2({ l: 'Ore', v: n0(r.ore) + ' h', sub: r.bollettini + ' bollettini' })}${kpi2({ l: 'Offerte', v: r.offerte + ' emesse', sub: r.vinte + ' vinte · ' + chf(r.offerteChf) })}${kpi2({ l: 'Incassato', v: chf(r.incassato), sub: 'scoperto a fine mese ' + chf(r.aperto) })}</div>
    <div class="row"><button class="btn" data-act="nav" data-id="contabilita">Apri la contabilità</button><button class="btn" data-act="nav" data-id="bollettini">Bollettini</button><button class="btn" data-act="open-pipeline">Offerte</button></div>`;
}

// ---------- dettaglio bollettino ----------
function bolDetailModal(m) {
  const b = DB.bollettini.find((x) => x.id === m.id); if (!b) return '<p>Bollettino non trovato</p>';
  const w = worker(b.workerId); const c = cant(b.cantiere) || { id: b.cantiere, nome: '', comune: '' }; const resp = worker(w.ramo === 'G' ? 'C003' : 'C002');
  const costo = (b.ore + b.viaggio) * w.costoAziendaOra; const valore = b.ore * P.tariffaVenditaOra; const isOp = S.user.role === 'operaio';
  const week = DB.bollettini.filter((x) => x.workerId === b.workerId && x.id !== b.id).sort((a, z) => z.data.localeCompare(a.data)).slice(0, 5);
  const ip = indennitaPranzo(w, c);
  return `<div class="row between"><h2>${I('clipboard')} Bollettino del ${fd(b.data)}</h2><div class="row nowrap">${pill(b.stato)}<button class="btn sm" data-act="close">Chiudi</button></div></div>
    <div class="grid2"><div class="card" style="padding:12px 14px"><div class="row nowrap">${avatar(w.nome, avCls(w))}<div style="min-width:0"><button class="lnk b" data-act="open-worker" data-id="${w.id}" style="font-size:1rem">${esc(w.nome)}</button><div class="small muted">${esc(w.ruolo)} · ${w.ramo === 'G' ? 'gessatura' : 'pittura'} · ${esc(w.residenza)}</div></div></div></div>
    <div class="card" style="padding:12px 14px"><div class="eyebrow">Cantiere</div><button class="lnk b" data-act="open-cantiere" data-id="${c.id}" style="font-size:1rem">${esc(c.nome)}</button><div class="small muted num">${c.id} · ${esc(c.comune)} · ${c.kmDaBase != null ? c.kmDaBase + ' km dalla base' : ''}</div></div></div>
    ${b.anomalia ? `<div class="alert warn"><span>${I('alert')}</span><span><span class="t b">Anomalia:</span> ${esc(b.anomalia)}. ${b.ore > 10 ? 'Oltre 10 ore: verificare con il capo squadra prima di approvare.' : b.gps > 100 ? 'Timbratura lontana dal cantiere: chiedere conferma.' : ''}</span></div>` : ''}
    <div class="grid2"><div class="card"><h3>Giornata</h3><dl class="dl"><dt>Entrata – uscita</dt><dd class="num">${b.entrata} – ${b.uscita}</dd><dt>Ore di lavoro</dt><dd class="num b">${n1(b.ore)} h</dd><dt>Viaggio</dt><dd class="num">${n1(b.viaggio)} h${b.viaggio > 0 ? ' · ' + Math.round(b.viaggio * 60) + ' min' : ''}</dd><dt>Attività</dt><dd>${esc(b.attivita)}</dd><dt>Materiale</dt><dd>${esc(b.materiale || '–')}</dd><dt>Indennità pranzo</dt><dd>${ip.val ? chf(ip.val) + ip.unit + ' · ' + esc(ip.tipo) : 'non dovuta'}</dd><dt>Inviato da</dt><dd>${b.fonte === 'assistente' ? I('sparkles') + ' assistente IA' : b.vocale ? I('mic') + ' app, nota vocale' : I('phone') + ' app'}${b.foto ? ' · ' + b.foto + ' foto' : ''}</dd></dl></div>
    <div class="card"><h3>Posizione e valore</h3>${mapSvg(b.gps || 35)}<div class="row between" style="margin-top:8px"><span class="small muted">GPS alla timbratura</span>${b.gps > 100 ? `<span class="pill bad">${(b.gps / 1000).toFixed(1)} km dal cantiere</span>` : `<span class="pill good">✓ ${b.gps || 35} m dal cantiere</span>`}</div>${isOp ? '' : `<dl class="dl" style="margin-top:8px"><dt>Costo aziendale</dt><dd class="num">${chf(costo)} <span class="small muted">(${n1(b.ore + b.viaggio)} h × ${chf(w.costoAziendaOra, 2)})</span></dd><dt>Valore a tariffa</dt><dd class="num">${chf(valore)} <span class="small muted">(${n1(b.ore)} h × ${P.tariffaVenditaOra})</span></dd><dt>Margine della giornata</dt><dd class="num b" style="color:${valore - costo > 0 ? 'var(--good)' : 'var(--bad)'}">${chf(valore - costo)}</dd></dl>`}</div></div>
    ${b.note ? `<div class="card" style="background:var(--surface-2)"><div class="eyebrow">${b.vocale ? I('mic') + ' Nota vocale trascritta' : 'Note per l\'ufficio'}</div><p style="margin:6px 0 0;white-space:pre-wrap">${esc(b.note)}</p></div>` : ''}
    <div class="row between"><div class="row">${!isOp && b.stato === 'Inviato' ? `<button class="btn good" data-act="approve" data-id="${b.id}">${I('check')} Approva</button><button class="btn" data-act="reject" data-id="${b.id}">Rinvia a ${esc(w.nome.split(' ')[0])}</button>` : ''}${!isOp && b.stato === 'Bozza' ? `<button class="btn" data-act="sollecita-bol" data-id="${b.id}">Sollecita</button>` : ''}${!isOp ? `<button class="btn" data-act="dm-open" data-id="${w.id}">${I('message')} Scrivi a ${esc(w.nome.split(' ')[0])}</button>` : ''}</div><span class="small muted">${b.stato === 'Approvato' ? 'Approvato da ' + esc(resp.nome.split(' ')[0]) : b.stato === 'Inviato' ? 'In attesa di ' + esc(resp.nome.split(' ')[0]) + ' o Ivo' : ''}</span></div>
    ${week.length ? `<div><div class="eyebrow" style="margin-bottom:6px">Altri bollettini di ${esc(w.nome.split(' ')[0])}</div>${week.map((x) => `<div class="listrow click" data-act="bol-open" data-id="${x.id}"><span><span class="b">${fshort(x.data)}</span> · ${esc((cant(x.cantiere) || {}).nome || '')} <span class="small muted">· ${esc(x.attivita)}</span></span><span class="row nowrap"><span class="num">${n1(x.ore)} h</span>${pill(x.stato)}</span></div>`).join('')}</div>` : ''}`;
}

// ---------- entità cliccabili ovunque ----------
let _lkRx = null, _lkMap = null, _lkSig = '';
function linkifyBuild() {
  const sig = DB.workers.length + '|' + DB.clienti.length + '|' + DB.fornitori.length + '|' + DB.cantieri.length + '|' + DB.offerte.length + '|' + DB.fatture.length;
  if (sig === _lkSig && _lkRx) return;
  _lkSig = sig; _lkMap = new Map();
  const add = (name, act, id) => { if (name && name.length > 3 && !_lkMap.has(name)) _lkMap.set(name, [act, id]); };
  DB.workers.forEach((w) => add(w.nome, 'open-worker', w.id));
  DB.clienti.forEach((k) => { add(k.nome, 'open-cliente', k.id); add(k.contatto, 'open-cliente', k.id); });
  DB.fornitori.forEach((f) => add(f.nome, 'open-fornitore', f.id));
  DB.cantieri.forEach((c) => { add(c.nome, 'open-cantiere', c.id); add(c.id, 'open-cantiere', c.id); });
  DB.offerte.forEach((o) => add(o.id, 'open-offerta', o.id));
  DB.fatture.forEach((f) => add(f.id, 'open-fattura', f.id));
  const names = [..._lkMap.keys()].sort((a, b) => b.length - a.length).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  _lkRx = new RegExp('(?<![\\p{L}\\d])(' + names.join('|') + ')(?![\\p{L}\\d])', 'u');
}
const LK_SKIP = 'button,a,select,option,textarea,input,label,h1,h2,h3,svg,.elink,.doc,.firma-page,.sidebar,.topbar,.dropdown,.tip,.toast,.ai-panel,.login-card,.mobilebar,.tabbar,.phone-head,.kbd,.cardhd,[contenteditable]';
function linkify() {
  if (!S.user) return; const root = document.getElementById('app'); if (!root) return; linkifyBuild();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => { if (!n.nodeValue || n.nodeValue.length < 4 || !_lkRx.test(n.nodeValue)) return NodeFilter.FILTER_REJECT; const p = n.parentElement; if (!p || p.closest(LK_SKIP)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const g = new RegExp(_lkRx.source, 'gu');
  nodes.forEach((n) => {
    const txt = n.nodeValue; const frag = document.createDocumentFragment(); let last = 0; let m; g.lastIndex = 0;
    while ((m = g.exec(txt))) { const [act, id] = _lkMap.get(m[1]); if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index))); const b = document.createElement('button'); b.className = 'elink'; b.type = 'button'; b.dataset.act = act; b.dataset.id = id; b.textContent = m[1]; b.title = 'Apri ' + (act === 'open-worker' ? 'la scheda di ' : act === 'open-cliente' ? 'il cliente ' : act === 'open-fornitore' ? 'il fornitore ' : act === 'open-cantiere' ? 'il cantiere ' : act === 'open-offerta' ? "l'offerta " : 'la fattura ') + m[1]; frag.appendChild(b); last = m.index + m[1].length; }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
}

// ---------- eventi ----------
document.addEventListener('click', (e) => {
  const h = e.target.closest('[data-act]'); if (!h) return; const act = h.dataset.act, id = h.dataset.id; const ds = h.dataset;
  const H = {
    'open-kpi': () => { go('kpi', id); return 'skip'; },
    'ana-preset': () => { const [f, t] = id.split('|'); Object.assign(anaState(), { from: f, to: t }); },
    'ana-gran': () => { anaState().gran = id; },
    'ana-month': () => { S.modal = { type: 'ana-month', ym: id }; },
    'ana-csv': () => { const blob = new Blob(['﻿' + ds.csv], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analisi-' + ds.name + '.csv'; a.click(); toast('CSV esportato'); return 'skip'; },
    'bol-open': () => { if (e.target.matches('input')) return 'skip'; S.modal = { type: 'bol-detail', id }; },
  };
  if (!H[act]) return; e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('change', (e) => {
  const t = e.target; const a = t.dataset.actChange; if (!a) return; const A = anaState();
  if (a === 'ana-from') { if (t.value) { A.from = t.value; if (A.to < A.from) A.to = A.from; } render(); }
  if (a === 'ana-to') { if (t.value) { A.to = t.value; if (A.from > A.to) A.from = A.to; } render(); }
  if (a === 'ana-cmp') { A.cmp = t.checked; render(); }
});
