/* MyColor Gestionale – rendering, routing, eventi e avvio */
const VIEWS = { home: vHome, cantieri: vCantieri, cantiere: vCantiere, pianificazione: vPianificazione, bollettini: vBollettini, persone: vPersone, cliente: vCliente, fornitore: vFornitore, veicoli: vVeicoli, commerciale: vCommerciale, offerta: vOfferta, fattura: vFattura, capitolato: vCapitolato, calendario: vCalendario, messaggi: vMessaggi, magazzino: vMagazzino, contabilita: vContabilita, impostazioni: vImpostazioni };
const OPV = { 'op-oggi': vOpOggi, 'op-bol': vOpBol, 'op-km': vOpKm, 'op-msg': vOpMsg, 'op-mese': vOpMese };
VIEWS.firma = vFirma;
const TABKEY = { impostazioni: 'imp', persone: 'persone', commerciale: 'comm', veicoli: 'veic', bollettini: 'bol', contabilita: 'cont', magazzino: 'mag', cantiere: 'cant' };

function render() {
  if (S._rend) { S._again = true; return; }
  S._rend = true; try { renderInner(); } finally { S._rend = false; if (S._again) { S._again = false; render(); } }
}
function renderInner() {
  const app = $('#app');
  const ae = document.activeElement; const focusId = ae && ae.id; const caret = ae && ae.selectionStart != null ? ae.selectionStart : null;
  if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', S.theme);
  let html = '';
  if (S.view === 'firma') html = vFirma();
  else if (!S.user) html = vLogin();
  else if (S.user.role === 'operaio') html = (OPV[S.view] || vOpOggi)();
  else html = shell((VIEWS[S.view] || vHome)());
  html += renderModal();
  if (S.user) html += aiPanel();
  if (S.toast) html += `<div class="toast">${S.toast}</div>`;
  app.innerHTML = html;
  if (focusId) { const el = document.getElementById(focusId); if (el && el.type !== 'file') { el.focus(); try { if (caret != null && el.setSelectionRange) el.setSelectionRange(caret, caret); } catch (_) {} } }
  ['msgs', 'ai-msgs'].forEach((id) => { const el = document.getElementById(id); if (el) el.scrollTop = el.scrollHeight; });
  if (typeof afterRender === 'function') afterRender();
  persist();
}

// ---------- CSV ----------
function exportCsv(key) {
  const c = (id) => (cant(id) || {}).nome || '';
  const sets = {
    cantieri: ['Cantieri', ['ID', 'Cantiere', 'Comune', 'Cliente', 'Stato', 'Avanzamento %', 'Contratto', 'Costi', 'Margine', 'CHF/h'], DB.cantieri.map((x) => { const r = calc(x); return [x.id, x.nome, x.comune, cliente(x.clienteId).nome, x.stato, x.avanzamento, r.contratto, Math.round(r.costi), Math.round(r.margine), r.chfOra.toFixed(1)]; })],
    ff: ['Fatture fornitori', ['Fattura', 'Fornitore', 'Categoria', 'Cantiere', 'Data', 'Scadenza', 'Importo', 'Stato'], DB.fattForn.map((f) => [f.id, fornitore(f.fornitoreId).nome, f.categoria, f.cantiere || '', f.data, f.scadenza, f.importo, f.stato])],
    'ff-cant': ['Fatture cantiere', ['Fattura', 'Fornitore', 'Categoria', 'Data', 'Importo', 'Stato'], DB.fattForn.filter((f) => f.cantiere === S.id).map((f) => [f.id, fornitore(f.fornitoreId).nome, f.categoria, f.data, f.importo, f.stato])],
    bollettini: ['Bollettini', ['Data', 'Collaboratore', 'Cantiere', 'Entrata', 'Uscita', 'Ore', 'Viaggio', 'Attività', 'GPS m', 'Stato', 'Note'], DB.bollettini.map((b) => [b.data, worker(b.workerId).nome, b.cantiere, b.entrata, b.uscita, b.ore, b.viaggio, b.attivita, b.gps, b.stato, b.note || ''])],
    conguaglio: ['Conguaglio', ['Collaboratore', 'Ruolo', 'Categoria', 'Salario', 'Costo orario', 'Costo aziendale'], DB.workers.filter((w) => w.ramo !== 'U').map((w) => [w.nome, w.ruolo, w.cat, w.salario, w.costoOra, w.costoAziendaOra])],
    team: ['Collaboratori', ['Nome', 'Ramo', 'Categoria', 'Ruolo', 'Residenza', 'Km base', 'Anni', 'Competenze', 'Costo az./h', 'Telefono', 'E-mail', 'App'], DB.workers.map((w) => [w.nome, w.ramo, w.cat, w.ruolo, w.residenza, w.kmDaBase, w.anni, w.competenze.join(', '), w.costoAziendaOra, w.tel, w.email, w.app])],
    clienti: ['Clienti', ['Cliente', 'Tipo', 'Contatto', 'E-mail', 'Telefono', 'Comune', 'Pagamento'], DB.clienti.map((k) => [k.nome, k.tipo, k.contatto, k.email, k.tel, k.comune, k.pagamento])],
    fornitori: ['Fornitori', ['Fornitore', 'Categoria', 'Contatto', 'E-mail', 'Telefono', 'Comune', 'Pagamento', 'Sconto'], DB.fornitori.map((f) => [f.nome, f.categoria, f.contatto, f.email, f.tel, f.comune, f.pagamento, f.sconto])],
    veicoli: ['Veicoli', ['Targa', 'Modello', 'Anno', 'Assegnato', 'Km mese', 'Km totali', 'Servizio', 'Stato'], DB.veicoli.map((v) => [v.targa, v.modello, v.anno, v.assegnato ? worker(v.assegnato).nome : '', v.kmMese, v.kmTot, v.prossimoServizio, v.stato])],
    offerte: ['Offerte', ['Offerta', 'Cliente', 'Oggetto', 'Tipo', 'Data', 'Preventivo', 'Deliberato', 'Sconto', 'Stato'], DB.offerte.map((o) => [o.id, cliente(o.clienteId).nome, o.oggetto, o.tipo, o.data, o.preventivo, o.deliberato, o.sconto, o.stato])],
    fatture: ['Fatture clienti', ['Fattura', 'Cliente', 'Cantiere', 'Tipo', 'Descrizione', 'Data', 'Scadenza', 'Importo', 'Stato'], DB.fatture.map((f) => [f.id, cliente(f.clienteId).nome, f.cantiere || '', f.tipo, f.desc, f.data, f.scadenza, f.importo, f.stato])],
    magazzino: ['Magazzino', ['Codice', 'Articolo', 'Categoria', 'Q.tà', 'Unità', 'Valore unit.', 'Valore', 'Ubicazione', 'Cantiere'], DB.magazzino.map((m) => [m.cod, m.nome, m.cat, m.qta, m.unita, m.valore, m.qta * m.valore, m.ubic, m.cantiere ? m.cantiere + ' ' + c(m.cantiere) : ''])],
  };
  const s = sets[key]; if (!s) return; csvDownload(s[0].replace(/\s+/g, '_') + '_' + D.TODAY_ISO, s[1], s[2]); toast(s[0] + ': file CSV scaricato (apribile in Excel)');
}

// ---------- azioni ----------
function openNew(ent, prefill, extra) {
  const after = (o, isNew) => { if (!isNew) return; if (ent === 'cantiere') go('cantiere', o.id); if (ent === 'cliente') go('cliente', o.id); if (ent === 'fornitore') go('fornitore', o.id); if (ent === 'assenza' && S.user.role === 'operaio') { notify(worker(o.workerId).nome + ' chiede ' + o.tipo.toLowerCase() + ' dal ' + fd(o.dal) + ' al ' + fd(o.al), 'bollettini', null, ['C001', 'C002', 'C003']); } };
  S.modal = { type: 'form', ent, prefill: prefill || {}, after, ...(extra || {}) }; render();
}
function parseRel(s) { if (!s) return null; const [tt, id] = s.split('|'); return tt && id ? { t: tt, id } : null; }
function composeTo(el) {
  const rel = parseRel(el.dataset.rel); const obj = rel ? (rel.t === 'cliente' ? cliente(rel.id) : fornitore(rel.id)) : null;
  const ctx = { contatto: el.dataset.contatto || (obj ? obj.contatto : ''), me: me().nome, fattura: obj && rel.t === 'cliente' ? DB.fatture.find((f) => f.clienteId === obj.id && ['Inviata', 'Scaduta'].includes(f.stato)) : null };
  const tt = TPL[el.dataset.tpl || ''] ? TPL[el.dataset.tpl || ''](ctx) : {};
  openCompose({ rel, a: el.dataset.to || (obj ? obj.email : ''), oggetto: el.dataset.sub || tt.oggetto || '', testo: tt.testo || '', ctx, contatto: ctx.contatto });
}
function confirmDo(title, text, ok, fn, danger) { S.modal = { type: 'confirm', title, text, ok, fn, danger }; render(); }
const curSel = (key) => selOf(key).slice();
function clearSel(key) { S.selected[key] = []; }
function sendFattura(f) { f.stato = 'Inviata'; const k = cliente(f.clienteId); DB.email.unshift({ id: uid('E'), rel: { t: 'cliente', id: k.id }, folder: 'Sent', da: me().email, a: k.email, oggetto: 'Fattura ' + f.id + ', ' + f.desc, data: nowISO(), unread: false, testo: `Gentile ${k.contatto},\n\nallegata la fattura ${f.id} di ${chf(f.importo)} (+ IVA), scadenza ${fd(f.scadenza)}, con QR-fattura.\n\nCordiali saluti\n${me().nome}`, allegati: [f.id + '.pdf'] }); DB.attivita.unshift({ id: uid('AT'), tipo: 'E-mail', rel: { t: 'cliente', id: k.id }, titolo: 'Inviata fattura ' + f.id, data: D.TODAY_ISO, ora: nowHM(), chi: S.user.wid, esito: '', done: true }); }
function sollecita(f) { const k = cliente(f.clienteId); const tt = TPL.sollecito({ contatto: k.contatto, me: me().nome, fattura: f }); DB.email.unshift({ id: uid('E'), rel: { t: 'cliente', id: k.id }, folder: 'Sent', da: me().email, a: k.email, oggetto: tt.oggetto, data: nowISO(), unread: false, testo: tt.testo, allegati: [f.id + '.pdf'] }); DB.attivita.unshift({ id: uid('AT'), tipo: 'E-mail', rel: { t: 'cliente', id: k.id }, titolo: 'Sollecito fattura ' + f.id, data: D.TODAY_ISO, ora: nowHM(), chi: S.user.wid, esito: '', done: true }); if (f.scadenza < D.TODAY_ISO) f.stato = 'Scaduta'; }
function assignWorkers(ids, cid, notif) { const c = cant(cid); ids.forEach((wid) => { DB.cantieri.forEach((x) => { x.squadra = x.squadra.filter((y) => y !== wid); }); c.squadra.push(wid); Object.keys(DB.plan).forEach((k) => { if (k.startsWith(wid + '|')) delete DB.plan[k]; }); if (notif) DB.messaggi.push({ id: uid('M'), ch: dmId(S.user.wid, wid), autore: S.user.wid, testo: `Da ${fd(addDays(D.TODAY_ISO, 3))} sei su ${c.nome}, ${c.comune}. Ritrovo alle 7 al magazzino.`, ts: nowISO(), letto: false }); }); }

document.addEventListener('click', (e) => {
  const t0 = e.target;
  if (t0.dataset && t0.dataset.sel) { const arr = selOf(t0.dataset.sel); const id = t0.dataset.id; if (t0.checked) { if (!arr.includes(id)) arr.push(id); } else S.selected[t0.dataset.sel] = arr.filter((x) => x !== id); render(); return; }
  if (t0.dataset && t0.dataset.selall) { const key = t0.dataset.selall; const boxes = [...document.querySelectorAll(`input[data-sel="${key}"]`)]; S.selected[key] = t0.checked ? boxes.map((b) => b.dataset.id) : []; render(); return; }
  const el = t0.closest('[data-act]');
  const menusOpen = S.searchOpen || S.plusOpen || S.notifOpen || S.profOpen;
  if (!el) { if (menusOpen && !t0.closest('.dropdown') && !t0.closest('.search')) { closeMenus(); render(); } return; }
  if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.tagName === 'FORM') return;
  const act = el.dataset.act, id = el.dataset.id; const ds = el.dataset; const w = me();
  const prev = { s: S.searchOpen, p: S.plusOpen, n: S.notifOpen, pr: S.profOpen }; closeMenus();
  const A = {
    'ms-picker': () => { S.sel.msPicker = true; render(); },
    'ms-back': () => { S.sel.msPicker = false; render(); },
    login: () => { const u = USERS.find((x) => x.key === id); S.user = u; S.sel.msPicker = false; try { localStorage.setItem('mc-user', u.key); } catch (_) {} go(u.role === 'operaio' ? 'op-oggi' : 'home'); },
    logout: () => { S.user = null; S.clock = { in: null, out: null }; S.trip = null; S.ai = { open: false, msgs: [], typing: false }; try { localStorage.removeItem('mc-user'); } catch (_) {} go('login'); },
    nav: () => { if (ds.tab && TABKEY[id]) S.tab[TABKEY[id]] = ds.tab; go(id); },
    tab: () => { S.tab[ds.key] = id; render(); },
    'plus-toggle': () => { S.plusOpen = !prev.p; render(); },
    'notif-toggle': () => { S.notifOpen = !prev.n; render(); },
    'prof-toggle': () => { S.profOpen = !prev.pr; render(); },
    'notif-readall': () => { myNotifs().forEach((n) => { n.letta = true; }); render(); },
    'notif-open': () => { const n = DB.notifiche.find((x) => x.id === id); n.letta = true; if (n.view === 'messaggi') { S.chatCh = n.id2; go('messaggi'); } else if (n.view === 'commerciale') { S.tab.comm = n.id2 === 'fatture' ? 'fat' : 'off'; go('commerciale'); } else if (n.view === 'capitolato' || n.view === 'cantiere' || n.view === 'cliente' || n.view === 'fornitore') go(n.view, n.id2); else go(n.view); },
    plus: () => { if (id.startsWith('form:')) openNew(id.slice(5)); else if (id === 'new-offerta') A['new-offerta'](); else if (id === 'fwiz') { S.modal = { type: 'fwiz' }; render(); } else if (id === 'ocr') { S.modal = { type: 'ocr', step: 'idle' }; render(); } else if (id === 'cap-upload') { S.modal = { type: 'cap-upload', step: 'idle' }; render(); } else if (id === 'compose') openCompose({}); else if (id === 'new-dm') { S.modal = { type: 'new-dm' }; render(); } else if (id === 'stock') { S.modal = { type: 'stock', tipo: 'Scarico' }; render(); } else if (id === 'invite') { S.modal = { type: 'invite' }; render(); } },
    'open-cantiere': () => go('cantiere', id), 'open-cliente': () => go('cliente', id), 'open-fornitore': () => go('fornitore', id), 'open-offerta': () => go('offerta', id), 'open-fattura': () => go('fattura', id), 'open-capitolato': () => go('capitolato', id),
    'open-worker': () => { S.modal = { type: 'worker', id }; render(); },
    'open-email': () => { S.modal = { type: 'email', id }; render(); },
    'open-evento': () => { S.modal = { type: 'event-read', id }; render(); },
    'open-ff': () => { S.modal = { type: 'form', ent: 'fatturaForn', id }; render(); },
    'open-articolo': () => { S.modal = { type: 'form', ent: 'articolo', id }; render(); },
    'open-veicolo': () => { S.modal = { type: 'form', ent: 'veicolo', id }; render(); },
    close: () => { S.modal = null; render(); },
    'close-bg': () => { if (t0 === el) { S.modal = null; render(); } },
    toast: () => toast(ds.msg),
    'toast-sel': () => { clearSel(ds.key); toast(id); },
    'sel-clear': () => { clearSel(ds.key); render(); },
    'new-entity': () => openNew(ds.ent, ds.prefill ? JSON.parse(ds.prefill) : {}),
    'edit-entity': () => { S.modal = { type: 'form', ent: ds.ent, id }; render(); },
    'edit-offerta': () => { S.modal = { type: 'form', ent: 'offerta', id }; render(); },
    'delete-entity': () => { const E = ENT[ds.ent]; const o = entityFind(ds.ent, id); confirmDo('Eliminare ' + E.label + '?', `"${esc(E.name(o))}" verrà eliminato. L'operazione resta nel registro attività.`, 'Elimina', () => { deleteEntity(ds.ent, id); toast(E.label.charAt(0).toUpperCase() + E.label.slice(1) + ' eliminato'); if ((ds.ent === 'cantiere' && S.view === 'cantiere') || (ds.ent === 'cliente' && S.view === 'cliente') || (ds.ent === 'fornitore' && S.view === 'fornitore') || (ds.ent === 'offerta' && S.view === 'offerta') || (ds.ent === 'fattura' && S.view === 'fattura')) go(VIEW_PARENT[S.view]); }, true); },
    'confirm-ok': () => { const fn = S.modal.fn; S.modal = null; if (fn) fn(); render(); },
    'bulk-edit': () => { S.modal = { type: 'bulk-edit', ent: ds.ent || { offerte: 'offerta' }[ds.key], key: ds.key, field: ds.field }; render(); },
    'bulk-delete': () => { const ent = ds.ent || { offerte: 'offerta' }[ds.key]; const ids = curSel(ds.key); confirmDo('Eliminare ' + ids.length + ' elementi?', 'Verranno eliminati: ' + ids.map((i) => ENT[ent].name(entityFind(ent, i) || { nome: i, id: i, titolo: i, desc: i })).join(', '), 'Elimina ' + ids.length, () => { ids.forEach((i) => deleteEntity(ent, i)); clearSel(ds.key); toast(ids.length + ' elementi eliminati'); }, true); },
    'bulk-approve': () => { const ids = curSel(ds.key); let n = 0; DB.bollettini.forEach((b) => { if (ids.includes(b.id) && b.stato === 'Inviato') { b.stato = 'Approvato'; n++; } }); clearSel(ds.key); toast(n + ' bollettini approvati'); },
    'bulk-reject': () => { const ids = curSel(ds.key); let n = 0; DB.bollettini.forEach((b) => { if (ids.includes(b.id) && b.stato === 'Inviato') { b.stato = 'Bozza'; n++; } }); clearSel(ds.key); toast(n + ' bollettini rinviati agli operai'); },
    'bulk-assign': () => { S.modal = { type: 'assign', ids: curSel(ds.key), key: ds.key }; render(); },
    'bulk-export-ff': () => { const ids = curSel(ds.key); let n = 0; DB.fattForn.forEach((f) => { if (ids.includes(f.id) && f.stato !== 'Esportata SelectLine') { f.stato = 'Esportata SelectLine'; n++; } }); clearSel(ds.key); toast(n + ' fatture esportate a SelectLine (creditori)'); },
    'bulk-assign-ff': () => { S.modal = { type: 'bulk-edit', ent: 'fatturaForn', key: ds.key, field: 'cantiere' }; render(); },
    'bulk-msg': () => { const ids = curSel(ds.key); clearSel(ds.key); if (ids.length === 1) { S.chatCh = dmId(w.id, ids[0]); go('messaggi'); } else { S.chatCh = 'gen'; S.sel.msgDraft = ids.map((i) => worker(i).nome.split(' ')[0]).join(', ') + ': '; go('messaggi'); } },
    'bulk-mail': () => { const ids = curSel(ds.key); const list = ds.ent === 'cliente' ? DB.clienti : DB.fornitori; const to = list.filter((x) => ids.includes(x.id)).map((x) => x.email).join('; '); clearSel(ds.key); openCompose({ a: to, contatto: 'Signore e Signori' }); },
    'bulk-paid': () => { const ids = curSel(ds.key); let n = 0; DB.fatture.forEach((f) => { if (ids.includes(f.id) && f.stato !== 'Pagata') { f.stato = 'Pagata'; f.pagataIl = D.TODAY_ISO; n++; } }); clearSel(ds.key); toast(n + ' fatture segnate come pagate'); },
    'bulk-sollecito': () => { const ids = curSel(ds.key); let n = 0; DB.fatture.forEach((f) => { if (ids.includes(f.id) && ['Inviata', 'Scaduta'].includes(f.stato)) { sollecita(f); n++; } }); clearSel(ds.key); toast(n + ' solleciti inviati via Outlook'); },
    'bulk-send-fat': () => { const ids = curSel(ds.key); let n = 0; DB.fatture.forEach((f) => { if (ids.includes(f.id) && f.stato === 'Bozza') { sendFattura(f); n++; } }); clearSel(ds.key); toast(n + ' fatture inviate ai clienti e a SelectLine'); },
    'bulk-sollecita-firma': () => { const ids = curSel(ds.key); let n = 0; DB.offerte.forEach((o) => { if (ids.includes(o.id) && o.stato === 'In attesa firma') { const k = cliente(o.clienteId); DB.email.unshift({ id: uid('E'), rel: { t: 'cliente', id: k.id }, folder: 'Sent', da: w.email, a: k.email, oggetto: 'Sollecito: offerta ' + o.id + ' in attesa di firma', data: nowISO(), unread: false, testo: `Gentile ${k.contatto},\n\nle ricordo che l'offerta ${o.id} è in attesa della sua firma dal link ricevuto.\n\nCordiali saluti\n${w.nome}`, allegati: [] }); n++; } }); clearSel(ds.key); toast(n + ' solleciti firma inviati'); },
    'bulk-approve-ass': () => { const ids = curSel(ds.key); let n = 0; DB.assenze.forEach((a) => { if (ids.includes(a.id) && a.stato === 'Richiesta') { a.stato = 'Approvata'; if (a.tipo === 'Vacanze') worker(a.workerId).vacanzeUsate += a.giorni; n++; } }); clearSel(ds.key); toast(n + ' assenze approvate'); },
    'bulk-approve-km': () => { const ids = curSel(ds.key); let n = 0; DB.kmPrivati.forEach((k) => { if (ids.includes(k.id) && k.stato === 'Inviato') { k.stato = 'Approvato'; n++; } }); clearSel(ds.key); toast(n + ' rimborsi km approvati'); },
    'bulk-stock': () => { const ids = curSel(ds.key); clearSel(ds.key); S.modal = { type: 'stock', cod: ids[0], tipo: 'Scarico' }; render(); },
    'bulk-invite': () => { const ids = curSel(ds.key); let n = 0; ids.forEach((i) => { const x = worker(i); if (x.app !== 'Attivo') { x.app = 'Invitato'; DB.inviti.push({ id: uid('IN'), email: x.email, nome: x.nome, ruolo: 'Operaio (app)', inviato: D.TODAY_ISO, stato: 'In attesa' }); n++; } }); clearSel(ds.key); toast(n + ' inviti inviati via e-mail'); },
    'bulk-deactivate': () => { const ids = curSel(ds.key); ids.forEach((i) => { if (i !== w.id) worker(i).app = 'Non invitato'; }); clearSel(ds.key); toast('Accesso disattivato per ' + ids.length + ' utenti'); },
    'export-csv': () => exportCsv(id),
    'export-all': () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'mycolor-gestionale-export.json'; document.body.appendChild(a); a.click(); a.remove(); toast('Esportazione completa scaricata'); },
    'reset-demo': () => confirmDo('Ripristinare i dati demo?', 'Tutte le modifiche fatte su questo dispositivo verranno annullate.', 'Ripristina', () => { resetDB(); S.selected = {}; S.batch = null; go('home'); toast('Dati demo ripristinati'); }, true),
    'filtro-cant': () => { S.sel.filtroCant = id; render(); }, 'filtro-bol': () => { S.filtroBol = id; render(); }, 'filtro-team': () => { S.filtroTeam = id; render(); }, 'filtro-cat': () => { S.sel.filtroCat = id; render(); }, 'filtro-off': () => { S.filtroOff = id; render(); }, 'filtro-fat': () => { S.filtroFat = id; render(); },
    'cal-week': () => { S.calWeek = id === '0' ? 0 : S.calWeek + (+id); render(); },
    // cantiere
    'squad-remove': () => { const [cid, wid] = id.split('|'); const c = cant(cid); c.squadra = c.squadra.filter((x) => x !== wid); toast(worker(wid).nome + ' tolto dalla squadra'); },
    'plan-cell': () => { S.modal = { type: 'plan-cell', cant: id, day: ds.day }; render(); },
    'plan-remove': () => { DB.plan[id + '|' + ds.day] = 'none'; render(); },
    'doc-remove': () => { const [cid, i] = id.split('|'); DB.documenti[cid].splice(+i, 1); toast('Documento rimosso da SharePoint'); },
    'ocr-open': () => { S.modal = { type: 'ocr', step: 'idle', cantiere: ds.cant || null }; if (ds.sample != null) ocrStart(null, +ds.sample); else render(); },
    'ocr-sample': () => ocrStart(null, +id),
    'stock-open': () => { S.modal = { type: 'stock', cantiere: ds.cant || (S.view === 'cantiere' ? S.id : null), cod: ds.cod, tipo: ds.tipo || 'Scarico' }; render(); },
    'fwiz-open': () => { S.modal = { type: 'fwiz', offertaId: id || null }; render(); },
    'fwiz-create': () => { fwizCreate(); render(); },
    'compose-to': () => composeTo(el),
    'act-done': () => { const a = DB.attivita.find((x) => x.id === id); a.done = true; toast('Attività completata'); },
    'new-contatto': () => { S.modal = { type: 'form', ent: 'contatto', after: (o) => cliente(id).contatti.push(o) }; render(); },
    'edit-contatto': () => { const [kid, i] = id.split('|'); S.modal = { type: 'form', ent: 'contatto', obj: cliente(kid).contatti[+i] }; render(); },
    // bollettini
    approve: () => { const b = DB.bollettini.find((x) => x.id === id); b.stato = 'Approvato'; toast('Bollettino approvato: ore caricate sul cantiere ' + b.cantiere); },
    reject: () => { const b = DB.bollettini.find((x) => x.id === id); b.stato = 'Bozza'; DB.messaggi.push({ id: uid('M'), ch: dmId(w.id, b.workerId), autore: w.id, testo: `Il bollettino del ${fshort(b.data)} è da correggere (${b.anomalia || 'controlla ore e cantiere'}). Rimandalo quando hai sistemato.`, ts: nowISO(), letto: false }); toast('Rinviato a ' + worker(b.workerId).nome.split(' ')[0] + ' con messaggio di correzione'); },
    'approve-all': () => { let n = 0; DB.bollettini.forEach((b) => { if (b.stato === 'Inviato' && !b.anomalia) { b.stato = 'Approvato'; n++; } }); toast(n + ' bollettini approvati, restano solo quelli con anomalia'); },
    'sollecita-bol': () => { const b = DB.bollettini.find((x) => x.id === id); DB.messaggi.push({ id: uid('M'), ch: dmId(w.id, b.workerId), autore: w.id, testo: `Ciao, manca il bollettino del ${fshort(b.data)}: lo invii per favore?`, ts: nowISO(), letto: false }); toast('Promemoria inviato sull\'app di ' + worker(b.workerId).nome.split(' ')[0]); },
    'ass-ok': () => { const a = DB.assenze.find((x) => x.id === id); a.stato = 'Approvata'; if (a.tipo === 'Vacanze') worker(a.workerId).vacanzeUsate += a.giorni; DB.messaggi.push({ id: uid('M'), ch: dmId(w.id, a.workerId), autore: w.id, testo: `${a.tipo} dal ${fd(a.dal)} al ${fd(a.al)} approvate 👍`, ts: nowISO(), letto: false }); toast('Approvata: pianificazione e saldo vacanze aggiornati'); },
    'ass-no': () => { const a = DB.assenze.find((x) => x.id === id); a.stato = 'Rifiutata'; toast('Richiesta rifiutata, l\'operaio riceve una notifica'); },
    'approve-km': () => { DB.kmPrivati.find((k) => k.id === id).stato = 'Approvato'; toast('Rimborso km approvato'); },
    carpool: () => { DB.carpool[id] = true; toast('Proposta applicata: pianificazione di lunedì aggiornata e notifica inviata agli operai'); },
    'carpool-undo': () => { delete DB.carpool[id]; render(); },
    // commerciale
    'new-offerta': () => { const c = ds.cant ? cant(ds.cant) : null; S.modal = { type: 'offerta-new', clienteId: c ? c.clienteId : DB.clienti[0].id, tipo: 'A corpo', oggetto: c ? c.nome + ': ' + c.tipo : '', cantiere: c ? c.id : null }; render(); },
    'off-row-add': () => { S.modal.rows.push({ pos: '', desc: '', un: 'm²', qta: 0, prezzo: 0 }); render(); },
    'off-row-del': () => { S.modal.rows.splice(+id, 1); render(); },
    'off-create': () => { const m = S.modal; const rows = m.rows.filter((r) => r.desc); const o = { id: nextId('OF-2026-', DB.offerte), tipo: m.tipo || 'A corpo', cantiere: m.cantiere || null, clienteId: m.clienteId, data: D.TODAY_ISO, validita: m.validita || addDays(D.TODAY_ISO, 30), oggetto: m.oggetto, stato: 'Bozza', firma: null, sconto: 0, preventivo: Math.round(rows.reduce((a, r) => a + (+r.qta || 0) * (+r.prezzo || 0), 0)), deliberato: 0, capitolato: rows.map((r) => [r.pos, r.desc, r.un, +r.qta || 0, +r.prezzo || 0]), variazioni: [], capitolatoId: m.capitolatoId || null }; DB.offerte.unshift(o); if (o.cantiere) cant(o.cantiere).preventivo = o.preventivo; go('offerta', o.id); toast('Offerta ' + o.id + ' creata in bozza'); },
    'off-from-cap': () => { const cp = DB.capitolati.find((x) => x.id === id); S.modal = { type: 'offerta-new', clienteId: cp.clienteId, tipo: 'A stima', oggetto: cp.titolo.replace(/^Capitolato\s*/i, ''), capitolatoId: cp.id, cantiere: cp.cantiere, rows: cp.posizioni.map((p) => ({ pos: p[0] ? 'NPK ' + p[0] : '', desc: p[1], un: p[2], qta: p[3], prezzo: NPK_PREZZI[p[0]] || 0 })) }; render(); },
    'off-pos-add': () => { offerta(id).capitolato.push(['', 'Nuova posizione', 'm²', 0, 0]); render(); },
    'send-sign': () => { const o = offerta(id); const k = cliente(o.clienteId); ensureLink(o); logEv(o, 'sent', 'Offerta inviata con link di firma', o.link.email); o.stato = 'In attesa firma'; o.firma = { stato: 'Inviata per firma', data: nowISO(), firmatario: k.contatto, metodo: 'Firma elettronica (SES)' }; DB.email.unshift({ id: uid('E'), rel: { t: 'cliente', id: k.id }, folder: 'Sent', da: w.email, a: k.email, oggetto: 'Offerta ' + o.id + ': firma digitale', data: nowISO(), unread: false, testo: TPL.offerta({ contatto: k.contatto, me: w.nome }).testo + '\n\nLink per visualizzare e firmare: ' + linkUrl(o), allegati: [o.id + '.pdf'] }); toast('Offerta inviata a ' + k.email + ' con link per la firma'); },
    sign: () => { const o = offerta(id); const k = cliente(o.clienteId); applySign(o, { firmatario: k.contatto, luogo: k.comune, metodo: 'Firma elettronica (SES), simulata', img: typedSig(k.contatto), email: k.email }); toast('Firmata: il cantiere passa in pianificazione e la prima rata del piano acconti è pronta da fatturare'); },
    'approve-var': () => { const [oid, i] = id.split('|'); offerta(oid).variazioni[+i].stato = 'Approvata dal cliente'; toast('Variazione approvata: il contratto del cantiere è aggiornato'); },
    'var-del': () => { const [oid, i] = id.split('|'); offerta(oid).variazioni.splice(+i, 1); render(); },
    'var-add': () => { S.modal = { type: 'form', ent: 'variazione', title: 'Nuova variazione in corso d\'opera', after: (v) => { offerta(id).variazioni.push(v); } }; render(); },
    'print-open': () => { S.modal = { type: 'print', kind: ds.kind, id }; render(); },
    'print-now': () => { window.print(); },
    'print-email': () => { const m = S.modal; const isF = m.kind === 'fattura'; const obj = isF ? DB.fatture.find((x) => x.id === m.id) : offerta(m.id); const k = cliente(obj.clienteId); const ctx = { contatto: k.contatto, me: w.nome, fattura: isF ? obj : null }; const tt = isF ? { oggetto: 'Fattura ' + obj.id + ', ' + obj.desc, testo: `Gentile ${k.contatto},\n\nallegata la fattura ${obj.id} di ${chf(obj.importo)} (+ IVA), scadenza ${fd(obj.scadenza)}, con QR-fattura.\n\nCordiali saluti\n${w.nome}` } : TPL.offerta(ctx); openCompose({ rel: { t: 'cliente', id: k.id }, oggetto: tt.oggetto, testo: tt.testo, allegati: [m.id + '.pdf'], ctx }); if (isF && obj.stato === 'Bozza') obj.stato = 'Inviata'; },
    'fat-send': () => { sendFattura(DB.fatture.find((x) => x.id === id)); toast('Fattura ' + id + ' inviata al cliente via Outlook e registrata in SelectLine'); },
    'fat-paid': () => { const f = DB.fatture.find((x) => x.id === id); f.stato = 'Pagata'; f.pagataIl = D.TODAY_ISO; toast('Pagamento registrato (camt.054): ' + chf(f.importo)); },
    'fat-sollecito': () => { const f = DB.fatture.find((x) => x.id === id); const k = cliente(f.clienteId); const ctx = { contatto: k.contatto, me: w.nome, fattura: f }; const tt = TPL.sollecito(ctx); openCompose({ rel: { t: 'cliente', id: k.id }, oggetto: tt.oggetto, testo: tt.testo, allegati: [f.id + '.pdf'], ctx }); },
    // capitolati
    'cap-upload-open': () => { S.modal = { type: 'cap-upload', step: 'idle', clienteId: S.view === 'cliente' ? S.id : null }; render(); },
    'cap-demo': () => capStart(null, S.modal),
    'cap-mail': () => { const cp = DB.capitolati.find((x) => x.id === id); const k = cliente(cp.clienteId); const tt = TPL.capitolato({ contatto: k.contatto, me: w.nome, domande: cp.domande.filter((d) => d.stato === 'Aperta').map((d) => d.q) }); openCompose({ rel: { t: 'cliente', id: k.id }, oggetto: tt.oggetto + ' (' + cp.titolo.slice(0, 40) + ')', testo: tt.testo, ctx: { contatto: k.contatto, me: w.nome } }); },
    'cap-q-ok': () => { const [cid, i] = id.split('|'); const d = DB.capitolati.find((x) => x.id === cid).domande[+i]; d.stato = 'Chiarita'; d.risposta = d.risposta || 'Chiarito con il cliente il ' + fd(D.TODAY_ISO); render(); },
    'cap-q-from-chat': () => { const [cid, q] = id.split('|'); DB.capitolati.find((x) => x.id === cid).domande.push({ q, stato: 'Aperta' }); toast('Aggiunta alle domande aperte'); },
    'cap-req-add': () => { S.modal = { type: 'form', ent: 'richiesta', after: (r) => DB.capitolati.find((x) => x.id === id).richieste.push(r) }; render(); },
    'cap-req-quote': () => { const [cid, i] = id.split('|'); const cp = DB.capitolati.find((x) => x.id === cid); const r = cp.richieste[+i]; r.stato = 'Quotata'; const o = cp.cantiere ? DB.offerte.find((x) => x.cantiere === cp.cantiere) : null; if (o) { o.variazioni.push({ data: D.TODAY_ISO, desc: 'Richiesta cliente: ' + r.testo, importo: 1500, stato: 'In attesa approvazione' }); go('offerta', o.id); toast('Variazione creata sull\'offerta ' + o.id + ': completa l\'importo e inviala al cliente'); } else toast('Richiesta quotata: aggiungila alla prossima offerta'); },
    'cap-ask': () => { const cp = DB.capitolati.find((x) => x.id === id); (DB.capChat[cp.id] = DB.capChat[cp.id] || []).push({ q: ds.q, ...capAnswer(cp, ds.q) }); render(); },
    // chat
    'open-chat': () => { S.chatCh = id; S.chatListOpen = false; if (S.view !== 'messaggi') go('messaggi'); else render(); },
    'open-chat-op': () => { S.chatCh = id; render(); },
    'chat-list': () => { S.chatListOpen = !S.chatListOpen; render(); },
    'new-dm': () => { S.modal = { type: 'new-dm' }; render(); },
    'dm-open': () => { S.chatCh = dmId(w.id, id); S.modal = null; go(S.user.role === 'operaio' ? 'op-msg' : 'messaggi'); },
    // assistente
    'ai-toggle': () => { S.ai.open = !S.ai.open; render(); setTimeout(() => { const i = document.getElementById('ai-input'); if (i && S.ai.open && window.innerWidth > 700) i.focus(); }, 50); },
    'ai-clear': () => { S.ai.msgs = []; render(); },
    'ai-sugg': () => aiAsk(ds.q),
    'ai-send-msg': () => { const [wid, text] = id.split('|'); sendChat(dmId(w.id, wid), text); toast('Messaggio inviato a ' + worker(wid).nome.split(' ')[0]); },
    // contabilità
    'build-batch': () => { S.batch = buildBatch(); toast('Batch generato: ' + S.batch.postings.length + ' registrazioni pronte'); },
    'send-batch': () => { let n = 0; DB.fattForn.forEach((f) => { if (f.stato === 'Registrata' && f.cantiere) { f.stato = 'Esportata SelectLine'; n++; } }); const k = S.batch.postings.length; S.batch = null; toast('Batch di ' + k + ' registrazioni inviato a SelectLine, risposta 201 Created'); },
    'export-ff': () => { let n = 0; DB.fattForn.forEach((f) => { if (f.stato === 'Registrata') { f.stato = 'Esportata SelectLine'; n++; } }); toast(n + ' fatture fornitori esportate a SelectLine (creditori)'); },
    'verify-ff': () => { DB.fattForn.find((f) => f.id === id).stato = 'Registrata'; toast('Fattura verificata'); },
    'ord-delivered': () => { const o = DB.ordini.find((x) => x.id === id); o.stato = 'Consegnato'; toast('Consegna registrata: carico in magazzino e fattura attesa da ' + fornitore(o.fornitoreId).nome); },
    // impostazioni
    'invite-open': () => { S.modal = { type: 'invite' }; render(); },
    'invite-worker': () => { const x = worker(id); x.app = 'Invitato'; DB.inviti.push({ id: uid('IN'), email: x.email, nome: x.nome, ruolo: ['V', 'Q'].includes(x.cat) ? 'Capo squadra (app)' : 'Operaio (app)', inviato: D.TODAY_ISO, stato: 'In attesa' }); S.modal = null; toast('Invito inviato a ' + x.email); },
    'invite-resend': () => toast('Invito reinviato'),
    'invite-revoke': () => { DB.inviti = DB.inviti.filter((i) => i.id !== id); toast('Invito revocato'); },
    'user-deactivate': () => { if (id === w.id) return toast('Non puoi disattivare il tuo accesso'); worker(id).app = 'Non invitato'; toast('Accesso disattivato'); },
    'assign-open': () => { S.modal = { type: 'assign', ids: [id] }; render(); },
    'docs-worker': () => { S.modal = { type: 'docs-worker', id }; render(); },
    'reply-email': () => { const m = DB.email.find((x) => x.id === id); const addr = (m.da.match(/<([^>]+)>/) || [null, m.da])[1]; openCompose({ rel: m.rel, a: m.folder === 'Sent' ? m.a : addr, oggetto: (m.oggetto.startsWith('Re:') ? '' : 'Re: ') + m.oggetto, testo: '\n\n--- Messaggio originale ---\n' + m.testo, contatto: m.rel ? relName(m.rel) : '' }); },
    'email-to-activity': () => { const m = DB.email.find((x) => x.id === id); S.modal = { type: 'form', ent: 'attivita', prefill: { tipo: 'Promemoria', titolo: 'Rispondere a: ' + m.oggetto, relKey: m.rel ? m.rel.t + '|' + m.rel.id : '', data: addDays(D.TODAY_ISO, 1), ora: '09:00', chi: w.id } }; render(); },
    // operaio
    'op-change-cant': () => { S.sel.opPick = !S.sel.opPick; render(); },
    'op-pick-cant': () => { DB.plan[w.id + '|' + D.TODAY_ISO] = id; S.sel.opPick = false; S.bolForm.cantiere = id; toast('Cantiere di oggi cambiato'); },
    'trip-start': () => { const c = myCant(w); const tot = routeKm(w, c); S.trip = { start: Date.now(), startHM: nowHM(), km: 0, end: null, tot }; clearInterval(S._tt); S._tt = setInterval(() => { if (!S.trip || S.trip.end) return clearInterval(S._tt); S.trip.km = Math.min(S.trip.tot, S.trip.km + S.trip.tot / 18); render(); }, 500); toast('Viaggio avviato: GPS attivo'); },
    'trip-end': () => { clearInterval(S._tt); const c = myCant(w); const tr = S.trip; tr.end = Date.now(); tr.km = tr.tot; tr.min = Math.max(5, Math.round(tr.tot * 1.4)); const endHM = nowHM(); DB.viaggi.unshift({ id: uid('TR'), workerId: w.id, data: D.TODAY_ISO, partenza: tr.startHM, arrivo: endHM, da: w.residenza + ' (casa)', a: c.nome + ', ' + c.comune, km: tr.km, minuti: tr.min, veicolo: w.veicolo === 'privato' ? 'Auto privata' : w.veicolo || 'Squadra', gps: true }); if (w.veicolo === 'privato') S.kmForm.km = Math.round(tr.km); S.bolForm._fromTrip = false; toast('Arrivato: ' + n1(tr.km) + ' km in ' + tr.min + ' min registrati'); },
    'clock-in': () => { S.clock = { in: Date.now(), out: null }; clearInterval(S._ti); S._ti = setInterval(() => { const c = document.getElementById('clock'); if (c) c.textContent = elapsed(); }, 1000); toast('Entrata registrata alle ' + nowHM() + ' · GPS ok'); },
    'clock-out': () => { S.clock.out = Date.now(); clearInterval(S._ti); S.bolForm._fromClock = false; toast('Uscita registrata'); },
    att: () => { const F = S.bolForm; F.att = F.att.includes(id) ? F.att.filter((a) => a !== id) : [...F.att, id]; render(); },
    'send-bol': () => { const F = S.bolForm; const c = cant(F.cantiere) || myCant(w); const resp = w.ramo === 'G' ? 'C003' : 'C002'; DB.bollettini.unshift({ id: 'B-' + Date.now(), data: D.TODAY_ISO, cantiere: c.id, workerId: w.id, ore: +F.ore || 8, viaggio: +F.viaggio || 0, attivita: F.att[0] || 'Lavori vari', stato: 'Inviato', anomalia: +F.ore > 10 ? 'Oltre 10 h' : null, entrata: S.clock.in ? new Date(S.clock.in).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' }) : '07:15', uscita: S.clock.out ? new Date(S.clock.out).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' }) : '16:45', gps: 35, materiale: F.mat, note: F.note, vocale: !!F.vocale }); notify(w.nome + ' ha inviato il bollettino di oggi: ' + (+F.ore || 8) + ' h su ' + c.nome + (F.vocale ? ' (nota vocale)' : ''), 'bollettini', null, ['C001', resp]); S.bolForm = { cantiere: c.id, ore: 8, viaggio: 0.5, att: [], note: '', mat: '' }; S.voice = { state: 'idle', text: '', target: 'bol' }; toast('Bollettino inviato: ' + worker(resp).nome.split(' ')[0] + ' e Ivo lo vedono subito'); },
    'km-sugg': () => { S.kmForm.km = +id; render(); },
    'send-km': () => { const c = myCant(w); if (!+S.kmForm.km) return toast('Inserisci i km percorsi'); DB.kmPrivati.unshift({ id: uid('KM'), workerId: w.id, data: D.TODAY_ISO, da: w.residenza, a: c.nome + ', ' + c.comune, km: +S.kmForm.km, rientro: S.kmForm.rientro, stato: 'Inviato' }); S.kmForm.km = ''; toast('Km registrati, in attesa di approvazione'); },
    'op-vac': () => openNew('assenza', { workerId: w.id, tipo: 'Vacanze', dal: addDays(D.TODAY_ISO, 10), al: addDays(D.TODAY_ISO, 14), stato: 'Richiesta' }, { title: 'Richiesta vacanze', noDelete: true }),
    'op-sick': () => openNew('assenza', { workerId: w.id, tipo: 'Malattia', dal: D.TODAY_ISO, al: D.TODAY_ISO, stato: 'Certificato caricato', nota: 'Certificato medico fotografato' }, { title: 'Segnala malattia', noDelete: true }),
    'op-scan': () => { S.modal = { type: 'stock', cantiere: myCant(w).id, tipo: 'Scarico' }; render(); },
    'voice-start': () => { if (S.voice.state === 'listening') { voiceStop(); S.voice = { state: 'idle', text: '', target: id }; render(); } else voiceStart(id); },
  };
  if (A[act]) { e.preventDefault(); A[act](); if (!['open-cantiere', 'open-cliente', 'open-fornitore', 'open-offerta', 'open-fattura', 'open-capitolato', 'nav', 'login', 'logout', 'dm-open'].includes(act) && !S.toast) render(); }
});

document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-act]'); if (!f) return; e.preventDefault(); const act = f.dataset.act, id = f.dataset.id; const w = me();
  if (act === 'login-form') { const u = USERS[1]; S.user = u; try { localStorage.setItem('mc-user', u.key); } catch (_) {} go('home'); return; }
  if (act === 'form-submit') { submitForm(f); render(); return; }
  if (act === 'bulk-submit') { const m = S.modal; const E = ENT[m.ent]; const field = f.querySelector('[data-bulk-field]').value; const fdef = E.fields().find((x) => x.k === field); const vals = readForm(f, [fdef]); const ids = curSel(m.key); ids.forEach((i) => { const o = entityFind(m.ent, i); if (o) { o[field] = vals[field]; if (E.onSave) E.onSave(o); } }); clearSel(m.key); S.modal = null; toast(ids.length + ' elementi aggiornati: ' + fdef.l); return; }
  if (act === 'compose-send') { sendCompose(f); render(); return; }
  if (act === 'assign-submit') { const m = S.modal; const cid = f.cant.value; assignWorkers(m.ids, cid, f.notif.checked); if (m.key) clearSel(m.key); S.modal = null; toast(m.ids.length + (m.ids.length > 1 ? ' persone assegnate a ' : ' persona assegnata a ') + cant(cid).nome); return; }
  if (act === 'ocr-submit') { ocrSubmit(f); render(); return; }
  if (act === 'stock-submit') { const cod = f.articolo.value, qta = +f.qta.value || 1; const a = DB.magazzino.find((x) => x.cod === cod); const tipo = S.modal.tipo === 'Carico' ? 'Carico' : 'Scarico'; const cid = tipo === 'Scarico' ? f.cantiere.value : null; if (a.cat === 'Equipaggiamento') { a.cantiere = cid; DB.movimenti.unshift({ id: uid('MV'), data: D.TODAY_ISO, tipo: cid ? 'Scarico' : 'Carico', articolo: cod, qta, cantiere: cid, chi: f.chi.value, valore: 0 }); S.modal = null; toast(a.nome + (cid ? ' assegnato al cantiere ' + cid + ' (attrezzatura: nessun costo di materiale)' : ' rientrato in magazzino')); return; } if (tipo === 'Scarico') a.qta = Math.max(0, a.qta - qta); else a.qta += qta; DB.movimenti.unshift({ id: uid('MV'), data: D.TODAY_ISO, tipo, articolo: cod, qta, cantiere: cid, chi: f.chi.value, valore: Math.round(qta * a.valore) }); S.modal = null; toast(tipo + ' registrato: ' + qta + ' ' + a.unita + ' ' + a.nome + (cid ? ' → costi ' + cid : '')); return; }
  if (act === 'invite-submit') { const nome = f.nome.value, email = f.email.value; DB.inviti.push({ id: uid('IN'), email, nome, ruolo: f.ruolo.value, inviato: D.TODAY_ISO, stato: 'In attesa' }); const x = DB.workers.find((y) => y.email === email); if (x) x.app = 'Invitato'; S.modal = null; toast('Invito inviato a ' + email + (f.acc.value === 'pin' ? ' con PIN via SMS' : ' (accesso Microsoft 365)')); return; }
  if (act === 'plan-add') { const m = S.modal; const wid = f.wid.value; if (f.week.checked) assignWorkers([wid], m.cant, false); else DB.plan[wid + '|' + m.day] = m.cant; toast(worker(wid).nome + ' pianificato su ' + cant(m.cant).nome); return; }
  if (act === 'cap-q-add') { const q = f.q.value.trim(); if (q) DB.capitolati.find((x) => x.id === id).domande.push({ q, stato: 'Aperta' }); render(); return; }
  if (act === 'cap-ask-form') { const q = f.querySelector('#cap-q').value.trim(); if (!q) return; const cp = DB.capitolati.find((x) => x.id === id); (DB.capChat[cp.id] = DB.capChat[cp.id] || []).push({ q, ...capAnswer(cp, q) }); S.capQ = ''; render(); return; }
  if (act === 'chat-send') { const inp = f.querySelector('#chat-input'); const vocale = S.voice.state === 'done' && S.voice.target === 'msg' && inp.value === S.voice.text; sendChat(id, inp.value, vocale); S.sel.msgDraft = ''; if (vocale) S.voice = { state: 'idle', text: '', target: 'msg' }; render(); return; }
  if (act === 'ai-send') { const inp = f.querySelector('#ai-input'); const v = inp.value; inp.value = ''; aiAsk(v); return; }
});

document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.actChange) {
    const a = ds.actChange;
    if (a === 'assign-ff' && t.value) { const f = DB.fattForn.find((x) => x.id === ds.id); f.cantiere = t.value; if (f.stato === 'Da assegnare') f.stato = 'Registrata'; toast('Fattura assegnata al cantiere ' + t.value); return; }
    if (a === 'tpl') { const tt = TPL[t.value] ? TPL[t.value](m.ctx || { contatto: '', me: me().nome }) : {}; if (tt.oggetto) m.oggetto = tt.oggetto; if (tt.testo) m.testo = tt.testo; m.a = t.form.a.value; m.cc = t.form.cc.value; render(); return; }
    if (a === 'attach') { [...t.files].forEach((x) => m.allegati.push(x.name)); m.a = t.form.a.value; m.oggetto = t.form.oggetto.value; m.testo = t.form.testo.value; render(); return; }
    if (a === 'ocr-file') { ocrStart(t.files[0] ? t.files[0].name : null); return; }
    if (a === 'cap-file') { capStart(t.files[0] ? t.files[0].name : null, m); return; }
    if (a === 'off-import') { const cp = DB.capitolati.find((x) => x.id === t.value); if (cp) { m.rows = cp.posizioni.map((p) => ({ pos: p[0] ? 'NPK ' + p[0] : '', desc: p[1], un: p[2], qta: p[3], prezzo: NPK_PREZZI[p[0]] || 0 })); m.capitolatoId = cp.id; m.clienteId = cp.clienteId; if (!m.oggetto) m.oggetto = cp.titolo.replace(/^Capitolato\s*/i, ''); m.tipo = 'A stima'; } render(); return; }
    if (a === 'upload-cant-doc') { const c = cant(S.id); [...t.files].forEach((x) => (DB.documenti[c.id] = DB.documenti[c.id] || []).unshift([x.name, D.TODAY_ISO, 'Caricato'])); toast(t.files.length + ' file caricati in SharePoint/Cantieri/' + c.id); return; }
    if (a === 'upload-doc') { toast(t.files.length + ' documento caricato in SharePoint'); return; }
    if (a === 'bol-foto') { S.bolForm.foto = t.files.length; render(); return; }
    if (a === 'calWho') { S.sel.calWho = t.value; render(); return; }
    if (a === 'calTipo') { S.sel.calTipo = t.value; render(); return; }
    if (a === 'lang') { S.lang = t.value; try { localStorage.setItem('mc-lang', S.lang); } catch (_) {} toast({ it: 'Lingua: Italiano', de: 'Sprache: Deutsch', fr: 'Langue : Français', en: 'Language: English' }[S.lang]); return; }
    if (a === 'theme') { S.theme = t.value; try { localStorage.setItem('mc-theme', S.theme); } catch (_) {} render(); return; }
    if (a === 'pref') { toast('Preferenza salvata'); return; }
    if (a === 'import-puntanet') { toast('Importazione avviata: ' + (t.files[0] ? t.files[0].name : 'file') + ' letto, mappatura campi PUNTANET applicata'); return; }
  }
  if (ds.bulkField) { m.field = t.value; render(); return; }
  if (ds.wiz) { if (ds.wiz === 'offertaId') { m.offertaId = t.value; m.rows = null; m.avanz = null; } else if (ds.wiz === 'tipo') m.tipo = t.value; else m[ds.wiz] = +t.value; render(); return; }
  if (ds.wizRow) { m.rows[+ds.wizRow].eff = +t.value || 0; render(); return; }
  if (ds.off) { m[ds.off] = t.value; render(); return; }
  if (ds.offRow) { const [i, k] = ds.offRow.split('|'); m.rows[+i][k] = k === 'qta' || k === 'prezzo' ? +t.value || 0 : t.value; render(); return; }
  if (ds.offPos) { const [oid, i, col] = ds.offPos.split('|'); const o = offerta(oid); o.capitolato[+i][+col] = +col === 1 ? t.value : +t.value || 0; o.preventivo = Math.round(offTot(o)); render(); return; }
  if (ds.cap) { m[ds.cap] = t.value; return; }
  if (ds.bind) { S.bolForm[ds.bind] = t.value; return; }
  if (ds.bindKm) { S.kmForm[ds.bindKm] = t.type === 'checkbox' ? t.checked : t.value; return; }
  if (ds.profile) { toast('Profilo aggiornato'); return; }
  if (ds.soll) { P.solleciti = P.solleciti || {}; P.solleciti[ds.soll] = t.type === 'checkbox' ? t.checked : +t.value; toast('Impostazione fatturazione salvata'); return; }
  if (ds.param) { P[ds.param] = +t.value; recomputeWorkers(); toast('Parametro aggiornato in tutta la demo'); }
});
document.addEventListener('input', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.actInput === 'search') { S.search = t.value; S.searchOpen = true; updateSearch(); return; }
  if (ds.actInput === 'qCli') { S.sel.qCli = t.value; render(); return; }
  if (ds.actInput === 'capQ') { S.capQ = t.value; return; }
  if (ds.bind) { S.bolForm[ds.bind] = t.value; if (ds.bind === 'note') S.bolForm.vocale = false; }
  if (ds.bindKm && t.type !== 'checkbox') S.kmForm[ds.bindKm] = t.value;
  if (ds.off && m) m[ds.off] = t.value;
  if (ds.offRow && m) { const [i, k] = ds.offRow.split('|'); m.rows[+i][k] = k === 'qta' || k === 'prezzo' ? +t.value || 0 : t.value; }
  if (ds.wizRow && m) m.rows[+ds.wizRow].eff = +t.value || 0;
  if (ds.cap && m) m[ds.cap] = t.value;
});
document.addEventListener('focusin', (e) => { if (e.target.id === 'gsearch') { S.searchOpen = true; updateSearch(); } });
function searchDropdown() { if (!S.searchOpen || S.search.trim().length < 2) return ''; const res = searchAll(S.search); const groups = []; res.forEach((r) => { let g = groups.find((x) => x.g === r.g); if (!g) { g = { g: r.g, items: [] }; groups.push(g); } g.items.push(r); }); return `<div class="dropdown l">${groups.length ? groups.map((g) => `<div class="hd">${g.g}</div>${g.items.map((r) => `<button class="it" data-act="${r.act}" data-id="${esc(r.id)}"><span class="ic">${r.ic}</span><span style="min-width:0"><div class="b" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.t)}</div><div class="sub">${esc(r.s)}</div></span></button>`).join('')}`).join('') : `<div class="it muted">Nessun risultato per "${esc(S.search)}"</div>`}</div>`; }
function updateSearch() { const box = document.querySelector('.search'); if (!box) return; const old = box.querySelector('.dropdown'); if (old) old.remove(); box.insertAdjacentHTML('beforeend', searchDropdown()); }
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (S.modal) { S.modal = null; render(); } else if (S.searchOpen || S.plusOpen || S.notifOpen || S.profOpen) { closeMenus(); render(); } else if (S.ai.open) { S.ai.open = false; render(); } return; }
  if (e.key === '/' && S.user && S.user.role === 'ufficio' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); const i = document.getElementById('gsearch'); if (i) { i.focus(); i.select(); } }
});
window.addEventListener('popstate', () => { applyHash(); render(); });
function applyHash() {
  const h = decodeURIComponent((location.hash || '').slice(1)); if (!h) return; const [v, id] = h.split('/');
  if (v === 'firma') { S.view = 'firma'; S.id = id || null; return; }
  if (!S.user) return;
  if (S.user.role === 'operaio') { if (OPV[v]) S.view = v; } else if (VIEWS[v]) { S.view = v; S.id = id || null; }
}

// ---------- avvio ----------
loadDB();
try { S.lang = localStorage.getItem('mc-lang') || 'it'; S.theme = localStorage.getItem('mc-theme') || 'auto'; } catch (_) {}
try { const q = new URLSearchParams(location.search); const k = q.get('u') || localStorage.getItem('mc-user'); const u = USERS.find((x) => x.key === k); if (u) { S.user = u; S.view = u.role === 'operaio' ? 'op-oggi' : 'home'; } if (q.get('theme')) S.theme = q.get('theme'); if (q.get('fg')) { const h0 = decodeURIComponent((location.hash || '').slice(1)).split('/'); const o = DB.offerte.find((x) => x.link && x.link.token === h0[1]); if (o) S.firma = { token: h0[1], oid: o.id, phase: 'ready', email: o.link.email, sel: {}, tab: 'draw', name: cliente(o.clienteId).contatto, place: cliente(o.clienteId).comune, date: D.TODAY_ISO, signOpen: q.get('fg') === '2' }; } (q.get('t') || '').split(',').filter(Boolean).forEach((p) => { const [a, b] = p.split(':'); S.tab[a] = b; }); if (q.get('m')) { const [a, b] = q.get('m').split(':'); S.modal = a === 'form' ? { type: 'form', ent: b } : a === 'fwiz' ? { type: 'fwiz', offertaId: b } : a === 'ocr' ? { type: 'ocr', step: 'result', file: D.OCR_SAMPLES[0].file, data: clone(D.OCR_SAMPLES[0]) } : a === 'compose' ? { type: 'compose', a: 'g.bernasconi@bluewin.ch', oggetto: 'Variazione da approvare', testo: TPL.variazione({ contatto: 'Giorgio Bernasconi', me: 'Ivo Foletti' }).testo, allegati: ['Variazione_cantina.pdf'], ctx: {} } : a === 'print' ? { type: 'print', kind: 'offerta', id: b } : { type: a, id: b, cant: b, day: D.TODAY_ISO, clienteId: 'K07', tipo: 'A stima', oggetto: 'Loft Via Pretorio' }; } } catch (_) {}
applyHash();
render();
