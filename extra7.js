/* MyColor Gestionale – v12: lavagna di pianificazione, CCL per ramo con calendari aziendali e guida, export Commissione
   paritetica, bollettini (modifica e approva, veicolo, agenzia, GPS con finestra oraria), prezzi dallo storico,
   capitolato da più file. Vedi REQUISITI-IVO.md, sezione 2, punti 4-10. */

// ---------- CCL per ramo e calendari aziendali 2026 (dalle foto di Ivo) ----------
const MESI7 = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const CCL7_BASE = {
  G: { label: 'Gessatura', ccl: 'CCL per gessatori, stuccatori, montatori a secco, plafonatori e intonacatori TI', oreAnnue: 2018, giorni: 247, straordSoglia: 44.5, straordPct: 25, pranzo: [[30, 15], [40, 20], [60, 27], [9999, 37]], conguaglio: 'Mensile: ore effettive contro ore del calendario aziendale, saldo entro il 5 del mese dopo', viaggio: 'Prima ora di trasferta al giorno a carico del collaboratore, oltre pagata come lavoro (da verificare le soglie km sul testo 2026)', flessibilita: 'senza flessibilità (scelta ditta)', mesi: [[160, '8', 20], [160, '8', 20], [160, '8', 20], [170, '8 → 8.5', 21], [144.5, '8.5', 17], [161.5, '8.5', 19], [195.5, '8.5', 23], [178.5, '8.5', 21], [176, '8', 22], [176, '8', 22], [168, '8', 21], [168, '8', 21]], verifica: 'Il testo 2026 del CCL gessatori TI non è pubblicato online: valori dagli appunti di Ivo e dal calendario aziendale, da confermare sul PDF del CCL.' },
  P: { label: 'Pittura', ccl: 'CCL pittura, verniciatura, tappezzeria e sabbiatura TI (1.5.2026 – 31.3.2029)', oreAnnue: 2016, giorni: 247, straordSoglia: 44, straordPct: 25, pranzo: null, conguaglio: 'Per ore: saldo progressivo di ore in più o in meno, compensato nei mesi successivi', viaggio: 'Tempo di viaggio dalla sede al cantiere secondo CCL TI; nella demo i primi 15 min non sono pagati (parametro)', flessibilita: 'senza flessibilità (scelta ditta)', mesi: [[160, '8', 20], [160, '8', 20], [160, '8', 20], [168, '8', 21], [144.5, '8.5', 17], [161.5, '8.5', 19], [195.5, '8.5', 23], [178.5, '8.5', 21], [176, '8', 22], [176, '8', 22], [168, '8', 21], [168, '8', 21]], verifica: 'Il CCL pittura TI dice 44 h settimanali e +25% oltre; Ivo ha citato 44.5 h: da chiarire con lui quale soglia applica l\'azienda.' },
};
const ccl7 = (ramo) => { ensure7(); return DB.ccl7[ramo === 'G' ? 'G' : 'P']; };
function indennita7(w, c) {
  if (w.ramo !== 'G') return indennitaPranzo(w, c);
  const km = c ? (c.kmDaBase || 0) : 0; const sc = ccl7('G').pranzo.find((x) => km <= x[0]) || [0, 37];
  return { tipo: 'Gessatori, ' + km + ' km dalla sede', val: sc[1], unit: '/giorno', km };
}
const FISSI7 = [{ pos: '1.1', desc: 'Impianto cantiere: installazione, trasporto materiali, uso furgoni, sgombero e pulizia finale', un: 'ac', qta: 1, prezzo: 200, freq: 100 }, { pos: '1.2', desc: 'Protezione pavimentazione e serramenti con carta, plastica e nastro, compreso uso e rimozione', un: 'ac', qta: 1, prezzo: 600, freq: 94 }, { pos: '1.3', desc: 'Smaltimento rifiuti in discarica autorizzata compresa tassa ecologica', un: 'ac', qta: 1, prezzo: 300, freq: 98 }];
const LAV_ATTESA7 = [['Farmacia Coop', 'MC 223/26'], ['Gentilino', 'MC 270/26'], ['Masoni Arogno', 'MC 286/26'], ['Via Frasca', 'MC 271/26'], ['Paradiso 3U', 'MC 287/26'], ['Pesciallo', 'MC 276/26'], ['Lupoli Bedano', 'MC 160/26'], ['Vitalini Lugano', 'MC 255/26'], ['Morbio Engelstein', 'MC 252/26'], ['Solari', 'MC 249/26'], ['Crespi', 'MC 259/26'], ['Coop Melide', 'MC 272/26']];

// ---------- migrazione dati (idempotente) ----------
function ensure7() {
  if (typeof ensure6 === 'function') ensure6();
  if (!DB.ccl7) DB.ccl7 = clone(CCL7_BASE);
  if (!DB.planNote) DB.planNote = { '2026-11-12': 'Giovedì 12 riservato Masoni' };
  if (!DB.planAg) DB.planAg = {};
  if (!DB.workers.some((w) => w.agenzia)) {
    const tpl = DB.workers.find((w) => w.ramo === 'P' && w.cat === 'B') || DB.workers[5];
    const mk = (id, nome, ramo, agenzia, residenza, comp, stag) => { const w = { ...clone(tpl), id, nome, ramo, cat: stag ? 'APP' : 'B', ruolo: (stag ? 'Stagiaire ' : 'Interinale ') + agenzia, agenzia, stag: !!stag, residenza, anni: 0, competenze: comp, veicolo: null, certificazioni: ['Sicurezza Suva'], vacanzeTot: 0, vacanzeUsate: 0, app: 'Non invitato', email: '', permesso: 'B', salario: 0, eta: stag ? 19 : 34 }; D.workerCosts(w, P); return w; };
    DB.workers.push(mk('AG1', 'Luca Varrone', 'P', 'Adecco', 'Lugano', ['Tinteggiatura', 'Preparazione']), mk('AG2', 'Milan Petrić', 'G', 'Manpower', 'Massagno', ['Cartongesso', 'Intonaco']), mk('AG3', 'Noemi Ferrari', 'P', 'SPAI', 'Agno', ['Preparazione'], true));
    if (typeof setPlan === 'function') { setPlan('AG1', D.TODAY_ISO, [{ c: 'MC 20-26.421', ore: 8, inizio: '07:00', nota: 'agenzia' }]); setPlan('AG2', D.TODAY_ISO, [{ c: 'MC 20-26.415', ore: 8, inizio: '07:00', nota: 'agenzia' }]); }
  }
  ['gpsDa', 'gpsA', 'pausaOra'].forEach((k, i) => { if (!P[k]) P[k] = ['06:30', '18:30', '11:55'][i]; }); if (!P.gpsRaggio) P.gpsRaggio = 500;
  DB.capitolati.forEach((cp) => { if (!cp.files) { cp.files = [{ n: cp.file, t: 'Capitolato' }, { n: 'Piani_esecutivi_facciate.pdf', t: 'Piani esecutivi' }, { n: 'Planimetrie_vani_scala.dwg', t: 'Disegno CAD' }, { n: 'Render_facciata_sud.jpg', t: 'Render' }, { n: 'Modulo_offerta.xlsx', t: 'Modulo d\'offerta' }]; cp.prompt = 'Stabile abitato, lavori in 2 fasi; il ponteggio lo quotiamo con Lawil; colore facciate secondo campione.'; cp.misure = misure7(cp); } });
  if (!S.cpc) S.cpc = { da: '2026-11-01', a: D.TODAY_ISO, chi: '' };
}
function misure7(cp) {
  const tot = cp.posizioni.reduce((a, p) => a + (p[2] === 'm²' ? p[3] : 0), 0) || 1850;
  if (/gess|cartong|rei|controsoff|intonac/i.test(cp.titolo + ' ' + cp.riassunto)) return [['Aule piano terra (6)', 'pareti divisorie', Math.round(tot * 0.3), 'piani esecutivi'], ['Aule piano 1 (8)', 'pareti divisorie', Math.round(tot * 0.34), 'piani esecutivi'], ['Corridoi e atrio', 'controsoffitti', Math.round(tot * 0.26), 'planimetrie CAD, h 3.2 m'], ['Servizi e locali tecnici', 'contropareti', Math.round(tot * 0.1), 'planimetrie CAD'], ['Raccordi e profili', 'ml', 340, 'dettagli esecutivi']];
  return [['Facciata sud', 'pareti', Math.round(tot * 0.28), 'piani esecutivi'], ['Facciata nord', 'pareti', Math.round(tot * 0.26), 'piani esecutivi'], ['Facciate est / ovest', 'pareti', Math.round(tot * 0.2), 'piani esecutivi'], ['Vani scala A e B', 'pareti + soffitti', Math.round(tot * 0.21), 'planimetrie CAD, h 2.6 m'], ['Sottogronda e travi', 'ml', 120, 'render + piani']];
}

// ---------- utilità ----------
const cantDisplay7 = (id) => String(id).replace(/MC 20-26\.(\d{3})/g, 'MC $1/26');
const weekStart7 = () => addDays('2026-11-02', S.calWeek * 7);
function lavDay7() { const days = weekDays(weekStart7()); if (S.lavDay && days.includes(S.lavDay)) return S.lavDay; return days.includes(D.TODAY_ISO) ? D.TODAY_ISO : days[0]; }
const ltag7 = (w, day) => `<div class="ltag ${w.agenzia ? (w.stag ? 'stag' : 'ag') : ''}" draggable="true" data-drag="${w.id}" data-act="plan2-person" data-id="${w.id}|${day}" title="${esc(w.ruolo)}"><span class="avatar xs ${avCls(w)}">${initials(w.nome)}</span><span class="ltxt"><b>${esc(w.nome.split(' ').slice(-1)[0].toUpperCase())}</b> ${esc(w.nome.split(' ')[0])}${w.agenzia ? `<br><span class="small muted">${esc(w.ruolo)}</span>` : ''}</span></div>`;

// ---------- 4. LAVAGNA DI PIANIFICAZIONE ----------
function lavagna7() {
  ensure7(); const start = weekStart7(); const days = weekDays(start); const day = lavDay7();
  const cs = DB.cantieri.filter((c) => ['In corso', 'Pianificato'].includes(c.stato)); const ops = DB.workers.filter((w) => w.ramo !== 'U');
  const where = (w) => { const p = planOf(w.id, day); return p.length ? p[0].c : null; };
  const vans = DB.veicoli.filter((v) => v.assegnato && v.stato !== 'In officina').map((v) => ({ v, c: where(worker(v.assegnato)), w: worker(v.assegnato) }));
  const col = (c) => { const l = ops.filter((w) => where(w) === c.id); const ore = l.reduce((a, w) => a + sumOre(planOf(w.id, day)), 0); const vv = vans.filter((x) => x.c === c.id); return `<div class="lavcol" data-drop="${c.id}"><div class="lavhd"><span class="num small muted">${c.id}</span><br><b>${esc(cantShort(c))}</b><br><span class="small muted">${esc(c.comune)} · ${l.length} pers · ${n0(ore)} h</span></div>${vv.map((x) => `<div class="ltag van" title="${esc(x.v.modello)} · ${esc(x.w.nome)}">${I('truck')} <span class="ltxt"><b>${esc(x.v.targa)}</b> <span class="small muted">${esc(x.w.nome.split(' ')[0])}</span></span></div>`).join('')}${l.map((w) => ltag7(w, day)).join('')}${l.length ? '' : '<div class="lavempty">trascina qui le persone</div>'}</div>`; };
  const free = ops.filter((w) => !w.agenzia && !assenzaDi(w.id, day) && !where(w)); const ag = ops.filter((w) => w.agenzia && !where(w)); const abs = ops.filter((w) => assenzaDi(w.id, day));
  const poolVans = vans.filter((x) => !x.c);
  return `<div class="card" style="padding:10px 14px"><div class="row between" style="flex-wrap:wrap"><div class="chips">${days.map((d) => `<button data-act="lav-day" data-id="${d}" class="${d === day ? 'on' : ''}">${dow[new Date(d + 'T12:00').getDay()]} ${fshort(d)}</button>`).join('')}</div><label class="row nowrap small" style="gap:6px;cursor:pointer"><input type="checkbox" data-act="lav-week" ${S.lavWeek ? 'checked' : ''}> Applica lo spostamento a tutta la settimana</label></div>
    <div class="row nowrap" style="margin-top:8px;align-items:flex-start"><span class="small muted" style="white-space:nowrap;padding-top:8px">${I('note')} Nota del giorno</span><input data-lavnote="${day}" value="${esc(DB.planNote[day] || '')}" placeholder="es. giovedì 12 riservato Masoni, furgone 9 in officina"></div></div>
    <p class="small muted">La lavagna dell'ufficio: una colonna per cantiere, targhette con le persone e i furgoni. Trascina una targhetta da una colonna all'altra; clicca per ore e orario. Le persone di agenzia e gli stagiaire sono in arancione.</p>
    <div class="lav">${cs.map(col).join('')}
      <div class="lavcol pool" data-drop="free"><div class="lavhd"><b>Non pianificati</b><br><span class="small muted">${free.length} persone</span></div>${free.map((w) => ltag7(w, day)).join('') || '<div class="lavempty">nessuno</div>'}</div>
      <div class="lavcol pool" data-drop="free"><div class="lavhd"><b>Agenzia e stagiaire</b><br><span class="small muted">${ag.length} disponibili</span></div>${ag.map((w) => ltag7(w, day)).join('') || '<div class="lavempty">tutti pianificati</div>'}${poolVans.map((x) => `<div class="ltag van">${I('truck')} <span class="ltxt"><b>${esc(x.v.targa)}</b> <span class="small muted">al magazzino</span></span></div>`).join('')}</div>
      <div class="lavcol pool ro"><div class="lavhd"><b>Assenti</b><br><span class="small muted">${abs.length}</span></div>${abs.map((w) => `<div class="ltag abs"><span class="avatar xs ${avCls(w)}">${initials(w.nome)}</span><span class="ltxt"><b>${esc(w.nome.split(' ').slice(-1)[0].toUpperCase())}</b><br><span class="small muted">${esc(assenzaDi(w.id, day).tipo)}</span></span></div>`).join('') || '<div class="lavempty">nessuno</div>'}</div></div>
    <div class="card"><div class="row between"><h3>Acquisiti, in attesa di pianificazione</h3><span class="small muted">in basso a sinistra sulla lavagna</span></div><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${LAV_ATTESA7.map((x) => `<button class="pill" data-act="new-entity" data-ent="cantiere" data-prefill='${esc(JSON.stringify({ nome: x[0], stato: 'Pianificato', tipo: 'Pittura' }))}' title="Crea il cantiere e pianificalo" style="cursor:pointer">${esc(x[0])} <span class="muted num">${x[1]}</span></button>`).join('')}</div></div>`;
}
const vPian0 = vPianificazione;
vPianificazione = function () {
  ensure7(); const v = S.planView || 'cant'; let out = vPian0();
  out = out.replace(/(data-act="plan-view" data-id="pers">Per persona<\/button>)/, `$1<button class="${v === 'lavagna' ? 'on' : ''}" data-act="plan-view" data-id="lavagna">${I('layers')} Lavagna</button>`);
  if (v !== 'lavagna') return out;
  const i0 = out.indexOf('<div class="planwrap">'); const i1 = out.indexOf('<div class="grid2">', i0); if (i0 < 0 || i1 < 0) return out;
  return out.slice(0, i0) + lavagna7() + out.slice(i1);
};
function lavDrop7(wid, target) {
  const w = worker(wid); const days = S.lavWeek ? weekDays(weekStart7()) : [lavDay7()]; let n = 0;
  days.forEach((d) => { if (assenzaDi(wid, d)) return; if (target === 'free') setPlan(wid, d, []); else { const c = cant(target); if (!c) return; setPlan(wid, d, [{ c: c.id, ore: ORE_G(), inizio: startDi(c), nota: w.agenzia ? 'agenzia' : '' }]); } n++; });
  toast(w.nome.split(' ')[0] + (target === 'free' ? ' tolto dalla pianificazione' : ' su ' + cant(target).nome) + (n > 1 ? ' per ' + n + ' giorni' : ''));
}
document.addEventListener('dragstart', (e) => { const t = e.target.closest && e.target.closest('[data-drag]'); if (!t) return; S._drag7 = t.dataset.drag; try { e.dataTransfer.setData('text/plain', S._drag7); e.dataTransfer.effectAllowed = 'move'; } catch (_) {} });
document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('[data-drop]'); if (!col || !S._drag7) return; e.preventDefault(); col.classList.add('over'); });
document.addEventListener('dragleave', (e) => { const col = e.target.closest && e.target.closest('[data-drop]'); if (col) col.classList.remove('over'); });
document.addEventListener('drop', (e) => { const col = e.target.closest && e.target.closest('[data-drop]'); if (!col || !S._drag7) return; e.preventDefault(); lavDrop7(S._drag7, col.dataset.drop); S._drag7 = null; render(); });

// ---------- 5. CCL: impostazioni, guida, indennità per ramo ----------
function cclTab7() {
  const ramo = S.cclRamo || 'G'; const R = ccl7(ramo); const other = ramo === 'G' ? 'P' : 'G';
  const tot = R.mesi.reduce((a, m) => a + m[0], 0); const gg = R.mesi.reduce((a, m) => a + m[2], 0);
  return `<div class="row between" style="flex-wrap:wrap"><span class="seg"><button class="${ramo === 'G' ? 'on' : ''}" data-act="ccl-ramo" data-id="G">Gessatura</button><button class="${ramo === 'P' ? 'on' : ''}" data-act="ccl-ramo" data-id="P">Pittura</button></span><div class="row"><button class="btn" data-act="cpc-open">${I('shield')} Export Commissione paritetica</button><button class="btn" data-act="toast" data-msg="Guida CCL inviata nell'app a tutti gli operai del ramo ${R.label.toLowerCase()}">${I('send')} Pubblica la guida nell'app</button></div></div>
    <div class="alert warn"><span>${I('alert')}</span><span>${esc(R.verifica)}</span></div>
    <div class="grid2"><div class="card pad0"><div class="cardhd"><h3>Calendario aziendale 2026 · ${R.label}</h3><span class="small muted">${R.flessibilita}</span></div>${table([{ h: 'Mese' }, { h: 'Giorni', cls: 'right num' }, { h: 'Ore/giorno', cls: 'right num' }, { h: 'Ore mese', cls: 'right num' }], R.mesi.map((m, i) => ({ c: [MESI7[i], m[2], m[1], `<span class="b">${n1(m[0])}</span>`] })).concat([{ cls: 'b', c: ['Totale', gg, '', `<span class="b">${n1(tot)} h</span>`] }]))}<p class="small muted" style="padding:8px 16px">Sabato, domenica e festivi infrasettimanali esclusi (Capodanno, Epifania, San Giuseppe, Lunedì di Pasqua, 1º maggio, Ascensione, Pentecoste, Corpus Domini, SS. Pietro e Paolo, Ognissanti, Immacolata, Natale, Santo Stefano). Il conguaglio e i saldi ore usano queste ore mese, non 174 h fisse.</p></div>
    <div class="stack"><div class="card"><h3>Regole ${R.label.toLowerCase()} applicate dal sistema</h3><dl class="dl"><dt>Contratto</dt><dd>${esc(R.ccl)}</dd><dt>Ore annue</dt><dd class="num">${n0(R.oreAnnue)} h su ${R.giorni} giorni</dd><dt>Straordinario</dt><dd>oltre <b>${R.straordSoglia} h</b> a settimana: +${R.straordPct}% in tempo o in denaro</dd><dt>Indennità pranzo</dt><dd>${R.pranzo ? 'per giorno, secondo la tratta semplice dalla sede: ' + R.pranzo.map((x, i) => (i === 0 ? '0–' + x[0] : i === R.pranzo.length - 1 ? 'oltre ' + R.pranzo[i - 1][0] : (R.pranzo[i - 1][0] + 1) + '–' + x[0]) + ' km ' + chf(x[1])).join(' · ') + '. Non dovuta per malattia, infortunio, vacanze.' : 'fuori sede oltre ' + P.pranzoSogliaKm + ' km: ' + chf(P.pranzoPittoriGiorno) + '/giorno (CCL TI: forfait 200/mese)'}</dd><dt>Tempo di viaggio</dt><dd>${esc(R.viaggio)}</dd><dt>Conguaglio</dt><dd>${esc(R.conguaglio)}</dd><dt>Commissione paritetica</dt><dd>bollettini con nome, luogo, ore, orario, km e indennità esportabili per periodo; archivio consultabile 5 anni</dd></dl></div>
    <div class="card"><h3>Parametri modificabili</h3><div class="form"><div><label>Soglia straordinario</label><div class="row nowrap"><input type="number" step="0.5" value="${R.straordSoglia}" data-ccl7="${ramo}|straordSoglia"><span class="small muted">h/settimana</span></div></div><div><label>Supplemento</label><div class="row nowrap"><input type="number" step="5" value="${R.straordPct}" data-ccl7="${ramo}|straordPct"><span class="small muted">%</span></div></div>${R.pranzo ? R.pranzo.map((x, i) => `<div><label>Pranzo ${i === R.pranzo.length - 1 ? 'oltre ' + R.pranzo[i - 1][0] + ' km' : 'fino a ' + x[0] + ' km'}</label><div class="row nowrap"><input type="number" step="1" value="${x[1]}" data-ccl7="${ramo}|pranzo|${i}"><span class="small muted">CHF/giorno</span></div></div>`).join('') : ''}</div><p class="small muted" style="margin-top:8px">Ogni modifica vale da subito per bollettini, app operaio e conguaglio. Il ramo ${ccl7(other).label.toLowerCase()} ha i suoi valori.</p></div>
    <div class="card"><h3>${I('shield')} Guida CCL nell'app</h3><p class="small">Gli operai la vedono nel loro Profilo ("Le mie regole"), nella loro lingua: orario, straordinari, pranzo, viaggio, vacanze, cosa fare in caso di malattia. Fonti: <a href="https://gav-service.ch/gav/355009/version/5/vertrag/12320" target="_blank" rel="noopener">CCL pittura TI</a>, <a href="https://www.ocst.ch/ccl" target="_blank" rel="noopener">elenco CCL OCST (gessatori 2026)</a>, <a href="https://unia.ch/it/professioni-rami/pittura-e-gessatura" target="_blank" rel="noopener">Unia</a>.</p><button class="btn sm" data-act="nav" data-id="op-mese" data-tip="Apri l'app come operaio">Vedi come la vede l'operaio</button></div></div></div>`;
}
const vImp0 = vImpostazioni;
vImpostazioni = function () {
  ensure7(); let out = vImp0(); const tb = curTab('imp', 'profilo');
  const i0 = out.indexOf('<div class="tabs">'); if (i0 < 0) return out; const i1 = out.indexOf('</div>', i0);
  out = out.slice(0, i1) + `<button data-act="tab" data-key="imp" data-id="ccl" class="${tb === 'ccl' ? 'on' : ''}">${I('shield')} CCL e calendari</button>` + out.slice(i1);
  if (tb === 'ccl') return out.slice(0, out.indexOf('</div>', i0) + 6) + cclTab7();
  if (tb === 'azienda') out = out.replace('<div class="card"><h3>CCL pittura e gessatura (riferimento)</h3>', gpsCard7() + '<div class="card"><h3>CCL pittura e gessatura (riferimento)</h3>');
  return out;
};
function gpsCard7() {
  return `<div class="card"><h3>${I('pin')} GPS e promemoria nell'app operaio</h3><div class="form"><div><label>GPS attivo dalle</label><input type="time" value="${P.gpsDa}" data-p7="gpsDa"></div><div><label>alle</label><input type="time" value="${P.gpsA}" data-p7="gpsA"></div><div><label>Raggio del cantiere</label><div class="row nowrap"><input type="number" step="50" value="${P.gpsRaggio}" data-p7="gpsRaggio"><span class="small muted">m</span></div></div><div><label>Promemoria pausa pranzo</label><input type="time" value="${P.pausaOra}" data-p7="pausaOra"></div></div><p class="small muted" style="margin-top:8px">Fuori dalla finestra oraria il telefono non registra nulla (niente tragitto verso casa). Il raggio si calcola sul telefono: il server riceve solo "arrivato" e "partito", zero chiamate a servizi di mappe a pagamento. Il promemoria parte solo se il telefono è entro ${P.gpsRaggio} m dal cantiere.</p></div>`;
}
const opCcl7 = (w) => { const R = ccl7(w.ramo); const ip = indennita7(w, myCant(w)); return `<div class="card"><h3>${I('shield')} Le mie regole (CCL ${R.label.toLowerCase()})</h3><div class="stack small"><div class="listrow"><span>Ore all'anno</span><span class="b num">${n0(R.oreAnnue)} h</span></div><div class="listrow"><span>Questo mese (${MESI7[10]})</span><span class="b num">${n1(R.mesi[10][0])} h · ${R.mesi[10][1]} h/giorno</span></div><div class="listrow"><span>Straordinario</span><span class="b">oltre ${R.straordSoglia} h/sett · +${R.straordPct}%</span></div><div class="listrow"><span>Pranzo oggi</span><span class="b">${ip.val ? chf(ip.val) + ip.unit : 'non dovuto'}</span></div><div class="listrow"><span>Viaggio</span><span class="small" style="text-align:right;max-width:60%">${esc(R.viaggio.split('(')[0].trim())}</span></div><div class="listrow"><span>Malattia</span><span class="small" style="text-align:right;max-width:60%">avvisa entro le 8, certificato dal 3º giorno</span></div></div><p class="small muted" style="margin-top:8px">Domande? Chiedi all'assistente: "quante ore devo fare a maggio?"</p></div>`; };
const vOpMese0 = vOpMese;
vOpMese = function () { ensure7(); const w = me(); let out = vOpMese0(); if (w.ramo === 'G') { const ip = indennita7(w, myCant(w)); out = out.replace(/(<dt>Indennità pranzo<\/dt><dd class="num">)[^<]*(<)/, `$1${chf(ip.val * 21)} (${esc(ip.tipo)}, 21 giorni)$2`); } const mark = '<div class="card"><h3>Assenze e richieste</h3>'; return out.includes(mark) ? out.replace(mark, opCcl7(w) + mark) : out; };
const vOpOggi7_0 = vOpOggi;
vOpOggi = function () {
  ensure7(); const w = me(); const c = myCant(w); let out = vOpOggi7_0();
  if (w.ramo === 'G') { const ip = indennita7(w, c); out = out.replace(/(Indennità pranzo<\/span><span class="small b">)[^<]*(<)/, `$1${chf(ip.val)}${ip.unit} (${ip.km} km)$2`); }
  const gps = `<div class="card" style="padding:10px 12px"><div class="row between"><span class="small muted">${I('pin')} GPS attivo ${P.gpsDa}–${P.gpsA} · solo entro ${P.gpsRaggio} m dal cantiere</span><button class="btn sm" data-act="gps-sim">Simula le ${P.pausaOra}</button></div></div>`;
  const push = S.gpsSim ? `<div class="alert info pushcard"><span>${I('bell')}</span><span><span class="t b">${P.pausaOra} · Pausa pranzo</span><br>Sei a 35 m da ${esc(c.nome)}. Timbro la pausa?<div class="row" style="margin-top:8px"><button class="btn sm primary" data-act="pausa-in">Inizio pausa</button><button class="btn sm" data-act="gps-later">Più tardi</button></div></span></div>` : S.pausa ? `<div class="alert good"><span>${I('check')}</span><span>Pausa iniziata alle ${S.pausa}: il tempo di pausa non conta come lavoro.</span></div>` : '';
  const mk = '<div class="card" style="padding:12px 14px"><div class="eyebrow">Cantiere di oggi</div>'; if (out.includes(mk)) out = out.replace(mk, push + mk);
  const mark = '<div class="row"><button class="btn sm" data-act="op-vac"'; return out.includes(mark) ? out.replace(mark, gps + mark) : out;
};
const vCant7_0 = vCantiere;
vCantiere = function () { ensure7(); let out = vCant7_0(); const c = cant(S.id); if (c && curTab('cant', 'redd') === 'ore') { const ip = indennita7({ ramo: 'G' }, c); out = out.split('Forfait gessatori · ' + chf(P.pranzoGessatoriMese) + '/mese').join(esc(ip.tipo) + ' · ' + chf(ip.val) + '/giorno'); } return out; };

// ---------- 6. EXPORT COMMISSIONE PARITETICA ----------
function cpcRows7() {
  const F = S.cpc; return DB.bollettini.filter((b) => b.data >= F.da && b.data <= F.a && (!F.chi || b.workerId === F.chi) && b.stato !== 'Bozza').sort((a, b) => a.data.localeCompare(b.data) || worker(a.workerId).nome.localeCompare(worker(b.workerId).nome)).map((b) => { const w = worker(b.workerId); const c = cant(b.cantiere) || { id: b.cantiere, nome: '', comune: '', indirizzo: '' }; const km = DB.viaggi.filter((v) => v.workerId === w.id && v.data === b.data).reduce((a, v) => a + v.km, 0); const ip = indennita7(w, c); return { b, w, c, km, ip }; });
}
function cpcModal7(m) {
  ensure7(); const F = S.cpc; const rows = cpcRows7(); const ops = DB.workers.filter((w) => w.ramo !== 'U');
  return `<div class="row between"><h2>${I('shield')} Export per la Commissione paritetica</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <p class="small muted">Registro dei bollettini con nome, luogo, ore eseguite, orario, km e indennità pranzo, per il periodo richiesto. In produzione l'archivio copre 5 anni; qui ci sono i dati demo delle ultime due settimane.</p>
    <div class="form"><div><label>Da</label><input type="date" value="${F.da}" data-cpc="da"></div><div><label>A</label><input type="date" value="${F.a}" data-cpc="a"></div><div class="full"><label>Collaboratore</label><select data-cpc="chi"><option value="">Tutti (${ops.length})</option>${ops.map((w) => `<option value="${w.id}" ${F.chi === w.id ? 'selected' : ''}>${esc(w.nome)} · ${esc(w.ruolo)}</option>`).join('')}</select></div></div>
    <div class="row between"><span class="small"><b>${rows.length}</b> bollettini · <b>${n1(rows.reduce((a, r) => a + r.b.ore, 0))}</b> h · ${rows.filter((r) => r.ip.val).length} indennità pranzo</span><div class="row"><button class="btn" data-act="cpc-csv">${I('download')} Scarica CSV</button><button class="btn primary" data-act="cpc-print">${I('printer')} Anteprima e PDF</button></div></div>`;
}
function cpcDoc7() {
  const F = S.cpc; const rows = cpcRows7(); const who = F.chi ? worker(F.chi).nome : 'tutti i collaboratori';
  return `<div class="doc"><div class="row between" style="align-items:flex-start"><img src="${LOGO}" alt="MY COLOR" style="width:150px"><div class="small right">MY COLOR Isella & Foletti SA<br>Via Industria 17, 6934 Bioggio<br>Registro bollettini per la Commissione paritetica cantonale</div></div>
    <h2 style="margin-top:18px">Registro delle ore dal ${fd(F.da)} al ${fd(F.a)}</h2><p class="small">${esc(who)} · ${rows.length} bollettini · estratto il ${fd(D.TODAY_ISO)} dal gestionale. Orari e posizione registrati dall'app al momento della timbratura; indennità secondo CCL e calendario aziendale del ramo.</p>
    <table style="width:100%;font-size:.78rem"><thead><tr><th>Data</th><th>Collaboratore</th><th>Cat.</th><th>Cantiere e luogo</th><th>Entrata–uscita</th><th class="right">Ore</th><th class="right">Viaggio</th><th class="right">Km</th><th class="right">Pranzo</th><th>Stato</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="num">${fd(r.b.data)}</td><td>${esc(r.w.nome)}${r.w.agenzia ? ' <i>(agenzia)</i>' : ''}</td><td>${r.w.cat}</td><td>${esc(r.c.nome)}, ${esc(r.c.comune)}</td><td class="num">${r.b.entrata}–${r.b.uscita}</td><td class="right num">${n1(r.b.ore)}</td><td class="right num">${n1(r.b.viaggio)}</td><td class="right num">${r.km ? n0(r.km) : '–'}</td><td class="right num">${r.ip.val ? chf(r.ip.val) : '–'}</td><td>${esc(r.b.stato)}</td></tr>`).join('')}</tbody></table>
    <div class="row between sigblock" style="margin-top:22px"><span class="small">Totale ore ${n1(rows.reduce((a, r) => a + r.b.ore, 0))} · viaggio ${n1(rows.reduce((a, r) => a + r.b.viaggio, 0))} h</span><span class="small">Per la ditta: ______________________</span></div></div>`;
}
function cpcCsv7() { const rows = cpcRows7(); csvDownload('registro-cpc-' + S.cpc.da + '-' + S.cpc.a, ['Data', 'Collaboratore', 'Categoria CCL', 'Ramo', 'Cantiere', 'Luogo', 'Entrata', 'Uscita', 'Ore', 'Viaggio h', 'Km', 'Indennità pranzo CHF', 'Veicolo', 'Stato'], rows.map((r) => [r.b.data, r.w.nome, r.w.cat, r.w.ramo === 'G' ? 'Gessatura' : 'Pittura', r.c.id, r.c.nome + ', ' + r.c.comune, r.b.entrata, r.b.uscita, r.b.ore, r.b.viaggio, r.km, r.ip.val || 0, r.b.veicolo || '', r.b.stato])); toast(rows.length + ' righe esportate per la Commissione paritetica'); }

// ---------- 7. BOLLETTINI: modifica e approva, veicolo, agenzia ----------
const veicLabel7 = (v) => !v ? '' : v === 'privato' ? 'auto privata' : v === 'squadra' ? 'con la squadra' : 'furgone ' + v;
function bolModModal7(m) {
  const b = DB.bollettini.find((x) => x.id === m.id); const w = worker(b.workerId);
  return `<form data-act="bol-mod-save" data-id="${b.id}" class="stack"><div class="row between"><h2>Modifica e approva · ${esc(w.nome)}, ${fd(b.data)}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <p class="small muted">Correggi tu e approva: l'operaio riceve la modifica per conoscenza in chat, con il motivo. Il bollettino originale resta nello storico.</p>
    <div class="form"><div><label>Ore di lavoro</label><input name="ore" type="number" step="0.25" value="${b.ore}"></div><div><label>Ore di viaggio</label><input name="viaggio" type="number" step="0.25" value="${b.viaggio}"></div><div class="full"><label>Motivo (va all'operaio)</label><input name="nota" required placeholder="es. uscita alle 16:30 dal GPS, non alle 17:15"></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn good" type="submit">${I('check')} Approva con le modifiche</button></div></form>`;
}
function bolAgModal7(m) {
  ensure7(); const ags = DB.workers.filter((w) => w.agenzia);
  return `<form data-act="bol-ag-save" class="stack"><div class="row between"><h2>Bollettino di agenzia (cartaceo)</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <p class="small muted">I bollettini delle agenzie interinali sono di colore diverso, in doppia copia e firmati: qui si registrano a mano e si allega la foto della copia firmata, così entrano nei costi del cantiere e nel registro per la Commissione paritetica.</p>
    <div class="form"><div><label>Interinale</label><select name="wid">${ags.map((w) => `<option value="${w.id}">${esc(w.nome)} · ${esc(w.agenzia)}</option>`).join('')}</select></div><div><label>Cantiere</label><select name="cantiere">${DB.cantieri.filter((c) => c.stato === 'In corso').map((c) => `<option value="${c.id}">${c.id} · ${esc(c.nome)}</option>`).join('')}</select></div><div><label>Data</label><input name="data" type="date" value="${D.TODAY_ISO}"></div><div><label>Ore</label><input name="ore" type="number" step="0.5" value="8"></div><div><label>Viaggio (h)</label><input name="viaggio" type="number" step="0.25" value="0.5"></div><div><label>Attività</label><input name="attivita" value="Lavori vari"></div><div class="full"><label>Foto della copia firmata</label><input name="foto" type="file" accept="image/*,.pdf"></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Registra bollettino agenzia</button></div></form>`;
}
const bolDetail0 = bolDetailModal;
bolDetailModal = function (m) {
  ensure7(); let out = bolDetail0(m); const b = DB.bollettini.find((x) => x.id === m.id); if (!b) return out; const w = worker(b.workerId);
  out = out.replace(/(data-act="approve" data-id="[^"]+">[\s\S]*?<\/button>)/, `$1<button class="btn" data-act="bol-mod" data-id="${b.id}">${I('edit')} Modifica e approva</button>`);
  if (w.ramo === 'G') { const ip = indennita7(w, cant(b.cantiere)); out = out.replace(/(<dt>Indennità pranzo<\/dt><dd>)[^<]*(<)/, `$1${chf(ip.val)}${ip.unit} · ${esc(ip.tipo)}$2`); }
  if (b.veicolo) out = out.replace('<dt>Attività</dt>', `<dt>Spostamento</dt><dd>${esc(veicLabel7(b.veicolo))}</dd><dt>Attività</dt>`);
  const extra = (b.modifica ? `<div class="alert info"><span>${I('edit')}</span><span><span class="t b">Modificato da ${esc(worker(b.modifica.chi).nome.split(' ')[0])}</span> il ${fdt(b.modifica.ts)}: ore ${n1(b.modifica.prima.ore)} → ${n1(b.ore)}, viaggio ${n1(b.modifica.prima.viaggio)} → ${n1(b.viaggio)}. Motivo: ${esc(b.modifica.nota)}. Inviato per conoscenza a ${esc(w.nome.split(' ')[0])}.</span></div>` : '') + (b.agenzia ? `<div class="alert warn"><span>${I('alert')}</span><span><span class="t b">Bollettino di agenzia (${esc(b.agenzia)})</span>: registrato a mano dalla copia cartacea firmata${b.fotoNome ? ', foto allegata: ' + esc(b.fotoNome) : ''}. Il costo va al cantiere con la tariffa dell'agenzia.</span></div>` : '');
  const mk = '<div class="grid2"><div class="card"><h3>Giornata</h3>'; return extra && out.includes(mk) ? out.replace(mk, extra + mk) : out;
};
const vBol7_0 = vBollettini;
vBollettini = function () {
  ensure7(); let out = vBol7_0(); const btn = '<button class="btn primary" data-act="approve-all"';
  return out.replace(btn, `<button class="btn" data-act="cpc-open">${I('shield')} Export CPC</button><button class="btn" data-act="bol-ag">+ Bollettino agenzia</button>` + btn);
};
const vOpBol7_0 = vOpBol;
vOpBol = function () {
  ensure7(); let out = vOpBol7_0(); const w = me(); const F = S.bolForm; if (F.veicolo == null) F.veicolo = w.veicolo === 'privato' ? 'privato' : w.veicolo ? w.veicolo : 'squadra';
  const sel = `<div><label for="f-veic">Spostamento con</label><select id="f-veic" data-bind="veicolo"><option value="squadra" ${F.veicolo === 'squadra' ? 'selected' : ''}>Con la squadra (furgone del capo)</option>${DB.veicoli.map((v) => `<option value="${esc(v.targa)}" ${F.veicolo === v.targa ? 'selected' : ''}>Furgone ${esc(v.targa)} · ${esc(v.modello)}</option>`).join('')}<option value="privato" ${F.veicolo === 'privato' ? 'selected' : ''}>Auto privata (rimborso ${chf(P.kmTariffa, 2)}/km)</option></select></div>`;
  const mk = '<div><label for="f-mat">'; return out.includes(mk) ? out.replace(mk, sel + mk) : out;
};
document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('[data-act="send-bol"]'); if (el && S.bolForm) S._bolVeic7 = S.bolForm.veicolo || null; }, true);
const vVeic0 = vVeicoli;
vVeicoli = function () {
  ensure7(); let out = vVeic0(); if (curTab('veic', 'flotta') !== 'flotta') return out;
  const day = D.TODAY_ISO; const ops = DB.workers.filter((w) => w.ramo !== 'U');
  const cards = DB.veicoli.map((v) => { const d = v.assegnato ? worker(v.assegnato) : null; const p = d ? planOf(d.id, day) : []; const c = p.length ? cant(p[0].c) : null; const pax = c ? ops.filter((w) => w.id !== (d || {}).id && w.veicolo !== 'privato' && !w.veicolo && planOf(w.id, day).some((x) => x.c === c.id)).slice(0, 3) : []; return `<div class="vancard ${v.stato === 'In officina' ? 'off' : c ? 'out' : ''}"><div class="row between"><b class="num">${esc(v.targa)}</b>${pill(v.stato)}</div><div class="small muted">${esc(v.modello)}</div><div style="margin-top:6px">${I('truck')} ${d ? esc(d.nome) : '<span class="muted">pool magazzino</span>'}</div><div class="small">${c ? '→ ' + esc(c.nome) + ' · ' + p[0].inizio : v.stato === 'In officina' ? 'in officina' : 'al magazzino'}</div>${pax.length ? `<div class="row" style="gap:3px;margin-top:6px">${pax.map((w) => `<span class="avatar xs ${avCls(w)}" title="${esc(w.nome)}">${initials(w.nome)}</span>`).join('')}<span class="small muted">a bordo</span></div>` : ''}</div>`; }).join('');
  const card = `<div class="card"><div class="row between"><h3>Oggi: chi usa quale furgone</h3><span class="small muted">dalla pianificazione e dai bollettini (campo "spostamento con")</span></div><div class="vangrid">${cards}</div></div>`;
  const mk = '<div class="card pad0">'; const i = out.indexOf(mk); return i < 0 ? out : out.slice(0, i) + card + out.slice(i);
};

// ---------- 9. PREZZI DALLO STORICO ----------
function storicoTab7() {
  const rows = LISTINO.map((p, i) => ({ p, n: p.n || 12 + ((i * 37) % 180), ultimo: addDays(D.TODAY_ISO, -((i * 11) % 90)) }));
  return `<div class="kpis">${kpi('Offerte analizzate', STORICO.offerte, STORICO.periodo + ' · ' + STORICO.fonte)}${kpi('Accettate', STORICO.accettate + '%', 'sconto medio ' + pct(STORICO.scontoMedio))}${kpi('Posizioni con prezzo storico', LISTINO.length, 'mediana, minimo e massimo')}${kpi('Capitoli sempre presenti', FISSI7.length, 'aggiunti in ogni offerta')}</div>
    <div class="alert info"><span>${I('sparkles')}</span><span>Il preventivatore parte da qui: per ogni voce usa la <b>mediana</b> delle offerte simili, segnala quando esci dall'intervallo e aggiunge sempre i capitoli fissi. Con le offerte reali degli ultimi due anni (PDF o export) questa tabella diventa il listino di MY COLOR, incluse le voci "a ore + % materiale" del preventivo 2026/0364.</span></div>
    <div class="grid2"><div class="card pad0"><div class="cardhd"><h3>Capitoli sempre presenti</h3><span class="small muted">frequenza nelle offerte</span></div>${table([{ h: 'Pos.' }, { h: 'Descrizione', cls: 'wrap' }, { h: 'Un.' }, { h: 'Prezzo medio', cls: 'right num' }, { h: 'Presente in', cls: 'right num' }], FISSI7.map((f) => ({ c: [f.pos, esc(f.desc), f.un, chf(f.prezzo), f.freq + '%'] })).concat([{ c: ['2.1', 'Ponteggio: da preventivo del fornitore (es. Lawil), riportato senza ricarico o con % concordata', 'ac', '–', 'facciate 100%'] }]))}</div>
    <div class="card"><h3>Come lavora il preventivatore</h3><ol class="small" style="margin:6px 0 0 18px;padding:0;line-height:1.7"><li>Legge la descrizione (o i documenti del capitolato) e riconosce le lavorazioni.</li><li>Per ogni lavorazione prende la posizione NPK e la <b>mediana</b> del prezzo storico; quantità dalle misure (m², ml, ore + % materiale).</li><li>Aggiunge i capitoli fissi e il ponteggio se ci sono facciate.</li><li>Applica il layout dell'offerta MY COLOR: capitoli, posizioni, unità, quantità, prezzo, totale per capitolo.</li><li>Tu correggi nel builder: voci, sconti, righe manuali. Ogni offerta accettata aggiorna lo storico.</li></ol></div></div>
    <div class="card pad0"><div class="cardhd"><h3>Prezzi storici per posizione</h3><span class="small muted">mediana · intervallo · offerte</span></div>${table([{ h: 'NPK' }, { h: 'Descrizione', cls: 'wrap' }, { h: 'Un.' }, { h: 'Mediana', cls: 'right num' }, { h: 'Min', cls: 'right num' }, { h: 'Max', cls: 'right num' }, { h: 'Offerte', cls: 'right num' }, { h: 'Ultimo uso' }], rows.map(({ p, n, ultimo }) => ({ c: [`<span class="num small">${p.npk}</span>`, esc(p.desc), p.un, `<span class="b">${chf(p.prezzo, 2)}</span>`, chf(p.min, 2), chf(p.max, 2), n, fd(ultimo)] })))}</div>`;
}
const vComm0 = vCommerciale;
vCommerciale = function () {
  ensure7(); let out = vComm0(); const tb = curTab('comm', 'off');
  const k = out.indexOf('data-key="comm"'); if (k < 0) return out; const i0 = Math.max(out.lastIndexOf('<div class="tabs">', k), out.lastIndexOf('<div class="subtabs">', k)); if (i0 < 0) return out; const i1 = out.indexOf('</div>', i0);
  out = out.slice(0, i1) + `<button data-act="tab" data-key="comm" data-id="storico" class="${tb === 'storico' ? 'on' : ''}">${I('calculator')} Prezzi dallo storico</button>` + out.slice(i1);
  if (tb === 'storico') return out.slice(0, out.indexOf('</div>', i0) + 6) + storicoTab7();
  return out;
};
const aiOff0 = aiOfferta;
aiOfferta = function (desc, tipo) { const r = aiOff0(desc, tipo); if (r && r.rows && r.rows.length && !r.rows.some((x) => /impianto cantiere/i.test(x.desc))) { r.rows.unshift(...FISSI7.map((f) => ({ pos: f.pos, desc: f.desc, un: f.un, qta: f.qta, prezzo: f.prezzo, fonte: 'presente nel ' + f.freq + '% delle offerte' }))); r.why.push('Aggiunti i capitoli sempre presenti nelle offerte MY COLOR: impianto cantiere, protezioni, smaltimento.'); r.tot = r.rows.reduce((a, x) => a + x.qta * x.prezzo, 0); } return r; };
const newOff0 = newOffertaModal;
newOffertaModal = function (m) { let out = newOff0(m); const mk = '<div class="card" style="background:var(--surface-2)"><div class="row between"><h3 style="margin:0">'; if (m.ai && out.includes(mk)) out = out.replace(mk, `<div class="small muted">${I('calculator')} Prezzi = mediana delle offerte simili (${STORICO.offerte} offerte ${STORICO.periodo}); capitoli fissi aggiunti sempre. <button class="btn sm ghost" data-act="nav" data-id="commerciale" data-tab="storico">Vedi lo storico</button></div>` + mk); return out; };

// ---------- 10. CAPITOLATO DA PIÙ FILE ----------
const fileType7 = (n) => /\.(dwg|dxf)$/i.test(n) ? 'Disegno CAD' : /\.(jpe?g|png)$/i.test(n) ? 'Render / foto' : /\.(xlsx?|csv)$/i.test(n) ? 'Modulo d\'offerta' : /pian|esecutiv|plan/i.test(n) ? 'Piani esecutivi' : /capitolat|npk|cpn/i.test(n) ? 'Capitolato' : 'Documento';
const capUp0 = capUploadModal;
capUploadModal = function (m) {
  let out = capUp0(m); if (m.step === 'scan') return out.replace('Lettura pagine, estrazione posizioni NPK, ricerca di punti poco chiari…', `Lettura di ${(m.files || []).length || 1} documenti: capitolato, piani, planimetrie e CAD. Estrazione posizioni e misure, ricerca di punti poco chiari…`);
  const files = m.files || [];
  const extra = `<div><label for="cu-p">Cosa deve sapere in più l'IA (prompt)</label><textarea id="cu-p" rows="2" data-cap="prompt" placeholder="es. stabile abitato, lavori in 2 fasi; ponteggio lo quotiamo noi con Lawil; colore secondo campione">${esc(m.prompt || '')}</textarea></div>
    ${files.length ? `<div class="card" style="padding:10px 12px"><div class="row between"><span class="b">${files.length} documenti pronti</span><button class="btn sm primary" data-act="cap-go">${I('sparkles')} Analizza e prepara la bozza</button></div><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${files.map((f) => `<span class="pill">${I('file')} ${esc(f)} <span class="muted">· ${fileType7(f)}</span></span>`).join('')}</div></div>` : ''}`;
  out = out.replace('<div class="dropzone"><input type="file" accept=".pdf,.docx,.xlsx" data-act-change="cap-file">', extra + '<div class="dropzone"><input type="file" multiple accept=".pdf,.docx,.xlsx,.dwg,.dxf,.jpg,.jpeg,.png" data-act-change="cap-files">');
  out = out.replace('Trascina qui il capitolato (PDF, Word, Excel)', 'Trascina qui tutti i file: capitolato, piani esecutivi, planimetrie, CAD, render, modulo d\'offerta');
  return out.replace('L\'IA lo legge, estrae le posizioni, riassume condizioni e penali, segnala cosa non è chiaro e poi risponde alle tue domande sul documento.', 'L\'IA legge tutto insieme: posizioni dal capitolato, misure dai disegni, prezzi dallo storico. Obiettivo: bozza d\'offerta in un\'ora invece di 5-10, da rifinire nel builder.');
};
const capStart0 = capStart;
capStart = function (file, m) { const files = (m && m.files && m.files.length) ? m.files.slice() : null; const prompt = m && m.prompt; capStart0(file, m); setTimeout(() => { const cp = DB.capitolati[0]; if (cp && files) { cp.files = files.map((n) => ({ n, t: fileType7(n) })); cp.prompt = prompt || ''; cp.misure = misure7(cp); if (S.view === 'capitolato') render(); } }, 2150); };
const vCap0 = vCapitolato;
vCapitolato = function () {
  ensure7(); let out = vCap0(); const cp = DB.capitolati.find((x) => x.id === S.id); if (!cp || !cp.files) return out;
  const card = `<div class="card"><div class="row between" style="flex-wrap:wrap"><h3>${I('file')} Documenti analizzati (${cp.files.length})</h3><button class="btn primary sm" data-act="cap-offerta" data-id="${cp.id}">${I('sparkles')} Genera bozza d'offerta</button></div><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${cp.files.map((f) => `<span class="pill">${esc(f.n)} <span class="muted">· ${esc(f.t)}</span></span>`).join('')}</div>${cp.prompt ? `<p class="small" style="margin:8px 0 0"><b>Indicazioni date all'IA:</b> ${esc(cp.prompt)}</p>` : ''}
    <div class="eyebrow" style="margin-top:12px">Misure prese dai disegni</div>${table([{ h: 'Zona', cls: 'wrap' }, { h: 'Cosa' }, { h: 'Quantità', cls: 'right num' }, { h: 'Fonte', cls: 'wrap' }], (cp.misure || []).map((x) => ({ c: [esc(x[0]), esc(x[1]), n0(x[2]) + (x[1] === 'ml' ? ' ml' : ' m²'), `<span class="small muted">${esc(x[3])}</span>`] })))}<p class="small muted" style="margin:8px 0 0">Le quantità delle posizioni vengono da queste misure; i prezzi dalla mediana dello storico; i capitoli fissi (impianto cantiere, protezioni, smaltimento) si aggiungono da soli. Da 5-10 ore di lavoro a circa un'ora di controllo.</p></div>`;
  const mk = '<div class="card"><div class="row between"><h3>Da chiarire prima dell\'inizio dei lavori</h3>'; return out.includes(mk) ? out.replace(mk, card + mk) : out;
};
function capOfferta7(cp) {
  const rows = FISSI7.map((f) => ({ pos: f.pos, desc: f.desc, un: f.un, qta: f.qta, prezzo: f.prezzo })).concat(cp.posizioni.map((p) => ({ pos: p[0] ? 'NPK ' + p[0] : '', desc: p[1], un: p[2], qta: p[3], prezzo: NPK_PREZZI[p[0]] || 0 })));
  S.modal = { type: 'offerta-new', mode: 'ia', aiDone: true, clienteId: cp.clienteId, capitolatoId: cp.id, oggetto: cp.titolo.replace(/^Capitolato\s*/i, ''), tipo: 'A stima', rows, ai: { conf: 0.86, simili: [], tipo: 'A stima', why: [`${cp.posizioni.length} posizioni dal capitolato, quantità dalle misure dei ${cp.files.length} documenti (piani esecutivi, planimetrie CAD).`, 'Prezzi dalla mediana dello storico MY COLOR; ponteggio da quotare con il fornitore.', 'Capitoli fissi aggiunti: impianto cantiere, protezioni, smaltimento.'].concat(cp.prompt ? ['Indicazioni tue: ' + cp.prompt] : []) } };
  toast('Bozza d\'offerta pronta in 1 minuto: controlla quantità e prezzi nel builder');
}

// ---------- modali, afterRender (codice cantiere MC 409/26), gestori ----------
const MODALS7 = { cpc: cpcModal7, 'bol-mod': bolModModal7, 'bol-ag': bolAgModal7 };
const renderModal7_0 = renderModal;
renderModal = function () { const m = S.modal; if (m && MODALS7[m.type]) return `<div class="modal-bg" data-act="close-bg"><div class="modal ${m.type === 'cpc' ? 'wide' : ''}">${MODALS7[m.type](m)}</div></div>`; return renderModal7_0(); };
const printModal7_0 = printModal;
printModal = function (m) { if (m.kind !== 'cpc') return printModal7_0(m); return `<div class="row between"><h2>Registro per la Commissione paritetica</h2><div class="row"><button class="btn sm" data-act="cpc-csv">${I('download')} CSV</button><button class="btn sm" data-act="print-now">${I('printer')} Stampa / salva PDF</button><button class="btn sm" data-act="close">Chiudi</button></div></div><div class="print-area">${cpcDoc7()}</div>`; };
const afterRender7_0 = typeof afterRender === 'function' ? afterRender : () => {};
afterRender = function () {
  afterRender7_0();
  if (S._bolVeic7 != null) { const b = DB.bollettini[0]; if (b && !b.veicolo && String(b.id).startsWith('B-1') && b.data === D.TODAY_ISO) b.veicolo = S._bolVeic7; S._bolVeic7 = null; }
  const app = document.getElementById('app'); if (!app) return; const it = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); const re = /MC 20-26\.(\d{3})/; let n; const todo = [];
  while ((n = it.nextNode())) { if (re.test(n.nodeValue)) todo.push(n); }
  todo.forEach((t) => { t.nodeValue = t.nodeValue.replace(/MC 20-26\.(\d{3})/g, 'MC $1/26'); });
};
window.addEventListener('DOMContentLoaded', () => { ensure7(); });
document.addEventListener('click', (e) => {
  const h = e.target.closest('[data-act]'); if (!h) return; const act = h.dataset.act, id = h.dataset.id; const isInput = e.target.tagName === 'INPUT';
  const H = {
    'lav-day': () => { S.lavDay = id; },
    'lav-week': () => { S.lavWeek = !S.lavWeek; },
    'ccl-ramo': () => { S.cclRamo = id; },
    'cpc-open': () => { ensure7(); S.modal = { type: 'cpc' }; },
    'cpc-csv': () => { cpcCsv7(); return 'skip'; },
    'cpc-print': () => { S.modal = { type: 'print', kind: 'cpc' }; },
    'bol-mod': () => { S.modal = { type: 'bol-mod', id }; },
    'bol-ag': () => { S.modal = { type: 'bol-ag' }; },
    'gps-sim': () => { S.gpsSim = true; S.pausa = null; },
    'gps-later': () => { S.gpsSim = false; toast('Ti avviso di nuovo tra 15 minuti'); },
    'pausa-in': () => { S.gpsSim = false; S.pausa = nowHM(); toast('Pausa registrata alle ' + S.pausa); },
    'cap-go': () => { const m = S.modal; if (!m || !m.files || !m.files.length) return 'skip'; const primary = m.files.find((f) => /\.pdf$/i.test(f)) || m.files[0]; capStart(primary, m); return 'skip'; },
    'cap-offerta': () => { const cp = DB.capitolati.find((x) => x.id === id); if (!cp) return 'skip'; capOfferta7(cp); },
  };
  if (!H[act]) return; if (!isInput) e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.lavnote != null) { DB.planNote[ds.lavnote] = t.value; return; }
  if (ds.ccl7) { const [ramo, k, i] = ds.ccl7.split('|'); const R = ccl7(ramo); if (k === 'pranzo') R.pranzo[+i][1] = +t.value || 0; else R[k] = +t.value || 0; toast('Parametro CCL ' + R.label.toLowerCase() + ' aggiornato'); return; }
  if (ds.p7) { P[ds.p7] = t.type === 'number' ? +t.value || 0 : t.value; toast('Impostazione GPS salvata'); return; }
  if (ds.cpc) { S.cpc[ds.cpc] = t.value; render(); return; }
  if (ds.actChange === 'cap-files' && m) { m.files = (m.files || []).concat([...t.files].map((f) => f.name)); render(); return; }
});
document.addEventListener('input', (e) => { const t = e.target; if (t.dataset.lavnote != null) DB.planNote[t.dataset.lavnote] = t.value; });
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-act]'); if (!f) return; const act = f.dataset.act, id = f.dataset.id;
  if (act === 'bol-mod-save') { e.preventDefault(); const b = DB.bollettini.find((x) => x.id === id); const prima = { ore: b.ore, viaggio: b.viaggio }; b.ore = +f.ore.value || b.ore; b.viaggio = +f.viaggio.value || 0; b.modifica = { chi: S.user.wid, ts: nowISO(), prima, nota: f.nota.value.trim() }; b.stato = 'Approvato'; b.anomalia = null; DB.messaggi.push({ id: uid('M'), ch: dmId(S.user.wid, b.workerId), autore: S.user.wid, testo: `Per conoscenza: ho approvato il bollettino del ${fshort(b.data)} con una modifica (ore ${n1(prima.ore)} → ${n1(b.ore)}, viaggio ${n1(prima.viaggio)} → ${n1(b.viaggio)}). Motivo: ${b.modifica.nota}`, ts: nowISO(), letto: false }); notify(`Bollettino di ${worker(b.workerId).nome} del ${fshort(b.data)} modificato e approvato da ${me().nome.split(' ')[0]}`, 'bollettini', null, ['C001', b.workerId]); S.modal = null; toast('Approvato con modifiche: ' + worker(b.workerId).nome.split(' ')[0] + ' avvisato in chat'); render(); return; }
  if (act === 'bol-ag-save') { e.preventDefault(); const w = worker(f.wid.value); const c = cant(f.cantiere.value); const foto = f.foto.files[0] ? f.foto.files[0].name : ''; DB.bollettini.unshift({ id: 'B-AG-' + Date.now(), data: f.data.value || D.TODAY_ISO, cantiere: c.id, workerId: w.id, ore: +f.ore.value || 8, viaggio: +f.viaggio.value || 0, attivita: f.attivita.value || 'Lavori vari', stato: 'Inviato', anomalia: null, entrata: '07:00', uscita: '16:30', gps: 0, materiale: '', note: 'Bollettino agenzia ' + w.agenzia + (foto ? ', copia firmata: ' + foto : ''), vocale: false, agenzia: w.agenzia, fotoNome: foto, foto: foto ? 1 : 0 }); S.modal = null; toast('Bollettino agenzia registrato per ' + w.nome + ' su ' + c.nome); render(); }
});
