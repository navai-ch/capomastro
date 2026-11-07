/* MyColor Gestionale – v13: bollettino di squadra compilato dal capo, promemoria "foto prima", file copertina cantiere e
   analisi rischi SUVA, smistamento delle richieste per ramo dall'Inbox, invito operaio con QR senza password,
   fornitori gessatura reali. Vedi REQUISITI-IVO.md (sezioni 1.2, 1.4, 1.5) e VALUTAZIONE.md (capo squadra, onboarding). */

// ---------- dati e migrazione ----------
const FORN8 = [
  ['Röfix AG', 'Materiale gessatura', 'Marco Delcò', 'ticino@roefix.ch', '+41 91 851 50 90', 'Sant\'Antonino', 7],
  ['Fassa Bortolo Svizzera SA', 'Materiale gessatura', 'Elena Carobbio', 'ordini@fassabortolo.ch', '+41 91 605 83 00', 'Agno', 9],
  ['Saint-Gobain Weber AG', 'Materiale gessatura', 'Kundendienst', 'info@ch.weber', '+41 44 737 70 70', 'Zürich', 6],
  ['Siniat Suisse SA', 'Materiale gessatura', 'Paolo Ghiringhelli', 'ordini@siniat.ch', '+41 91 960 02 02', 'Manno', 8],
  ['Protektor Profil AG', 'Materiale gessatura', 'Shop online', 'order@protektor.ch', '+41 52 644 18 88', 'Gossau', 5],
  ['Fixit AG', 'Materiale gessatura', 'Hans Bürgi', 'bestellung@fixit.ch', '+41 43 833 29 00', 'Holderbank', 6],
  ['Isover Saint-Gobain', 'Materiale gessatura', 'Vendite Ticino', 'ticino@isover.ch', '+41 91 605 44 50', 'Lugano', 10],
  ['Dold AG', 'Materiale pittura', 'Renzo Ferrari', 'ticino@dold.ch', '+41 91 600 12 12', 'Mendrisio', 11],
  ['Würth AG', 'Altro', 'Filiale Lugano', 'lugano@wuerth.ch', '+41 91 936 32 32', 'Lugano', 4],
  ['Lawil Ponteggi SA', 'Ponteggi', 'Ufficio preventivi', 'preventivi@lawil.ch', '+41 91 967 60 60', 'Lamone', 0],
];
const SUVA8 = ['Ponteggi e protezioni anticaduta montati e controllati (lavori oltre 2 m)', 'Scale e trabattelli: uso corretto, piedi antiscivolo', 'Piattaforme elevatrici: solo con patente IPAF, area delimitata', 'Prodotti chimici: schede di sicurezza in cantiere, ventilazione, nessun solvente in locali chiusi senza aspirazione', 'Polveri (levigatura, intonaci): aspirazione e maschera FFP2', 'DPI: scarpe S3, occhiali, guanti, maschera, elmetto dove serve', 'Elettricità: cavi integri, prese con FI, utensili controllati', 'Movimentazione carichi: sacchi da 25 kg con tecnica corretta, carrello dove possibile', 'Impianto cantiere: vie di fuga libere, estintore, cassetta pronto soccorso, numeri d\'emergenza affissi', 'Coordinamento con le altre imprese e con la direzione lavori', 'Nuovi, apprendisti e interinali istruiti il primo giorno', 'Amianto: verifica diagnosi per edifici prima del 1990 prima di raschiare o forare'];
const FOTO8_SEED = { 'MC 20-26.409': 48, 'MC 20-26.388': 120, 'MC 20-26.415': 22, 'MC 20-26.421': 0, 'MC 20-26.430': 15, 'MC 20-26.395': 31, 'MC 20-26.402': 40 };
function ensure8() {
  if (!DB.fotoPrima) DB.fotoPrima = clone(FOTO8_SEED);
  if (!DB.suva) DB.suva = { 'MC 20-26.409': { data: '2026-09-11', chi: 'C002', ck: { 0: 1, 1: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1, 10: 1 }, note: 'Nessun lavoro in quota oltre i 3 m; scale e trabattello interno.' }, 'MC 20-26.388': { data: '2026-05-28', chi: 'C002', ck: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1 }, note: 'Ponteggio Ponteggi Ticino con parapetto e rete; piano ponteggi in Documenti.' } };
  if (!DB._forn8) { DB._forn8 = true; let n = Math.max(...DB.fornitori.map((f) => +f.id.replace('F', '') || 0)); FORN8.forEach((x) => { if (DB.fornitori.some((f) => f.nome === x[0])) return; n++; DB.fornitori.push({ id: 'F' + String(n).padStart(2, '0'), nome: x[0], categoria: x[1], contatto: x[2], email: x[3], tel: x[4], comune: x[5], pagamento: '30 giorni', sconto: x[6], iban: '', note: '', sharepoint: 'Fornitori/' + x[0].split(' ')[0] }); }); }
  if (!DB.email.some((m) => m.id === 'E-80')) {
    DB.email.unshift({ id: 'E-80', rel: null, account: 'AC3', folder: 'Inbox', da: 'Studio Arch. Regazzoni <info@regazzoni-arch.ch>', a: 'info@mycolorgroup.ch', oggetto: 'Richiesta preventivo: contropareti e controsoffitti uffici Via Beltramina', data: D.TODAY_ISO + ' 08:41', unread: true, testo: 'Buongiorno,\n\nper la ristrutturazione degli uffici al 2° piano di Via Beltramina 12 a Lugano (circa 380 m²) cerchiamo un\'impresa per contropareti in cartongesso, controsoffitti con isolamento acustico e rasatura. In allegato planimetria e capitolato sommario. Sopralluogo possibile la settimana prossima.\n\nCordiali saluti\nArch. Mattia Regazzoni', allegati: ['Planimetria_2piano_Beltramina.pdf', 'Capitolato_sommario.docx'] });
    DB.email.unshift({ id: 'E-81', rel: null, account: 'AC3', folder: 'Inbox', da: 'Famiglia Keller <keller.lugano@gmail.com>', a: 'info@mycolorgroup.ch', oggetto: 'Tinteggiatura appartamento 4.5 locali a Breganzona', data: D.TODAY_ISO + ' 07:55', unread: true, testo: 'Buongiorno,\n\nvorremmo far tinteggiare il nostro appartamento di 4.5 locali a Breganzona prima del trasloco di gennaio: pareti e soffitti, più le porte in legno. Potete passare per un preventivo? Siamo a casa la sera dopo le 18.\n\nGrazie, Anna e Thomas Keller', allegati: [] });
  }
  if (!USERS.some((u) => u.key === 'capo')) { const w = DB.workers.find((x) => x.nome === 'Andrea Mazzola'); if (w) USERS.splice(USERS.findIndex((u) => u.key === 'operaio'), 0, { key: 'capo', nome: w.nome, ruolo: 'Capo operaio pittura (app cantiere)', role: 'operaio', wid: w.id }); }
  if (!S.sqForm) S.sqForm = { cantiere: null, ore: {}, incl: {}, att: '', note: '' };
}
const respRamo8 = (ramo) => ramo === 'G' ? 'C003' : 'C002';
const ramoDiTesto8 = (t) => /gess|cartong|controsoff|contropar|intonac|rasat|isolamento/i.test(t || '') ? 'G' : 'P';
const ramoDiCant8 = (c) => ramoDiTesto8(c.tipo);
const isCapo8 = (w) => w && ['V', 'Q'].includes(w.cat);

// ---------- 1. BOLLETTINO DI SQUADRA (capo squadra) ----------
function sqMembers8(c, w) { return c.squadra.filter((id) => id !== w.id).map((id) => worker(id)); }
function vOpSquadra() {
  ensure8(); const w = me(); const F = S.sqForm; const c = cant(F.cantiere) || myCant(w); F.cantiere = c.id;
  const all = sqMembers8(c, w); const assenti = all.filter((m) => typeof assenzaDi === 'function' && assenzaDi(m.id, D.TODAY_ISO)); const pres = all.filter((m) => !assenti.includes(m));
  const oreDef = typeof planOf === 'function' && planOf(w.id, D.TODAY_ISO).length ? sumOre(planOf(w.id, D.TODAY_ISO)) : 8;
  pres.forEach((m) => { if (F.ore[m.id] == null) F.ore[m.id] = oreDef; if (F.incl[m.id] == null) F.incl[m.id] = true; });
  const atts = w.ramo === 'G' ? ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto', 'Isolamento', 'Preparazione'] : ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura', 'Tappezzeria', 'Velatura'];
  const n = pres.filter((m) => F.incl[m.id]).length; const resp = worker(respRamo8(w.ramo));
  const giaOggi = DB.bollettini.filter((b) => b.data === D.TODAY_ISO && b.capo === w.id).length;
  return phone(`<div class="row small"><button class="btn sm" data-act="nav" data-id="op-bol">${I('back')} Bollettino</button></div>
    <div><div class="eyebrow">${flong(D.TODAY_ISO)} · capo squadra</div><h1>Bollettino della squadra</h1><p class="small muted">Compili tu per chi lavora con te: ognuno riceve il suo bollettino e può correggerlo entro domani. L'ufficio vede che l'hai compilato tu.</p></div>
    ${giaOggi ? `<div class="alert good"><span>${I('check')}</span><span>Oggi hai già inviato ${giaOggi} bollettini per la squadra.</span></div>` : ''}
    <div class="stack"><div><label for="sq-cant">Cantiere</label><select id="sq-cant" data-sq-cant="1">${DB.cantieri.filter((x) => x.stato === 'In corso').map((x) => `<option value="${x.id}" ${c.id === x.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
    <div><label>Attività della squadra</label><div class="chips">${atts.map((a) => `<button type="button" data-act="sq-att" data-id="${esc(a)}" class="${F.att === a ? 'on' : ''}">${a}</button>`).join('')}</div></div>
    <div class="row between"><label style="margin:0">Ore per tutti</label><div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">${[7, 8, 8.5, 9].map((h) => `<button class="btn sm" data-act="sq-ore-all" data-id="${h}">${n1(h)}</button>`).join('')}</div></div>
    <div class="card pad0">${pres.map((m) => `<div class="listrow" style="padding:8px 12px"><label class="row nowrap" style="gap:10px;margin:0;cursor:pointer;min-width:0">${avatar(m.nome, avCls(m))}<input type="checkbox" data-sq-in="${m.id}" ${F.incl[m.id] ? 'checked' : ''}><span style="min-width:0"><span class="b">${esc(m.nome)}</span><br><span class="small muted">${esc(m.ruolo)}</span></span></label><span class="row nowrap" style="gap:4px"><input type="number" step="0.5" inputmode="decimal" value="${F.ore[m.id]}" data-sq-ore="${m.id}" style="width:64px;text-align:right" aria-label="Ore"><span class="small muted">h</span></span></div>`).join('') || '<p class="muted small" style="padding:12px">Nessun altro in squadra su questo cantiere</p>'}</div>
    ${assenti.length ? `<p class="small muted">Assenti oggi: ${assenti.map((m) => esc(m.nome.split(' ')[0])).join(', ')} (vacanze o malattia registrate)</p>` : ''}
    <div><label for="sq-note">Nota per l'ufficio</label><input id="sq-note" value="${esc(F.note)}" data-sq-note="1" placeholder="es. finito il piano 2, domani iniziamo il vano scala"></div>
    <button class="btn primary xl block" data-act="sq-send" ${n ? '' : 'disabled'}>Invia ${n} bollettin${n === 1 ? 'o' : 'i'} a ${esc(resp.nome.split(' ')[0])} e Ivo</button>
    <p class="small muted">Il tuo bollettino lo compili dalla pagina Bollettino, con le tue ore e il tuo viaggio.</p></div>`);
}
function sqSend8() {
  const w = me(); const F = S.sqForm; const c = cant(F.cantiere) || myCant(w); const resp = respRamo8(w.ramo); let n = 0;
  sqMembers8(c, w).forEach((m) => { if (!F.incl[m.id]) return; const ore = +F.ore[m.id] || 8; DB.bollettini.unshift({ id: 'B-' + Date.now() + '-' + n, data: D.TODAY_ISO, cantiere: c.id, workerId: m.id, ore, viaggio: 0.5, attivita: F.att || 'Lavori vari', stato: 'Inviato', anomalia: ore > 10 ? 'Oltre 10 h' : null, entrata: '07:15', uscita: ore >= 8.5 ? '17:15' : '16:45', gps: 35, materiale: '', note: F.note ? F.note + ' (dal capo squadra ' + w.nome.split(' ')[0] + ')' : 'Compilato dal capo squadra ' + w.nome, vocale: false, capo: w.id, fonte: 'capo' }); n++; });
  if (!n) return toast('Nessuno selezionato');
  notify(w.nome + ' ha compilato ' + n + ' bollettini per la squadra su ' + c.nome, 'bollettini', null, ['C001', resp]);
  S.sqForm = { cantiere: c.id, ore: {}, incl: {}, att: '', note: '' }; toast(n + ' bollettini inviati: ogni collaboratore li vede nel suo telefono e può correggerli'); go('op-bol');
}

// ---------- 2. FOTO "PRIMA" ----------
function fotoPrimaCard8(w, c) {
  const n = DB.fotoPrima[c.id]; if (n == null || n > 0) return '';
  return `<div class="alert warn"><span>${I('camera')}</span><span><span class="t b">Foto "prima" mancanti</span> per ${esc(c.nome)}: scattale prima di iniziare, servono per le variazioni e le contestazioni.<div class="row" style="margin-top:8px"><label class="btn sm primary" style="cursor:pointer">${I('camera')} Scatta ora<input type="file" accept="image/*" capture="environment" multiple style="display:none" data-act-change="foto-prima" data-id="${c.id}"></label><button class="btn sm ghost" data-act="toast" data-msg="Promemoria rimandato a domani mattina">Più tardi</button></div></span></div>`;
}
function fotoPrimaPill8(c) { const n = DB.fotoPrima[c.id]; return n ? `<span class="pill good">${I('camera')} foto prima: ${n}</span>` : `<span class="pill warn">${I('camera')} foto prima mancanti</span>`; }

// ---------- 3. FILE COPERTINA E ANALISI RISCHI SUVA ----------
function copertinaDoc8(c) {
  const k = cliente(c.clienteId); const off = DB.offerte.find((o) => o.cantiere === c.id); const resp = worker(respRamo8(ramoDiCant8(c)));
  const capo = c.squadra.map(worker).find((w) => isCapo8(w)); const squad = c.squadra.map(worker); const furg = [...new Set(squad.map((w) => w.veicolo).filter((v) => v && v !== 'privato'))];
  const mats = (k.materiali || []).filter((m) => m.cantiere === c.id); const docs = DB.documenti[c.id] || []; const sv = DB.suva[c.id];
  const l = DB.liste && DB.liste[c.id];
  return `<div class="doc"><div class="row between" style="align-items:flex-start"><img src="${LOGO}" alt="MY COLOR" style="width:150px"><div class="small right">MY COLOR Isella & Foletti SA<br>Via Industria 17, 6934 Bioggio<br>+41 91 605 00 00 · info@mycolorgroup.ch</div></div>
    <div style="margin-top:22px;display:flex;justify-content:space-between;align-items:flex-end"><div><div class="small muted">File copertina cantiere</div><h2 style="margin:2px 0;font-size:1.5rem">${esc(c.nome)}</h2><div>${esc(c.indirizzo)}</div></div><div class="right"><div style="font-size:1.6rem;font-weight:800;font-family:var(--display)">${esc(typeof cantDisplay7 === 'function' ? cantDisplay7(c.id) : c.id)}</div><div class="small">${esc(c.tipo)} · ${ramoDiCant8(c) === 'G' ? 'gessatura' : 'pittura'}</div></div></div>
    <div class="grid2" style="margin-top:16px;gap:14px"><div><div class="eyebrow">Committente</div><div class="b">${esc(k.nome)}</div><div>${esc(k.contatto)}<br>${esc(k.tel)}<br>${esc(k.email)}</div>${k.note ? `<div class="small muted" style="margin-top:4px">${esc(k.note)}</div>` : ''}</div>
    <div><div class="eyebrow">Responsabili</div><dl class="dl"><dt>Responsabile ramo</dt><dd>${esc(resp.nome)} · ${esc(resp.tel)}</dd><dt>Capo squadra</dt><dd>${capo ? esc(capo.nome) + ' · ' + esc(capo.tel) : '–'}</dd><dt>Periodo</dt><dd>${fd(c.inizio)} – ${fd(c.fine)}</dd><dt>Contratto</dt><dd class="num">${chf(c.deliberato || c.preventivo)}${off ? ' · offerta ' + off.id : ''}</dd>${off && off.acconti ? `<dt>Acconti</dt><dd>${off.acconti.map((a) => a.pct + '% ' + a.quando.toLowerCase()).join(', ')}</dd>` : ''}</dl></div></div>
    <div class="eyebrow" style="margin-top:14px">Squadra (${squad.length}) e mezzi</div><div>${squad.map((w) => esc(w.nome) + (isCapo8(w) ? ' (capo)' : '')).join(', ')}</div><div class="small">Furgoni: ${furg.length ? furg.map(esc).join(', ') : 'con la squadra'}${l ? ` · lista materiale: ${l.righe.filter((r) => r.car).length}/${l.righe.length} caricati` : ''}</div>
    ${mats.length ? `<div class="eyebrow" style="margin-top:14px">Materiali e colori</div><table><thead><tr><th>Dove</th><th>Prodotto</th><th>Colore</th><th>Tipo</th></tr></thead><tbody>${mats.map((m) => `<tr><td>${esc(m.dove)}</td><td>${esc(m.prodotto)}</td><td>${esc(m.colore)}</td><td>${esc(m.tipo)}</td></tr>`).join('')}</tbody></table>` : ''}
    <div class="grid2" style="margin-top:14px;gap:14px"><div><div class="eyebrow">Documenti nel fascicolo</div><ul class="small" style="margin:4px 0;padding-left:18px">${docs.map((d) => `<li>${esc(d[0])} <span class="muted">(${esc(d[2])}, ${fd(d[1])})</span></li>`).join('') || '<li class="muted">nessuno</li>'}</ul></div>
    <div><div class="eyebrow">Sicurezza</div><div class="small">Analisi dei rischi SUVA: ${sv ? `compilata il ${fd(sv.data)} da ${esc(worker(sv.chi).nome)}, ${Object.keys(sv.ck).length}/${SUVA8.length} punti` : '<b>da compilare</b>'}<br>Foto prima: ${DB.fotoPrima[c.id] || '<b>mancanti</b>'}<br>Emergenze: 144 ambulanza · 118 pompieri · 117 polizia · Tox 145</div></div></div>
    <div class="sigblock" style="margin-top:18px"><div class="grid2"><div>Compilato da ______________________<br><span class="small">${esc(me().nome)}, ${fd(D.TODAY_ISO)}</span></div><div>Visto responsabile ramo ______________________</div></div></div></div>`;
}
function suvaModal(m) {
  const c = cant(m.id); const sv = DB.suva[c.id] || (DB.suva[c.id] = { data: D.TODAY_ISO, chi: S.user.wid, ck: {}, note: '' }); const n = Object.keys(sv.ck).length;
  return `<div class="row between"><h2>${I('shield')} Analisi dei rischi (SUVA) · ${esc(c.nome)}</h2><div class="row"><button class="btn sm" data-act="suva-print" data-id="${c.id}">${I('printer')} Stampa / PDF</button><button class="btn sm" data-act="close">Chiudi</button></div></div>
    <p class="small muted">Lista di controllo dell'impresa per il cantiere, da compilare prima dell'inizio dei lavori e da tenere nel file copertina. ${n}/${SUVA8.length} punti verificati${sv.data ? ' · ' + fd(sv.data) + ' · ' + esc(worker(sv.chi).nome) : ''}.</p>
    <div class="print-area"><div class="doc" style="padding:18px"><div class="row between"><div><b>MY COLOR Isella & Foletti SA · Analisi dei rischi</b><br><span class="small">${esc(c.nome)}, ${esc(c.indirizzo)} · ${esc(typeof cantDisplay7 === 'function' ? cantDisplay7(c.id) : c.id)} · ${esc(c.tipo)}</span></div><span class="small right">${fd(sv.data)}<br>${esc(worker(sv.chi).nome)}</span></div>
    <div class="stack small" style="margin-top:10px">${SUVA8.map((t, i) => `<label class="listrow" style="cursor:pointer;gap:12px;padding:7px 0"><input type="checkbox" data-suva="${c.id}|${i}" ${sv.ck[i] ? 'checked' : ''}><span style="flex:1">${esc(t)}</span></label>`).join('')}</div>
    <div style="margin-top:10px"><label for="suva-note">Misure particolari per questo cantiere</label><textarea id="suva-note" rows="2" data-suva-note="${c.id}">${esc(sv.note)}</textarea></div>
    <div class="sigblock small" style="margin-top:12px">Responsabile ramo ______________________ &nbsp;&nbsp; Capo squadra ______________________</div></div></div>
    <div class="row between"><span class="small muted">Si salva da solo. Le istruzioni per i nuovi e gli interinali vanno fatte il primo giorno (punto 11).</span><button class="btn primary" data-act="suva-done" data-id="${c.id}">Segna tutto verificato</button></div>`;
}

// ---------- 4. SMISTAMENTO RICHIESTE PER RAMO (Inbox) ----------
function smistaBtn8(m) {
  const ramo = ramoDiTesto8(m.oggetto + ' ' + m.testo); const r = worker(respRamo8(ramo)); const done = DB.attivita.find((a) => a.email === m.id);
  if (done) return `<span class="pill good">${I('check')} inoltrata a ${esc(worker(done.chi).nome.split(' ')[0])}</span>`;
  return `<button class="btn sm" data-act="req-smista" data-id="${m.id}" data-ramo="${ramo}" title="Regola: gesso e cartongesso ad Antonio, pittura a Stefano">${I('user-plus')} Inoltra a ${esc(r.nome.split(' ')[0])} (${ramo === 'G' ? 'gesso' : 'pittura'})</button><button class="btn sm ghost" data-act="req-smista" data-id="${m.id}" data-ramo="${ramo === 'G' ? 'P' : 'G'}">${ramo === 'G' ? 'a Stefano' : 'ad Antonio'}</button>`;
}
function smista8(mid, ramo) {
  const m = DB.email.find((x) => x.id === mid); if (!m) return; const resp = respRamo8(ramo); const r = worker(resp); const nome = fromName(m.da);
  DB.attivita.unshift({ id: uid('AT'), tipo: 'Sopralluogo', rel: m.rel || null, titolo: 'Richiesta ' + (ramo === 'G' ? 'gesso' : 'pittura') + ': ' + m.oggetto.replace(/^richiesta( preventivo)?:?\s*/i, '') + ' (' + nome + ')', data: addDays(D.TODAY_ISO, 2), ora: '09:00', chi: resp, esito: 'Da ' + nome + ' <' + fromAddr(m.da) + '>: fissare appuntamento e sopralluogo. ' + (m.allegati.length ? 'Allegati: ' + m.allegati.join(', ') : ''), done: false, email: m.id });
  m.labels = [...new Set([...(m.labels || []), 'Richiesta offerta'])]; m.unread = false;
  DB.email.unshift({ id: uid('E'), rel: m.rel || null, account: m.account, folder: 'Sent', da: me().email, a: r.email, oggetto: 'Inoltro: ' + m.oggetto, data: nowISO(), unread: false, testo: `Ciao ${r.nome.split(' ')[0]},\n\nnuova richiesta ${ramo === 'G' ? 'gesso/cartongesso' : 'pittura'} da ${nome}: ti ho messo l'attività per fissare il sopralluogo.\n\n${me().nome}`, allegati: m.allegati.slice() });
  notify('Nuova richiesta ' + (ramo === 'G' ? 'gesso' : 'pittura') + ' da ' + nome + ': ' + m.oggetto, 'attivita', null, ['C001', resp]);
  toast('Inoltrata a ' + r.nome.split(' ')[0] + ': attività "sopralluogo" creata e notifica inviata');
}

// ---------- 5. INVITO OPERAIO CON QR (senza password) ----------
function qrSvg8(seed, size = 160) {
  let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const n = 25; const cell = size / n; let r = '';
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const finder = (x, y) => { r += `<rect x="${x * cell}" y="${y * cell}" width="${cell * 7}" height="${cell * 7}" fill="#111"/><rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${cell * 5}" height="${cell * 5}" fill="#fff"/><rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${cell * 3}" height="${cell * 3}" fill="#111"/>`; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && rnd() < 0.45) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#111"/>`; }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="background:#fff;border-radius:8px;padding:6px;box-sizing:content-box">${r}</svg>`;
}
function qrInviteModal(m) {
  const w = worker(m.id); const pin = String(1000 + ((w.id.charCodeAt(2) * 37 + w.id.charCodeAt(3) * 11) % 9000)); const link = 'https://app.mycolorgroup.ch/i/' + w.id.toLowerCase() + '-' + pin.slice(0, 2) + 'k7';
  return `<div class="row between"><h2>${I('scan')} Invito nell'app · ${esc(w.nome)}</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="print-area"><div class="grid2"><div style="text-align:center">${qrSvg8(w.id)}<p class="small muted" style="margin:8px 0 0">Scansionato dalla fotocamera del telefono: apre l'app già con il suo nome. Niente password.</p></div>
    <div><dl class="dl"><dt>Link</dt><dd class="small num" style="word-break:break-all">${esc(link)}</dd><dt>PIN di conferma</dt><dd class="num b" style="font-size:1.3rem">${pin}</dd><dt>Scadenza</dt><dd>${fd(addDays(D.TODAY_ISO, 7))} (7 giorni)</dd><dt>Lingua dell'app</dt><dd>${esc(w.lingua || 'Italiano')}</dd><dt>Telefono</dt><dd class="num">${esc(w.tel || '–')}</dd></dl>
    <p class="small muted">Dopo la prima apertura l'operaio sceglie un PIN o usa l'impronta. Se cambia telefono, l'ufficio rigenera l'invito da qui.</p></div></div></div>
    <div class="row"><button class="btn primary" data-act="qr-send" data-id="${w.id}" data-via="sms">${I('message')} Invia per SMS</button><button class="btn" data-act="qr-send" data-id="${w.id}" data-via="whatsapp">WhatsApp</button><button class="btn" data-act="print-now">${I('printer')} Stampa per consegnarlo a mano</button></div>`;
}

// ---------- viste avvolte ----------
const vOpBol8_0 = vOpBol;
vOpBol = function () {
  ensure8(); let out = vOpBol8_0(); const w = me(); const c = cant(S.bolForm.cantiere) || myCant(w);
  const foto = fotoPrimaCard8(w, c);
  if (isCapo8(w)) { const n = sqMembers8(c, w).length; const card = `<div class="card" style="padding:12px 14px;border-left:3px solid var(--brand)"><div class="row between"><div><div class="eyebrow">${I('users')} Capo squadra</div><span class="small muted">${n} con te su ${esc(cantShort ? cantShort(c) : c.nome)}: compila per tutti in un colpo</span></div><button class="btn sm primary" data-act="nav" data-id="op-squadra">Per la squadra</button></div></div>`; const mk = '<div><div class="eyebrow" style="margin-bottom:6px">I miei ultimi bollettini'; out = out.includes(mk) ? out.replace(mk, card + mk) : out; }
  const mk2 = '<div class="stack"><div><label for="f-cant">Cantiere</label>'; return foto && out.includes(mk2) ? out.replace(mk2, foto + mk2) : out;
};
const vOpOggi8_0 = vOpOggi;
vOpOggi = function () { ensure8(); let out = vOpOggi8_0(); const w = me(); const c = myCant(w); const foto = fotoPrimaCard8(w, c); const mk = '<div class="card" style="padding:12px 14px"><div class="eyebrow">Cantiere di oggi</div>'; return foto && out.includes(mk) ? out.replace(mk, foto + mk) : out; };
const vCant8_0 = vCantiere;
vCantiere = function () {
  ensure8(); let out = vCant8_0(); const c = cant(S.id); if (!c) return out;
  if (curTab('cant', 'redd') === 'doc') { const mk = 'data-act-change="upload-cant-doc"></label>'; const sv = DB.suva[c.id]; const btns = `<button class="btn sm" data-act="copertina-open" data-id="${c.id}">${I('file')} File copertina</button><button class="btn sm ${sv ? '' : 'primary'}" data-act="suva-open" data-id="${c.id}">${I('shield')} Analisi rischi SUVA${sv ? ' (' + Object.keys(sv.ck).length + '/' + SUVA8.length + ')' : ''}</button>`; if (out.includes(mk)) out = out.replace(mk, mk + btns); const mk2 = '<p class="muted small">Nessun documento</p>'; const row = `<div class="listrow"><span>${fotoPrimaPill8(c)} <span class="small muted">· le foto "prima" le chiede l'app il primo giorno</span></span></div>`; out = out.includes(mk2) ? out.replace(mk2, row + mk2) : out.replace(`<div class="listrow"><span>${I('file')}`, row + `<div class="listrow"><span>${I('file')}`); }
  return out;
};
const vInbox8_0 = vInbox;
vInbox = function () { ensure8(); let out = vInbox8_0(); const X = S.inbox; const open = X && X.open ? DB.email.find((m) => m.id === X.open) : null; if (open && open.folder === 'Inbox' && /preventiv|offert|richiest|tinteggi|cartong|ristruttur/i.test(open.oggetto + ' ' + open.testo)) { const mk = `<button class="btn sm" data-act="email-to-activity" data-id="${open.id}">`; out = out.replace(mk, smistaBtn8(open) + mk); } return out; };
const workerModal8_0 = workerModal;
workerModal = function (m) { ensure8(); let out = workerModal8_0(m); const w = worker(m.id); if (w.ramo === 'U') return out; const mk = '<dt>Accesso app</dt><dd>'; return out.includes(mk) ? out.replace(/(<dt>Accesso app<\/dt><dd>)(.*?)(<\/dd>)/, `$1$2 <button class="btn sm" data-act="qr-invite" data-id="${w.id}" style="margin-left:6px">${I('scan')} Invito con QR</button>$3`) : out; };
const bolDetail8_0 = bolDetailModal;
bolDetailModal = function (m) { let out = bolDetail8_0(m); const b = DB.bollettini.find((x) => x.id === m.id); if (b && b.capo) out = out.replace(/(<dt>Inviato da<\/dt><dd>)/, `$1${I('users')} capo squadra ${esc(worker(b.capo).nome)} · `); return out; };
const printModal8_0 = printModal;
printModal = function (m) { if (m.kind !== 'copertina') return printModal8_0(m); const c = cant(m.id); return `<div class="row between"><h2>File copertina · ${esc(c.nome)}</h2><div class="row"><button class="btn sm" data-act="print-now">${I('printer')} Stampa / salva PDF</button><button class="btn sm" data-act="suva-open" data-id="${c.id}">${I('shield')} Analisi rischi</button><button class="btn sm" data-act="close">Chiudi</button></div></div><div class="print-area">${copertinaDoc8(c)}</div>`; };
const MODALS8 = { suva: suvaModal, 'qr-invite': qrInviteModal };
const renderModal8_0 = renderModal;
renderModal = function () { const m = S.modal; if (m && MODALS8[m.type]) return `<div class="modal-bg" data-act="close-bg"><div class="modal ${m.type === 'suva' ? 'wide' : ''}">${MODALS8[m.type](m)}</div></div>`; return renderModal8_0(); };
const sysAtt8_0 = sysAttivita;
sysAttivita = function (all) {
  ensure8(); const L = sysAtt8_0(all); const st = sysDone();
  const add = (key, o) => { const a = { id: 'SYS|' + key, sys: true, data: D.TODAY_ISO, ora: '', esito: '', done: false, ...o }; const s = st[a.id]; if (s && s.done) { a.done = true; a.doneTs = s.ts; } if (s && s.snooze && s.snooze > D.TODAY_ISO) { a.snoozed = s.snooze; if (!all) return; } L.push(a); };
  DB.cantieri.filter((c) => c.stato === 'In corso' && !DB.fotoPrima[c.id] && c.inizio >= addDays(D.TODAY_ISO, -21)).forEach((c) => add('foto|' + c.id, { tipo: 'Controllo', prio: 'warn', titolo: `${c.nome}: nessuna foto "prima" caricata dall'inizio dei lavori (${fd(c.inizio)})`, html: `<span class="t b">${esc(c.nome)}</span>: nessuna foto "prima" dall'inizio dei lavori (${fd(c.inizio)}). L'app la chiede alla squadra ogni mattina finché non arriva.`, act: 'open-cantiere', aid: c.id }));
  DB.cantieri.filter((c) => c.stato === 'In corso' && !DB.suva[c.id]).slice(0, 2).forEach((c) => add('suva|' + c.id, { tipo: 'Documento', prio: 'info', titolo: `${c.nome}: analisi dei rischi SUVA da compilare per il file copertina`, html: `<span class="t b">${esc(c.nome)}</span>: analisi dei rischi SUVA da compilare per il file copertina.`, act: 'suva-open', aid: c.id }));
  DB.email.filter((m) => m.folder === 'Inbox' && /^richiesta|preventivo|tinteggiatura|cartong/i.test(m.oggetto) && !DB.attivita.some((a) => a.email === m.id)).forEach((m) => add('req|' + m.id, { tipo: 'Controllo', prio: 'info', titolo: `Richiesta da smistare: ${m.oggetto} (${fromName(m.da)})`, html: `Richiesta da smistare: <span class="t b">${esc(m.oggetto)}</span> da ${esc(fromName(m.da))}. Regola: gesso ad Antonio, pittura a Stefano.`, act: 'req-open', aid: m.id }));
  return L;
};

// ---------- gestori ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return; const act = el.dataset.act, id = el.dataset.id, ds = el.dataset;
  const H = {
    'sq-att': () => { S.sqForm.att = S.sqForm.att === id ? '' : id; },
    'sq-ore-all': () => { Object.keys(S.sqForm.ore).forEach((k) => { S.sqForm.ore[k] = +id; }); },
    'sq-send': () => { sqSend8(); return 'skip'; },
    'copertina-open': () => { ensure8(); S.modal = { type: 'print', kind: 'copertina', id }; },
    'suva-open': () => { ensure8(); if (S.view !== 'cantiere' || S.id !== id) { S.tab.cant = 'doc'; go('cantiere', id); } S.modal = { type: 'suva', id }; },
    'suva-print': () => { window.print(); return 'skip'; },
    'suva-done': () => { const sv = DB.suva[id]; SUVA8.forEach((_, i) => { sv.ck[i] = 1; }); sv.data = D.TODAY_ISO; sv.chi = S.user.wid; toast('Analisi dei rischi completata: ' + SUVA8.length + '/' + SUVA8.length); return 'skip'; },
    'req-smista': () => { smista8(id, ds.ramo); return 'skip'; },
    'req-open': () => { S.inbox = S.inbox || { folder: 'inbox', acc: 'all', label: '', q: '', open: null }; S.inbox.open = id; S.inbox.folder = 'inbox'; go('inbox'); return 'skip'; },
    'qr-invite': () => { S.modal = { type: 'qr-invite', id }; },
    'qr-send': () => { const w = worker(id); w.app = 'Invitato'; DB.inviti.push({ id: uid('IN'), email: w.email, nome: w.nome, ruolo: 'Operaio (app)', inviato: D.TODAY_ISO, stato: 'In attesa' }); S.modal = null; toast('Invito inviato a ' + w.nome.split(' ')[0] + ' via ' + (ds.via === 'sms' ? 'SMS' : 'WhatsApp') + ': apre l\'app con il QR, senza password'); return 'skip'; },
  };
  if (!H[act]) return; if (el.tagName !== 'INPUT' && el.tagName !== 'LABEL') e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset;
  if (ds.sqOre) { S.sqForm.ore[ds.sqOre] = Math.max(0.5, Math.min(12, +t.value || 8)); return; }
  if (ds.sqIn) { S.sqForm.incl[ds.sqIn] = t.checked; render(); return; }
  if (ds.sqCant) { S.sqForm = { cantiere: t.value, ore: {}, incl: {}, att: S.sqForm.att, note: S.sqForm.note }; render(); return; }
  if (ds.sqNote) { S.sqForm.note = t.value; return; }
  if (ds.suva) { const [cid, i] = ds.suva.split('|'); const sv = DB.suva[cid]; if (t.checked) sv.ck[i] = 1; else delete sv.ck[i]; sv.data = D.TODAY_ISO; sv.chi = S.user.wid; render(); return; }
  if (ds.suvaNote) { DB.suva[ds.suvaNote].note = t.value; return; }
  if (ds.actChange === 'foto-prima') { const c = cant(ds.id); const n = t.files.length || 1; DB.fotoPrima[c.id] = (DB.fotoPrima[c.id] || 0) + n; (DB.documenti[c.id] = DB.documenti[c.id] || []).unshift(['Foto prima (' + n + ').zip', D.TODAY_ISO, 'Foto']); notify(me().nome + ' ha caricato ' + n + ' foto "prima" per ' + c.nome, 'cantiere', c.id, ['C001', respRamo8(ramoDiCant8(c))]); toast(n + ' foto "prima" salvate in SharePoint/Cantieri/' + c.id); return; }
});
window.addEventListener('DOMContentLoaded', () => { if (typeof OPV !== 'undefined') { OPV['op-squadra'] = vOpSquadra; } ensure8(); try { const k = new URLSearchParams(location.search).get('u'); const u = k && USERS.find((x) => x.key === k); if (u && !S.user) { S.user = u; if (typeof applyHash === 'function') applyHash(); else S.view = 'op-oggi'; } } catch (_) {} render(); });
