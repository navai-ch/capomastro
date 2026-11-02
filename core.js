/* MyColor Gestionale – nucleo: stato, persistenza, helper, componenti, entità e modali */
const D = window.MC;
const P = D.PARAMS;
const LOGO = 'logo-mycolor.png';
const DB_KEY = 'mc-db-v4';
const clone = (x) => JSON.parse(JSON.stringify(x));

// ---------- banca dati in memoria (clonata dai dati demo, persistita in localStorage) ----------
function freshDB() {
  return {
    workers: clone(D.WORKERS), clienti: clone(D.CLIENTI), fornitori: clone(D.FORNITORI), cantieri: clone(D.CANTIERI),
    fattForn: clone(D.FATTURE_FORNITORI), movimenti: clone(D.MOVIMENTI), bollettini: clone(D.BOLLETTINI), veicoli: clone(D.VEICOLI),
    kmPrivati: clone(D.KM_PRIVATI), viaggi: clone(D.VIAGGI), offerte: clone(D.OFFERTE), fatture: clone(D.FATTURE), capitolati: clone(D.CAPITOLATI),
    magazzino: clone(D.MAGAZZINO), ordini: clone(D.ORDINI), attivita: clone(D.ATTIVITA_CRM), email: clone(D.EMAIL), eventi: clone(D.EVENTI),
    canali: clone(D.CANALI), messaggi: clone(D.MESSAGGI), notifiche: clone(D.NOTIFICHE).map((n) => ({ ...n, letta: false })), assenze: clone(D.ASSENZE),
    documenti: clone(D.DOCUMENTI), inviti: clone(D.INVITI), params: clone(D.PARAMS), carpool: {}, plan: {}, capChat: {},
  };
}
let DB = freshDB();
function loadDB() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) { const saved = JSON.parse(raw); if (saved && saved.workers && saved.fatture) { DB = saved; Object.assign(P, DB.params); } } } catch (_) {}
}
let _persistT = null;
function persist() { clearTimeout(_persistT); _persistT = setTimeout(() => { try { DB.params = { ...P }; localStorage.setItem(DB_KEY, JSON.stringify(DB)); } catch (_) {} }, 250); }
function resetDB() { try { localStorage.removeItem(DB_KEY); } catch (_) {} DB = freshDB(); Object.assign(P, clone(D.PARAMS)); recomputeWorkers(); }
function recomputeWorkers() { DB.workers.forEach((w) => D.workerCosts(w, P)); }

// ---------- stato interfaccia ----------
const S = {
  user: null, view: 'login', id: null, tab: {}, sel: {}, modal: null, toast: null, lang: 'it', theme: 'auto',
  clock: { in: null, out: null }, trip: null, batch: null,
  bolForm: { cantiere: null, ore: 8, viaggio: 0.5, att: [], note: '', mat: '' },
  kmForm: { veicolo: 'privato', km: '', rientro: true },
  voice: { state: 'idle', text: '', target: 'bol' },
  filtroTeam: 'tutti', filtroBol: 'da-approvare', filtroFat: 'tutte', filtroOff: 'tutte', magTab: 'Materiale',
  selected: {}, search: '', searchOpen: false, plusOpen: false, notifOpen: false, profOpen: false, chatCh: 'gen', chatListOpen: false,
  ai: { open: false, msgs: [], typing: false }, calWeek: 0, capQ: '',
};

const USERS = [
  { key: 'ivo', nome: 'Ivo Foletti', ruolo: 'Direzione', role: 'ufficio', wid: 'C001' },
  { key: 'stefano', nome: 'Stefano Montagnese', ruolo: 'Responsabile ramo pittura', role: 'ufficio', wid: 'C002' },
  { key: 'antonio', nome: 'Antonio Scumaci', ruolo: 'Responsabile ramo gessatura', role: 'ufficio', wid: 'C003' },
  { key: 'letizia', nome: 'Letizia Gottardello', ruolo: 'Amministrazione', role: 'ufficio', wid: 'C004' },
  { key: 'operaio', nome: 'Francesco De Luca', ruolo: 'Pittore AFC (app cantiere)', role: 'operaio', wid: 'C023' },
  { key: 'operaio2', nome: 'Dario Pellegrini', ruolo: 'Gessatore AFC (app cantiere)', role: 'operaio', wid: 'C008' },
];

// ---------- traduzioni (navigazione e voci principali) ----------
const T = {
  it: { home: 'Dashboard', cantieri: 'Cantieri', pianificazione: 'Pianificazione', bollettini: 'Bollettini', persone: 'Persone', veicoli: 'Veicoli e km', commerciale: 'Offerte e fatture', calendario: 'Calendario', messaggi: 'Messaggi', magazzino: 'Magazzino', contabilita: 'Contabilità', impostazioni: 'Impostazioni', search: 'Cerca cantieri, persone, fatture, documenti…', hello: 'Buongiorno', new: 'Nuovo', logout: 'Esci', switch: 'Cambia utente', profile: 'Il mio profilo', notif: 'Notifiche', gestione: 'Gestione', commerciale_sep: 'Commerciale', comunicazione: 'Comunicazione', amministrazione: 'Amministrazione' },
  de: { home: 'Dashboard', cantieri: 'Baustellen', pianificazione: 'Planung', bollettini: 'Rapporte', persone: 'Personen', veicoli: 'Fahrzeuge und km', commerciale: 'Offerten und Rechnungen', calendario: 'Kalender', messaggi: 'Nachrichten', magazzino: 'Lager', contabilita: 'Buchhaltung', impostazioni: 'Einstellungen', search: 'Baustellen, Personen, Rechnungen suchen…', hello: 'Guten Morgen', new: 'Neu', logout: 'Abmelden', switch: 'Benutzer wechseln', profile: 'Mein Profil', notif: 'Benachrichtigungen', gestione: 'Verwaltung', commerciale_sep: 'Verkauf', comunicazione: 'Kommunikation', amministrazione: 'Administration' },
  fr: { home: 'Tableau de bord', cantieri: 'Chantiers', pianificazione: 'Planification', bollettini: 'Rapports', persone: 'Personnes', veicoli: 'Véhicules et km', commerciale: 'Offres et factures', calendario: 'Calendrier', messaggi: 'Messages', magazzino: 'Dépôt', contabilita: 'Comptabilité', impostazioni: 'Paramètres', search: 'Chercher chantiers, personnes, factures…', hello: 'Bonjour', new: 'Nouveau', logout: 'Quitter', switch: 'Changer d\'utilisateur', profile: 'Mon profil', notif: 'Notifications', gestione: 'Gestion', commerciale_sep: 'Commercial', comunicazione: 'Communication', amministrazione: 'Administration' },
  en: { home: 'Dashboard', cantieri: 'Job sites', pianificazione: 'Planning', bollettini: 'Timesheets', persone: 'People', veicoli: 'Vehicles & km', commerciale: 'Quotes & invoices', calendario: 'Calendar', messaggi: 'Messages', magazzino: 'Warehouse', contabilita: 'Accounting', impostazioni: 'Settings', search: 'Search sites, people, invoices, documents…', hello: 'Good morning', new: 'New', logout: 'Sign out', switch: 'Switch user', profile: 'My profile', notif: 'Notifications', gestione: 'Operations', commerciale_sep: 'Sales', comunicazione: 'Communication', amministrazione: 'Administration' },
};
const t = (k) => (T[S.lang] || T.it)[k] || T.it[k] || k;

// ---------- helper ----------
const $ = (s) => document.querySelector(s);
const chf = (n, dec = 0) => 'CHF ' + Number(n || 0).toLocaleString('de-CH', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/’/g, "'");
const n1 = (n) => Number(n || 0).toLocaleString('de-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const n0 = (n) => Number(n || 0).toLocaleString('de-CH', { maximumFractionDigits: 0 }).replace(/’/g, "'");
const n2 = (n) => Number(n || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/’/g, "'");
const pct = (n) => (Math.round((n || 0) * 10) / 10).toLocaleString('de-CH') + '%';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fd = (iso) => { if (!iso) return '–'; const [y, m, d] = String(iso).slice(0, 10).split('-'); return d && y ? `${d}.${m}.${y}` : iso; };
const fdt = (iso) => iso ? fd(iso) + (iso.length > 10 ? ' ' + iso.slice(11, 16) : '') : '–';
const fshort = (iso) => iso ? fd(iso).slice(0, 5) : '';
const dow = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const flong = (iso) => { const d = new Date(iso + (iso.length === 10 ? 'T12:00' : '')); return `${['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`; };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const nowHM = () => new Date().toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' });
const nowISO = () => D.TODAY_ISO + 'T' + nowHM();
const worker = (id) => DB.workers.find((w) => w.id === id) || { id, nome: 'Collaboratore', ruolo: '', ramo: 'P', costoAziendaOra: 60, costoOra: 40, residenza: '', kmDaBase: 0, competenze: [], certificazioni: [], vacanzeTot: 22, vacanzeUsate: 0, salario: 0, cat: 'B', tel: '', email: '' };
const cant = (id) => DB.cantieri.find((c) => c.id === id);
const cliente = (id) => DB.clienti.find((c) => c.id === id) || { id, nome: 'Cliente', contatto: '', email: '', tel: '', comune: '', tipo: '', contatti: [] };
const fornitore = (id) => DB.fornitori.find((f) => f.id === id) || { id, nome: 'Fornitore', contatto: '', email: '', tel: '', categoria: 'Altro' };
const offerta = (id) => DB.offerte.find((o) => o.id === id);
const initials = (n) => String(n || '?').split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
const tone = (s) => ({ Approvato: 'good', Approvata: 'good', Inviato: 'info', Bozza: '', 'In corso': 'info', Concluso: 'good', Offerta: 'warn', Pianificato: '', Sospeso: 'warn', Registrata: 'info', 'Da verificare': 'warn', 'Da assegnare': 'bad', 'Esportata SelectLine': 'good', Pagata: 'good', Inviata: 'info', Scaduta: 'bad', Deliberata: 'good', Fatturata: 'good', 'In attesa firma': 'warn', Firmata: 'good', 'Inviata per firma': 'warn', Rifiutata: 'bad', Scaduto: 'bad', 'In uso': 'good', 'In officina': 'bad', 'Servizio a breve': 'warn', Disponibile: '', 'Approvata dal cliente': 'good', 'In attesa approvazione': 'warn', Attivo: 'good', Invitato: 'info', 'Non invitato': '', 'In attesa': 'warn', Richiesta: 'warn', 'Certificato caricato': 'info', Confermato: 'info', Consegnato: 'good', Ordinato: 'info', Analizzato: 'good', 'In analisi': 'warn', Aperta: 'warn', Chiarita: 'good', 'Da quotare': 'warn', Quotata: 'good', Carico: 'good', Scarico: 'info', 'A corpo': 'brand', 'A stima': 'info', Richiesta: '', Sopralluogo: 'info', Persa: 'bad', Fatturata: 'good', 'Da creare': 'warn', 'Da inviare': 'info', 'In scadenza': 'warn', 'Sollecito 1': 'warn', 'Sollecito 2': 'bad', Diffida: 'bad' }[s] || '');
const pill = (s, extra = '') => `<span class="pill ${tone(s)} ${extra}">${esc(s)}</span>`;
const toast = (m) => { S.toast = m; render(); clearTimeout(S._t); S._t = setTimeout(() => { S.toast = null; render(); }, 2400); };
function go(view, id, extra) {
  S.view = view; S.id = id ?? null; if (extra) Object.assign(S.sel, extra); S.modal = null; closeMenus();
  const h = '#' + view + (id ? '/' + encodeURIComponent(id) : '');
  if (location.hash !== h) { try { history.pushState(null, '', h); } catch (_) {} }
  render(); window.scrollTo(0, 0);
}
function closeMenus() { S.searchOpen = false; S.plusOpen = false; S.notifOpen = false; S.profOpen = false; }
const uid = (p) => p + '-' + Date.now().toString(36).toUpperCase().slice(-5);
function nextId(prefix, list, key = 'id') { let max = 0; list.forEach((x) => { const m = String(x[key]).match(new RegExp('^' + prefix.replace(/[-.]/g, '\\$&') + '(\\d+)$')); if (m) max = Math.max(max, +m[1]); }); return prefix + String(max + 1).padStart(4, '0'); }
const me = () => S.user ? worker(S.user.wid) : null;
function notify(testo, view, id2, per) { DB.notifiche.unshift({ id: uid('N'), ts: nowISO(), testo, view, id2, per: per || ['C001', 'C002', 'C003', 'C004'], letta: false }); }
const myNotifs = () => DB.notifiche.filter((n) => !n.per || n.per.includes(S.user.wid));
function csvDownload(name, cols, rows) {
  const q = (v) => '"' + String(v ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"';
  const csv = [cols.map(q).join(';'), ...rows.map((r) => r.map(q).join(';'))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = name + '.csv'; document.body.appendChild(a); a.click(); a.remove();
}

// ---------- calcoli ----------
function costoMedioSquadra(c) { if (!c.squadra || !c.squadra.length) return 55; return c.squadra.reduce((a, id) => a + worker(id).costoAziendaOra, 0) / c.squadra.length; }
function calc(c) {
  const off = DB.offerte.find((o) => o.cantiere === c.id);
  const varApp = off ? off.variazioni.filter((v) => v.stato === 'Approvata dal cliente').reduce((a, v) => a + v.importo, 0) : 0;
  const contratto = (c.deliberato || c.preventivo || 0) + varApp;
  const maturato = contratto * (c.avanzamento || 0) / 100;
  const ff = DB.fattForn.filter((f) => f.cantiere === c.id);
  const forn = ff.reduce((a, f) => a + f.importo, 0);
  const byCat = {}; ff.forEach((f) => { byCat[f.categoria] = (byCat[f.categoria] || 0) + f.importo; });
  const prelievi = DB.movimenti.filter((m) => m.cantiere === c.id && m.tipo === 'Scarico').reduce((a, m) => a + m.valore, 0);
  const cmedio = costoMedioSquadra(c);
  const costoOre = (c.oreFatte || 0) * cmedio;
  const costi = costoOre + forn + prelievi;
  const margine = maturato - costi;
  const chfOra = c.oreFatte ? (maturato - forn - prelievi) / c.oreFatte : 0;
  const fatt = DB.fatture.filter((f) => f.cantiere === c.id);
  const fatturato = fatt.reduce((a, f) => a + f.importo, 0);
  const incassato = fatt.filter((f) => f.stato === 'Pagata').reduce((a, f) => a + f.importo, 0);
  return { contratto, varApp, maturato, forn, byCat, prelievi, cmedio, costoOre, costi, margine, margPct: maturato ? margine / maturato * 100 : 0, chfOra, fatturato, incassato, off, ff };
}
const indennitaPranzo = (w, c) => w.ramo === 'G' ? { tipo: 'Forfait gessatori', val: P.pranzoGessatoriMese, unit: '/mese' } : (c && c.kmDaBase > P.pranzoSogliaKm ? { tipo: 'Pittore oltre ' + P.pranzoSogliaKm + ' km', val: P.pranzoPittoriGiorno, unit: '/giorno' } : { tipo: 'Pittore entro ' + P.pranzoSogliaKm + ' km', val: 0, unit: '' });
const cantiereDi = (wid, day) => { const ov = day && DB.plan[wid + '|' + day]; if (ov === 'none') return null; if (ov) return cant(ov); return DB.cantieri.find((c) => c.stato === 'In corso' && c.squadra.includes(wid)); };
const offTot = (o) => o.capitolato.reduce((a, r) => a + r[3] * r[4], 0);
const offFatturato = (o) => DB.fatture.filter((f) => f.offertaId === o.id).reduce((a, f) => a + f.importo, 0);
const chfTone = (v) => v < P.breakEvenOra ? 'bad' : v < P.tariffaVenditaOra ? 'warn' : 'good';
const chfColor = (v) => `var(--${chfTone(v)})`;

// ---------- componenti ----------
const kpi = (l, v, sub = '', tn = '') => `<div class="kpi"><div class="eyebrow">${l}</div><div class="v ${tn}">${v}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
const avatar = (nome, cls = '') => `<span class="avatar ${cls}">${initials(nome)}</span>`;
const avCls = (w) => w.ramo === 'G' ? 'g' : w.ramo === 'U' ? '' : 'o';
const tabs = (key, list) => `<div class="tabs">${list.map((x) => `<button data-act="tab" data-key="${key}" data-id="${x[0]}" class="${(S.tab[key] || list[0][0]) === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>`;
const subtabs = (key, list) => `<div class="subtabs">${list.map((x) => `<button data-act="tab" data-key="${key}" data-id="${x[0]}" class="${(S.tab[key] || list[0][0]) === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>`;
const curTab = (key, def) => S.tab[key] || def;
const chips = (act, cur, list) => `<div class="chips">${list.map((x) => `<button data-act="${act}" data-id="${x[0]}" class="${cur === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>`;
const selOf = (key) => S.selected[key] || (S.selected[key] = []);
function table(cols, rows, opts = {}) {
  const sel = opts.sel; const chosen = sel ? selOf(sel) : [];
  const allOn = sel && rows.length && rows.every((r) => chosen.includes(String(r.id)));
  const head = (sel ? `<th class="ck"><input type="checkbox" data-selall="${sel}" ${allOn ? 'checked' : ''} aria-label="Seleziona tutti"></th>` : '') + cols.map((c) => `<th class="${c.cls || ''}">${c.h}</th>`).join('');
  const body = rows.length ? rows.map((r) => `<tr class="${r.cls || ''} ${sel && chosen.includes(String(r.id)) ? 'sel' : ''}" ${r.act ? `data-act="${r.act}" data-id="${esc(r.id)}"` : ''}>${sel ? `<td class="ck"><input type="checkbox" data-sel="${sel}" data-id="${esc(r.id)}" ${chosen.includes(String(r.id)) ? 'checked' : ''} aria-label="Seleziona"></td>` : ''}${r.c.map((x, i) => `<td class="${(cols[i] || {}).cls || ''}">${x}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length + (sel ? 1 : 0)}" class="muted">${opts.empty || 'Nessun elemento'}</td></tr>`;
  return `<div class="tw"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function selbar(key, ent, actions = []) {
  const n = selOf(key).length; if (!n) return '';
  return `<div class="selbar"><span class="b">${n} selezionat${n === 1 ? 'o' : 'i'}</span>${actions.map((a) => `<button class="btn sm ${a.cls || ''}" data-act="${a.act}" data-key="${key}" data-ent="${ent || ''}" ${a.id ? `data-id="${a.id}"` : ''}>${a.label}</button>`).join('')}${ent ? `<button class="btn sm" data-act="bulk-edit" data-key="${key}" data-ent="${ent}">${I('edit')} Modifica campo</button><button class="btn sm danger" data-act="bulk-delete" data-key="${key}" data-ent="${ent}">${I('trash')} Elimina</button>` : ''}<button class="btn sm ghost" data-act="sel-clear" data-key="${key}" style="margin-left:auto">Annulla selezione</button></div>`;
}
function hbars(items, max) {
  return `<div class="bars">${items.map((it) => `<div class="bar"><span class="b" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.label}</span><div class="trk">${it.segs.reduce((acc, s) => { const w = s.v / max * 100; acc.html += `<i style="left:${acc.x}%;width:${Math.max(w - 0.4, 0)}%;background:${s.color}" title="${s.name}: ${chf(s.v)}"></i>`; acc.x += w; return acc; }, { x: 0, html: '' }).html}</div><span class="num right small">${it.right}</span></div>`).join('')}</div>`;
}
function chartChfOra(cs) {
  const W = 720, H = 240, pl = 44, pr = 96, pt = 16, pb = 48;
  const max = 110, iw = W - pl - pr, ih = H - pt - pb, bw = iw / Math.max(cs.length, 1);
  const y = (v) => pt + ih - v / max * ih;
  let s = `<svg class="svgchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="CHF per ora realizzati per cantiere">`;
  [0, 25, 50, 75, 100].forEach((v) => { s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
  cs.forEach((c, i) => {
    const r = calc(c); const x = pl + i * bw + bw * 0.2; const w = bw * 0.6; const v = Math.max(0, Math.min(r.chfOra, max));
    s += `<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" fill="${chfColor(r.chfOra)}" data-act="open-cantiere" data-id="${c.id}" style="cursor:pointer"><title>${esc(c.nome)}: ${chf(r.chfOra, 1)}/h</title></rect>`;
    s += `<text x="${x + w / 2}" y="${y(v) - 5}" text-anchor="middle" style="font-weight:600;fill:var(--ink)">${Math.round(r.chfOra)}</text>`;
    const lab = c.nome.length > 16 ? c.nome.slice(0, 15) + '…' : c.nome;
    s += `<text x="${x + w / 2}" y="${H - pb + 16}" text-anchor="middle">${esc(lab)}</text><text x="${x + w / 2}" y="${H - pb + 30}" text-anchor="middle" style="fill:var(--muted);font-size:10px">${esc(c.comune)}</text>`;
  });
  s += `<line class="ref" x1="${pl}" x2="${W - pr}" y1="${y(P.breakEvenOra)}" y2="${y(P.breakEvenOra)}"/><text x="${W - pr + 6}" y="${y(P.breakEvenOra) + 4}">break-even ${P.breakEvenOra}</text>`;
  s += `<line class="ref" x1="${pl}" x2="${W - pr}" y1="${y(P.tariffaVenditaOra)}" y2="${y(P.tariffaVenditaOra)}"/><text x="${W - pr + 6}" y="${y(P.tariffaVenditaOra) + 4}">tariffa ${P.tariffaVenditaOra}</text>`;
  return s + '</svg>';
}
function mapSvg(dist, opts = {}) {
  const far = dist > 500; const px = far ? 300 : 182, py = far ? 60 : 96;
  const route = opts.route ? `<path d="M30 180 C 80 120, 120 150, 170 105" stroke="var(--brand)" stroke-width="4" fill="none" stroke-dasharray="${opts.progress != null ? `${opts.progress * 220} 400` : '0 0'}" stroke-linecap="round"/>` + (opts.progress != null ? `<circle cx="${30 + 140 * opts.progress}" cy="${180 - 75 * opts.progress}" r="7" fill="var(--brand)" stroke="var(--surface)" stroke-width="3"/>` : '') : '';
  return `<svg viewBox="0 0 360 200" role="img" aria-label="Posizione rispetto al cantiere">
    <rect width="360" height="200" fill="var(--surface-2)"/>
    <g stroke="var(--line)" stroke-width="6" fill="none"><path d="M0 70 Q120 60 200 90 T360 110"/><path d="M60 0 L90 200"/><path d="M250 0 L230 200"/><path d="M0 150 L360 170"/></g>
    <g stroke="var(--surface)" stroke-width="2" fill="none"><path d="M0 70 Q120 60 200 90 T360 110"/><path d="M60 0 L90 200"/><path d="M250 0 L230 200"/><path d="M0 150 L360 170"/></g>
    ${route}
    <circle cx="170" cy="105" r="42" fill="var(--info)" fill-opacity=".12" stroke="var(--info)" stroke-dasharray="4 3"/>
    <rect x="156" y="92" width="28" height="22" rx="3" fill="var(--ink-2)"/><text x="170" y="150" text-anchor="middle" font-size="11" fill="var(--ink-2)">Cantiere · geofence 100 m</text>
    ${opts.route ? `<text x="30" y="196" font-size="10" fill="var(--ink-2)">${esc(opts.from || 'Casa')}</text>` : ''}
    ${opts.progress == null ? `<circle cx="${px}" cy="${py}" r="9" fill="${far ? 'var(--bad)' : 'var(--good)'}" stroke="var(--surface)" stroke-width="3"/><circle cx="${px}" cy="${py}" r="16" fill="${far ? 'var(--bad)' : 'var(--good)'}" fill-opacity=".2"/><text x="${px}" y="${py - 22}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink)">Tu · ${dist} m</text>` : ''}</svg>`;
}
const relName = (rel) => !rel ? '' : rel.t === 'cliente' ? cliente(rel.id).nome : rel.t === 'fornitore' ? fornitore(rel.id).nome : rel.t === 'cantiere' ? (cant(rel.id) || {}).nome || rel.id : '';
const relAct = (rel) => !rel ? '' : rel.t === 'cliente' ? 'open-cliente' : rel.t === 'fornitore' ? 'open-fornitore' : 'open-cantiere';
const ACT_ICON = { Chiamata: I('phone'), Riunione: I('users'), Promemoria: I('alarm'), 'E-mail': I('mail'), Nota: I('edit'), Sopralluogo: I('pin'), Consegna: I('package'), Interno: I('building2'), Scadenza: I('clock'), Cantiere: I('building'), Assenza: I('sun') };
function activityList(list, opts = {}) {
  if (!list.length) return '<p class="muted small">Nessuna attività</p>';
  return `<div class="actlist">${list.map((a) => `<div class="listrow"><div class="row nowrap" style="align-items:flex-start"><span class="act-ic">${ACT_ICON[a.tipo] || '•'}</span><div><div class="small muted">${a.tipo} · ${fd(a.data)} ${a.ora || ''} · ${worker(a.chi).nome.split(' ')[0]}${opts.showRel && a.rel ? ' · ' + esc(relName(a.rel)) : ''}</div><div class="${a.done ? 'muted' : 'b'}" style="${a.done ? 'text-decoration:line-through' : ''}">${esc(a.titolo)}</div>${a.esito ? `<div class="small">${esc(a.esito)}</div>` : ''}</div></div><span class="row nowrap">${a.done ? pill('Fatta', 'good') : `<button class="btn sm good" data-act="act-done" data-id="${a.id}">✓ Fatta</button>`}<button class="btn sm ghost" data-act="edit-entity" data-ent="attivita" data-id="${a.id}">${I('edit')}</button></span></div>`).join('')}</div>`;
}
function emailList(list, opts = {}) {
  if (!list.length) return '<p class="muted small">Nessuna e-mail sincronizzata</p>';
  return list.map((m) => `<div class="listrow click" data-act="open-email" data-id="${m.id}"><div style="min-width:0"><div class="small muted">${m.folder === 'Sent' ? '↗ Inviata' : '↙ Ricevuta'} · ${fdt(m.data)}${m.unread ? ' · <span class="pill brand">nuova</span>' : ''}</div><div class="${m.unread ? 'b' : ''}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.oggetto)}</div><div class="small muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.folder === 'Sent' ? 'A: ' + m.a : m.da)}${m.allegati.length ? (' · ' + I('attach') + ' ') + m.allegati.length : ''}</div></div><span class="muted">›</span></div>`).join('');
}
function eventList(list) {
  if (!list.length) return '<p class="muted small">Nessun appuntamento</p>';
  return list.map((e) => `<div class="listrow click" data-act="edit-entity" data-ent="evento" data-id="${e.id}"><div class="row nowrap"><span class="act-ic">${ACT_ICON[e.tipo] || I('calendar')}</span><div><div class="small muted">${flong(e.inizio.slice(0, 10))} · ${e.inizio.slice(11, 16)}–${e.fine.slice(11, 16)}${e.luogo ? ' · ' + esc(e.luogo) : ''}</div><div class="b">${esc(e.titolo)}</div><div class="small muted">${e.partecipanti.map((p) => worker(p).nome.split(' ')[0]).join(', ')}${e.outlook ? ' · <span class="pill info">Outlook</span>' : ''}</div></div></div></div>`).join('');
}

// ---------- registro entità (form CRUD generici) ----------
const sel = (list) => list.map((x) => Array.isArray(x) ? x : [x, x]);
const ENT = {
  worker: { label: 'collaboratore', coll: 'workers', key: 'id', name: (o) => o.nome,
    fields: () => [{ k: 'nome', l: 'Nome e cognome', req: 1 }, { k: 'ramo', l: 'Ramo', t: 'select', opts: [['P', 'Pittura'], ['G', 'Gessatura'], ['U', 'Ufficio']] }, { k: 'cat', l: 'Categoria CCL', t: 'select', opts: [...Object.keys(D.CCL).map((k) => [k, k + ' · ' + D.CCL[k].label]), ['DIR', 'Direzione'], ['RESP', 'Responsabile'], ['AMM', 'Amministrazione']] }, { k: 'ruolo', l: 'Ruolo' }, { k: 'residenza', l: 'Residenza', t: 'select', opts: sel(Object.keys(D.KM)) }, { k: 'anni', l: 'Anni di esperienza', t: 'number' }, { k: 'tel', l: 'Telefono', t: 'tel' }, { k: 'email', l: 'E-mail', t: 'email' }, { k: 'permesso', l: 'Permesso', t: 'select', opts: sel(['CH', 'C', 'B', 'G (frontaliere)', 'L']) }, { k: 'assunzione', l: 'Data assunzione', t: 'date' }, { k: 'veicolo', l: 'Veicolo', t: 'select', opts: [['', 'Nessuno (viaggia con la squadra)'], ['privato', 'Auto privata (rimborso km)'], ...DB.veicoli.map((v) => [v.targa, v.targa + ' · ' + v.modello])] }, { k: 'app', l: 'Accesso app', t: 'select', opts: sel(['Attivo', 'Invitato', 'Non invitato']) }, { k: 'competenze', l: 'Competenze', t: 'chips', opts: D.COMPETENZE, full: 1 }],
    make: (v) => ({ id: nextId('C', DB.workers), eta: 30, vacanzeTot: 22, vacanzeUsate: 0, certificazioni: ['Sicurezza Suva'], competenze: [], salario: 0, ...v }),
    onSave: (o) => { o.salario = 0; D.workerCosts(o, P); if (o.app === 'Invitato' && !DB.inviti.some((i) => i.email === o.email)) DB.inviti.push({ id: uid('IN'), email: o.email, nome: o.nome, ruolo: 'Operaio (app)', inviato: D.TODAY_ISO, stato: 'In attesa' }); },
    onDelete: (o) => { DB.cantieri.forEach((c) => { c.squadra = c.squadra.filter((x) => x !== o.id); }); } },
  cliente: { label: 'cliente', coll: 'clienti', key: 'id', name: (o) => o.nome,
    fields: () => [{ k: 'nome', l: 'Ragione sociale / nome', req: 1 }, { k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['Privato', 'Amministrazione', 'Ente pubblico', 'Azienda', 'Impresa generale', 'Architetto']) }, { k: 'contatto', l: 'Persona di contatto' }, { k: 'email', l: 'E-mail', t: 'email' }, { k: 'tel', l: 'Telefono', t: 'tel' }, { k: 'indirizzo', l: 'Indirizzo' }, { k: 'comune', l: 'Comune' }, { k: 'pagamento', l: 'Condizioni di pagamento', t: 'select', opts: sel(['30 giorni', '45 giorni', '60 giorni', '10 giorni', 'Anticipato']) }, { k: 'note', l: 'Note', t: 'textarea', full: 1 }],
    make: (v) => ({ id: nextId('K', DB.clienti), sharepoint: 'Clienti/' + (v.nome || '').replace(/\s+/g, ''), ultimoContatto: D.TODAY_ISO, contatti: [], ...v }),
    onSave: (o) => { if (!o.contatti.length && o.contatto) o.contatti.push({ nome: o.contatto, ruolo: 'Contatto principale', email: o.email, tel: o.tel }); } },
  fornitore: { label: 'fornitore', coll: 'fornitori', key: 'id', name: (o) => o.nome,
    fields: () => [{ k: 'nome', l: 'Ragione sociale', req: 1 }, { k: 'categoria', l: 'Categoria', t: 'select', opts: sel(D.CATEGORIE_COSTO) }, { k: 'contatto', l: 'Persona di contatto' }, { k: 'email', l: 'E-mail', t: 'email' }, { k: 'tel', l: 'Telefono', t: 'tel' }, { k: 'comune', l: 'Comune' }, { k: 'pagamento', l: 'Condizioni', t: 'select', opts: sel(['30 giorni', '45 giorni', '60 giorni', 'Carta', 'Anticipato']) }, { k: 'sconto', l: 'Sconto concordato %', t: 'number' }, { k: 'iban', l: 'IBAN' }, { k: 'note', l: 'Note', t: 'textarea', full: 1 }],
    make: (v) => ({ id: nextId('F', DB.fornitori), sharepoint: 'Fornitori/' + (v.nome || '').replace(/\s+/g, ''), ...v }) },
  cantiere: { label: 'cantiere', coll: 'cantieri', key: 'id', name: (o) => o.nome,
    fields: () => [{ k: 'nome', l: 'Nome cantiere', req: 1 }, { k: 'clienteId', l: 'Cliente', t: 'select', opts: DB.clienti.map((k) => [k.id, k.nome]) }, { k: 'tipo', l: 'Tipo di lavoro' }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Offerta', 'Pianificato', 'In corso', 'Sospeso', 'Concluso']) }, { k: 'indirizzo', l: 'Indirizzo' }, { k: 'comune', l: 'Comune', t: 'select', opts: sel(Object.keys(D.KM)) }, { k: 'inizio', l: 'Inizio', t: 'date' }, { k: 'fine', l: 'Fine prevista', t: 'date' }, { k: 'preventivo', l: 'Preventivo CHF', t: 'number' }, { k: 'deliberato', l: 'Deliberato CHF', t: 'number' }, { k: 'orePreviste', l: 'Ore previste', t: 'number' }, { k: 'avanzamento', l: 'Avanzamento %', t: 'number' }, { k: 'capo', l: 'Capo squadra', t: 'select', opts: DB.workers.filter((w) => ['V', 'Q', 'RESP'].includes(w.cat)).map((w) => [w.id, w.nome]) }],
    make: (v) => ({ id: 'MC 20-26.' + (Math.max(...DB.cantieri.map((c) => +c.id.split('.')[1] || 0)) + 1), oreFatte: 0, squadra: [], lat: 46, lng: 8.9, ...v }),
    onSave: (o) => { o.kmDaBase = D.KM[o.comune] ?? 10; o.oreFatte = o.oreFatte || 0; if (!DB.documenti[o.id]) DB.documenti[o.id] = []; if (!DB.canali.some((c) => c.cant === o.id)) DB.canali.push({ id: 'c-' + o.id.split('.')[1], nome: o.nome, tipo: 'cantiere', cant: o.id }); } },
  veicolo: { label: 'veicolo', coll: 'veicoli', key: 'id', name: (o) => o.targa + ' ' + o.modello,
    fields: () => [{ k: 'targa', l: 'Targa', req: 1 }, { k: 'modello', l: 'Modello', req: 1 }, { k: 'anno', l: 'Anno', t: 'number' }, { k: 'assegnato', l: 'Assegnato a', t: 'select', opts: [['', 'Pool magazzino'], ...DB.workers.map((w) => [w.id, w.nome])] }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['In uso', 'Disponibile', 'Servizio a breve', 'In officina']) }, { k: 'kmTot', l: 'Km totali', t: 'number' }, { k: 'kmMese', l: 'Km mese', t: 'number' }, { k: 'prossimoServizio', l: 'Prossimo servizio', t: 'date' }, { k: 'carburante', l: 'Carburante', t: 'select', opts: sel(['Diesel', 'Benzina', 'Elettrico', 'Ibrido']) }, { k: 'costoKm', l: 'Costo CHF/km', t: 'number', step: 0.01 }],
    make: (v) => ({ id: nextId('V', DB.veicoli), ...v }), onSave: (o) => { if (!o.assegnato) o.assegnato = null; } },
  articolo: { label: 'articolo di magazzino', coll: 'magazzino', key: 'cod', name: (o) => o.nome,
    fields: () => [{ k: 'cod', l: 'Codice', req: 1 }, { k: 'nome', l: 'Articolo', req: 1 }, { k: 'cat', l: 'Categoria', t: 'select', opts: sel(['Materiale', 'Equipaggiamento']) }, { k: 'qta', l: 'Quantità', t: 'number' }, { k: 'unita', l: 'Unità', t: 'select', opts: sel(['pz', 'secchi', 'latte', 'sacchi', 'lastre', 'kit', 'lotto', 'm', 'kg']) }, { k: 'valore', l: 'Valore unitario CHF', t: 'number', step: 0.05 }, { k: 'min', l: 'Scorta minima', t: 'number' }, { k: 'ubic', l: 'Ubicazione' }, { k: 'fornitoreId', l: 'Fornitore', t: 'select', opts: [['', '–'], ...DB.fornitori.map((f) => [f.id, f.nome])] }, { k: 'cantiere', l: 'In uso su cantiere', t: 'select', opts: [['', 'In magazzino'], ...DB.cantieri.map((c) => [c.id, c.id + ' · ' + c.nome])] }],
    make: (v) => ({ ...v }), onSave: (o) => { if (!o.cantiere) o.cantiere = null; } },
  fatturaForn: { label: 'fattura fornitore', coll: 'fattForn', key: 'id', name: (o) => o.id,
    fields: () => [{ k: 'id', l: 'Numero', req: 1 }, { k: 'fornitoreId', l: 'Fornitore', t: 'select', opts: DB.fornitori.map((f) => [f.id, f.nome]) }, { k: 'categoria', l: 'Categoria di costo', t: 'select', opts: sel(D.CATEGORIE_COSTO) }, { k: 'cantiere', l: 'Cantiere', t: 'select', opts: [['', 'Da assegnare'], ...DB.cantieri.map((c) => [c.id, c.id + ' · ' + c.nome])] }, { k: 'data', l: 'Data', t: 'date' }, { k: 'scadenza', l: 'Scadenza', t: 'date' }, { k: 'importo', l: 'Importo CHF (IVA incl.)', t: 'number', step: 0.05 }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Da verificare', 'Registrata', 'Esportata SelectLine', 'Da assegnare']) }],
    make: (v) => ({ voci: [], allegato: '', ...v }), onSave: (o) => { if (!o.cantiere) { o.cantiere = null; if (o.stato !== 'Da verificare') o.stato = 'Da assegnare'; } else if (o.stato === 'Da assegnare') o.stato = 'Registrata'; if (!o.voci.length) o.voci = [['Importo totale', 1, o.importo]]; } },
  fattura: { label: 'fattura cliente', coll: 'fatture', key: 'id', name: (o) => o.id,
    fields: () => [{ k: 'clienteId', l: 'Cliente', t: 'select', opts: DB.clienti.map((k) => [k.id, k.nome]) }, { k: 'cantiere', l: 'Cantiere', t: 'select', opts: [['', '–'], ...DB.cantieri.map((c) => [c.id, c.id + ' · ' + c.nome])] }, { k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['Acconto', 'Avanzamento', 'Finale', 'Regia']) }, { k: 'desc', l: 'Descrizione', req: 1 }, { k: 'importo', l: 'Importo CHF', t: 'number' }, { k: 'data', l: 'Data', t: 'date' }, { k: 'scadenza', l: 'Scadenza', t: 'date' }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Bozza', 'Inviata', 'Pagata', 'Scaduta']) }],
    make: (v) => ({ id: nextId('FA-2026-', DB.fatture), offertaId: null, ...v }), onSave: (o) => { if (!o.cantiere) o.cantiere = null; if (!o.offertaId) o.offertaId = (DB.offerte.find((x) => x.cantiere === o.cantiere) || {}).id || null; } },
  attivita: { label: 'attività', coll: 'attivita', key: 'id', name: (o) => o.titolo,
    fields: () => [{ k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['Chiamata', 'Riunione', 'Promemoria', 'E-mail', 'Nota', 'Sopralluogo']) }, { k: 'titolo', l: 'Titolo', req: 1, full: 1 }, { k: 'relKey', l: 'Collegata a', t: 'select', opts: [['', '–'], ...DB.clienti.map((k) => ['cliente|' + k.id, 'Cliente · ' + k.nome]), ...DB.fornitori.map((f) => ['fornitore|' + f.id, 'Fornitore · ' + f.nome]), ...DB.cantieri.map((c) => ['cantiere|' + c.id, 'Cantiere · ' + c.nome])] }, { k: 'data', l: 'Data', t: 'date' }, { k: 'ora', l: 'Ora', t: 'time' }, { k: 'chi', l: 'Responsabile', t: 'select', opts: DB.workers.filter((w) => w.ramo === 'U').map((w) => [w.id, w.nome]) }, { k: 'esito', l: 'Esito / note', t: 'textarea', full: 1 }, { k: 'done', l: 'Completata', t: 'checkbox' }],
    make: (v) => ({ id: uid('AT'), ...v }), load: (o) => ({ ...o, relKey: o.rel ? o.rel.t + '|' + o.rel.id : '' }), onSave: (o) => { const [tt, id] = (o.relKey || '').split('|'); o.rel = tt ? { t: tt, id } : null; delete o.relKey; if (!o.data) o.data = D.TODAY_ISO; if (!o.chi) o.chi = S.user.wid; } },
  evento: { label: 'appuntamento', coll: 'eventi', key: 'id', name: (o) => o.titolo,
    fields: () => [{ k: 'titolo', l: 'Titolo', req: 1, full: 1 }, { k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['Riunione', 'Sopralluogo', 'Chiamata', 'Consegna', 'Cantiere', 'Scadenza', 'Interno', 'Assenza']) }, { k: 'relKey', l: 'Collegato a', t: 'select', opts: [['', '–'], ...DB.clienti.map((k) => ['cliente|' + k.id, 'Cliente · ' + k.nome]), ...DB.fornitori.map((f) => ['fornitore|' + f.id, 'Fornitore · ' + f.nome]), ...DB.cantieri.map((c) => ['cantiere|' + c.id, 'Cantiere · ' + c.nome])] }, { k: 'giorno', l: 'Giorno', t: 'date' }, { k: 'dalle', l: 'Dalle', t: 'time' }, { k: 'alle', l: 'Alle', t: 'time' }, { k: 'luogo', l: 'Luogo' }, { k: 'partecipanti', l: 'Partecipanti', t: 'chips', opts: DB.workers.filter((w) => w.ramo === 'U' || ['V', 'Q'].includes(w.cat)).map((w) => [w.id, w.nome]), full: 1 }, { k: 'outlook', l: 'Sincronizza con Outlook', t: 'checkbox' }],
    make: (v) => ({ id: uid('EV'), ...v }), load: (o) => ({ ...o, relKey: o.rel ? o.rel.t + '|' + o.rel.id : '', giorno: o.inizio.slice(0, 10), dalle: o.inizio.slice(11, 16), alle: o.fine.slice(11, 16) }),
    onSave: (o) => { const [tt, id] = (o.relKey || '').split('|'); o.rel = tt ? { t: tt, id } : null; const g = o.giorno || D.TODAY_ISO; o.inizio = g + 'T' + (o.dalle || '09:00'); o.fine = g + 'T' + (o.alle || '10:00'); delete o.relKey; delete o.giorno; delete o.dalle; delete o.alle; if (!o.partecipanti || !o.partecipanti.length) o.partecipanti = [S.user.wid]; } },
  assenza: { label: 'assenza', coll: 'assenze', key: 'id', name: (o) => o.tipo,
    fields: () => [{ k: 'workerId', l: 'Collaboratore', t: 'select', opts: DB.workers.map((w) => [w.id, w.nome]) }, { k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['Vacanze', 'Malattia', 'Infortunio', 'Scuola professionale', 'Militare', 'Permesso non pagato']) }, { k: 'dal', l: 'Dal', t: 'date' }, { k: 'al', l: 'Al', t: 'date' }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Richiesta', 'Approvata', 'Rifiutata', 'Certificato caricato']) }, { k: 'nota', l: 'Nota', full: 1 }],
    make: (v) => ({ id: uid('AS'), ...v }), onSave: (o) => { o.giorni = Math.max(1, Math.round((new Date(o.al) - new Date(o.dal)) / 864e5) + 1); } },
  ordine: { label: 'ordine fornitore', coll: 'ordini', key: 'id', name: (o) => o.id,
    fields: () => [{ k: 'fornitoreId', l: 'Fornitore', t: 'select', opts: DB.fornitori.map((f) => [f.id, f.nome]) }, { k: 'articoli', l: 'Articoli', req: 1, full: 1 }, { k: 'importo', l: 'Importo stimato CHF', t: 'number' }, { k: 'consegna', l: 'Consegna richiesta', t: 'date' }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Ordinato', 'Confermato', 'Consegnato']) }],
    make: (v) => ({ id: nextId('OR-2026-', DB.ordini), data: D.TODAY_ISO, ...v }) },
  contatto: { label: 'contatto', coll: null, key: 'nome', name: (o) => o.nome,
    fields: () => [{ k: 'nome', l: 'Nome', req: 1 }, { k: 'ruolo', l: 'Ruolo' }, { k: 'email', l: 'E-mail', t: 'email' }, { k: 'tel', l: 'Telefono', t: 'tel' }], make: (v) => ({ ...v }) },
  variazione: { label: 'variazione', coll: null, key: 'desc', name: (o) => o.desc,
    fields: () => [{ k: 'desc', l: 'Descrizione', req: 1, full: 1 }, { k: 'importo', l: 'Importo CHF', t: 'number' }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['In attesa approvazione', 'Approvata dal cliente']) }], make: (v) => ({ data: D.TODAY_ISO, ...v }) },
  richiesta: { label: 'richiesta del cliente', coll: null, key: 'testo', name: (o) => o.testo,
    fields: () => [{ k: 'da', l: 'Chi la chiede', req: 1 }, { k: 'testo', l: 'Richiesta', req: 1, full: 1 }], make: (v) => ({ data: D.TODAY_ISO, stato: 'Da quotare', ...v }) },
  offerta: { label: 'offerta', coll: 'offerte', key: 'id', name: (o) => o.id,
    fields: () => [{ k: 'oggetto', l: 'Oggetto', req: 1, full: 1 }, { k: 'clienteId', l: 'Cliente', t: 'select', opts: DB.clienti.map((k) => [k.id, k.nome]) }, { k: 'tipo', l: 'Tipo', t: 'select', opts: sel(['A corpo', 'A stima']) }, { k: 'stato', l: 'Stato', t: 'select', opts: sel(['Richiesta', 'Sopralluogo', 'Bozza', 'In attesa firma', 'Deliberata', 'Fatturata', 'Persa']) }, { k: 'data', l: 'Data', t: 'date' }, { k: 'validita', l: 'Valida fino al', t: 'date' }, { k: 'preventivo', l: 'Preventivo CHF', t: 'number' }, { k: 'deliberato', l: 'Deliberato CHF', t: 'number' }, { k: 'sconto', l: 'Sconto %', t: 'number', step: 0.1 }, { k: 'cantiere', l: 'Cantiere', t: 'select', opts: [['', '–'], ...DB.cantieri.map((c) => [c.id, c.id + ' · ' + c.nome])] }, { k: 'note', l: 'Note (es. motivo se persa)', t: 'textarea', full: 1 }],
    make: (v) => ({ id: nextId('OF-2026-', DB.offerte), firma: null, capitolato: [], variazioni: [], acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 40, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }], opzionali: [], eventi: [], ...v }), onSave: (o) => { if (!o.cantiere) o.cantiere = null; } },
};
function fieldHtml(f, v) {
  const id = 'f-' + f.k; const wrap = (inner) => `<div class="${f.full ? 'full' : ''}"><label for="${id}">${f.l}${f.req ? ' *' : ''}</label>${inner}</div>`;
  if (f.t === 'select') return wrap(`<select id="${id}" name="${f.k}">${f.opts.map((o) => `<option value="${esc(o[0])}" ${String(v ?? '') === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`);
  if (f.t === 'textarea') return wrap(`<textarea id="${id}" name="${f.k}" rows="3">${esc(v)}</textarea>`);
  if (f.t === 'checkbox') return `<div class="${f.full ? 'full' : ''}"><label class="row" style="font-weight:500;margin-top:22px"><input type="checkbox" id="${id}" name="${f.k}" ${v ? 'checked' : ''}> ${f.l}</label></div>`;
  if (f.t === 'chips') return `<div class="full"><label>${f.l}</label><div class="chips">${f.opts.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; const on = (v || []).includes(val); return `<label class="chip" style="cursor:pointer;padding:5px 10px;${on ? 'background:var(--brand-soft);border-color:var(--brand);color:var(--brand-dark);font-weight:600' : ''}"><input type="checkbox" name="${f.k}" value="${esc(val)}" ${on ? 'checked' : ''} style="margin-right:5px">${esc(lab)}</label>`; }).join('')}</div></div>`;
  return wrap(`<input id="${id}" name="${f.k}" type="${f.t || 'text'}" ${f.step ? `step="${f.step}"` : f.t === 'number' ? 'step="any"' : ''} value="${esc(v ?? '')}" ${f.req ? 'required' : ''} autocomplete="off">`);
}
function readForm(form, fields) {
  const fdata = new FormData(form); const out = {};
  fields.forEach((f) => { if (f.t === 'chips') out[f.k] = fdata.getAll(f.k); else if (f.t === 'checkbox') out[f.k] = form.querySelector(`[name="${f.k}"]`).checked; else if (f.t === 'number') out[f.k] = fdata.get(f.k) === '' ? 0 : +fdata.get(f.k); else out[f.k] = String(fdata.get(f.k) ?? '').trim(); });
  return out;
}
function entityFind(ent, id) { const E = ENT[ent]; return DB[E.coll].find((o) => String(o[E.key]) === String(id)); }
function modalForm(m) {
  const E = ENT[m.ent]; const fields = E.fields(); const obj = m.id != null ? (m.obj || entityFind(m.ent, m.id)) : (m.obj || null);
  const vals = { ...(obj ? (E.load ? E.load(obj) : obj) : {}), ...(m.prefill || {}) };
  return `<form data-act="form-submit" class="stack" novalidate><div class="row between"><h2>${m.title || ((obj ? 'Modifica ' : 'Nuovo ') + E.label)}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form">${fields.map((f) => fieldHtml(f, vals[f.k])).join('')}</div>
    <div class="row between"><div>${obj && E.coll && !m.noDelete ? `<button type="button" class="btn danger sm" data-act="delete-entity" data-ent="${m.ent}" data-id="${esc(obj[E.key])}">Elimina</button>` : ''}</div><div class="row"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Salva</button></div></div></form>`;
}
function submitForm(form) {
  const m = S.modal; const E = ENT[m.ent]; const fields = E.fields(); const vals = readForm(form, fields);
  const missing = fields.filter((f) => f.req && !vals[f.k]); if (missing.length) { toast('Compila: ' + missing.map((f) => f.l).join(', ')); return; }
  let obj;
  if (m.obj) { obj = m.obj; Object.assign(obj, vals); }
  else if (m.id != null) { obj = entityFind(m.ent, m.id); Object.assign(obj, vals); }
  else { obj = E.make(vals); if (E.coll) DB[E.coll].unshift(obj); }
  if (E.onSave) E.onSave(obj);
  if (m.after) m.after(obj, !m.id && !m.obj);
  S.modal = null; toast((m.id != null || m.obj ? 'Modifiche salvate' : E.label.charAt(0).toUpperCase() + E.label.slice(1) + ' creato') + (E.coll ? ': ' + E.name(obj) : ''));
}
function deleteEntity(ent, id) {
  const E = ENT[ent]; const obj = entityFind(ent, id); if (!obj) return;
  DB[E.coll] = DB[E.coll].filter((o) => o !== obj); if (E.onDelete) E.onDelete(obj);
  Object.keys(S.selected).forEach((k) => { S.selected[k] = S.selected[k].filter((x) => x !== String(id)); });
}
function confirmModal(m) { return `<div class="row between"><h2>${m.title}</h2><button class="btn sm" data-act="close">Chiudi</button></div><p>${m.text}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Annulla</button><button class="btn ${m.danger ? 'danger' : 'primary'}" data-act="confirm-ok">${m.ok || 'Conferma'}</button></div>`; }
function bulkEditModal(m) {
  const E = ENT[m.ent]; const fields = E.fields().filter((f) => !['chips', 'checkbox'].includes(f.t) && !f.req); const f = fields.find((x) => x.k === (m.field || fields[0].k)) || fields[0];
  return `<form data-act="bulk-submit" class="stack"><div class="row between"><h2>Modifica ${selOf(m.key).length} ${E.label}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label for="bf">Campo da modificare</label><select id="bf" data-bulk-field>${fields.map((x) => `<option value="${x.k}" ${x.k === f.k ? 'selected' : ''}>${x.l}</option>`).join('')}</select></div>${fieldHtml({ ...f, l: 'Nuovo valore', req: 0 }, '')}</div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Applica a tutti</button></div></form>`;
}

// ---------- e-mail (Outlook) ----------
const TPL = {
  '': () => ({}),
  sollecito: (c) => ({ oggetto: `Sollecito pagamento ${c.fattura ? c.fattura.id : ''}`.trim(), testo: `Gentile ${c.contatto},\n\nla fattura ${c.fattura ? c.fattura.id + ' di ' + chf(c.fattura.importo) + ', scaduta il ' + fd(c.fattura.scadenza) : 'in oggetto'} risulta ancora aperta. La preghiamo di provvedere al pagamento entro 10 giorni.\n\nCordiali saluti\n${c.me}\nMY COLOR Isella & Foletti SA` }),
  appuntamento: (c) => ({ oggetto: 'Conferma appuntamento in cantiere', testo: `Gentile ${c.contatto},\n\nle confermo l'appuntamento di sopralluogo per la prossima settimana. Mi faccia sapere l'orario a lei più comodo.\n\nCordiali saluti\n${c.me}` }),
  offerta: (c) => ({ oggetto: 'Offerta per i lavori di pittura e gessatura', testo: `Gentile ${c.contatto},\n\nin allegato la nostra offerta. Può firmarla direttamente dal link ricevuto, senza stampare. Resto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti\n${c.me}` }),
  ordine: (c) => ({ oggetto: 'Ordine materiale per cantiere', testo: `Buongiorno ${c.contatto},\n\nvi chiediamo di confermare disponibilità e consegna a Bioggio del materiale indicato di seguito.\n\nGrazie e cordiali saluti\n${c.me}` }),
  variazione: (c) => ({ oggetto: 'Variazione in corso d\'opera da approvare', testo: `Gentile ${c.contatto},\n\ndurante i lavori è emersa una lavorazione non prevista. Allego la variazione con importo e foto: la preghiamo di approvarla rispondendo a questa e-mail o dal link.\n\nCordiali saluti\n${c.me}` }),
  capitolato: (c) => ({ oggetto: 'Domande sul capitolato prima dell\'inizio lavori', testo: `Gentile ${c.contatto},\n\nanalizzando il capitolato sono emersi alcuni punti da chiarire prima dell'inizio dei lavori:\n\n${(c.domande || []).map((d, i) => (i + 1) + '. ' + d).join('\n')}\n\nGrazie per il riscontro.\n\nCordiali saluti\n${c.me}` }),
};
function composeModal(m) {
  return `<form data-act="compose-send" class="stack"><div class="row between"><h2>${I('mail')} Nuova e-mail (Outlook)</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div class="full"><label for="c-to">A</label><input id="c-to" name="a" value="${esc(m.a || '')}" required></div><div><label for="c-cc">Cc</label><input id="c-cc" name="cc" value="${esc(m.cc || '')}"></div><div><label for="c-tpl">Modello</label><select id="c-tpl" data-act-change="tpl"><option value="">Nessuno</option><option value="sollecito">Sollecito pagamento</option><option value="appuntamento">Conferma appuntamento</option><option value="offerta">Invio offerta</option><option value="variazione">Variazione da approvare</option><option value="ordine">Ordine a fornitore</option><option value="capitolato">Domande sul capitolato</option></select></div>
    <div class="full"><label for="c-sub">Oggetto</label><input id="c-sub" name="oggetto" value="${esc(m.oggetto || '')}" required></div><div class="full"><label for="c-body">Testo</label><textarea id="c-body" name="testo" rows="9">${esc(m.testo || '')}</textarea></div>
    <div class="full"><label>Allegati</label><div class="row">${(m.allegati || []).map((a) => `<span class="chip">${I('attach')} ${esc(a)}</span>`).join('')}<label class="btn sm" style="cursor:pointer">+ Allega file<input type="file" multiple style="display:none" data-act-change="attach"></label></div></div></div>
    <div class="row between"><span class="small muted">Da ${esc(me().email)} · inviata tramite Microsoft 365</span><div class="row"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Invia</button></div></div></form>`;
}
function openCompose(opts) { const relObj = opts.rel ? (opts.rel.t === 'cliente' ? cliente(opts.rel.id) : fornitore(opts.rel.id)) : null; S.modal = { type: 'compose', a: opts.a || (relObj ? relObj.email : ''), cc: opts.cc || '', oggetto: opts.oggetto || '', testo: opts.testo || '', allegati: opts.allegati || [], rel: opts.rel || null, ctx: { contatto: relObj ? relObj.contatto : (opts.contatto || ''), me: me().nome, ...(opts.ctx || {}) } }; render(); }
function sendCompose(form) {
  const m = S.modal; const fdata = new FormData(form); const a = fdata.get('a'), oggetto = fdata.get('oggetto'), testo = fdata.get('testo');
  if (!a || !oggetto) { toast('Indica destinatario e oggetto'); return; }
  const rel = m.rel || (() => { const k = DB.clienti.find((c) => c.email === a); if (k) return { t: 'cliente', id: k.id }; const f = DB.fornitori.find((x) => x.email === a); return f ? { t: 'fornitore', id: f.id } : null; })();
  DB.email.unshift({ id: uid('E'), rel, folder: 'Sent', da: me().email, a, oggetto, data: nowISO(), unread: false, testo, allegati: m.allegati || [] });
  if (rel) { DB.attivita.unshift({ id: uid('AT'), tipo: 'E-mail', rel, titolo: 'Inviata e-mail: ' + oggetto, data: D.TODAY_ISO, ora: nowHM(), chi: S.user.wid, esito: '', done: true }); if (rel.t === 'cliente') cliente(rel.id).ultimoContatto = D.TODAY_ISO; }
  S.modal = null; toast('E-mail inviata da Outlook a ' + a);
}
function emailModal(m) {
  const e = DB.email.find((x) => x.id === m.id); e.unread = false;
  return `<div class="row between"><h2 style="min-width:0;overflow-wrap:anywhere">${esc(e.oggetto)}</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <dl class="dl"><dt>Da</dt><dd>${esc(e.da)}</dd><dt>A</dt><dd>${esc(e.a)}</dd><dt>Data</dt><dd>${fdt(e.data)} · ${e.folder === 'Sent' ? 'Posta inviata' : 'Posta in arrivo'} · Outlook</dd>${e.allegati.length ? `<dt>Allegati</dt><dd>${e.allegati.map((a) => `<span class="chip">${I('attach')} ${esc(a)}</span>`).join('')}</dd>` : ''}</dl>
    <pre style="white-space:pre-wrap;font-family:var(--body);font-size:.92rem">${esc(e.testo)}</pre>
    <div class="row"><button class="btn primary" data-act="reply-email" data-id="${e.id}">${I('reply')} Rispondi</button><button class="btn" data-act="email-to-activity" data-id="${e.id}">+ Crea attività</button>${e.allegati.some((a) => /\.pdf$/i.test(a) && /fattura|rechnung|_1\d{3}/i.test(a)) ? `<button class="btn" data-act="ocr-open" data-sample="0">Registra fattura allegata</button>` : ''}</div>`;
}

// ---------- scheda collaboratore ----------
function workerModal(m) {
  const w = worker(m.id); const c = cantiereDi(w.id); const ip = indennitaPranzo(w, c);
  const bols = DB.bollettini.filter((b) => b.workerId === w.id); const ass = DB.assenze.filter((a) => a.workerId === w.id);
  return `<div class="row between"><div class="row nowrap">${avatar(w.nome, avCls(w))}<div><h2>${esc(w.nome)}</h2><p class="muted small">${esc(w.ruolo)} · ${w.eta} anni · ${w.anni} anni di esperienza · ${esc(w.tel)} · ${esc(w.email)}</p></div></div><button class="btn sm" data-act="close">Chiudi</button></div>
  <div class="grid2"><div><div class="eyebrow">Competenze</div><div style="margin-top:6px">${w.competenze.map((k) => `<span class="chip">${esc(k)}</span>`).join('') || '<span class="muted">–</span>'}</div><div class="eyebrow" style="margin-top:12px">Certificazioni</div><div style="margin-top:6px">${(w.certificazioni || []).map((k) => `<span class="chip">✓ ${esc(k)}</span>`).join('') || '<span class="muted">–</span>'}</div>
    <div class="eyebrow" style="margin-top:12px">Logistica e contratto</div><dl class="dl" style="margin-top:6px"><dt>Residenza</dt><dd>${esc(w.residenza)} (${w.kmDaBase} km dalla base)${w.frontaliere ? ' · frontaliere' : ''}</dd><dt>Permesso</dt><dd>${esc(w.permesso || '–')}</dd><dt>Assunzione</dt><dd>${fd(w.assunzione)}</dd><dt>Veicolo</dt><dd>${w.veicolo === 'privato' ? 'Auto privata (rimborso ' + P.kmTariffa.toFixed(2) + ' CHF/km)' : w.veicolo || 'Nessuno, viaggia con la squadra'}</dd><dt>Cantiere</dt><dd>${c ? esc(c.nome + ', ' + c.comune) : '–'}</dd><dt>Indennità pranzo</dt><dd>${ip.val ? ip.tipo + ' · ' + chf(ip.val) + ip.unit : ip.tipo + ' · nessuna'}</dd><dt>Accesso app</dt><dd>${pill(w.app || 'Attivo')}</dd></dl></div>
  <div><div class="eyebrow">Costo orario (CCL 2026)</div>${w.ramo === 'U' ? '<p class="muted">Quadro, non a bollettino</p>' : `<dl class="dl" style="margin-top:6px"><dt>Categoria</dt><dd>${w.cat} · ${(D.CCL[w.cat] || {}).label || ''}</dd><dt>Salario mensile</dt><dd class="num">${chf(w.salario)} × 13</dd><dt>Ore annue</dt><dd class="num">${n0(P.oreAnnue)} h</dd><dt>Oneri sociali</dt><dd>× ${P.oneriSociali}</dd><dt>Costo orario</dt><dd class="num">${chf(w.costoOra, 2)}</dd><dt>+ struttura</dt><dd class="num">${chf(P.costoStrutturaOra, 2)}</dd><dt>Costo aziendale</dt><dd class="num b">${chf(w.costoAziendaOra, 2)}/h</dd><dt>Vacanze</dt><dd>${w.vacanzeTot - w.vacanzeUsate} residue su ${w.vacanzeTot}</dd></dl>`}
    <div class="eyebrow" style="margin-top:12px">Ultime 2 settimane</div><p class="num">${n1(bols.reduce((a, b) => a + b.ore, 0))} h lavoro · ${n1(bols.reduce((a, b) => a + b.viaggio, 0))} h viaggio · ${bols.length} bollettini</p>
    ${ass.length ? `<div class="eyebrow" style="margin-top:12px">Assenze</div>${ass.map((a) => `<div class="small">${a.tipo} ${fd(a.dal)}–${fd(a.al)} ${pill(a.stato)}</div>`).join('')}` : ''}</div></div>
  <div class="row"><button class="btn primary" data-act="edit-entity" data-ent="worker" data-id="${w.id}">${I('edit')} Modifica</button><button class="btn" data-act="assign-open" data-id="${w.id}">Assegna cantiere</button><button class="btn" data-act="dm-open" data-id="${w.id}">${I('message')} Messaggio</button><button class="btn" data-act="docs-worker" data-id="${w.id}">Documenti</button>${w.app !== 'Attivo' ? `<button class="btn" data-act="invite-worker" data-id="${w.id}">Invita sull'app</button>` : ''}</div>`;
}
function docsWorkerModal(m) { const w = worker(m.id); const docs = [['Contratto di lavoro.pdf', w.assunzione], ['Permesso ' + (w.permesso || 'B') + '.pdf', w.assunzione], ['Attestato Sicurezza Suva.pdf', '2025-03-12'], ['Patente.pdf', '2024-01-10'], ['Certificato AFC.pdf', '2019-06-30']]; return `<div class="row between"><h2>Documenti · ${esc(w.nome)}</h2><button class="btn sm" data-act="close">Chiudi</button></div><p class="small muted">SharePoint/Collaboratori/${esc(w.nome.replace(/\s+/g, ''))}</p>${docs.map((d) => `<div class="listrow"><span>${I('file')} ${esc(d[0])} <span class="small muted">· ${fd(d[1])}</span></span><button class="btn sm" data-act="toast" data-msg="Apre ${esc(d[0])} da SharePoint">Apri</button></div>`).join('')}<label class="btn" style="cursor:pointer">+ Carica documento<input type="file" style="display:none" data-act-change="upload-doc"></label>`; }
function assignModal(m) {
  const ids = m.ids || [m.id]; const w = worker(ids[0]); const cur = cantiereDi(w.id);
  return `<form data-act="assign-submit" class="stack"><div class="row between"><h2>Assegna ${ids.length > 1 ? ids.length + ' persone' : esc(w.nome.split(' ')[0])} a un cantiere</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>${ids.length > 1 ? `<p class="small muted">${ids.map((i) => esc(worker(i).nome)).join(', ')}</p>` : ''}
    <div class="form"><div class="full"><label for="as-c">Cantiere</label><select id="as-c" name="cant">${DB.cantieri.filter((c) => c.stato !== 'Concluso').map((c) => `<option value="${c.id}" ${cur && cur.id === c.id ? 'selected' : ''}>${c.id} · ${esc(c.nome)}, ${esc(c.comune)} (${c.squadra.length} in squadra)</option>`).join('')}</select></div><div><label for="as-d">Da</label><input id="as-d" name="dal" type="date" value="${addDays(D.TODAY_ISO, 3)}"></div><div><label>Notifica</label><label class="row" style="font-weight:500"><input type="checkbox" name="notif" checked> Avvisa sull'app</label></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Assegna</button></div></form>`;
}

// ---------- fattura cliente da offerta (wizard) ----------
function fwizModal(m) {
  const offs = DB.offerte.filter((o) => ['Deliberata', 'Fatturata'].includes(o.stato));
  const o = offerta(m.offertaId) || offs[0]; if (!o) return `<h2>Nessuna offerta deliberata</h2><button class="btn" data-act="close">Chiudi</button>`;
  m.offertaId = o.id; const c = o.cantiere ? cant(o.cantiere) : null; const r = c ? calc(c) : null; const cl = cliente(o.clienteId);
  const varApp = o.variazioni.filter((v) => v.stato === 'Approvata dal cliente').reduce((a, v) => a + v.importo, 0);
  const contratto = (o.deliberato || o.preventivo) + varApp; const gia = offFatturato(o);
  m.tipo = m.tipo || 'Avanzamento'; if (m.pct == null) m.pct = 30;
  if (!m.rows) m.rows = o.capitolato.map((p) => ({ desc: p[1], un: p[2], qta: p[3], prezzo: p[4], eff: p[5] != null ? p[5] : Math.round(p[3] * (c ? c.avanzamento : 0) / 100) }));
  let importo = 0, dettaglio = '';
  if (m.tipo === 'Acconto') { importo = Math.round((o.deliberato || o.preventivo) * m.pct / 100); dettaglio = `${m.pct}% di ${chf(o.deliberato || o.preventivo)}`; }
  else if (m.tipo === 'Finale') { importo = Math.round(contratto - gia); dettaglio = `contratto ${chf(contratto)} (incl. variazioni ${chf(varApp)}) meno già fatturato ${chf(gia)}`; }
  else if (o.tipo === 'A stima') { const lav = m.rows.reduce((a, x) => a + x.eff * x.prezzo, 0); importo = Math.round(lav + varApp - gia); dettaglio = `lavori a misura eseguiti ${chf(lav)} + variazioni ${chf(varApp)} − già fatturato ${chf(gia)}`; }
  else { const av = m.avanz != null ? m.avanz : (c ? c.avanzamento : 0); importo = Math.round(contratto * av / 100 - gia); dettaglio = `${av}% di ${chf(contratto)} − già fatturato ${chf(gia)}`; }
  importo = Math.max(importo, 0); const iva = Math.round(importo * P.ivaPct) / 100;
  const giorni = parseInt(cl.pagamento) || 30;
  return `<div class="row between"><h2>Nuova fattura da offerta</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label for="fw-o">Offerta</label><select id="fw-o" data-wiz="offertaId">${offs.map((x) => `<option value="${x.id}" ${x.id === o.id ? 'selected' : ''}>${x.id} · ${esc(x.oggetto)}</option>`).join('')}</select></div><div><label for="fw-t">Tipo di fattura</label><select id="fw-t" data-wiz="tipo">${['Acconto', 'Avanzamento', 'Finale'].map((x) => `<option ${m.tipo === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    ${m.tipo === 'Acconto' ? `<div><label for="fw-p">Percentuale acconto</label><input id="fw-p" type="number" value="${m.pct}" data-wiz="pct"></div>` : ''}
    ${m.tipo === 'Avanzamento' && o.tipo === 'A corpo' ? `<div><label for="fw-a">Avanzamento certificato %</label><input id="fw-a" type="number" value="${m.avanz != null ? m.avanz : (c ? c.avanzamento : 0)}" data-wiz="avanz"></div>` : ''}</div>
    <div class="alert ${o.tipo === 'A corpo' ? 'info' : 'warn'}"><span>${o.tipo === 'A corpo' ? 'ℹ' : '▲'}</span><span>Offerta <span class="t b">${o.tipo}</span>: ${o.tipo === 'A corpo' ? 'il prezzo è fisso, si fattura per percentuale di avanzamento e le variazioni approvate.' : 'il preventivo è una stima: si fatturano le quantità effettivamente eseguite (misure di cantiere) ai prezzi unitari concordati.'}</span></div>
    ${m.tipo === 'Avanzamento' && o.tipo === 'A stima' ? `<div class="card pad0 pos-editor">${table([{ h: 'Posizione', cls: 'wrap' }, { h: 'Un.' }, { h: 'Preventivo', cls: 'right num' }, { h: 'Eseguito', cls: 'right num' }, { h: 'Prezzo', cls: 'right num' }, { h: 'Totale', cls: 'right num' }], m.rows.map((x, i) => ({ c: [esc(x.desc), x.un, n0(x.qta), `<input type="number" value="${x.eff}" data-wiz-row="${i}" style="width:90px;text-align:right">`, chf(x.prezzo, 2), `<span class="b">${chf(x.eff * x.prezzo)}</span>`] })))}</div>` : ''}
    <div class="card"><h3>Riepilogo</h3><dl class="dl"><dt>Cliente</dt><dd>${esc(cl.nome)} · pagamento ${esc(cl.pagamento || '30 giorni')}</dd><dt>Calcolo</dt><dd>${dettaglio}</dd><dt>Imponibile</dt><dd class="num b">${chf(importo)}</dd><dt>IVA ${P.ivaPct}%</dt><dd class="num">${chf(iva, 2)}</dd><dt>Totale fattura</dt><dd class="num b">${chf(importo + iva, 2)}</dd><dt>Scadenza</dt><dd>${fd(addDays(D.TODAY_ISO, giorni))}</dd></dl></div>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Annulla</button><button class="btn primary" data-act="fwiz-create" ${importo > 0 ? '' : 'disabled'}>Crea fattura ${chf(importo)}</button></div>`;
}
function fwizCreate() {
  const m = S.modal; const o = offerta(m.offertaId); const cl = cliente(o.clienteId); const c = o.cantiere ? cant(o.cantiere) : null;
  const varApp = o.variazioni.filter((v) => v.stato === 'Approvata dal cliente').reduce((a, v) => a + v.importo, 0); const contratto = (o.deliberato || o.preventivo) + varApp; const gia = offFatturato(o);
  let importo = 0, desc = '';
  if (m.tipo === 'Acconto') { importo = Math.round((o.deliberato || o.preventivo) * m.pct / 100); desc = `Acconto ${m.pct}%`; }
  else if (m.tipo === 'Finale') { importo = Math.round(contratto - gia); desc = 'Fattura finale a saldo'; }
  else if (o.tipo === 'A stima') { importo = Math.round(m.rows.reduce((a, x) => a + x.eff * x.prezzo, 0) + varApp - gia); desc = 'Avanzamento a misura (quantità eseguite)'; m.rows.forEach((x, i) => { if (o.capitolato[i]) o.capitolato[i][5] = x.eff; }); }
  else { const av = m.avanz != null ? m.avanz : (c ? c.avanzamento : 0); importo = Math.round(contratto * av / 100 - gia); desc = `Avanzamento ${av}%`; }
  const giorni = parseInt(cl.pagamento) || 30;
  const f = { id: nextId('FA-2026-', DB.fatture), offertaId: o.id, cantiere: o.cantiere, clienteId: o.clienteId, tipo: m.tipo, data: D.TODAY_ISO, scadenza: addDays(D.TODAY_ISO, giorni), desc, importo: Math.max(importo, 0), stato: 'Bozza' };
  DB.fatture.unshift(f); if (m.tipo === 'Finale') o.stato = 'Fatturata';
  S.modal = { type: 'print', kind: 'fattura', id: f.id }; toast('Fattura ' + f.id + ' creata in bozza');
}

// ---------- caricamento fattura fornitore con lettura IA (OCR simulato) ----------
function ocrModal(m) {
  if (m.step === 'scan') return `<div class="row between"><h2>Lettura fattura in corso</h2></div><div class="stack"><div class="row nowrap"><span class="act-ic">${I('file')}</span><div><div class="b">${esc(m.file)}</div><div class="small muted">Riconoscimento testo, fornitore, voci e riferimento cantiere…</div></div></div><div class="scan"></div><div class="small muted">L'IA confronta il fornitore con l'anagrafica, cerca il numero di cantiere nel testo e propone la categoria di costo.</div></div>`;
  if (m.step === 'result') {
    const s = m.data; const forn = DB.fornitori.find((f) => f.nome === s.fornitore); const tot = s.voci.reduce((a, v) => a + v[1] * v[2], 0); const ivaV = Math.round(tot * s.iva) / 100;
    return `<form data-act="ocr-submit" class="stack"><div class="row between"><h2>Fattura letta ${s.confidenza >= 0.9 ? `<span class="conf">affidabilità ${Math.round(s.confidenza * 100)}%</span>` : `<span class="conf mid">affidabilità ${Math.round(s.confidenza * 100)}%: verifica i campi</span>`}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
      <div class="form"><div><label>Fornitore ${forn ? '<span class="conf">in anagrafica</span>' : '<span class="conf mid">nuovo</span>'}</label><select name="fornitoreId">${DB.fornitori.map((f) => `<option value="${f.id}" ${forn && forn.id === f.id ? 'selected' : ''}>${esc(f.nome)}</option>`).join('')}</select></div><div><label>Numero fattura</label><input name="id" value="${esc(s.numero)}"></div><div><label>Data</label><input name="data" type="date" value="${s.data}"></div><div><label>Scadenza</label><input name="scadenza" type="date" value="${s.scadenza}"></div>
      <div><label>Cantiere ${s.cantiere ? `<span class="conf">trovato: "${esc(s.riferimento)}"</span>` : '<span class="conf mid">nessun riferimento nel documento</span>'}</label><select name="cantiere"><option value="">Da assegnare</option>${DB.cantieri.map((c) => `<option value="${c.id}" ${s.cantiere === c.id ? 'selected' : ''}>${c.id} · ${esc(c.nome)}</option>`).join('')}</select></div><div><label>Categoria di costo <span class="conf">suggerita</span></label><select name="categoria">${D.CATEGORIE_COSTO.map((x) => `<option ${x === s.categoria ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
      <div class="card pad0">${table([{ h: 'Voce letta', cls: 'wrap' }, { h: 'Q.tà', cls: 'right num' }, { h: 'Prezzo', cls: 'right num' }, { h: 'Totale', cls: 'right num' }], s.voci.map((v) => ({ c: [esc(v[0]), n0(v[1]), chf(v[2], 2), chf(v[1] * v[2], 2)] })))}<div class="row between" style="padding:10px 16px"><span class="small muted">Imponibile ${chf(tot, 2)} + IVA ${s.iva}% ${chf(ivaV, 2)}</span><span class="b num">Totale ${chf(tot + ivaV, 2)}</span></div></div>
      <div class="row between"><span class="small muted">Allegato ${esc(m.file)} archiviato in SharePoint/${forn ? esc(forn.sharepoint) : 'Fornitori'}</span><div class="row"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Registra fattura</button></div></div></form>`;
  }
  return `<div class="row between"><h2>Carica fattura fornitore</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="dropzone"><input type="file" accept="image/*,.pdf" data-act-change="ocr-file"><div style="font-size:1.6rem">${I('camera')} ${I('file')}</div><div class="b">Trascina qui il PDF o scatta una foto della fattura</div><div class="small muted">L'IA legge fornitore, numero, date, voci e importo, riconosce il riferimento al cantiere e propone la categoria di costo. Tu confermi.</div></div>
    <div class="eyebrow">Oppure prova con una fattura di esempio</div><div class="stack">${D.OCR_SAMPLES.map((s, i) => `<button class="listrow click" data-act="ocr-sample" data-id="${i}" style="border:0;background:none;width:100%;text-align:left;font:inherit;color:inherit"><span>${I('file')} ${esc(s.file)}<br><span class="small muted">${esc(s.fornitore)} · ${esc(s.riferimento)}</span></span><span class="b num">${chf(s.voci.reduce((a, v) => a + v[1] * v[2], 0) * (1 + s.iva / 100), 2)}</span></button>`).join('')}</div>`;
}
function ocrStart(file, sampleIdx) {
  const s = D.OCR_SAMPLES[sampleIdx != null ? sampleIdx : (S._ocrN = ((S._ocrN || 0) + 1) % D.OCR_SAMPLES.length)];
  S.modal = { type: 'ocr', step: 'scan', file: file || s.file, data: clone(s), cantiere: S.modal && S.modal.cantiere }; render();
  setTimeout(() => { if (S.modal && S.modal.type === 'ocr') { if (S.modal.cantiere && !S.modal.data.cantiere) S.modal.data.cantiere = S.modal.cantiere; S.modal.step = 'result'; render(); } }, 1500);
}
function ocrSubmit(form) {
  const fdata = new FormData(form); const s = S.modal.data; const tot = s.voci.reduce((a, v) => a + v[1] * v[2], 0); const importo = Math.round(tot * (1 + s.iva / 100) * 100) / 100;
  const cantiere = fdata.get('cantiere') || null;
  const f = { id: fdata.get('id') || nextId('FF-2026-', DB.fattForn), cantiere, fornitoreId: fdata.get('fornitoreId'), categoria: fdata.get('categoria'), data: fdata.get('data'), scadenza: fdata.get('scadenza'), importo, stato: cantiere ? 'Registrata' : 'Da assegnare', allegato: S.modal.file, voci: s.voci };
  if (DB.fattForn.some((x) => x.id === f.id)) f.id = nextId('FF-2026-', DB.fattForn);
  DB.fattForn.unshift(f); S.modal = null; toast('Fattura ' + f.id + (cantiere ? ' registrata sul cantiere ' + cantiere : ' registrata, da assegnare') + ' · pronta per SelectLine');
}

// ---------- capitolato: caricamento e analisi IA ----------
function capUploadModal(m) {
  if (m.step === 'scan') return `<h2>Analisi del capitolato in corso</h2><div class="stack"><div class="row nowrap"><span class="act-ic">${I('file-text')}</span><div><div class="b">${esc(m.file)}</div><div class="small muted">Lettura pagine, estrazione posizioni NPK, ricerca di punti poco chiari…</div></div></div><div class="scan"></div></div>`;
  return `<div class="row between"><h2>Carica capitolato</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label for="cu-c">Cliente</label><select id="cu-c" data-cap="clienteId">${DB.clienti.map((k) => `<option value="${k.id}" ${m.clienteId === k.id ? 'selected' : ''}>${esc(k.nome)}</option>`).join('')}</select></div><div><label for="cu-t">Titolo (opzionale)</label><input id="cu-t" data-cap="titolo" value="${esc(m.titolo || '')}"></div></div>
    <div class="dropzone"><input type="file" accept=".pdf,.docx,.xlsx" data-act-change="cap-file"><div style="font-size:1.6rem">${I('file-text')}</div><div class="b">Trascina qui il capitolato (PDF, Word, Excel)</div><div class="small muted">L'IA lo legge, estrae le posizioni, riassume condizioni e penali, segnala cosa non è chiaro e poi risponde alle tue domande sul documento.</div></div>
    <button class="btn" data-act="cap-demo">Usa un capitolato di esempio (Condominio Via Trevano, 36 pagine)</button>`;
}
function capStart(file, m) {
  const name = file || 'Capitolato_Condominio_ViaTrevano.pdf'; const clienteId = m.clienteId || DB.clienti[0].id; const titolo = m.titolo || ('Capitolato ' + name.replace(/[_.]/g, ' ').replace(/ pdf$/, ''));
  S.modal = { type: 'cap-upload', step: 'scan', file: name }; render();
  setTimeout(() => {
    const cp = { id: nextId('CAP-', DB.capitolati), titolo, clienteId, cantiere: null, file: name, pagine: 36, caricato: D.TODAY_ISO, stato: 'Analizzato', norma: 'NPK 671 / SIA 118',
      riassunto: 'Tinteggiatura di vani scala e facciate di un condominio di 18 appartamenti con ponteggio a carico dell\'appaltatore. Lavori da eseguire con stabile abitato, in 2 fasi. Garanzia 2 anni, ritenuta 5%, pagamento a 30 giorni su acconti mensili.',
      posizioni: [['671.510', 'Pittura facciate silossanica, 2 mani', 'm²', 1850], ['671.120', 'Rasatura armata facciate', 'm²', 1850], ['671.211', 'Tinteggiatura vani scala, 2 mani', 'm²', 1240], ['', 'Ponteggio e installazione cantiere', 'forf.', 1]],
      domande: [{ q: 'Il capitolato chiede "colore secondo campione" per le facciate ma non indica chi approva il campione né entro quando.', stato: 'Aperta' }, { q: 'Non è specificato se il ponteggio deve avere il telo di protezione (obbligatorio sul lato strada).', stato: 'Aperta' }, { q: 'Le 2 fasi non hanno date: da concordare con l\'amministrazione per evitare costi di doppio montaggio ponteggio.', stato: 'Aperta' }],
      richieste: [],
      faq: [{ k: ['ponteggio', 'telo', 'ponteggi'], a: 'Il ponteggio è a carico dell\'appaltatore (pag. 8). Non è indicato l\'obbligo del telo di protezione sul lato strada: da chiarire, incide sul prezzo del ponteggio.', p: 'pag. 8' }, { k: ['fasi', 'fase', 'tempi', 'date', 'consegna'], a: 'I lavori sono in 2 fasi (pag. 4) ma senza date: concordare un calendario che eviti di smontare e rimontare il ponteggio.', p: 'pag. 4' }, { k: ['colore', 'campione', 'ral'], a: 'Colore "secondo campione da approvare" (pag. 15), senza indicare chi approva: proporre un verbale di approvazione campione firmato dall\'amministrazione.', p: 'pag. 15' }, { k: ['pagamento', 'acconto', 'ritenuta', 'garanzia'], a: 'Acconti mensili a 30 giorni, ritenuta di garanzia 5% svincolata al collaudo, garanzia 2 anni (pag. 30-31).', p: 'pag. 30-31' }] };
    DB.capitolati.unshift(cp); notify('Capitolato "' + titolo + '" analizzato: ' + cp.domande.length + ' domande aperte', 'capitolato', cp.id); go('capitolato', cp.id);
  }, 2000);
}
function capAnswer(cp, q) {
  const ql = q.toLowerCase(); let best = null, score = 0;
  cp.faq.forEach((f) => { const sc = f.k.filter((k) => ql.includes(k)).length; if (sc > score) { score = sc; best = f; } });
  if (best) return { a: best.a, p: best.p };
  if (/domand|chiar|aperte|manca|dubbi/.test(ql)) return { a: 'I punti ancora da chiarire sono: ' + cp.domande.filter((d) => d.stato === 'Aperta').map((d, i) => (i + 1) + ') ' + d.q).join(' ') + ' Vuoi che prepari l\'e-mail al cliente con queste domande?', p: 'sintesi', email: true };
  if (/riassun|sintesi|di cosa|cosa prevede|oggetto/.test(ql)) return { a: cp.riassunto, p: 'pag. 1-3' };
  if (/posizion|quantit|m²|metri|npk/.test(ql)) return { a: 'Posizioni principali: ' + cp.posizioni.map((p) => p[1] + ' (' + n0(p[3]) + ' ' + p[2] + ')').join('; ') + '.', p: 'elenco prezzi' };
  if (/richiest|cliente|extra|aggiunt/.test(ql)) return { a: cp.richieste.length ? 'Richieste del cliente in corso d\'opera: ' + cp.richieste.map((r) => fd(r.data) + ' ' + r.da + ': ' + r.testo + ' (' + r.stato + ')').join('; ') : 'Non risultano richieste aggiuntive del cliente registrate su questo capitolato.', p: 'registro' };
  return { a: 'Nel documento non trovo un passaggio che risponda con certezza a questa domanda. Posso aggiungerla alle domande aperte da porre al cliente prima dell\'inizio dei lavori.', p: null, addQ: true };
}

// ---------- anteprima stampabile (offerta / fattura) ----------
function printModal(m) {
  const isF = m.kind === 'fattura'; const f = isF ? DB.fatture.find((x) => x.id === m.id) : null; const o = isF ? (f.offertaId ? offerta(f.offertaId) : null) : offerta(m.id);
  const cl = cliente(isF ? f.clienteId : o.clienteId); const c = (isF ? f.cantiere : o.cantiere) ? cant(isF ? f.cantiere : o.cantiere) : null;
  const rows = isF ? [[f.desc, '', 1, f.importo]] : o.capitolato.map((p) => [p[1], p[2], p[3], p[4]]);
  const net = isF ? f.importo : offTot(o); const sconto = !isF && o.deliberato ? net - o.deliberato : 0; const base = net - sconto; const iva = Math.round(base * P.ivaPct) / 100;
  return `<div class="row between"><h2>${isF ? 'Fattura ' + f.id : 'Offerta ' + o.id}</h2><div class="row"><button class="btn sm" data-act="print-now">${I('printer')} Stampa / salva PDF</button><button class="btn sm primary" data-act="print-email">${I('mail')} Invia per e-mail</button><button class="btn sm" data-act="close">Chiudi</button></div></div>
  <div class="print-area"><div class="doc"><div class="row between" style="align-items:flex-start"><img src="${LOGO}" alt="MY COLOR" style="width:150px"><div class="small right">MY COLOR Isella & Foletti SA<br>Via Industria 17, 6934 Bioggio<br>+41 91 605 00 00 · info@mycolorgroup.ch<br>CHE-123.456.789 IVA</div></div>
    <div class="row between" style="margin-top:26px;align-items:flex-start"><div><div class="small muted">Spett.le</div><div class="b">${esc(cl.nome)}</div><div>${esc(cl.contatto)}<br>${esc(cl.indirizzo || '')}<br>${esc(cl.comune)}</div></div><div class="small right"><b>${isF ? 'Fattura n. ' + f.id : 'Offerta n. ' + o.id}</b><br>Data ${fd(isF ? f.data : o.data)}<br>${isF ? 'Scadenza ' + fd(f.scadenza) : 'Valida fino al ' + fd(o.validita)}<br>${c ? 'Cantiere ' + c.id + ' · ' + esc(c.nome) : ''}</div></div>
    <h2 style="margin-top:22px">${esc(isF ? (f.tipo + ': ' + f.desc) : o.oggetto)}</h2>${!isF ? `<p class="small">Offerta <b>${o.tipo.toLowerCase()}</b>${o.tipo === 'A stima' ? ': le quantità sono stimate e verranno conteggiate a misura in base alle quantità effettivamente eseguite.' : ': prezzo fisso per le prestazioni descritte; lavori aggiuntivi su variazione scritta.'}</p>` : `<p class="small">${o ? 'Riferimento offerta ' + o.id + ' del ' + fd(o.data) + '.' : ''} Lavori eseguiti secondo CCL pittura e gessatura e norme SIA.</p>`}
    <div class="tw" style="margin-top:14px"><table><thead><tr><th>Descrizione</th><th>Un.</th><th class="right">Q.tà</th><th class="right">Prezzo</th><th class="right">Totale</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="wrap">${esc(r[0])}</td><td>${r[1]}</td><td class="right num">${n0(r[2])}</td><td class="right num">${n2(r[3])}</td><td class="right num">${n2(r[2] * r[3])}</td></tr>`).join('')}</tbody></table></div>
    <div class="row between" style="margin-top:16px;align-items:flex-start"><div class="qr">QR-fattura<br>IBAN CH93 0076 2011 6238 5295 7</div><dl class="dl" style="min-width:260px"><dt>Totale netto</dt><dd class="num right">${n2(net)}</dd>${sconto ? `<dt>Sconto ${pct(sconto / net * 100)}</dt><dd class="num right">−${n2(sconto)}</dd>` : ''}<dt>IVA ${P.ivaPct}%</dt><dd class="num right">${n2(iva)}</dd><dt><b>Totale CHF</b></dt><dd class="num right b">${n2(base + iva)}</dd></dl></div>
    <p class="small muted" style="margin-top:18px">${isF ? 'Pagamento a ' + (cl.pagamento || '30 giorni') + ' netto. Grazie per la fiducia.' : 'Condizioni: pagamento a ' + (cl.pagamento || '30 giorni') + ', acconti secondo avanzamento, garanzia 2 anni secondo SIA 118. Firma elettronica dal link ricevuto via e-mail.'}</p></div></div>`;
}

// ---------- modali di contorno ----------
function moveStockModal(m) {
  return `<form data-act="stock-submit" class="stack"><div class="row between"><h2>${m.tipo === 'Carico' ? 'Carico in magazzino' : 'Scarico su cantiere'}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div class="full"><label for="st-a">Articolo</label><select id="st-a" name="articolo">${DB.magazzino.map((a) => `<option value="${a.cod}" ${m.cod === a.cod ? 'selected' : ''}>${a.cod} · ${esc(a.nome)} (${a.qta} ${a.unita})</option>`).join('')}</select></div><div><label for="st-q">Quantità</label><input id="st-q" name="qta" type="number" value="${m.qta || 1}" min="1"></div>${m.tipo !== 'Carico' ? `<div><label for="st-c">Cantiere</label><select id="st-c" name="cantiere">${DB.cantieri.filter((c) => c.stato === 'In corso').map((c) => `<option value="${c.id}" ${m.cantiere === c.id ? 'selected' : ''}>${c.id} · ${esc(c.nome)}</option>`).join('')}</select></div>` : ''}<div><label for="st-w">Chi</label><select id="st-w" name="chi">${DB.workers.map((w) => `<option value="${w.id}" ${w.id === S.user.wid ? 'selected' : ''}>${esc(w.nome)}</option>`).join('')}</select></div></div>
    <p class="small muted">${m.tipo === 'Carico' ? 'Il carico aumenta la giacenza e il valore di magazzino.' : 'Lo scarico riduce la giacenza e carica il valore del materiale sui costi del cantiere (voce "prelievi magazzino").'} Sull'app operaio basta scansionare il codice a barre.</p>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Registra ${m.tipo === 'Carico' ? 'carico' : 'scarico'}</button></div></form>`;
}
function inviteModal(m) {
  return `<form data-act="invite-submit" class="stack"><div class="row between"><h2>Invita un utente</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label for="in-n">Nome</label><input id="in-n" name="nome" value="${esc(m.nome || '')}" required></div><div><label for="in-e">E-mail</label><input id="in-e" name="email" type="email" value="${esc(m.email || '')}" required></div><div class="full"><label for="in-r">Ruolo</label><select id="in-r" name="ruolo">${D.RUOLI.map((r) => `<option ${m.ruolo === r.id ? 'selected' : ''}>${r.id}</option>`).join('')}</select></div><div class="full"><label>Accesso</label><label class="row" style="font-weight:500"><input type="radio" name="acc" value="ms" checked> Account Microsoft 365 aziendale (Entra ID)</label><label class="row" style="font-weight:500"><input type="radio" name="acc" value="pin"> E-mail + PIN a 6 cifre (operai senza account)</label></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Invia invito</button></div></form>`;
}
function planCellModal(m) {
  const c = cant(m.cant); const day = m.day; const inCell = DB.workers.filter((w) => w.ramo !== 'U' && (cantiereDi(w.id, day) || {}).id === c.id);
  return `<div class="row between"><div><h2>${esc(c.nome)}</h2><p class="muted small">${flong(day)} · ${inCell.length} persone pianificate</p></div><button class="btn sm" data-act="close">Chiudi</button></div>
    <div>${inCell.map((w) => `<div class="listrow"><span class="row nowrap">${avatar(w.nome, avCls(w) + ' sm')}<span>${esc(w.nome)}<br><span class="small muted">${esc(w.ruolo)}</span></span></span><button class="btn sm" data-act="plan-remove" data-id="${w.id}" data-day="${day}">Togli</button></div>`).join('') || '<p class="muted small">Nessuno pianificato</p>'}</div>
    <form data-act="plan-add" class="row nowrap"><select name="wid" style="flex:1">${DB.workers.filter((w) => w.ramo !== 'U' && !inCell.includes(w)).map((w) => `<option value="${w.id}">${esc(w.nome)} · ${esc(w.ruolo)}${(cantiereDi(w.id, day) || {}).nome ? ' (oggi: ' + esc(cantiereDi(w.id, day).nome) + ')' : ''}</option>`).join('')}</select><label class="row small" style="font-weight:500;white-space:nowrap"><input type="checkbox" name="week" checked> tutta la settimana</label><button class="btn primary" type="submit">Aggiungi</button></form>
    <p class="small muted">Le modifiche arrivano sull'app degli operai e all'assistente car pooling.</p>`;
}
function newDmModal() { return `<div class="row between"><h2>Nuovo messaggio</h2><button class="btn sm" data-act="close">Chiudi</button></div><div class="stack" style="max-height:60vh;overflow:auto">${DB.workers.filter((w) => w.id !== S.user.wid).map((w) => `<button class="listrow click" data-act="dm-open" data-id="${w.id}" style="border:0;background:none;width:100%;text-align:left;font:inherit;color:inherit"><span class="row nowrap">${avatar(w.nome, avCls(w) + ' sm')}<span>${esc(w.nome)}<br><span class="small muted">${esc(w.ruolo)}</span></span></span></button>`).join('')}</div>`; }
function eventModalRead(m) { const e = DB.eventi.find((x) => x.id === m.id); return `<div class="row between"><h2>${esc(e.titolo)}</h2><button class="btn sm" data-act="close">Chiudi</button></div><dl class="dl"><dt>Quando</dt><dd>${flong(e.inizio.slice(0, 10))}, ${e.inizio.slice(11, 16)}–${e.fine.slice(11, 16)}</dd><dt>Tipo</dt><dd>${e.tipo}</dd>${e.luogo ? `<dt>Luogo</dt><dd>${esc(e.luogo)}</dd>` : ''}${e.rel ? `<dt>Collegato a</dt><dd><button class="btn sm" data-act="${relAct(e.rel)}" data-id="${esc(e.rel.id)}">${esc(relName(e.rel))}</button></dd>` : ''}<dt>Partecipanti</dt><dd>${e.partecipanti.map((p) => worker(p).nome).join(', ')}</dd><dt>Outlook</dt><dd>${e.outlook ? '<span class="pill good">sincronizzato</span>' : '<span class="pill">solo gestionale</span>'}</dd></dl><div class="row"><button class="btn primary" data-act="edit-entity" data-ent="evento" data-id="${e.id}">${I('edit')} Modifica</button><button class="btn" data-act="toast" data-msg="Riunione Teams creata e link inviato ai partecipanti">Teams</button></div>`; }

function renderModal() {
  const m = S.modal; if (!m) return '';
  const inner = { form: modalForm, confirm: confirmModal, 'bulk-edit': bulkEditModal, compose: composeModal, email: emailModal, worker: workerModal, 'docs-worker': docsWorkerModal, assign: assignModal, fwiz: fwizModal, ocr: ocrModal, 'cap-upload': capUploadModal, print: printModal, stock: moveStockModal, invite: inviteModal, 'plan-cell': planCellModal, 'new-dm': newDmModal, 'event-read': eventModalRead, 'offerta-new': newOffertaModal, acconti: accontiModal, 'offerta-link': linkModal }[m.type];
  const cls = ['print', 'fwiz', 'offerta-new'].includes(m.type) ? 'wide' : m.type === 'confirm' || m.type === 'bulk-edit' ? 'narrow' : '';
  return `<div class="modal-bg" data-act="close-bg"><div class="modal ${cls}">${inner ? inner(m) : ''}</div></div>`;
}

// ---------- ricerca globale ----------
function searchAll(q) {
  q = q.trim().toLowerCase(); if (q.length < 2) return [];
  const hit = (s) => String(s || '').toLowerCase().includes(q); const out = [];
  DB.cantieri.forEach((c) => { if (hit(c.id) || hit(c.nome) || hit(c.comune)) out.push({ g: 'Cantieri', ic: I('building'), t: c.nome, s: c.id + ' · ' + c.comune + ' · ' + c.stato, act: 'open-cantiere', id: c.id }); });
  DB.workers.forEach((w) => { if (hit(w.nome) || hit(w.ruolo) || w.competenze.some(hit)) out.push({ g: 'Collaboratori', ic: I('user'), t: w.nome, s: w.ruolo + ' · ' + w.residenza, act: 'open-worker', id: w.id }); });
  DB.clienti.forEach((k) => { if (hit(k.nome) || hit(k.contatto) || hit(k.comune)) out.push({ g: 'Clienti', ic: I('phone'), t: k.nome, s: k.tipo + ' · ' + k.comune, act: 'open-cliente', id: k.id }); });
  DB.fornitori.forEach((f) => { if (hit(f.nome) || hit(f.categoria)) out.push({ g: 'Fornitori', ic: I('factory'), t: f.nome, s: f.categoria + ' · ' + f.comune, act: 'open-fornitore', id: f.id }); });
  DB.offerte.forEach((o) => { if (hit(o.id) || hit(o.oggetto)) out.push({ g: 'Offerte', ic: I('edit'), t: o.id + ' · ' + o.oggetto, s: cliente(o.clienteId).nome + ' · ' + o.stato, act: 'open-offerta', id: o.id }); });
  DB.fatture.forEach((f) => { if (hit(f.id) || hit(f.desc)) out.push({ g: 'Fatture clienti', ic: I('receipt'), t: f.id + ' · ' + f.desc, s: cliente(f.clienteId).nome + ' · ' + chf(f.importo) + ' · ' + f.stato, act: 'open-fattura', id: f.id }); });
  DB.fattForn.forEach((f) => { if (hit(f.id) || hit(fornitore(f.fornitoreId).nome)) out.push({ g: 'Fatture fornitori', ic: I('file'), t: f.id + ' · ' + fornitore(f.fornitoreId).nome, s: chf(f.importo) + ' · ' + (f.cantiere || 'da assegnare'), act: 'open-ff', id: f.id }); });
  DB.magazzino.forEach((a) => { if (hit(a.cod) || hit(a.nome)) out.push({ g: 'Magazzino', ic: I('scan'), t: a.nome, s: a.cod + ' · ' + a.qta + ' ' + a.unita + ' · ' + a.ubic, act: 'open-articolo', id: a.cod }); });
  DB.capitolati.forEach((c) => { if (hit(c.titolo) || hit(c.file)) out.push({ g: 'Capitolati', ic: I('file-text'), t: c.titolo, s: c.file + ' · ' + c.pagine + ' pagine', act: 'open-capitolato', id: c.id }); });
  DB.veicoli.forEach((v) => { if (hit(v.targa) || hit(v.modello)) out.push({ g: 'Veicoli', ic: I('truck'), t: v.targa + ' · ' + v.modello, s: v.assegnato ? worker(v.assegnato).nome : 'Pool', act: 'open-veicolo', id: v.id }); });
  DB.eventi.forEach((e) => { if (hit(e.titolo)) out.push({ g: 'Calendario', ic: I('calendar'), t: e.titolo, s: fdt(e.inizio), act: 'open-evento', id: e.id }); });
  DB.email.forEach((e) => { if (hit(e.oggetto) || hit(e.da)) out.push({ g: 'E-mail', ic: I('mail'), t: e.oggetto, s: e.da + ' · ' + fd(e.data), act: 'open-email', id: e.id }); });
  Object.entries(DB.documenti).forEach(([cid, docs]) => docs.forEach((d) => { if (hit(d[0])) out.push({ g: 'Documenti', ic: I('file'), t: d[0], s: (cant(cid) || {}).nome + ' · ' + fd(d[1]), act: 'open-cantiere', id: cid }); }));
  return out.slice(0, 14);
}
