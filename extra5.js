/* MyColor Gestionale – estensioni v9: modulo Attività (promemoria manuali + controlli automatici della dashboard),
   pianificazione con ore e orari per persona, vista per collaboratore, fabbisogno e capacità, settimana nell'app operaio */

Object.assign(ICONS, {
  tasks: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6"/>',
});
Object.assign(ICONS, { 'chevron-r': '<path d="m9 6 6 6-6 6"/>' });
NAV.forEach((n) => { if (n[0] === 'attivita') n[1] = I('tasks'); if (n[0] === 'inbox') n[1] = I('inbox'); });
Object.assign(T.it, { attivita: 'Attività' }); Object.assign(T.de, { attivita: 'Aufgaben' }); Object.assign(T.fr, { attivita: 'Activités' }); Object.assign(T.en, { attivita: 'Tasks' });
Object.assign(ACT_ICON, { Controllo: I('clipboard'), Incasso: I('coins'), Documento: I('shield'), Firma: I('edit'), Fatturazione: I('receipt'), Capitolato: I('file'), Automatica: I('sparkles') });

// ---------- 1. attività automatiche (i controlli di "Da fare oggi") ----------
const ATT_PRIO = { bad: 0, warn: 1, info: 2, '': 3 };
function sysDone() { return DB.sysAtt || (DB.sysAtt = {}); }
function sysAttivita(all) {
  const L = []; const push = (key, o) => L.push({ id: 'SYS|' + key, sys: true, data: D.TODAY_ISO, ora: '', esito: '', done: false, ...o });
  const respDi = (ramo) => ramo === 'G' ? 'C003' : 'C002';
  const inCorso = DB.cantieri.filter((c) => c.stato === 'In corso');
  inCorso.forEach((c) => { const r = calc(c); if (r.chfOra < P.breakEvenOra) push('be|' + c.id, { tipo: 'Cantiere', prio: 'bad', titolo: `${c.nome} è sotto il break-even: ${chf(r.chfOra, 1)}/h contro ${P.breakEvenOra} richiesti`, html: `<span class="t b">${esc(c.nome)}</span> è sotto il break-even: ${chf(r.chfOra, 1)}/h contro ${P.breakEvenOra} richiesti.`, rel: { t: 'cantiere', id: c.id }, act: 'open-cantiere', aid: c.id, chi: respDi(worker(c.capo).ramo) }); });
  DB.fatture.filter((f) => f.stato === 'Scaduta' || (f.stato === 'Inviata' && f.scadenza < D.TODAY_ISO)).forEach((f) => push('fat|' + f.id, { tipo: 'Incasso', prio: 'bad', titolo: `Fattura ${f.id} ${cliente(f.clienteId).nome} scaduta: ${chf(f.importo)}`, html: `Fattura <span class="t b">${f.id}</span> ${esc(cliente(f.clienteId).nome)} scaduta: ${chf(f.importo)}.`, rel: { t: 'cliente', id: f.clienteId }, act: 'open-fattura', aid: f.id, chi: 'C004' }));
  DB.bollettini.filter((b) => b.anomalia && b.stato !== 'Approvato').slice(0, 3).forEach((b) => { const w = worker(b.workerId); push('bol|' + b.id, { tipo: 'Controllo', prio: 'warn', titolo: `${w.nome}, bollettino del ${fshort(b.data)}: ${b.anomalia}`, html: `<span class="t b">${esc(w.nome)}</span>, bollettino del ${fshort(b.data)}: ${b.anomalia}.`, rel: { t: 'cantiere', id: b.cantiere }, act: 'bol-open', aid: b.id, chi: respDi(w.ramo) }); });
  DB.offerte.filter((o) => o.stato === 'In attesa firma').forEach((o) => push('firma|' + o.id, { tipo: 'Firma', prio: 'warn', titolo: `Offerta ${o.id} (${cliente(o.clienteId).nome}) in attesa di firma dal ${fd(o.firma.data)}`, html: `Offerta <span class="t b">${o.id}</span> (${esc(cliente(o.clienteId).nome)}) in attesa di firma dal ${fd(o.firma.data)}.`, rel: { t: 'cliente', id: o.clienteId }, act: 'open-offerta', aid: o.id, chi: 'C001' }));
  const unread = DB.email.filter((m) => m.folder === 'Inbox' && m.unread);
  if (unread.length) push('mail', { tipo: 'E-mail', prio: 'info', titolo: `${unread.length} e-mail non lette in Inbox: ${unread.slice(0, 2).map((m) => fromName(m.da).split(' ').slice(-1)[0] + ' (' + m.oggetto.slice(0, 28) + (m.oggetto.length > 28 ? '…' : '') + ')').join(', ')}`, html: `<span class="t b">${unread.length} e-mail non lette</span> in Inbox: ${esc(unread.slice(0, 2).map((m) => fromName(m.da).split(' ').slice(-1)[0] + ' (' + m.oggetto.slice(0, 28) + (m.oggetto.length > 28 ? '…' : '') + ')').join(', '))}.`, rel: null, act: 'nav', aid: 'inbox', chi: S.user.wid });
  const sc = scadenze().filter((s) => scadGiorni(s) <= 60).sort((a, b) => a.scad.localeCompare(b.scad)); const scad = sc.filter((s) => scadGiorni(s) < 0);
  if (sc.length) push('scad', { tipo: 'Documento', prio: scad.length ? 'bad' : 'warn', titolo: `${sc.length} documenti in scadenza entro 60 giorni${scad.length ? ', ' + scad.length + ' già scaduti' : ''}: ${sc.slice(0, 2).map((s) => scadNome(s) + ' (' + s.doc.toLowerCase().split(' ')[0] + ')').join(', ')}`, html: `<span class="t b">${sc.length} document${sc.length === 1 ? 'o' : 'i'} in scadenza</span> entro 60 giorni${scad.length ? ', ' + scad.length + ' già scadut' + (scad.length === 1 ? 'o' : 'i') : ''}: ${esc(sc.slice(0, 2).map((s) => scadNome(s) + ' (' + s.doc.toLowerCase().split(' ')[0] + ')').join(', '))}.`, rel: null, act: 'scad-open', aid: '', chi: 'C004' });
  DB.capitolati.filter((c) => c.domande.some((d) => d.stato === 'Aperta')).slice(0, 1).forEach((c) => push('cap|' + c.id, { tipo: 'Capitolato', prio: 'info', titolo: `Capitolato ${c.titolo}: ${c.domande.filter((d) => d.stato === 'Aperta').length} domande aperte da chiarire`, html: `Capitolato <span class="t b">${esc(c.titolo)}</span>: ${c.domande.filter((d) => d.stato === 'Aperta').length} domande aperte da chiarire.`, rel: null, act: 'open-capitolato', aid: c.id, chi: 'C003' }));
  fattReminders().filter((r) => r.tipo === 'crea' || r.tipo.startsWith('soll')).slice(0, 2).forEach((r, i) => push('fr|' + (r.id || i) + '|' + r.tipo, { tipo: 'Fatturazione', prio: r.tipo === 'crea' ? 'info' : 'warn', titolo: (r.tipo === 'crea' ? 'Da fatturare: ' : 'Sollecito: ') + r.testo, html: `<span class="t b">${r.tipo === 'crea' ? 'Da fatturare' : 'Sollecito'}:</span> ${esc(r.testo)}`, rel: null, act: r.act, aid: r.id, chi: 'C004' }));
  DB.fattForn.filter((f) => !f.cantiere).forEach((f) => push('ff|' + f.id, { tipo: 'Controllo', prio: 'info', titolo: `Fattura ${fornitore(f.fornitoreId).nome} ${chf(f.importo)} senza cantiere assegnato`, html: `Fattura <span class="t b">${esc(fornitore(f.fornitoreId).nome)} ${chf(f.importo)}</span> senza cantiere assegnato.`, rel: { t: 'fornitore', id: f.fornitoreId }, act: 'open-ff', aid: f.id, chi: 'C004' }));
  const st = sysDone();
  L.forEach((a) => { const s = st[a.id]; if (s && s.done) { a.done = true; a.doneTs = s.ts; } if (s && s.snooze && s.snooze > D.TODAY_ISO) a.snoozed = s.snooze; });
  return all ? L : L.filter((a) => !a.snoozed);
}
function attAll() { return DB.attivita.concat(sysAttivita()); }
function attDue() { return attAll().filter((a) => !a.done && a.data <= D.TODAY_ISO); }
function attPrio(a) { return a.sys ? a.prio : (a.done ? '' : a.data < D.TODAY_ISO ? 'warn' : ''); }
function attSort(a, b) { return (ATT_PRIO[attPrio(a)] - ATT_PRIO[attPrio(b)]) || (a.data + (a.ora || '')).localeCompare(b.data + (b.ora || '')); }
function attDash() { return attDue().sort(attSort); }
function attBucket(a) { const d = Math.round((new Date(a.data) - new Date(D.TODAY_ISO)) / 864e5); return d < 0 ? 'late' : d === 0 ? 'today' : d === 1 ? 'tomorrow' : d <= 7 ? 'week' : 'later'; }
function attOpenBtn(a) { if (a.sys) return `<button class="btn sm" data-act="${a.act}" data-id="${esc(a.aid || '')}">Apri</button>`; return a.rel ? `<button class="btn sm" data-act="${relAct(a.rel)}" data-id="${esc(a.rel.id)}">Apri</button>` : ''; }
function attRow(a, o = {}) {
  const pr = attPrio(a); const ic = ACT_ICON[a.tipo] || I('alarm'); const chi = worker(a.chi) || me();
  const meta = `${a.sys ? 'Automatica · ' + a.tipo : a.tipo} · ${a.data === D.TODAY_ISO ? 'oggi' : fd(a.data)}${a.ora ? ' ' + a.ora : ''} · ${esc(chi.nome.split(' ')[0])}${a.rel ? ' · ' + esc(relName(a.rel)) : ''}`;
  if (o.compact) return `<div class="listrow click att ${pr}" data-act="att-focus" data-id="${esc(a.id)}"><div class="row nowrap" style="align-items:flex-start;min-width:0"><span class="act-ic ${pr}">${ic}</span><div style="min-width:0"><div class="${a.done ? 'muted' : ''}">${a.html || esc(a.titolo)}</div><div class="small muted">${meta}</div></div></div><span class="go">${I('chevron-r')}</span></div>`;
  return `<div class="listrow att ${pr} ${a.done ? 'done' : ''} ${o.focus ? 'focus' : ''}"><div class="row nowrap" style="align-items:flex-start;min-width:0;flex:1"><span class="act-ic ${pr}">${ic}</span><div style="min-width:0"><div class="small muted">${meta}</div><div class="${a.done ? 'muted' : 'b'}" style="${a.done ? 'text-decoration:line-through' : ''}">${a.html || esc(a.titolo)}</div>${a.esito ? `<div class="small">${esc(a.esito)}</div>` : ''}</div></div>
    <span class="row nowrap">${a.done ? pill('Fatta', 'good') + (a.sys ? `<button class="btn sm ghost" data-act="att-undo" data-id="${esc(a.id)}" title="Riapri">${I('refresh')}</button>` : '') : `${attOpenBtn(a)}<button class="btn sm good" data-act="att-done" data-id="${esc(a.id)}">✓ Fatta</button><button class="btn sm ghost" data-act="att-snooze" data-id="${esc(a.id)}" data-tip="Rinvia a domani">${I('clock')}</button>${a.sys ? '' : `<button class="btn sm ghost" data-act="edit-entity" data-ent="attivita" data-id="${esc(a.id)}">${I('edit')}</button>`}`}</span></div>`;
}
function todoCard() {
  const l = attDash(); const n = l.length;
  return `<div class="card todo"><div class="row between"><h3>Da fare oggi</h3><button class="btn sm" data-act="nav" data-id="attivita">Tutte le attività${n ? ' (' + n + ')' : ''}</button></div><div class="actlist">${l.slice(0, 8).map((a) => attRow(a, { compact: true })).join('') || '<p class="muted small">Niente in sospeso: tutto a posto.</p>'}</div>${n > 8 ? `<p class="small muted" style="margin:8px 0 0">e altre ${n - 8} in Attività</p>` : ''}</div>`;
}
function attState() { return S.attF || (S.attF = { who: 'tutte', stato: 'aperte', tipo: '', q: '', quando: '' }); }
const ATT_Q = { late: 'In ritardo', today: 'Oggi', week: 'Prossimi 7 giorni' };
function attQuando(a, q) { const b = attBucket(a); return q === 'late' ? b === 'late' : q === 'today' ? b === 'today' : q === 'week' ? b === 'tomorrow' || b === 'week' : true; }
function vAttivita() {
  const F = attState(); const w = me(); const all = attAll();
  const open = all.filter((a) => !a.done);
  const late = open.filter((a) => a.data < D.TODAY_ISO), oggi = open.filter((a) => a.data === D.TODAY_ISO), sett = open.filter((a) => ['tomorrow', 'week'].includes(attBucket(a))), auto = open.filter((a) => a.sys);
  let l = all.filter((a) => F.stato === 'tutte' ? true : F.stato === 'fatte' ? a.done : !a.done);
  if (F.who === 'mie') l = l.filter((a) => a.chi === w.id);
  if (F.tipo) l = l.filter((a) => F.tipo === 'auto' ? a.sys : a.tipo === F.tipo);
  if (F.quando) l = l.filter((a) => a.done || attQuando(a, F.quando));
  if (F.q) { const q = F.q.toLowerCase(); l = l.filter((a) => (a.titolo + ' ' + (a.esito || '') + ' ' + (a.rel ? relName(a.rel) : '')).toLowerCase().includes(q)); }
  const hidden = sysAttivita(true).filter((a) => a.snoozed).length;
  const groups = [['late', 'In ritardo'], ['today', 'Oggi'], ['tomorrow', 'Domani'], ['week', 'Questa settimana'], ['later', 'Più avanti']];
  const seg = (k, opts) => `<span class="seg">${opts.map((o) => `<button class="${F[k] === o[0] ? 'on' : ''}" data-act="att-f" data-id="${k}|${o[0]}">${o[1]}</button>`).join('')}</span>`;
  const tipi = [['', 'Tutte'], ['auto', I('sparkles') + ' Automatiche'], ['Promemoria', 'Promemoria'], ['Chiamata', 'Chiamate'], ['Riunione', 'Riunioni'], ['Sopralluogo', 'Sopralluoghi'], ['E-mail', 'E-mail'], ['Nota', 'Note']];
  const section = (title, list, tone) => list.length ? `<div class="card"><div class="row between"><h3>${title}</h3><span class="pill ${tone || ''}">${list.length}</span></div><div class="actlist">${list.map((a) => attRow(a, { focus: a.id === S.attFocus })).join('')}</div></div>` : '';
  const openL = l.filter((a) => !a.done).sort(attSort); const doneL = l.filter((a) => a.done).sort((a, b) => (b.doneTs || b.data).localeCompare(a.doneTs || a.data)).slice(0, 20);
  return `<div class="pagehead"><div><div class="eyebrow">Gestione</div><h1>Attività</h1><p class="muted">Promemoria, chiamate, riunioni e i controlli che il gestionale genera da solo: cantieri sotto il break-even, fatture scadute, bollettini con anomalie, firme in attesa, documenti in scadenza. Ogni riga apre l'oggetto collegato; "Fatta" la archivia, l'orologio la rinvia a domani.</p></div><div class="row"><button class="btn primary" data-act="new-entity" data-ent="attivita" data-prefill='${esc(JSON.stringify({ tipo: 'Promemoria', data: D.TODAY_ISO, ora: '09:00', chi: w.id }))}'>+ Attività</button></div></div>
  <div class="kpis att-kpis">
    ${kpi2({ l: 'In ritardo', v: late.length, tn: late.length ? 'bad' : 'good', sub: late.length ? 'da chiudere o rinviare' : 'nessuna', act: 'att-f', id: 'quando|late', tip: 'Mostra solo le attività aperte con data passata', on: F.quando === 'late' })}
    ${kpi2({ l: 'Oggi', v: oggi.length, sub: oggi.filter((a) => a.sys).length + ' automatiche', act: 'att-f', id: 'quando|today', tip: 'Mostra solo le attività di oggi', on: F.quando === 'today' })}
    ${kpi2({ l: 'Prossimi 7 giorni', v: sett.length, sub: sett.filter((a) => a.chi === w.id).length + ' mie', act: 'att-f', id: 'quando|week', tip: 'Mostra solo da domani a 7 giorni', on: F.quando === 'week' })}
    ${kpi2({ l: 'Controlli automatici', v: auto.length, tn: auto.some((a) => a.prio === 'bad') ? 'bad' : auto.length ? 'warn' : 'good', sub: auto.filter((a) => a.prio === 'bad').length + ' urgenti', act: 'att-f', id: 'tipo|auto', tip: 'Generati dai dati: cantieri, fatture, bollettini, firme, documenti', on: F.tipo === 'auto' })}
  </div>
  <div class="row between" style="flex-wrap:wrap;gap:8px"><div class="row" style="flex-wrap:wrap;gap:8px">${seg('who', [['tutte', 'Tutte'], ['mie', 'Mie']])}${seg('stato', [['aperte', 'Aperte'], ['fatte', 'Fatte'], ['tutte', 'Tutte']])}${seg('quando', [['', 'Sempre'], ['late', 'In ritardo'], ['today', 'Oggi'], ['week', '7 giorni']])}${F.quando || F.tipo || F.q || F.who !== 'tutte' ? `<button class="btn sm ghost" data-act="att-f" data-id="reset|" title="Togli tutti i filtri">${I('x')} Azzera filtri</button>` : ''}</div><div class="row"><input type="search" placeholder="Cerca attività…" value="${esc(F.q)}" data-act-change="att-q" style="width:220px;padding:6px 10px;font-size:.85rem">${hidden ? `<button class="btn sm ghost" data-act="att-unsnooze">${hidden} rinviat${hidden === 1 ? 'a' : 'e'} · mostra</button>` : ''}</div></div>
  <div class="chips">${tipi.map((x) => `<button class="${F.tipo === x[0] ? 'on' : ''}" data-act="att-f" data-id="tipo|${x[0]}">${x[1]}</button>`).join('')}</div>
  ${F.stato === 'fatte' ? section('Fatte di recente', doneL, 'good') : groups.map((g) => section(g[1], openL.filter((a) => attBucket(a) === g[0]), g[0] === 'late' ? 'bad' : g[0] === 'today' ? 'warn' : '')).join('') + (F.stato === 'tutte' ? section('Fatte di recente', doneL, 'good') : '')}
  ${!openL.length && F.stato !== 'fatte' ? `<div class="card"><p class="muted">Nessuna attività ${F.quando ? '<b>' + ATT_Q[F.quando].toLowerCase() + '</b> ' : ''}con questi filtri.</p><button class="btn sm" data-act="att-f" data-id="reset|">Mostra tutte</button></div>` : ''}`;
}

// ---------- 2. pianificazione con ore per persona ----------
const ORE_G = () => (P.oreSettimana || 40) / 5;
const CANT_COL = ['#CD2527', '#0F6CBD', '#1E8E4E', '#C77A08', '#7A5AF8', '#0E7C86', '#B5367A'];
const cantCol = (cid) => CANT_COL[Math.max(0, DB.cantieri.findIndex((c) => c.id === cid)) % CANT_COL.length];
const cantShort = (c) => { const n = c.nome.split(',')[0]; return n.length > 24 ? n.slice(0, 22) + '…' : n; };
const sumOre = (arr) => arr.reduce((a, x) => a + (+x.ore || 0), 0);
function weekMonday(day) { const d = new Date(day + 'T12:00'); return addDays(day, -((d.getDay() + 6) % 7)); }
function weekDays(start) { return [0, 1, 2, 3, 4].map((i) => addDays(start, i)); }
const assenzaDi = (wid, day) => DB.assenze.find((x) => x.workerId === wid && x.stato !== 'Rifiutata' && day >= x.dal && day <= x.al);
const startDi = (c) => c && c.kmDaBase > 25 ? '06:30' : '07:00';
function ensurePlanX() {
  if (DB.planX) return DB.planX; DB.planX = {};
  const W = (n) => (DB.workers.find((w) => w.nome === n) || {}).id; const set = (wid, day, arr) => { if (wid) DB.planX[wid + '|' + day] = arr; };
  const own = (wid) => (cantiereDi(wid, '2026-11-03') || {}).id; const other = (wid) => (DB.cantieri.find((c) => c.stato === 'In corso' && c.id !== own(wid) && worker(c.capo).ramo === worker(wid).ramo) || DB.cantieri.find((c) => c.stato === 'In corso' && c.id !== own(wid))).id;
  const rs = W('Roberto Sala'); if (rs && own(rs)) ['2026-11-03', '2026-11-05'].forEach((d) => set(rs, d, [{ c: own(rs), ore: 4, inizio: '07:00', nota: '' }, { c: other(rs), ore: 4, inizio: '12:30', nota: 'Controllo e misure per il SAL' }]));
  const ob = W('Omar Bouzid'); if (ob && own(ob)) set(ob, '2026-11-06', [{ c: own(ob), ore: 4, inizio: '07:00', nota: 'Pomeriggio visita medica' }]);
  const am = W('Andrea Mazzola'); if (am && own(am)) set(am, '2026-11-05', [{ c: own(am), ore: 9.5, inizio: '06:45', nota: 'Consegna piano 1 al cliente' }]);
  const nf = W('Nicola Ferretti'); if (nf) ['2026-11-05', '2026-11-06'].forEach((d) => { set(nf, d, []); DB.plan[nf + '|' + d] = 'none'; });
  const ai = W('Adrian Ionescu'); if (ai) { set(ai, '2026-11-02', []); DB.plan[ai + '|2026-11-02'] = 'none'; }
  const cb = W('Carlo Beltrami'); if (cb && own(cb)) set(cb, '2026-11-04', [{ c: own(cb), ore: 5, inizio: '07:00', nota: '' }, { c: other(cb), ore: 3, inizio: '13:00', nota: 'Trasporto materiale e ponteggio' }]);
  return DB.planX;
}
function planOf(wid, day) { ensurePlanX(); const k = wid + '|' + day; if (DB.planX[k]) return DB.planX[k]; if (assenzaDi(wid, day)) return []; const c = cantiereDi(wid, day); return c ? [{ c: c.id, ore: ORE_G(), inizio: startDi(c), nota: '' }] : []; }
function setPlan(wid, day, arr) { ensurePlanX(); DB.planX[wid + '|' + day] = arr; DB.plan[wid + '|' + day] = arr.length ? arr[0].c : 'none'; }
const COMP_REQ = [[/facciat/i, 'Facciate'], [/facciat/i, 'Ponteggi'], [/cartongesso|controsoffitt/i, 'Cartongesso'], [/intonac|gessatura/i, 'Intonaco'], [/tappezz/i, 'Tappezzeria'], [/resin/i, 'Resine'], [/intumesc/i, 'Intumescenti']];
const compReq = (c) => [...new Set(COMP_REQ.filter((x) => x[0].test(c.tipo || '')).map((x) => x[1]))];
const hasComp = (w, k) => (w.competenze || []).includes(k) || (k === 'Ponteggi' && (w.certificazioni || []).some((x) => /Ponteggi/.test(x)));
function planCant(c, days) {
  const ops = DB.workers.filter((w) => w.ramo !== 'U'); const r = calc(c);
  const oreRim = Math.max((c.orePreviste || 0) - (c.oreFatte || 0), 0);
  const perDay = days.map((d) => ops.map((w) => ({ w, x: planOf(w.id, d).find((x) => x.c === c.id) })).filter((o) => o.x));
  const oreSett = perDay.reduce((a, l) => a + sumOre(l.map((o) => o.x)), 0);
  const wkLeft = Math.max((new Date(c.fine) - new Date(days[0])) / 6048e5, 0.4); const target = oreRim / wkLeft;
  const fineStim = oreSett > 0 ? addDays(days[0], Math.ceil(oreRim / oreSett) * 7 - 3) : null; const ritardo = fineStim ? Math.round((new Date(fineStim) - new Date(c.fine)) / 864e5) : null;
  return { r, oreRim, perDay, oreSett, target, fineStim, ritardo, req: compReq(c) };
}
function vPianificazione() {
  const start = addDays('2026-11-02', S.calWeek * 7); const days = weekDays(start); const v = S.planView || 'cant';
  const cs = DB.cantieri.filter((c) => ['In corso', 'Pianificato'].includes(c.stato)); const ops = DB.workers.filter((w) => w.ramo !== 'U');
  const dayStat = days.map((d) => { const av = ops.filter((w) => !assenzaDi(w.id, d)); const pl = av.filter((w) => planOf(w.id, d).length); return { d, av: av.length, pl: pl.length, ore: av.reduce((a, w) => a + sumOre(planOf(w.id, d)), 0), free: av.filter((w) => !planOf(w.id, d).length), abs: ops.filter((w) => assenzaDi(w.id, d)) }; });
  const orePian = dayStat.reduce((a, s) => a + s.ore, 0), oreCap = dayStat.reduce((a, s) => a + s.av * ORE_G(), 0), liberiGG = dayStat.reduce((a, s) => a + s.free.length, 0);
  const pcs = cs.map((c) => ({ c, p: planCant(c, days) })); const inRit = pcs.filter((x) => x.p.ritardo > 0);
  const straord = ops.reduce((a, w) => a + days.reduce((b, d) => b + Math.max(sumOre(planOf(w.id, d)) - ORE_G(), 0), 0), 0);
  const hdr = `<div class="ph">${v === 'cant' ? 'Cantiere' : 'Collaboratore'}</div>${dayStat.map((s) => `<div class="ph ${s.d === D.TODAY_ISO ? 'today' : ''}">${dow[new Date(s.d + 'T12:00').getDay()]} <small>${fshort(s.d)}</small><br><span class="cap">${s.pl}/${s.av} pers · ${n0(s.ore)} h</span></div>`).join('')}<div class="ph">Ore sett.</div>`;
  const chip = (o) => { const w = o.w, x = o.x; const tot = sumOre(planOf(w.id, o.d)); return `<span class="pchip ${tot > ORE_G() ? 'ot' : x.ore < ORE_G() ? 'half' : ''}" data-act="plan2-person" data-id="${w.id}|${o.d}" data-tip="${esc(w.nome + '\n' + w.ruolo + '\n' + n1(x.ore) + ' h dalle ' + x.inizio + (x.nota ? '\n' + x.nota : '') + (tot > x.ore ? '\n+ ' + n1(tot - x.ore) + ' h su altro cantiere' : ''))}"><span class="avatar xs ${avCls(w)}">${initials(w.nome)}</span><b>${n1(x.ore)}</b></span>`; };
  let grid = '';
  if (v === 'cant') {
    grid = pcs.map(({ c, p }) => `<div class="pr"><span class="num small muted">${c.id}</span><br><button class="elink b" data-act="open-cantiere" data-id="${c.id}">${esc(c.nome)}</button><br><span class="small muted">${esc(c.comune)} · ${c.kmDaBase} km · rim. ${n0(p.oreRim)} h · obiettivo ${n0(p.target)} h/sett</span>${p.req.length ? `<br><span class="small muted">serve: ${p.req.join(', ')}</span>` : ''}</div>${days.map((d, i) => { const l = p.perDay[i].map((o) => ({ ...o, d })); const ore = sumOre(l.map((o) => o.x)); const miss = p.req.filter((k) => l.length && !l.some((o) => hasComp(o.w, k))); const first = l.map((o) => o.x.inizio).sort()[0]; return `<div class="cell ${d === D.TODAY_ISO ? 'today' : ''}" data-act="plan-cell" data-id="${c.id}" data-day="${d}">${l.map(chip).join('')}<span class="tot">${l.length ? `${l.length} pers · ${n1(ore)} h · dalle ${first}` : '–'}</span>${miss.length ? `<span class="tot" style="color:var(--warn)">manca ${miss.join(', ')}</span>` : ''}</div>`; }).join('')}<div class="wk"><span class="num b">${n0(p.oreSett)} h</span><div class="hbar" data-tip="${esc('Pianificate ' + n0(p.oreSett) + ' h su un obiettivo di ' + n0(p.target) + ' h/settimana per finire entro il ' + fd(c.fine))}"><i style="width:${Math.min(p.oreSett / (p.target || 1) * 100, 100)}%;background:${p.ritardo > 0 ? 'var(--warn)' : 'var(--good)'}"></i></div><span class="small ${p.ritardo > 0 ? '' : 'muted'}" style="${p.ritardo > 0 ? 'color:var(--warn)' : ''}">${p.fineStim ? (p.ritardo > 0 ? 'fine ' + fshort(p.fineStim) + ' (+' + p.ritardo + ' gg)' : 'fine ' + fshort(p.fineStim) + ' ✓') : 'nessuno'}</span></div>`).join('')
      + `<div class="pr">Assenti</div>${dayStat.map((s) => `<div class="cell">${s.abs.map((w) => `<span class="pill warn" data-tip="${esc(w.nome + ' · ' + assenzaDi(w.id, s.d).tipo + ' ' + fd(assenzaDi(w.id, s.d).dal) + ' – ' + fd(assenzaDi(w.id, s.d).al))}">${initials(w.nome)} ${assenzaDi(w.id, s.d).tipo}</span>`).join('') || '<span class="small muted">–</span>'}</div>`).join('')}<div class="wk"></div>`
      + `<div class="pr">Non pianificati<br><span class="small muted">clicca per assegnare</span></div>${dayStat.map((s) => `<div class="cell">${s.free.map((w) => `<span class="pchip" data-act="plan2-person" data-id="${w.id}|${s.d}" data-tip="${esc(w.nome + '\n' + w.ruolo + '\nlibero: clicca per pianificare')}"><span class="avatar xs ${avCls(w)}">${initials(w.nome)}</span></span>`).join('') || '<span class="small muted">nessuno</span>'}</div>`).join('')}<div class="wk"><span class="small muted">${liberiGG} gg liberi</span></div>`;
  } else {
    const grp = [['G', 'Gessatura'], ['P', 'Pittura']];
    grid = grp.map(([ramo, lab]) => { const l = ops.filter((w) => w.ramo === ramo); return `<div class="pr grp" style="grid-column:1/-1">${lab} · ${l.length} persone</div>` + l.map((w) => { const tot = days.reduce((a, d) => a + sumOre(planOf(w.id, d)), 0); return `<div class="pr"><div class="row nowrap"><span class="avatar xs ${avCls(w)}">${initials(w.nome)}</span><span style="min-width:0"><button class="elink b" data-act="open-worker" data-id="${w.id}">${esc(w.nome)}</button><br><span class="small muted">${esc(w.ruolo)}</span></span></div></div>${days.map((d) => { const a = assenzaDi(w.id, d); const l2 = planOf(w.id, d); return `<div class="cell ${d === D.TODAY_ISO ? 'today' : ''}" data-act="plan2-person" data-id="${w.id}|${d}">${a ? `<span class="pill warn">${a.tipo}</span>` : l2.map((x) => { const c = cant(x.c); return `<span class="cchip" style="--c:${cantCol(x.c)}" data-tip="${esc(c.nome + '\n' + n1(x.ore) + ' h dalle ' + x.inizio + (x.nota ? '\n' + x.nota : ''))}"><b>${esc(cantShort(c))}</b><span>${n1(x.ore)} h · ${x.inizio}${x.nota ? ' · ' + esc(x.nota) : ''}</span></span>`; }).join('') || '<span class="small muted">+ pianifica</span>'}</div>`; }).join('')}<div class="wk"><span class="num b" style="${tot > P.oreSettimana ? 'color:var(--warn)' : tot < P.oreSettimana && tot > 0 ? 'color:var(--info)' : ''}">${n1(tot)} h</span><br><span class="small muted">${tot > P.oreSettimana ? '+' + n1(tot - P.oreSettimana) + ' straord.' : tot < P.oreSettimana ? n1(P.oreSettimana - tot) + ' h libere' : 'piena'}</span></div>`; }).join(''); }).join('');
  }
  return `<div class="pagehead"><div><div class="eyebrow">Settimana ${fd(start)} – ${fd(days[4])}</div><h1>Pianificazione squadre</h1><p class="muted">Chi lavora dove, con ore e orario di inizio per ogni persona. Una persona può dividere la giornata su due cantieri; la settimana si confronta con le ore che restano per finire in tempo. Clicca una casella per modificare: l'app degli operai e il car pooling si aggiornano.</p></div><div class="row" style="flex-wrap:wrap"><span class="seg"><button class="${v === 'cant' ? 'on' : ''}" data-act="plan-view" data-id="cant">Per cantiere</button><button class="${v === 'pers' ? 'on' : ''}" data-act="plan-view" data-id="pers">Per persona</button></span><button class="btn sm" data-act="cal-week" data-id="-1">‹ Prec.</button><button class="btn sm" data-act="cal-week" data-id="0">Oggi</button><button class="btn sm" data-act="cal-week" data-id="1">Succ. ›</button><button class="btn sm" data-act="plan-copy" data-tip="Copia le assegnazioni della settimana precedente sui giorni senza assenze">${I('copy')} Copia sett. prec.</button><button class="btn sm primary" data-act="plan-notify">${I('send')} Invia alle squadre</button></div></div>
  <div class="kpis">
    ${kpi2({ l: 'Ore pianificate', v: n0(orePian) + ' h', sub: 'su ' + n0(oreCap) + ' h disponibili (' + pct(orePian / (oreCap || 1) * 100) + ')', tn: orePian / (oreCap || 1) < 0.85 ? 'warn' : 'good', tip: 'Somma delle ore assegnate nella settimana contro le ore delle persone presenti (' + ORE_G() + ' h al giorno)' })}
    ${kpi2({ l: 'Giorni-persona liberi', v: liberiGG, sub: liberiGG ? 'da assegnare o recupero ore' : 'tutti pianificati', tn: liberiGG > 5 ? 'warn' : '', tip: 'Persone presenti senza cantiere, sommate sui 5 giorni' })}
    ${kpi2({ l: 'Cantieri in ritardo', v: inRit.length, sub: inRit.length ? inRit.map((x) => cantShort(x.c)).join(', ') : 'tutti in linea con la fine prevista', tn: inRit.length ? 'warn' : 'good', tip: 'A questo ritmo settimanale le ore rimanenti finiscono dopo la data di fine contratto' })}
    ${kpi2({ l: 'Straordinari pianificati', v: n1(straord) + ' h', sub: 'oltre ' + ORE_G() + ' h al giorno (+25% CCL)', tn: straord > 8 ? 'warn' : '', tip: 'Ore oltre la giornata normale già previste in pianificazione' })}
  </div>
  <div class="planwrap"><div class="plan p2">${hdr}${grid}</div></div>
  <div class="grid2"><div class="card"><h3>Fabbisogno per cantiere</h3>${table([{ h: 'Cantiere', cls: 'wrap' }, { h: 'Rimanenti', cls: 'right num' }, { h: 'Sett.', cls: 'right num' }, { h: 'Obiettivo', cls: 'right num' }, { h: 'Fine stimata' }, { h: 'Contratto' }, { h: '' }], pcs.map(({ c, p }) => ({ act: 'open-cantiere', id: c.id, cls: 'click', c: [`<span class="b">${esc(cantShort(c))}</span><br><span class="small muted">${c.avanzamento || 0}% lavori · ${pct((c.oreFatte || 0) / (c.orePreviste || 1) * 100)} ore</span>`, n0(p.oreRim) + ' h', n0(p.oreSett) + ' h', n0(p.target) + ' h', p.fineStim ? fd(p.fineStim) : '–', fd(c.fine), p.ritardo == null ? pill('nessuno', 'warn') : p.ritardo > 0 ? pill('+' + p.ritardo + ' gg', 'warn') : pill('in linea', 'good')] })), { empty: 'Nessun cantiere' })}<p class="small muted" style="margin:8px 0 0">Obiettivo = ore rimanenti del budget divise per le settimane fino alla fine contratto. La fine stimata usa il ritmo di questa settimana.</p></div>
  <div class="stack"><div class="card"><h3>Assenze della settimana</h3>${DB.assenze.filter((a) => a.al >= start && a.dal <= days[4]).map((a) => `<div class="listrow"><span>${esc(worker(a.workerId).nome)} · ${a.tipo}<br><span class="small muted">${fd(a.dal)} – ${fd(a.al)} · ${a.giorni} gg</span></span>${pill(a.stato)}</div>`).join('') || '<p class="muted small">Nessuna</p>'}</div>
  <div class="card"><h3>Furgoni in partenza da Bioggio</h3>${DB.veicoli.filter((v2) => v2.assegnato && v2.stato !== 'In officina').map((v2) => { const w = worker(v2.assegnato); const l = planOf(w.id, D.TODAY_ISO); const c = l.length ? cant(l[0].c) : null; return `<div class="listrow"><span><span class="b num">${v2.targa}</span> ${esc(v2.modello)}<br><span class="small muted">${esc(w.nome)} → ${c ? esc(c.nome) + ' · ' + l[0].inizio : 'ufficio'}</span></span>${pill(v2.stato)}</div>`; }).join('')}<button class="btn sm" style="margin-top:8px" data-act="nav" data-id="veicoli" data-tab="ia">${I('sparkles')} Proposte car pooling</button></div></div></div>`;
}
function planCellModal(m) {
  const c = cant(m.cant); const day = m.day; const ops = DB.workers.filter((w) => w.ramo !== 'U');
  const inCell = ops.map((w) => { const all = planOf(w.id, day); const i = all.findIndex((x) => x.c === c.id); return { w, all, i, x: all[i] }; }).filter((o) => o.x);
  const ore = sumOre(inCell.map((o) => o.x)); const oreRim = Math.max((c.orePreviste || 0) - (c.oreFatte || 0), 0); const req = compReq(c);
  const liberi = ops.filter((w) => !assenzaDi(w.id, day) && !planOf(w.id, day).length && !inCell.some((o) => o.w === w)); const altri = ops.filter((w) => !assenzaDi(w.id, day) && !liberi.includes(w) && !inCell.some((o) => o.w === w));
  return `<div class="row between"><div><h2>${esc(c.nome)}</h2><p class="muted small">${flong(day)} · ${esc(c.comune)} · ${c.kmDaBase} km · capo ${esc(worker(c.capo).nome)}</p></div><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="row" style="gap:14px;flex-wrap:wrap"><span class="small"><b>${inCell.length}</b> persone · <b>${n1(ore)}</b> h pianificate</span><span class="small">rimanenti a budget <b>${n0(oreRim)}</b> h</span>${req.length ? `<span class="small row" style="gap:4px">competenze: ${req.map((k) => `<span class="pill ${inCell.some((o) => hasComp(o.w, k)) ? 'good' : 'warn'}" data-tip="${esc(k + ': ' + (inCell.filter((o) => hasComp(o.w, k)).map((o) => o.w.nome.split(' ')[0]).join(', ') || 'nessuno in squadra questo giorno'))}">${k}</span>`).join('')}</span>` : ''}</div>
    <div>${inCell.map((o) => `<div class="listrow" style="gap:8px;flex-wrap:wrap"><span class="row nowrap" style="min-width:0;flex:1">${avatar(o.w.nome, avCls(o.w) + ' sm')}<span style="min-width:0"><button class="elink b" data-act="open-worker" data-id="${o.w.id}">${esc(o.w.nome)}</button><br><span class="small muted">${esc(o.w.ruolo)}${o.all.length > 1 ? ' · anche ' + o.all.filter((x) => x !== o.x).map((x) => n1(x.ore) + ' h su ' + cantShort(cant(x.c))).join(', ') : ''}</span></span></span><span class="row nowrap"><input type="number" step="0.5" min="0.5" max="12" value="${o.x.ore}" data-plan="${o.w.id}|${day}|${o.i}|ore" style="width:66px" title="Ore" aria-label="Ore"><input type="time" value="${o.x.inizio}" data-plan="${o.w.id}|${day}|${o.i}|inizio" style="width:96px" title="Inizio" aria-label="Inizio"><input value="${esc(o.x.nota || '')}" placeholder="nota" data-plan="${o.w.id}|${day}|${o.i}|nota" style="width:150px" aria-label="Nota"><button class="btn sm" data-act="plan2-remove" data-id="${o.w.id}|${day}|${o.i}">Togli</button></span></div>`).join('') || '<p class="muted small">Nessuno pianificato: aggiungi dalla lista.</p>'}</div>
    <form data-act="plan2-add" class="row" style="flex-wrap:wrap;gap:8px"><select name="wid" style="flex:1;min-width:220px" aria-label="Persona"><optgroup label="Liberi quel giorno (${liberi.length})">${liberi.map((w) => `<option value="${w.id}">${esc(w.nome)} · ${esc(w.ruolo)}</option>`).join('')}</optgroup><optgroup label="Già pianificati altrove">${altri.map((w) => `<option value="${w.id}">${esc(w.nome)} · ${esc(w.ruolo)} (${planOf(w.id, day).map((x) => n1(x.ore) + ' h ' + cantShort(cant(x.c))).join(', ')})</option>`).join('')}</optgroup></select><input name="ore" type="number" step="0.5" min="0.5" max="12" value="${ORE_G()}" style="width:66px" aria-label="Ore"><input name="inizio" type="time" value="${startDi(c)}" style="width:96px" aria-label="Inizio"><label class="row small" style="font-weight:500;white-space:nowrap"><input type="checkbox" name="week" checked> tutta la settimana</label><button class="btn primary" type="submit">Aggiungi</button></form>
    <p class="small muted">Con meno di ${ORE_G()} h la persona resta disponibile per un secondo cantiere nello stesso giorno. Le modifiche arrivano subito sull'app degli operai ("La mia settimana") e all'assistente car pooling.</p>`;
}
function planPersonModal(m) {
  const w = worker(m.wid); const day = m.day; const a = assenzaDi(w.id, day); const arr = planOf(w.id, day); const tot = sumOre(arr);
  const cs = DB.cantieri.filter((c) => ['In corso', 'Pianificato'].includes(c.stato));
  return `<div class="row between"><div><h2>${esc(w.nome)}</h2><p class="muted small">${esc(w.ruolo)} · ${flong(day)} · ${n1(tot)} h pianificate${w.competenze && w.competenze.length ? ' · ' + esc(w.competenze.join(', ')) : ''}</p></div><button class="btn sm" data-act="close">Chiudi</button></div>
    ${a ? `<div class="alert warn"><span>${I('alert')}</span><span>${a.tipo} dal ${fd(a.dal)} al ${fd(a.al)} (${a.stato}): non pianificabile.</span></div>` : ''}
    <div class="stack">${arr.map((x, i) => { const c = cant(x.c); return `<div class="card" style="padding:10px 12px;border-left:3px solid ${cantCol(x.c)}"><div class="form"><div class="full"><label>Cantiere</label><select data-plan="${w.id}|${day}|${i}|c">${cs.map((k) => `<option value="${k.id}" ${k.id === x.c ? 'selected' : ''}>${k.id} · ${esc(k.nome)}</option>`).join('')}</select></div><div><label>Ore</label><input type="number" step="0.5" min="0.5" max="12" value="${x.ore}" data-plan="${w.id}|${day}|${i}|ore"></div><div><label>Inizio</label><input type="time" value="${x.inizio}" data-plan="${w.id}|${day}|${i}|inizio"></div><div class="full"><label>Nota</label><input value="${esc(x.nota || '')}" placeholder="es. solo mattina, consegna materiale, ritrovo in magazzino" data-plan="${w.id}|${day}|${i}|nota"></div></div><div class="row between" style="margin-top:6px"><span class="small muted">${c ? esc(c.comune) + ' · ' + c.kmDaBase + ' km · capo ' + esc(worker(c.capo).nome.split(' ')[0]) : ''}</span><button class="btn sm" data-act="plan2-remove" data-id="${w.id}|${day}|${i}">Togli</button></div></div>`; }).join('') || (a ? '' : '<p class="muted small">Nessun cantiere questo giorno.</p>')}</div>
    ${a ? '' : `<div class="row"><button class="btn" data-act="plan2-padd" data-id="${w.id}|${day}">+ Aggiungi cantiere</button><button class="btn" data-act="plan2-week" data-id="${w.id}|${day}" data-tip="Applica la stessa giornata da lunedì a venerdì, saltando le assenze">${I('copy')} Copia su tutta la settimana</button></div>`}
    ${tot > ORE_G() ? `<p class="small" style="color:var(--warn)">${n1(tot - ORE_G())} h oltre le ${ORE_G()} h normali: straordinario (+25% secondo CCL) se confermato dal bollettino.</p>` : ''}`;
}
function opWeekCard(w) {
  const days = weekDays(weekMonday(D.TODAY_ISO)); const tot = days.reduce((a, d) => a + sumOre(planOf(w.id, d)), 0);
  return `<div class="card" style="padding:12px 14px"><div class="row between"><div class="eyebrow">La mia settimana</div><span class="small b num">${n1(tot)} h pianificate</span></div>${days.map((d) => { const a = assenzaDi(w.id, d); const l = planOf(w.id, d); return `<div class="row between" style="padding:5px 0;border-bottom:1px solid var(--line);align-items:flex-start;${d === D.TODAY_ISO ? 'font-weight:600' : ''}"><span class="small num" style="white-space:nowrap">${dow[new Date(d + 'T12:00').getDay()]} ${fshort(d)}</span><span class="small" style="text-align:right;min-width:0">${a ? pill(a.tipo, 'warn') : l.map((x) => `${esc(cantShort(cant(x.c)))} · ${n1(x.ore)} h · ${x.inizio}${x.nota ? '<br><span class="muted">' + esc(x.nota) + '</span>' : ''}`).join('<br>') || '<span class="muted">libero</span>'}</span></div>`; }).join('')}</div>`;
}

// ---------- gestori ----------
document.addEventListener('click', (e) => {
  const h = e.target.closest('[data-act]'); if (!h) return; const act = h.dataset.act, id = h.dataset.id; const m = S.modal;
  const findAtt = (i) => DB.attivita.find((x) => x.id === i) || sysAttivita(true).find((x) => x.id === i);
  const H = {
    'att-focus': () => { S.attFocus = id; Object.assign(attState(), { who: 'tutte', stato: 'aperte', tipo: '', q: '', quando: '' }); go('attivita'); setTimeout(() => { const el = document.querySelector('.att.focus'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 30); return 'skip'; },
    'att-f': () => { const [k, v] = id.split('|'); const F = attState(); if (k === 'reset') Object.assign(F, { who: 'tutte', stato: 'aperte', tipo: '', q: '', quando: '' }); else { const toggle = (k === 'quando' || k === 'tipo') && F[k] === v && v; F[k] = toggle ? '' : v; if ((k === 'quando' && v) || (k === 'tipo' && v === 'auto')) F.stato = 'aperte'; } S.attFocus = null; if (S.view !== 'attivita') { go('attivita'); return 'skip'; } },
    'att-done': () => { const a = findAtt(id); if (!a) return; if (a.sys) sysDone()[id] = { done: true, ts: nowISO() }; else a.done = true; toast(a.sys ? 'Controllo archiviato: riappare se il problema torna' : 'Attività completata'); },
    'att-undo': () => { delete sysDone()[id]; toast('Riaperta'); },
    'att-snooze': () => { const a = findAtt(id); if (!a) return; if (a.sys) sysDone()[id] = { snooze: addDays(D.TODAY_ISO, 1) }; else a.data = addDays(a.data > D.TODAY_ISO ? a.data : D.TODAY_ISO, 1); toast('Rinviata a domani'); },
    'att-unsnooze': () => { Object.keys(sysDone()).forEach((k) => { if (sysDone()[k].snooze) delete sysDone()[k]; }); toast('Attività rinviate di nuovo visibili'); },
    'plan-view': () => { S.planView = id; },
    'plan2-person': () => { const [wid, day] = id.split('|'); S.modal = { type: 'plan-person', wid, day }; },
    'plan2-remove': () => { const [wid, day, i] = id.split('|'); const arr = planOf(wid, day).map((x) => ({ ...x })); arr.splice(+i, 1); setPlan(wid, day, arr); toast(worker(wid).nome.split(' ')[0] + ': giornata aggiornata'); },
    'plan2-padd': () => { const [wid, day] = id.split('|'); const arr = planOf(wid, day).map((x) => ({ ...x })); const used = arr.map((x) => x.c); const c = DB.cantieri.find((k) => k.stato === 'In corso' && !used.includes(k.id)) || DB.cantieri.find((k) => k.stato === 'In corso'); const rest = Math.max(ORE_G() - sumOre(arr), 2); arr.push({ c: c.id, ore: rest, inizio: arr.length ? '13:00' : startDi(c), nota: '' }); setPlan(wid, day, arr); },
    'plan2-week': () => { const [wid, day] = id.split('|'); const arr = planOf(wid, day); weekDays(weekMonday(day)).forEach((d) => { if (d !== day && !assenzaDi(wid, d)) setPlan(wid, d, arr.map((x) => ({ ...x }))); }); toast(worker(wid).nome.split(' ')[0] + ': stessa giornata da lunedì a venerdì'); },
    'plan-copy': () => { const start = addDays('2026-11-02', S.calWeek * 7); let n = 0; DB.workers.filter((w) => w.ramo !== 'U').forEach((w) => weekDays(start).forEach((d) => { if (assenzaDi(w.id, d)) return; const prev = planOf(w.id, addDays(d, -7)); setPlan(w.id, d, prev.map((x) => ({ ...x }))); n += prev.length; })); toast('Copiate ' + n + ' assegnazioni dalla settimana precedente'); },
    'plan-notify': () => { const start = addDays('2026-11-02', S.calWeek * 7); const ops = DB.workers.filter((w) => w.ramo !== 'U' && weekDays(start).some((d) => planOf(w.id, d).length)); ops.forEach((w) => DB.messaggi.push({ id: uid('M'), ch: dmId(S.user.wid, w.id), autore: S.user.wid, testo: `Pianificazione settimana ${fd(start)}: ${weekDays(start).map((d) => dow[new Date(d + 'T12:00').getDay()] + ' ' + (planOf(w.id, d).map((x) => cantShort(cant(x.c)) + ' ' + n1(x.ore) + ' h dalle ' + x.inizio).join(' + ') || (assenzaDi(w.id, d) || {}).tipo || 'libero')).join(' · ')}`, ts: nowISO(), letto: false })); toast('Pianificazione inviata a ' + ops.length + ' operai: notifica push e scheda "La mia settimana" aggiornate'); },
  };
  if (!H[act]) return; e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset;
  if (ds.plan) { const [wid, day, i, k] = ds.plan.split('|'); const arr = planOf(wid, day).map((x) => ({ ...x })); const x = arr[+i]; if (!x) return; x[k] = k === 'ore' ? Math.max(0.5, Math.min(12, +t.value || 0)) : t.value; setPlan(wid, day, arr); render(); return; }
  if (ds.actChange === 'att-q') { attState().q = t.value.trim(); S.attFocus = null; render(); }
});
document.addEventListener('submit', (e) => {
  const f = e.target; if (f.dataset.act !== 'plan2-add') return; e.preventDefault();
  const m = S.modal; const wid = f.wid.value; if (!wid) return; const ore = Math.max(0.5, Math.min(12, +f.ore.value || ORE_G())); const inizio = f.inizio.value || startDi(cant(m.cant));
  const days = f.week.checked ? weekDays(weekMonday(m.day)) : [m.day]; let n = 0;
  days.forEach((d) => { if (assenzaDi(wid, d)) return; let arr = planOf(wid, d).map((x) => ({ ...x })).filter((x) => x.c !== m.cant); if (ore >= ORE_G()) arr = []; arr.push({ c: m.cant, ore, inizio, nota: '' }); setPlan(wid, d, arr); n++; });
  toast(worker(wid).nome + ' pianificato su ' + cant(m.cant).nome + ' (' + n + ' giorn' + (n === 1 ? 'o' : 'i') + ', ' + n1(ore) + ' h)'); render();
});

// v10.1: bollettino dell'operaio precompilato dal piano della settimana (l'operaio conferma o corregge)
function opBolPrefill() {
  const w = me(); if (!w || typeof planOf !== 'function') return '';
  const p = planOf(w.id, D.TODAY_ISO); if (!p.length) return '';
  const F = S.bolForm; if (!F._fromPlan) { F._fromPlan = true; F.cantiere = p[0].c; if (!F._fromClock) F.ore = sumOre(p); }
  const txt = p.map((x) => `<b>${esc(cant(x.c).nome)}</b> · ${n1(x.ore)} h dalle ${x.inizio}`).join('<br>');
  return `<div class="card" style="padding:10px 12px;border-left:3px solid var(--brand)"><div class="small muted">${I('calendar')} Dal piano della settimana</div><div style="margin:2px 0">${txt}</div><div class="small muted">Se è giusto, controlla le attività e invia. Altrimenti correggi qui o a voce.</div></div>`;
}
