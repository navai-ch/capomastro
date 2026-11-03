/* MyColor Gestionale – estensioni v6: tema chiaro/scuro, tooltip e hover sui dati, dashboard completa,
   ricerca nel listino, account e-mail/calendario (Microsoft 365, Google), Inbox, assistente IA per gli operai */

// ---------- icone aggiuntive ----------
Object.assign(ICONS, {
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  forward: '<polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  funnel: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
});
Object.assign(T.it, { inbox: 'Inbox' }); Object.assign(T.de, { inbox: 'Posteingang' }); Object.assign(T.fr, { inbox: 'Boîte de réception' }); Object.assign(T.en, { inbox: 'Inbox' });

// ---------- tema ----------
function effTheme() { return S.theme === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.theme; }
function setTheme(v) { S.theme = v; try { localStorage.setItem('mc-theme', v); } catch (_) {} }
function themeSeg() { return `<span class="seg" role="group" aria-label="Tema">${[['auto', I('switch'), 'Auto'], ['light', I('sun'), 'Chiaro'], ['dark', I('moon'), 'Scuro']].map((x) => `<button type="button" class="${S.theme === x[0] ? 'on' : ''}" data-act="theme-set" data-id="${x[0]}">${x[1]}${x[2]}</button>`).join('')}</span>`; }
function profMenu(pos) {
  const w = me();
  return `<div class="dropdown ${pos}" style="width:300px"><div class="it" style="cursor:default"><span>${avatar(w.nome)}</span><span style="min-width:0"><div class="b">${esc(w.nome)}</div><div class="sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(S.user.ruolo)} · ${esc(w.email)}</div></span></div>
    <div class="it" style="cursor:default;justify-content:space-between"><span class="small b">Aspetto</span>${themeSeg()}</div>
    <button class="it" data-act="nav" data-id="impostazioni" data-tab="profilo"><span class="ic">${I('user')}</span>${t('profile')}</button><button class="it" data-act="nav" data-id="impostazioni"><span class="ic">${I('settings')}</span>${t('impostazioni')}</button><button class="it" data-act="nav" data-id="impostazioni" data-tab="account"><span class="ic">${I('mail')}</span>Account e-mail e calendari</button><button class="it" data-act="nav" data-id="impostazioni" data-tab="utenti"><span class="ic">${I('users')}</span>Utenti e inviti</button><button class="it" data-act="nav" data-id="impostazioni" data-tab="aspetto"><span class="ic">${I('globe')}</span>Lingua e aspetto</button><button class="it" data-act="logout"><span class="ic">${I('switch')}</span>${t('switch')}</button><button class="it" data-act="logout"><span class="ic">${I('logout')}</span>${t('logout')}</button></div>`;
}

// ---------- tooltip (data-tip) ----------
(function tooltips() {
  let el = null; const get = () => { if (!el) { el = document.createElement('div'); el.className = 'tip'; document.body.appendChild(el); } return el; };
  const place = (e) => { const t = get(); const x = Math.min(e.clientX + 14, window.innerWidth - t.offsetWidth - 8); const y = e.clientY + 18 + t.offsetHeight > window.innerHeight ? e.clientY - t.offsetHeight - 10 : e.clientY + 18; t.style.left = Math.max(8, x) + 'px'; t.style.top = y + 'px'; };
  document.addEventListener('mouseover', (e) => { const h = e.target.closest && e.target.closest('[data-tip]'); if (!h) { if (el) el.classList.remove('on'); return; } const t = get(); t.textContent = h.dataset.tip; t.classList.add('on'); place(e); });
  document.addEventListener('mousemove', (e) => { if (el && el.classList.contains('on')) place(e); });
  document.addEventListener('mouseout', (e) => { if (el && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-tip]'))) el.classList.remove('on'); });
  document.addEventListener('click', () => { if (el) el.classList.remove('on'); }, true);
})();

// ---------- account e-mail / calendario ----------
const ACC_COLORS = ['#0F6CBD', '#7A5AF8', '#C77A08', '#1E8E4E', '#B8232A', '#0E8A8A'];
const PROVIDERS = { 'Microsoft 365': { short: 'M', col: '#0F6CBD', desc: 'Outlook, Calendario, Contatti (Entra ID)' }, 'Google Workspace': { short: 'G', col: '#1E8E4E', desc: 'Gmail, Google Calendar, Contatti' }, 'IMAP / SMTP': { short: '@', col: '#4E5058', desc: 'Qualsiasi casella (Infomaniak, Bluewin, hosting)' }, 'Apple iCloud': { short: 'i', col: '#1F2024', desc: 'Mail e Calendario iCloud' } };
function ensureAcc() {
  if (!DB.accounts) DB.accounts = clone(D.ACCOUNTS);
  const byAddr = (s) => /ivo@/.test(s) ? 'AC1' : /stefano@/.test(s) ? 'AC2' : /letizia@/.test(s) ? 'AC3' : /info@/.test(s) ? 'AC4' : 'AC1';
  DB.email.forEach((m) => { if (!m.account) m.account = byAddr(m.folder === 'Sent' ? m.da : m.a); if (!m.labels) m.labels = []; });
  const byW = { C001: 'AC1', C002: 'AC2', C004: 'AC3' };
  DB.eventi.forEach((e) => { if (e.account === undefined) e.account = e.outlook ? (byW[e.partecipanti[0]] || 'AC4') : null; });
}
const accById = (id) => (DB.accounts || []).find((a) => a.id === id) || { id, provider: 'Gestionale', email: '', nome: 'Gestionale', colore: 'var(--muted)', servizi: [] };
const mailAccounts = () => { ensureAcc(); return DB.accounts.filter((a) => a.servizi.includes('mail') && a.stato === 'Connesso'); };
function defaultAccount() { const w = me(); const mine = mailAccounts().find((a) => a.owner === w.id); return (mine || mailAccounts()[0] || { id: null }).id; }
function accLogo(a, size = 44) { const p = PROVIDERS[a.provider] || PROVIDERS['IMAP / SMTP']; return `<span class="acc-logo" style="background:${p.col};width:${size}px;height:${size}px;font-size:${size * 0.42}px">${p.short}</span>`; }
function accountSettings() {
  ensureAcc(); const w = me();
  const office = DB.workers.filter((x) => x.ramo === 'U');
  const senza = office.filter((x) => !DB.accounts.some((a) => a.owner === x.id && a.provider !== 'Google Workspace'));
  const srvLabel = { mail: 'Posta', calendar: 'Calendario', contacts: 'Contatti' };
  return `<div class="row between"><p class="muted small" style="max-width:720px">Collega le caselle e i calendari di Microsoft 365 / Outlook, Google Workspace / Gmail o IMAP. Le e-mail in arrivo vengono associate da sole a clienti, fornitori e cantieri e compaiono in <b>Inbox</b>; gli appuntamenti finiscono nel <b>Calendario</b> condiviso con il colore dell'account. L'accesso avviene con OAuth del provider: nessuna password viene salvata nel gestionale.</p><button class="btn primary" data-act="acc-add-open">+ Collega account</button></div>
    <div class="stack">${DB.accounts.map((a) => `<div class="acc-card">${accLogo(a)}<div style="min-width:0"><div class="row nowrap"><span class="b">${esc(a.email)}</span>${pill(a.stato === 'Connesso' ? 'Attivo' : a.stato)}<span class="acc-chip static"><i style="background:${a.colore}"></i>${esc(a.nome)}</span></div><div class="small muted">${esc(a.provider)} · ${esc(worker(a.owner).nome)}${a.condiviso ? ' · condiviso con l\'ufficio' : ' · solo personale'}</div><div class="row" style="margin-top:6px;gap:6px">${a.servizi.map((s) => `<span class="pill good">${I('check')} ${srvLabel[s]}</span>`).join('')}<span class="small muted">· ${n0(a.nMail)} e-mail, ${n0(a.nEventi)} eventi · sincronizzato ${fdt(a.ultimaSync)}</span></div>
        <div class="grid2" style="margin-top:8px;gap:0 20px">${[['condiviso', 'Visibile a tutto l\'ufficio (Inbox e Calendario)'], ['autoRel', 'Associa automaticamente a clienti, fornitori e cantieri'], ['pdfFatture', 'Proponi gli allegati PDF come fatture fornitore (OCR)']].map((x) => `<label class="sw"><span>${x[1]}</span><input type="checkbox" data-acc-toggle="${x[0]}" data-id="${a.id}" ${a[x[0]] ? 'checked' : ''}></label>`).join('')}</div></div>
      <div class="stack" style="gap:6px"><button class="btn sm" data-act="acc-sync" data-id="${a.id}">${I('refresh')} Sincronizza ora</button><button class="btn sm ghost" data-act="toast" data-msg="Cartelle sincronizzate: Posta in arrivo, Inviata, Archivio; calendario principale">${I('settings')} Cartelle</button><button class="btn sm danger" data-act="acc-disconnect" data-id="${a.id}">Disconnetti</button></div></div>`).join('')}</div>
    ${senza.length ? `<div class="card"><h3>Collaboratori senza account collegato</h3>${senza.map((x) => `<div class="listrow"><span>${avatar(x.nome, 'sm')} <span class="b">${esc(x.nome)}</span> <span class="small muted">· ${esc(x.email)}</span></span><button class="btn sm" data-act="acc-invite" data-id="${x.id}">${I('send')} Invita a collegare</button></div>`).join('')}</div>` : ''}
    <div class="grid2"><div class="card"><h3>Cosa viene sincronizzato</h3><dl class="dl"><dt>Posta</dt><dd>In arrivo, inviata, bozze e archivio degli ultimi 6 mesi; poi in tempo reale (webhook). Gli allegati restano nel provider.</dd><dt>Calendario</dt><dd>Eventi letti e scritti nei due sensi: un sopralluogo creato qui compare in Outlook o Google e viceversa.</dd><dt>Contatti</dt><dd>Solo lettura: suggerisce indirizzi quando scrivi e completa le schede clienti.</dd><dt>Sicurezza</dt><dd>OAuth 2.0 con consenso dell'utente, token cifrati, revoca immediata con "Disconnetti".</dd></dl></div>
    <div class="card"><h3>Regole di associazione automatica</h3><p class="small muted">Come l'IA collega le e-mail alle schede del gestionale.</p><div class="stack small" style="margin-top:8px">${[['Mittente con e-mail di un cliente o fornitore', 'scheda cliente / fornitore'], ['Oggetto con numero offerta, fattura o cantiere (OF-, FA-, MC)', 'offerta / fattura / cantiere'], ['Allegato PDF che sembra una fattura', 'proposta in "Fatture fornitori" con OCR'], ['Richiesta di preventivo da sconosciuto', 'etichetta "Richiesta offerta" e bozza di offerta IA'], ['Newsletter e notifiche automatiche', 'etichetta "Newsletter", fuori dalla posta prioritaria']].map((x) => `<div class="listrow"><span>${x[0]}</span><span class="pill info">${x[1]}</span></div>`).join('')}</div></div></div>`;
}
function accountAddModal(m) {
  const step = m.step || 1; const p = PROVIDERS[m.provider] || PROVIDERS['Microsoft 365'];
  if (step === 1) return `<div class="row between"><h2>${I('plug')} Collega un account</h2><button class="btn sm" data-act="close">Chiudi</button></div><p class="small muted">Scegli il provider: verrai portato alla pagina di accesso del provider e potrai scegliere cosa condividere.</p>
    <div class="prov">${Object.entries(PROVIDERS).map(([k, v]) => `<button data-act="acc-step" data-id="${esc(k)}"><span class="acc-logo" style="background:${v.col}">${v.short}</span><span><div class="b">${esc(k)}</div><div class="small muted">${v.desc}</div></span></button>`).join('')}</div>`;
  if (step === 2) return `<div class="row between"><h2>${I('lock')} Autorizza ${esc(m.provider)}</h2><button class="btn sm" data-act="close">Chiudi</button></div>
    <form class="consent" data-act="acc-consent"><div class="ch" style="background:${p.col}"><span class="acc-logo" style="background:rgba(255,255,255,.25);width:32px;height:32px;font-size:.9rem">${p.short}</span>Accedi con ${esc(m.provider.split(' ')[0])}</div><div class="cb"><div><label for="acc-email">Account</label><input id="acc-email" name="email" type="email" value="${esc(m.email || me().email)}" required></div><p class="small" style="margin:0"><b>Capomastro</b> chiede l'autorizzazione a:</p><ul><li>Leggere e inviare e-mail per tuo conto</li><li>Leggere e creare eventi nel calendario</li><li>Leggere i contatti</li><li>Ricevere notifiche quando arriva nuova posta</li></ul><p class="small muted" style="margin:0">La password non viene mai trasmessa al gestionale. Puoi revocare l'accesso in qualsiasi momento.</p><div class="row between"><button type="button" class="btn" data-act="acc-step" data-id="">Indietro</button><button class="btn primary" type="submit">Consenti</button></div></div></form>`;
  return `<div class="row between"><h2>${I('check')} Cosa sincronizzare</h2><button class="btn sm" data-act="close">Chiudi</button></div><p class="small muted">${esc(m.email)} · ${esc(m.provider)} autorizzato.</p>
    <div class="card"><div class="stack" style="gap:2px">${[['mail', 'Posta (in arrivo, inviata, bozze, archivio)', true], ['calendar', 'Calendario principale', true], ['contacts', 'Contatti', m.provider !== 'IMAP / SMTP'], ['condiviso', 'Condividi con tutto l\'ufficio', true], ['autoRel', 'Associa automaticamente a clienti, fornitori e cantieri', true], ['pdfFatture', 'Proponi gli allegati PDF come fatture fornitore', false]].map((x) => `<label class="sw"><span>${x[1]}</span><input type="checkbox" data-acc-opt="${x[0]}" ${(m.opts || {})[x[0]] ?? x[2] ? 'checked' : ''}></label>`).join('')}</div><div style="margin-top:10px"><label>Importa lo storico</label><select data-acc-opt="storico" style="max-width:260px"><option>Ultimi 6 mesi</option><option>Ultimi 30 giorni</option><option>Tutto</option></select></div></div>
    <div class="row between"><button class="btn" data-act="acc-step" data-id="${esc(m.provider)}">Indietro</button><button class="btn primary" data-act="acc-finish">Collega account</button></div>`;
}

// ---------- compose con scelta account ----------
function composeModal(m) {
  ensureAcc(); const accs = mailAccounts(); if (!m.account || !accs.some((a) => a.id === m.account)) m.account = defaultAccount(); const acc = accById(m.account);
  return `<form data-act="compose-send" class="stack"><div class="row between"><h2>${I('mail')} Nuova e-mail</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div class="full"><label for="c-from">Da</label><select id="c-from" data-act-change="compose-acc">${accs.map((a) => `<option value="${a.id}" ${a.id === m.account ? 'selected' : ''}>${esc(a.email)} · ${esc(a.provider)}${a.owner !== me().id ? ' (condiviso)' : ''}</option>`).join('')}</select></div><div class="full"><label for="c-to">A</label><input id="c-to" name="a" value="${esc(m.a || '')}" required autocomplete="off" list="c-contacts"><datalist id="c-contacts">${[...DB.clienti.map((k) => [k.email, k.nome]), ...DB.fornitori.map((f) => [f.email, f.nome])].map((x) => `<option value="${esc(x[0])}">${esc(x[1])}</option>`).join('')}</datalist></div><div><label for="c-cc">Cc</label><input id="c-cc" name="cc" value="${esc(m.cc || '')}"></div><div><label for="c-tpl">Modello</label><select id="c-tpl" data-act-change="tpl"><option value="">Nessuno</option><option value="sollecito">Sollecito pagamento</option><option value="appuntamento">Conferma appuntamento</option><option value="offerta">Invio offerta</option><option value="variazione">Variazione da approvare</option><option value="ordine">Ordine a fornitore</option><option value="capitolato">Domande sul capitolato</option></select></div>
    <div class="full"><label for="c-sub">Oggetto</label><input id="c-sub" name="oggetto" value="${esc(m.oggetto || '')}" required></div><div class="full"><label for="c-body">Testo</label><textarea id="c-body" name="testo" rows="9">${esc(m.testo || '')}</textarea></div>
    <div class="full"><label>Allegati</label><div class="row">${(m.allegati || []).map((a) => `<span class="chip">${I('attach')} ${esc(a)}</span>`).join('')}<label class="btn sm" style="cursor:pointer">+ Allega file<input type="file" multiple style="display:none" data-act-change="attach"></label></div></div></div>
    <div class="row between"><span class="small muted">Da ${esc(acc.email)} · inviata tramite ${esc(acc.provider)} · firma: ${esc(me().nome)}</span><div class="row"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">${I('send')} Invia</button></div></div></form>`;
}
function sendCompose(form) {
  const m = S.modal; const fdata = new FormData(form); const a = fdata.get('a'), oggetto = fdata.get('oggetto'), testo = fdata.get('testo');
  if (!a || !oggetto) { toast('Indica destinatario e oggetto'); return; }
  const acc = accById(m.account || defaultAccount());
  const rel = m.rel || (() => { const k = DB.clienti.find((c) => c.email === a); if (k) return { t: 'cliente', id: k.id }; const f = DB.fornitori.find((x) => x.email === a); return f ? { t: 'fornitore', id: f.id } : null; })();
  DB.email.unshift({ id: uid('E'), rel, account: acc.id, folder: 'Sent', da: acc.email || me().email, a, cc: fdata.get('cc') || '', oggetto, data: nowISO().replace('T', ' ').slice(0, 16), unread: false, testo, allegati: m.allegati || [], labels: [] });
  if (rel) { DB.attivita.unshift({ id: uid('AT'), tipo: 'E-mail', rel, titolo: 'Inviata e-mail: ' + oggetto, data: D.TODAY_ISO, ora: nowHM(), chi: S.user.wid, esito: '', done: true }); if (rel.t === 'cliente') cliente(rel.id).ultimoContatto = D.TODAY_ISO; }
  S.modal = null; toast('E-mail inviata da ' + (acc.email || me().email) + ' a ' + a);
}

// ---------- Inbox ----------
const fromName = (s) => (s || '').replace(/<[^>]*>/g, '').trim() || s;
const fromAddr = (s) => (String(s).match(/<([^>]+)>/) || [null, s])[1];
function mailIntents(m) {
  const t = (m.oggetto + ' ' + m.testo).toLowerCase(); const out = [];
  if (/richiesta offerta|preventivo|offerta per/.test(t)) out.push('Richiesta offerta');
  if (/rechnung|fattura n|fattura \d|invoice|zahlbar/.test(t)) out.push('Fattura fornitore');
  if (/pagamento|bonifico|accredit|valuta/.test(t)) out.push('Pagamento');
  if (/candidatur|cv\b|curriculum/.test(t)) out.push('Candidatura');
  if (/autorizzazion|approvat/.test(t)) out.push('Autorizzazione');
  if (/conferm/.test(t)) out.push('Conferma');
  if (/\?/.test(m.testo)) out.push('Domanda');
  if (/newsletter|novità|scoprite/.test(t)) out.push('Newsletter');
  if (/premi|polizza|assicuraz/.test(t)) out.push('Assicurazione');
  return out.length ? out : ['Informazione'];
}
function mailSummary(m) {
  const lines = m.testo.split('\n').map((x) => x.trim()).filter(Boolean).filter((l) => !/^(buongiorno|buonasera|gentile|gentili|ciao|salve|guten tag|cordiali|freundliche|grazie$)/i.test(l));
  const body = lines.join(' ').replace(/\s+/g, ' '); const cut = body.slice(0, 210); const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '));
  const sum = body.length > 210 ? cut.slice(0, end > 80 ? end + 1 : 210) + (end > 80 ? '' : '…') : body;
  const todo = mailIntents(m).filter((i) => ['Richiesta offerta', 'Fattura fornitore', 'Domanda'].includes(i));
  return { sum, todo: todo.length ? (todo[0] === 'Richiesta offerta' ? 'Da fare: sopralluogo e offerta entro 2 giorni' : todo[0] === 'Fattura fornitore' ? 'Da fare: registrare la fattura e assegnarla al cantiere' : 'Da fare: rispondere con la data richiesta') : '' };
}
function aiReplyFor(m) {
  const it = mailIntents(m); const n = fromName(m.da).split(' ').slice(-1)[0]; const w = me(); const sal = /^(arch\.|ing\.)/i.test(fromName(m.da)) ? fromName(m.da).split(' ').slice(0, 2).join(' ') : 'signor/a ' + n;
  let t = '';
  if (it.includes('Richiesta offerta')) t = `Gentile ${sal},\n\ngrazie per la richiesta. Propongo un sopralluogo la prossima settimana (giovedì o venerdì mattina) per verificare superfici e fondi; l'offerta dettagliata seguirà entro due giorni lavorativi dal sopralluogo.\n\nResto a disposizione per fissare l'orario.\n\nCordiali saluti\n${w.nome}\nMY COLOR Isella & Foletti SA`;
  else if (it.includes('Fattura fornitore')) t = `Buongiorno,\n\nconfermiamo la ricezione della fattura, registrata sul cantiere di riferimento. Il pagamento avverrà entro i termini concordati (30 giorni).\n\nCordiali saluti\n${w.nome}`;
  else if (it.includes('Pagamento')) t = `Gentili signori,\n\nvi ringraziamo per la conferma del pagamento, che abbiamo registrato. Restiamo a disposizione.\n\nCordiali saluti\n${w.nome}`;
  else if (it.includes('Candidatura')) t = `Gentile ${sal},\n\ngrazie per la candidatura e per l'interesse verso la nostra impresa. La contatteremo nei prossimi giorni per un colloquio in sede a Bioggio.\n\nCordiali saluti\n${w.nome}`;
  else if (it.includes('Domanda')) { const c = m.rel && m.rel.t === 'cantiere' ? cant(m.rel.id) : DB.cantieri.find((x) => x.stato === 'In corso' && (m.oggetto + m.testo).toLowerCase().includes(x.nome.toLowerCase().split(' ').pop().toLowerCase())); t = `Gentile ${sal},\n\n${c ? `per ${c.nome} confermiamo la fine lavori entro il ${fd(addDays(D.TODAY_ISO, Math.max(5, Math.round((100 - c.avanzamento) / 4))))}, salvo imprevisti.` : 'confermo quanto richiesto: la prossima settimana va bene, le propongo martedì mattina.'}\n\nCordiali saluti\n${w.nome}`; }
  else t = `Gentile ${sal},\n\ngrazie per il messaggio, ricevuto. Le rispondo nel dettaglio entro domani.\n\nCordiali saluti\n${w.nome}`;
  return t;
}
function vInbox() {
  ensureAcc(); const X = S.inbox || (S.inbox = { folder: 'inbox', acc: 'all', label: '', q: '', open: null });
  const all = DB.email; const accs = DB.accounts.filter((a) => a.servizi.includes('mail'));
  const inFolder = (m) => X.folder === 'inbox' ? m.folder === 'Inbox' : X.folder === 'unread' ? m.folder === 'Inbox' && m.unread : X.folder === 'attach' ? m.allegati.length > 0 && m.folder !== 'Trash' : X.folder === 'sent' ? m.folder === 'Sent' : X.folder === 'draft' ? m.folder === 'Draft' : X.folder === 'archive' ? m.folder === 'Archive' : X.folder === 'trash' ? m.folder === 'Trash' : m.folder !== 'Trash';
  const labelOf = (m) => m.rel ? (m.rel.t === 'cliente' ? 'Clienti' : m.rel.t === 'fornitore' ? 'Fornitori' : 'Cantieri') : '';
  const q = X.q.toLowerCase().trim();
  const list = all.filter((m) => inFolder(m) && (X.acc === 'all' || m.account === X.acc) && (!X.label || labelOf(m) === X.label || (m.labels || []).includes(X.label)) && (!q || (m.oggetto + ' ' + m.da + ' ' + m.a + ' ' + m.testo).toLowerCase().includes(q))).sort((a, b) => b.data.localeCompare(a.data));
  const cnt = (f) => all.filter(f).length; const unreadTot = cnt((m) => m.folder === 'Inbox' && m.unread);
  const folders = [['inbox', 'In arrivo', 'inbox', unreadTot], ['unread', 'Non lette', 'dot', 0], ['attach', 'Con allegati', 'attach', 0], ['sent', 'Inviate', 'send', 0], ['draft', 'Bozze', 'edit', cnt((m) => m.folder === 'Draft')], ['archive', 'Archivio', 'archive', 0], ['trash', 'Cestino', 'trash', 0]];
  const labels = ['Clienti', 'Fornitori', 'Cantieri', 'Richiesta offerta', 'Fatture fornitori', 'Pagamenti', 'Candidature', 'Autorità', 'Assicurazioni', 'Banca', 'Newsletter'];
  const open = X.open ? all.find((m) => m.id === X.open) : null; if (open && open.unread) open.unread = false;
  const chosen = selOf('inbox');
  const when = (d) => d.startsWith(D.TODAY_ISO) ? d.slice(11, 16) : fshort(d.slice(0, 10));
  const row = (m) => { const acc = accById(m.account); const nm = m.folder === 'Sent' || m.folder === 'Draft' ? 'A: ' + fromName(m.a) : fromName(m.da); return `<div class="mrow ${m.unread ? 'unread' : ''} ${open && open.id === m.id ? 'on' : ''}" data-act="inbox-open" data-id="${m.id}"><input type="checkbox" data-sel="inbox" data-id="${m.id}" ${chosen.includes(m.id) ? 'checked' : ''} aria-label="Seleziona"><span class="avatar sm" style="background:${acc.colore}" data-tip="${esc(acc.nome + ' · ' + acc.email)}">${initials(nm.replace(/^A: /, ''))}</span><div class="mb"><div class="row between nowrap" style="gap:6px"><span class="n">${esc(nm)}</span><span class="small muted num" style="white-space:nowrap">${when(m.data)}</span></div><div class="s">${esc(m.oggetto)}</div><div class="p">${esc(m.testo.replace(/\s+/g, ' ').slice(0, 90))}</div><div class="row" style="gap:4px;margin-top:3px">${m.folder === 'Draft' ? '<span class="pill warn">Bozza</span>' : ''}${m.allegati.length ? `<span class="pill">${I('attach')} ${m.allegati.length}</span>` : ''}${labelOf(m) ? pill(labelOf(m)) : ''}${(m.labels || []).map((l) => `<span class="pill info">${esc(l)}</span>`).join('')}</div></div></div>`; };
  let detail = '';
  if (open) {
    const acc = accById(open.account); const it = mailIntents(open); const sm = mailSummary(open); const isLead = it.includes('Richiesta offerta') && open.folder === 'Inbox'; const isInv = open.allegati.some((a) => /\.pdf$/i.test(a) && /fattura|rechnung|_1\d{3}/i.test(a));
    const thread = all.filter((m) => m.id !== open.id && ((open.rel && m.rel && m.rel.t === open.rel.t && m.rel.id === open.rel.id) || fromAddr(m.da) === fromAddr(open.da) || m.a === fromAddr(open.da))).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
    detail = `<div class="row between nowrap"><button class="btn sm ghost mback" data-act="inbox-back">‹ Elenco</button><span class="small muted">${open.folder === 'Inbox' ? 'Posta in arrivo' : open.folder === 'Sent' ? 'Posta inviata' : open.folder}</span><div class="row nowrap" style="gap:4px"><button class="iconbtn sm" data-act="inbox-unread" data-id="${open.id}" data-tip="Segna come non letta">${I('mail')}</button><button class="iconbtn sm" data-act="inbox-archive" data-id="${open.id}" data-tip="Archivia">${I('archive')}</button><button class="iconbtn sm" data-act="inbox-del" data-id="${open.id}" data-tip="Elimina">${I('trash')}</button></div></div>
      <h2>${esc(open.oggetto)}</h2>
      <div class="mhead"><span class="avatar" style="background:${acc.colore}">${initials(fromName(open.da))}</span><div style="min-width:0"><div class="b">${esc(fromName(open.da))} <span class="muted small">&lt;${esc(fromAddr(open.da))}&gt;</span></div><div class="small muted">A: ${esc(open.a)}${open.cc ? ' · Cc: ' + esc(open.cc) : ''} · ${fdt(open.data)}</div><div class="row" style="margin-top:4px;gap:6px"><span class="acc-chip static"><i style="background:${acc.colore}"></i>${esc(acc.nome)}</span>${open.rel ? `<button class="btn sm ghost" data-act="${relAct(open.rel)}" data-id="${esc(open.rel.id)}">${I('open')} ${esc(relName(open.rel))}</button>` : '<span class="small muted">Nessuna scheda collegata</span>'}</div></div></div>
      <div class="row"><button class="btn primary sm" data-act="inbox-reply" data-id="${open.id}">${I('reply')} Rispondi</button><button class="btn sm" data-act="inbox-forward" data-id="${open.id}">${I('forward')} Inoltra</button><button class="btn sm" data-act="email-to-activity" data-id="${open.id}">${I('alarm')} Attività</button>${isLead ? `<button class="btn sm" data-act="inbox-to-offer" data-id="${open.id}">${I('sparkles')} Crea offerta con IA</button>` : ''}${isInv ? `<button class="btn sm" data-act="ocr-open" data-sample="0">${I('scan')} Registra fattura</button>` : ''}<select data-act-change="inbox-link" data-id="${open.id}" style="width:auto;padding:5px 8px;font-size:.8rem"><option value="">${I('link') ? '' : ''}Collega a cantiere…</option>${DB.cantieri.filter((c) => c.stato !== 'Concluso').map((c) => `<option value="${c.id}" ${open.rel && open.rel.t === 'cantiere' && open.rel.id === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></div>
      <div class="aibox"><div class="row between"><span class="b">${I('sparkles')} Riassunto IA</span><span class="small muted">${it.map((x) => `<span class="pill">${esc(x)}</span>`).join(' ')}</span></div><p class="small">${esc(sm.sum)}</p>${sm.todo ? `<p class="small b">${esc(sm.todo)}</p>` : ''}<div class="row"><button class="btn sm" data-act="inbox-ai-reply" data-id="${open.id}">${I('reply')} Suggerisci risposta</button>${sm.todo ? `<button class="btn sm ghost" data-act="email-to-activity" data-id="${open.id}">+ Promemoria</button>` : ''}</div></div>
      <pre class="mbody">${esc(open.testo)}</pre>
      ${open.allegati.length ? `<div class="row">${open.allegati.map((a) => `<button class="chip att" data-act="toast" data-msg="Anteprima di ${esc(a)} (apre dal provider)">${I('attach')} ${esc(a)}</button>`).join('')}</div>` : ''}
      ${thread.length ? `<div><div class="eyebrow" style="margin-bottom:6px">Stesso contatto</div>${thread.map((m) => `<div class="listrow click" data-act="inbox-open" data-id="${m.id}"><span style="min-width:0"><span class="small muted">${m.folder === 'Sent' ? '↗' : '↙'} ${fdt(m.data)}</span><br><span class="${m.unread ? 'b' : ''}">${esc(m.oggetto)}</span></span><span class="muted">›</span></div>`).join('')}</div>` : ''}`;
  } else detail = `<div class="mempty">${I('mail')}<p class="b">Seleziona un'e-mail</p><p class="small">${unreadTot} non lette · ${accs.length} account collegati · sincronizzato ${fdt(DB.accounts[0].ultimaSync).slice(-5)}</p></div>`;
  const lastSync = DB.accounts.reduce((a, x) => x.ultimaSync > a ? x.ultimaSync : a, '');
  return `<div class="pagehead"><div><div class="eyebrow">Comunicazione</div><h1>Inbox</h1><p class="muted">Tutta la posta dell'ufficio in un posto solo: Outlook e Gmail di ogni collaboratore, già collegata a clienti, fornitori e cantieri.</p></div><div class="row"><button class="btn" data-act="inbox-sync">${I('refresh')} Sincronizza</button><button class="btn primary" data-act="inbox-compose">${I('edit')} Nuova e-mail</button></div></div>
  ${selbar('inbox', null, [{ label: I('check') + ' Segna lette', act: 'inbox-read' }, { label: I('archive') + ' Archivia', act: 'inbox-archive' }, { label: I('trash') + ' Elimina', act: 'inbox-del', cls: 'danger' }])}
  <div class="mail ${open ? 'open' : ''}"><aside class="mnav">${folders.map((f) => `<button class="fb ${X.folder === f[0] ? 'on' : ''}" data-act="inbox-folder" data-id="${f[0]}">${I(f[2])}${f[1]}${f[3] ? `<span class="cnt">${f[3]}</span>` : ''}</button>`).join('')}
      <div class="sep">Account</div><button class="fb ${X.acc === 'all' ? 'on' : ''}" data-act="inbox-acc" data-id="all">${I('users')}Tutti</button>${accs.map((a) => `<button class="fb ${X.acc === a.id ? 'on' : ''}" data-act="inbox-acc" data-id="${a.id}" data-tip="${esc(a.email + ' · ' + a.provider)}"><i class="dotc" style="background:${a.colore}"></i>${esc(a.nome.split(' · ')[0])}${cnt((m) => m.account === a.id && m.folder === 'Inbox' && m.unread) ? `<span class="cnt">${cnt((m) => m.account === a.id && m.folder === 'Inbox' && m.unread)}</span>` : ''}</button>`).join('')}<button class="fb" data-act="nav" data-id="impostazioni" data-tab="account">${I('plus')}Collega account</button>
      <div class="sep">Etichette</div>${labels.map((l) => `<button class="fb ${X.label === l ? 'on' : ''}" data-act="inbox-label" data-id="${esc(l)}">${I('dot')}${l}</button>`).join('')}</aside>
    <div class="mlist"><div class="mtop"><div class="search" style="max-width:none"><span class="ico">${I('search')}</span><input id="inbox-q" placeholder="Cerca in ${list.length} e-mail…" value="${esc(X.q)}" data-act-input="inbox-q" autocomplete="off"></div><div class="small muted" style="margin-top:6px">${list.length} e-mail${X.label ? ' · ' + esc(X.label) + ` <button class="lnk" data-act="inbox-label" data-id="">togli filtro</button>` : ''} · ultima sincronizzazione ${lastSync ? fdt(lastSync).slice(-5) : '–'}</div></div>${list.map(row).join('') || '<p class="muted small" style="padding:20px;text-align:center">Nessuna e-mail qui</p>'}</div>
    <div class="mdetail">${detail}</div></div>`;
}

// ---------- calendario con account collegati ----------
function vCalendario() {
  ensureAcc();
  const start = addDays('2026-11-02', S.calWeek * 7); const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(start, i));
  const who = S.sel.calWho || 'tutti'; const tipo = S.sel.calTipo || 'tutti'; const hidden = S.sel.calHide || [];
  const accs = DB.accounts.filter((a) => a.servizi.includes('calendar'));
  const evs = DB.eventi.filter((e) => (who === 'tutti' || e.partecipanti.includes(who)) && (tipo === 'tutti' || e.tipo === tipo) && !hidden.includes(e.account || 'int'));
  const mins = (hm) => +hm.slice(0, 2) * 60 + +hm.slice(3, 5);
  const col = (d) => evs.filter((e) => e.inizio.slice(0, 10) <= d && e.fine.slice(0, 10) >= d).map((e) => { const multi = e.inizio.slice(0, 10) !== e.fine.slice(0, 10); const top = multi ? 0 : Math.max(0, mins(e.inizio.slice(11)) - 420); const h = multi ? 40 : Math.max(28, mins(e.fine.slice(11)) - mins(e.inizio.slice(11))); const a = e.account ? accById(e.account) : null; return `<div class="ev ${e.tipo}" style="top:${top}px;height:${h}px;${a ? 'border-left-color:' + a.colore : ''}" data-act="open-evento" data-id="${e.id}" data-tip="${esc(e.titolo + '\n' + e.inizio.slice(11, 16) + '–' + e.fine.slice(11, 16) + (e.luogo ? ' · ' + e.luogo : '') + '\n' + e.partecipanti.map((p) => worker(p).nome.split(' ')[0]).join(', ') + '\n' + (a ? a.nome : 'Evento interno del gestionale'))}"><b>${multi ? '' : e.inizio.slice(11, 16) + ' '}${esc(e.titolo)}</b>${h > 40 ? `<span class="muted">${esc(e.luogo || '')}</span>` : ''}</div>`; }).join('');
  const prossimi = DB.eventi.filter((e) => e.inizio >= D.TODAY_ISO).sort((a, b) => a.inizio.localeCompare(b.inizio)).slice(0, 8);
  const lastSync = accs.reduce((a, x) => x.ultimaSync > a ? x.ultimaSync : a, '');
  return `<div class="pagehead"><div><div class="eyebrow">Calendario condiviso · ${fd(start)} – ${fd(days[6])}</div><h1>Calendario</h1><p class="muted">Appuntamenti da Outlook e Google Calendar di ogni collaboratore, più sopralluoghi, consegne e scadenze creati nel gestionale. Ogni colore è un account collegato.</p></div><div class="row"><button class="btn sm" data-act="cal-week" data-id="-1">‹</button><button class="btn sm" data-act="cal-week" data-id="0">Oggi</button><button class="btn sm" data-act="cal-week" data-id="1">›</button><button class="btn primary" data-act="new-entity" data-ent="evento" data-prefill='${esc(JSON.stringify({ giorno: D.TODAY_ISO, dalle: '09:00', alle: '10:00', outlook: true }))}'>+ Appuntamento</button></div></div>
  <div class="card" style="padding:10px 14px"><div class="row between"><div class="row" style="gap:6px"><span class="small muted">Calendari:</span>${accs.map((a) => `<button class="acc-chip ${hidden.includes(a.id) ? 'off' : ''}" data-act="cal-acc" data-id="${a.id}" data-tip="${esc(a.provider + ' · ' + a.email + '\n' + n0(a.nEventi) + ' eventi · sincronizzato ' + fdt(a.ultimaSync) + '\nClicca per nascondere o mostrare')}"><i style="background:${a.colore}"></i>${esc(a.nome)}</button>`).join('')}<button class="acc-chip ${hidden.includes('int') ? 'off' : ''}" data-act="cal-acc" data-id="int" data-tip="Eventi creati nel gestionale, non ancora sincronizzati"><i style="background:var(--muted)"></i>Interni</button></div><div class="row nowrap"><span class="pill good">${I('check')} sincronizzati alle ${lastSync ? fdt(lastSync).slice(-5) : '–'}</span><button class="btn sm" data-act="nav" data-id="impostazioni" data-tab="account">${I('settings')} Gestisci account</button></div></div></div>
  <div class="row"><select data-act-change="calWho" style="max-width:240px"><option value="tutti">Tutti i collaboratori</option>${DB.workers.filter((w) => w.ramo === 'U' || ['V', 'Q'].includes(w.cat)).map((w) => `<option value="${w.id}" ${who === w.id ? 'selected' : ''}>${esc(w.nome)}</option>`).join('')}</select><select data-act-change="calTipo" style="max-width:200px"><option value="tutti">Tutti i tipi</option>${['Riunione', 'Sopralluogo', 'Chiamata', 'Consegna', 'Cantiere', 'Scadenza', 'Interno', 'Assenza'].map((x) => `<option ${tipo === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
  <div class="calwrap"><div class="cal"><div class="hd"></div>${days.map((d) => `<div class="hd ${d === D.TODAY_ISO ? 'today' : ''}">${dow[new Date(d + 'T12:00').getDay()]}<small>${fshort(d)}</small></div>`).join('')}<div class="hours">${[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => `<span style="top:${(h - 7) * 60}px">${h}:00</span>`).join('')}</div>${days.map((d) => `<div class="col">${col(d)}</div>`).join('')}</div></div>
  <div class="grid2"><div class="card"><h3>Prossimi appuntamenti</h3>${eventList(prossimi)}</div><div class="card"><div class="row between"><h3>Promemoria e attività in scadenza</h3><button class="btn sm" data-act="nav" data-id="attivita">Tutte le attività</button></div>${activityList(DB.attivita.filter((a) => !a.done).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 6), { showRel: true })}</div></div>`;
}

// ---------- ricerca nel listino (editor offerta) ----------
const LST_CATS = [...new Set(LISTINO.map((p) => p.cat))];
function listinoRows(m) {
  const q = (m.lstQ || '').toLowerCase().trim(); const cat = m.lstCat || ''; const words = q.split(/\s+/).filter(Boolean);
  const rows = LISTINO.filter((p) => (!cat || p.cat === cat) && (!words.length || words.every((w) => (p.npk + ' ' + p.desc + ' ' + (p.k || []).join(' ') + ' ' + p.cat).toLowerCase().includes(w))));
  return rows.length ? rows.slice(0, 40).map((p) => `<button type="button" class="lrow" data-act="lst-add" data-id="${p.npk}" data-tip="${esc('Prezzo medio delle ultime ' + p.n + ' offerte: ' + chf(p.prezzo, 2) + '/' + p.un + '\nIntervallo storico ' + n2(p.min) + '–' + n2(p.max) + '\nClicca per aggiungere la posizione')}"><span class="num muted small">NPK ${p.npk}</span><span class="d">${esc(p.desc)}</span><span class="num b">${chf(p.prezzo, 2)}<span class="muted small">/${p.un}</span></span><span class="small muted">${p.n} offerte · ${n2(p.min)}–${n2(p.max)}</span></button>`).join('') : '<div class="muted small" style="padding:12px">Nessuna posizione trovata: prova con una parola sola (es. "soffitti", "rasatura", "facciata")</div>';
}
function listinoPicker(m) { return `<button type="button" class="btn sm ${m.lstOpen ? 'primary' : ''}" data-act="lst-toggle">${I('search')} ${m.lstOpen ? 'Chiudi listino' : 'Cerca nel listino'}</button>`; }
function listinoPanel(m) {
  if (!m.lstOpen) return '';
  return `<div class="lpanel"><div class="row between nowrap"><div class="search" style="max-width:none;flex:1"><span class="ico">${I('search')}</span><input id="lst-q" placeholder="Cerca una posizione: dispersione soffitti, rasatura, cartongesso, facciata…" value="${esc(m.lstQ || '')}" data-act-input="lst-q" autocomplete="off"></div><span class="small muted" style="white-space:nowrap">${LISTINO.length} posizioni NPK</span></div><div class="chips sm">${['', ...LST_CATS].map((c) => `<button type="button" data-act="lst-cat" data-id="${esc(c)}" class="${(m.lstCat || '') === c ? 'on' : ''}">${c || 'Tutte'}</button>`).join('')}</div><div class="llist" id="lst-list">${listinoRows(m)}</div></div>`;
}

// ---------- dashboard ----------
function sparkline(vals, color) {
  const W = 64, H = 22; const mx = Math.max(...vals), mn = Math.min(...vals); const pts = vals.map((v, i) => [i / (vals.length - 1) * (W - 4) + 2, H - 3 - ((v - mn) / ((mx - mn) || 1)) * (H - 8)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M${pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><circle cx="${pts[pts.length - 1][0].toFixed(1)}" cy="${pts[pts.length - 1][1].toFixed(1)}" r="2.6" fill="${color}"/></svg>`;
}
function kpi2(o) { return `<div class="kpi ${o.act ? 'click' : ''} ${o.spark ? 'has-spark' : ''}" ${o.act ? `data-act="${o.act}" data-id="${esc(o.id || '')}" ${o.tab ? `data-tab="${o.tab}"` : ''}` : ''} ${o.tip ? `data-tip="${esc(o.tip)}"` : ''}><div class="eyebrow">${o.l}</div>${o.spark || ''}<div class="v ${o.tn || ''} ${String(o.v).length > 9 ? 'long' : ''}">${o.v}</div>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}${o.act ? `<span class="go">${I('chevron')}</span>` : ''}</div>`; }
function chartChfOra(cs) {
  const W = 720, H = 240, pl = 44, pr = 96, pt = 16, pb = 48;
  const max = 110, iw = W - pl - pr, ih = H - pt - pb, bw = iw / Math.max(cs.length, 1);
  const y = (v) => pt + ih - v / max * ih;
  let s = `<svg class="svgchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="CHF per ora realizzati per cantiere">`;
  [0, 25, 50, 75, 100].forEach((v) => { s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
  cs.forEach((c, i) => {
    const r = calc(c); const x = pl + i * bw + bw * 0.2; const w = bw * 0.6; const v = Math.max(0, Math.min(r.chfOra, max));
    const lab = c.nome.length > 16 ? c.nome.slice(0, 15) + '…' : c.nome;
    s += `<g class="hb" data-act="open-cantiere" data-id="${c.id}" data-tip="${esc(c.nome + ' · ' + c.comune + '\n' + chf(r.chfOra, 1) + '/h realizzati (' + (r.chfOra >= P.tariffaVenditaOra ? 'sopra tariffa' : r.chfOra >= P.breakEvenOra ? 'tra break-even e tariffa' : 'sotto break-even') + ')\nmaturato ' + chf(r.maturato) + ' · costi ' + chf(r.costi) + '\nmargine ' + chf(r.margine) + ' (' + pct(r.margPct) + ')\nClicca per aprire il cantiere')}"><rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" fill="${chfColor(r.chfOra)}"/><text x="${x + w / 2}" y="${y(v) - 5}" text-anchor="middle" style="font-weight:600;fill:var(--ink)">${Math.round(r.chfOra)}</text><text x="${x + w / 2}" y="${H - pb + 16}" text-anchor="middle">${esc(lab)}</text><text x="${x + w / 2}" y="${H - pb + 30}" text-anchor="middle" style="fill:var(--muted);font-size:10px">${esc(c.comune)}</text></g>`;
  });
  s += `<line class="ref" x1="${pl}" x2="${W - pr}" y1="${y(P.breakEvenOra)}" y2="${y(P.breakEvenOra)}"/><text x="${W - pr + 6}" y="${y(P.breakEvenOra) + 4}">break-even ${P.breakEvenOra}</text>`;
  s += `<line class="ref" x1="${pl}" x2="${W - pr}" y1="${y(P.tariffaVenditaOra)}" y2="${y(P.tariffaVenditaOra)}"/><text x="${W - pr + 6}" y="${y(P.tariffaVenditaOra) + 4}">tariffa ${P.tariffaVenditaOra}</text>`;
  return s + '</svg>';
}
function chartMensile() {
  const M = D.MENSILE; const W = 720, H = 230, pl = 50, pr = 10, pt = 22, pb = 28; const iw = W - pl - pr, ih = H - pt - pb; const max = 600000; const bw = iw / M.length;
  const y = (v) => pt + ih - v / max * ih;
  let s = `<svg class="svgchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fatturato e costi mensili 2026">`;
  [0, 150000, 300000, 450000, 600000].forEach((v) => { s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v ? n0(v / 1000) + 'k' : '0'}</text>`; });
  M.forEach((m, i) => {
    const x0 = pl + i * bw; const w = bw * 0.3; const marg = m.fatturato - m.costi; const mp = marg / m.fatturato * 100;
    s += `<g class="hb" data-act="nav" data-id="contabilita" data-tip="${esc(m.m + ' 2026' + (m.parziale ? ' (in corso)' : '') + '\nFatturato ' + chf(m.fatturato) + '\nCosti ' + chf(m.costi) + '\nMargine ' + chf(marg) + ' (' + pct(mp) + ')\n' + n0(m.ore) + ' ore lavorate · ' + chf(m.fatturato / m.ore, 1) + '/h')}"><rect x="${x0 + bw * 0.15}" y="${y(m.fatturato)}" width="${w}" height="${y(0) - y(m.fatturato)}" rx="3" fill="var(--brand)" ${m.parziale ? 'opacity=".55" stroke="var(--brand)" stroke-dasharray="3 2"' : ''}/><rect x="${x0 + bw * 0.15 + w + 2}" y="${y(m.costi)}" width="${w}" height="${y(0) - y(m.costi)}" rx="3" fill="var(--ink-2)" opacity="${m.parziale ? '.3' : '.45'}"/><text class="lab" x="${x0 + bw / 2}" y="${y(Math.max(m.fatturato, m.costi)) - 6}" text-anchor="middle">${pct(mp)}</text><text x="${x0 + bw / 2}" y="${H - pb + 16}" text-anchor="middle">${m.m}</text></g>`;
  });
  return s + '</svg>';
}
function vHome() {
  ensureAcc();
  const inCorso = DB.cantieri.filter((c) => c.stato === 'In corso');
  const rs = inCorso.map(calc);
  const maturato = rs.reduce((a, r) => a + r.maturato, 0), margine = rs.reduce((a, r) => a + r.margine, 0);
  const ore = inCorso.reduce((a, c) => a + c.oreFatte, 0) || 1;
  const chfOra = rs.reduce((a, r, i) => a + r.chfOra * inCorso[i].oreFatte, 0) / ore;
  const daApp = DB.bollettini.filter((b) => b.stato === 'Inviato');
  const anomalie = DB.bollettini.filter((b) => b.anomalia && b.stato !== 'Approvato');
  const oreSett = DB.bollettini.filter((b) => b.data >= '2026-11-02').reduce((a, b) => a + b.ore, 0);
  const sotto = inCorso.filter((c) => calc(c).chfOra < P.breakEvenOra);
  const attesaFirma = DB.offerte.filter((o) => o.stato === 'In attesa firma');
  const daAssegnare = DB.fattForn.filter((f) => !f.cantiere);
  const scadute = DB.fatture.filter((f) => f.stato === 'Scaduta' || (f.stato === 'Inviata' && f.scadenza < D.TODAY_ISO));
  const aperte = DB.fatture.filter((f) => ['Inviata', 'Scaduta'].includes(f.stato));
  const capOpen = DB.capitolati.filter((c) => c.domande.some((d) => d.stato === 'Aperta'));
  const oggiAtt = DB.attivita.filter((a) => !a.done && a.data <= D.TODAY_ISO);
  const oggiEv = DB.eventi.filter((e) => e.inizio.startsWith(D.TODAY_ISO) && e.partecipanti.includes(S.user.wid)).sort((a, b) => a.inizio.localeCompare(b.inizio));
  const unreadMail = DB.email.filter((m) => m.folder === 'Inbox' && m.unread);
  const openOff = DB.offerte.filter((o) => ['Richiesta', 'Sopralluogo', 'Bozza', 'In attesa firma'].includes(o.stato)); const pipeVal = openOff.reduce((a, o) => a + (o.preventivo || 0), 0);
  const chiuse = DB.offerte.filter((o) => ['Deliberata', 'Fatturata', 'Persa'].includes(o.stato)); const tasso = chiuse.length ? chiuse.filter((o) => o.stato !== 'Persa').length / chiuse.length * 100 : 0;
  const M = D.MENSILE; const ytdF = M.reduce((a, m) => a + m.fatturato, 0), ytdM = M.reduce((a, m) => a + m.fatturato - m.costi, 0);
  const alerts = [
    ...sotto.map((c) => ({ t: 'bad', m: `<span class="t b">${esc(c.nome)}</span> è sotto il break-even: ${chf(calc(c).chfOra, 1)}/h contro ${P.breakEvenOra} richiesti.`, act: 'open-cantiere', id: c.id })),
    ...scadute.map((f) => ({ t: 'bad', m: `Fattura <span class="t b">${f.id}</span> ${esc(cliente(f.clienteId).nome)} scaduta: ${chf(f.importo)}.`, act: 'open-fattura', id: f.id })),
    ...anomalie.slice(0, 2).map((b) => ({ t: 'warn', m: `<span class="t b">${esc(worker(b.workerId).nome)}</span>, bollettino del ${fshort(b.data)}: ${b.anomalia}.`, act: 'nav', id: 'bollettini' })),
    ...attesaFirma.map((o) => ({ t: 'warn', m: `Offerta <span class="t b">${o.id}</span> (${esc(cliente(o.clienteId).nome)}) in attesa di firma dal ${fd(o.firma.data)}.`, act: 'open-offerta', id: o.id })),
    ...(unreadMail.length ? [{ t: 'info', m: `<span class="t b">${unreadMail.length} e-mail non lette</span> in Inbox: ${esc(unreadMail.slice(0, 2).map((m) => fromName(m.da).split(' ').slice(-1)[0] + ' (' + m.oggetto.slice(0, 28) + (m.oggetto.length > 28 ? '…' : '') + ')').join(', '))}.`, act: 'nav', id: 'inbox' }] : []),
    ...scadAlerts(),
    ...capOpen.slice(0, 1).map((c) => ({ t: 'info', m: `Capitolato <span class="t b">${esc(c.titolo)}</span>: ${c.domande.filter((d) => d.stato === 'Aperta').length} domande aperte da chiarire.`, act: 'open-capitolato', id: c.id })),
    ...fattReminders().filter((r) => r.tipo === 'crea' || r.tipo.startsWith('soll')).slice(0, 2).map((r) => ({ t: r.tipo === 'crea' ? 'info' : 'warn', m: `<span class="t b">${r.tipo === 'crea' ? 'Da fatturare' : 'Sollecito'}:</span> ${esc(r.testo)}`, act: r.act, id: r.id })),
    ...daAssegnare.map((f) => ({ t: 'info', m: `Fattura <span class="t b">${esc(fornitore(f.fornitoreId).nome)} ${chf(f.importo)}</span> senza cantiere assegnato.`, act: 'open-ff', id: f.id })),
  ];
  // pipeline
  const phases = OFF_COLS.map((c) => { const l = DB.offerte.filter((o) => o.stato === c[0]); return { k: c[0], label: c[1], n: l.length, val: l.reduce((a, o) => a + (o.preventivo || 0), 0), lost: c[2] === 'lost' }; });
  const pmax = Math.max(...phases.map((p) => p.val), 1);
  const pcol = (p) => p.lost ? 'var(--bad)' : p.k === 'Deliberata' ? 'var(--good)' : p.k === 'Fatturata' ? 'var(--muted)' : p.k === 'In attesa firma' ? 'var(--warn)' : 'var(--info)';
  // scadenze incassi
  const dd = (f) => Math.round((new Date(D.TODAY_ISO) - new Date(f.scadenza)) / 864e5);
  const buckets = [['Non scadute', (f) => dd(f) <= 0, 'var(--good)'], ['1–15 giorni', (f) => dd(f) > 0 && dd(f) <= 15, 'var(--warn)'], ['16–30 giorni', (f) => dd(f) > 15 && dd(f) <= 30, 'var(--warn)'], ['Oltre 30 giorni', (f) => dd(f) > 30, 'var(--bad)']].map((b) => { const l = aperte.filter(b[1]); return { label: b[0], color: b[2], n: l.length, val: l.reduce((a, f) => a + f.importo, 0), list: l }; });
  const bmax = Math.max(...buckets.map((b) => b.val), 1); const apertoTot = aperte.reduce((a, f) => a + f.importo, 0);
  // squadra oggi
  const ops = DB.workers.filter((w) => w.ramo !== 'U');
  const assenti = DB.assenze.filter((a) => a.dal <= D.TODAY_ISO && a.al >= D.TODAY_ISO && a.stato !== 'Rifiutata');
  const where = {}; ops.forEach((w) => { if (assenti.some((a) => a.workerId === w.id)) return; const c = cantiereDi(w.id, D.TODAY_ISO); if (c) (where[c.id] = where[c.id] || []).push(w); });
  const bolOggi = DB.bollettini.filter((b) => b.data === D.TODAY_ISO).length; const inCant = Object.values(where).reduce((a, l) => a + l.length, 0);
  return `<div class="pagehead"><div><div class="eyebrow">${flong(D.TODAY_ISO)} 2026</div><h1>${t('hello')} ${esc(me().nome.split(' ')[0])}</h1></div><div class="row"><button class="btn" data-act="new-offerta" data-ai="1">${I('sparkles')} Offerta con IA</button><button class="btn primary" data-act="nav" data-id="bollettini">Approva bollettini (${daApp.length})</button></div></div>
  <div class="kpis">
    ${kpi2({ l: 'Margine in corso', v: chf(margine), sub: pct(margine / (maturato || 1) * 100) + ' su ' + chf(maturato) + ' maturati', tn: margine / (maturato || 1) > 0.15 ? 'good' : 'warn', act: 'open-kpi', id: 'margine', tip: 'Ricavo maturato meno ore, materiale e terzi dei ' + inCorso.length + ' cantieri in corso.\nClicca per l\'analisi mese per mese con trend', spark: sparkline(M.map((m) => (m.fatturato - m.costi) / m.fatturato), 'var(--good)') })}
    ${kpi2({ l: 'CHF/ora realizzati', v: chf(chfOra, 1), sub: 'break-even ' + P.breakEvenOra + ' · tariffa ' + P.tariffaVenditaOra, tn: chfTone(chfOra), act: 'open-kpi', id: 'chfora', tip: 'Media ponderata sulle ore dei cantieri in corso.\n' + sotto.length + ' cantier' + (sotto.length === 1 ? 'e' : 'i') + ' sotto il break-even.\nClicca per l\'analisi mensile', spark: sparkline(M.map((m) => m.fatturato / m.ore), 'var(--warn)') })}
    ${kpi2({ l: 'Fatturato 2026', v: 'CHF ' + n2(ytdF / 1e6) + ' mio', sub: 'margine ' + chf(ytdM) + ' (' + pct(ytdM / ytdF * 100) + ')', act: 'open-kpi', id: 'fatturato', tip: 'Da gennaio a oggi, da SelectLine.\nClicca per l\'analisi mensile con trend', spark: sparkline(M.slice(0, 10).map((m) => m.fatturato), 'var(--brand)') })}
    ${kpi2({ l: 'Ore settimana', v: n0(oreSett) + ' h', sub: inCant + ' operai su ' + Object.keys(where).length + ' cantieri oggi', act: 'open-kpi', id: 'ore', tip: 'Ore dai bollettini della settimana.\nClicca per l\'andamento mensile delle ore' })}
    ${kpi2({ l: 'Bollettini da approvare', v: daApp.length, sub: anomalie.length + ' con anomalia', tn: anomalie.length ? 'warn' : '', act: 'open-kpi', id: 'bollettini', tip: 'Bollettini inviati dagli operai in attesa di approvazione.\nClicca per approvarli' })}
    ${kpi2({ l: 'Fatture aperte', v: chf(apertoTot), sub: aperte.length + ' fatture · ' + scadute.length + ' scadute', tn: scadute.length ? 'bad' : '', act: 'open-kpi', id: 'fatture', tip: 'Fatture inviate e non ancora incassate.\nClicca per incassi e scoperto mese per mese' })}
    ${kpi2({ l: 'Pipeline offerte', v: chf(pipeVal), sub: openOff.length + ' aperte · chiusura ' + pct(tasso), act: 'open-kpi', id: 'pipeline', tip: 'Valore delle offerte da Richiesta a In attesa firma.\nClicca per l\'analisi di offerte emesse e vinte' })}
  </div>
  <div class="g21">
    <div class="card"><div class="row between"><h3>CHF per ora realizzati, cantieri in corso</h3><span class="small muted">passa sulle barre per il dettaglio, clicca per aprire</span></div>${chartChfOra(inCorso)}<div class="legend"><span><i style="background:var(--good)"></i>sopra tariffa</span><span><i style="background:var(--warn)"></i>tra break-even e tariffa</span><span><i style="background:var(--bad)"></i>sotto break-even</span></div></div>
    ${todoCard()}
  </div>
  <div class="g3">
    <div class="card"><div class="row between"><h3>Fatturato e costi per mese</h3><span class="small muted">margine % sopra le barre</span></div>${chartMensile()}<div class="legend"><span><i style="background:var(--brand)"></i>fatturato</span><span><i style="background:var(--ink-2);opacity:.45"></i>costi (ore, materiale, terzi, struttura)</span><span><i style="background:var(--brand);opacity:.5"></i>mese in corso</span></div></div>
    <div class="card"><div class="row between"><h3>Pipeline offerte</h3><button class="btn sm" data-act="open-pipeline">Kanban</button></div><div class="funnel">${phases.map((p) => `<button class="fstep" data-act="open-pipeline" data-id="${esc(p.k)}" data-tip="${esc(p.n + ' offert' + (p.n === 1 ? 'a' : 'e') + ' · ' + chf(p.val) + '\n' + (p.lost ? 'motivi: prezzo, tempistiche, scelto altro' : 'Clicca per aprire la pipeline'))}"><span class="n">${esc(p.label)}</span><span class="bar"><i style="width:${Math.max(p.val / pmax * 100, p.n ? 3 : 0)}%;background:${pcol(p)}"></i></span><span class="num small"><b>${p.n}</b> · ${chf(p.val)}</span></button>`).join('')}</div><p class="small muted" style="margin:8px 0 0">Tasso di chiusura ${pct(tasso)} su ${chiuse.length} offerte decise nel 2026 · media storica 61%</p></div>
    <div class="card"><div class="row between"><h3>Incassi e scadenze</h3><span class="b num">${chf(apertoTot)}</span></div><div class="aging">${buckets.map((b) => `<button class="arow" data-act="open-fatture" data-tip="${esc(b.list.map((f) => f.id + ' · ' + cliente(f.clienteId).nome + ' · ' + chf(f.importo)).join('\n') || 'Nessuna fattura')}"><span class="small b">${b.label}</span><span class="bar trk" style="height:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:4px;overflow:hidden;position:relative;display:block"><i style="position:absolute;left:0;top:0;bottom:0;width:${b.val / bmax * 100}%;background:${b.color};border-radius:3px"></i></span><span class="num small right">${b.n ? chf(b.val) : '–'}</span></button>`).join('')}</div><div class="row between" style="margin-top:10px"><span class="small muted">${fattReminders().filter((r) => r.tipo.startsWith('soll')).length} solleciti da inviare</span><button class="btn sm" data-act="open-fatture">Fatture e solleciti</button></div></div>
  </div>
  <div class="g21">
    <div class="card pad0"><div class="cardhd"><h3>Cantieri in corso</h3><button class="btn sm" data-act="nav" data-id="cantieri">Tutti i cantieri</button></div>${cantieriTable(inCorso)}</div>
    <div class="stack"><div class="card"><div class="row between"><h3>La mia giornata</h3><button class="btn sm" data-act="nav" data-id="calendario">Calendario</button></div>${oggiEv.map((e) => `<div class="listrow click" data-act="open-evento" data-id="${e.id}"><span><span class="b num">${e.inizio.slice(11, 16)}</span> ${esc(e.titolo)}<br><span class="small muted">${esc(e.luogo)}</span></span><span>${ACT_ICON[e.tipo] || I('calendar')}</span></div>`).join('') || '<p class="muted small">Nessun appuntamento oggi</p>'}</div>
    ${scadenzeCard(5)}<div class="card"><div class="row between"><h3>Squadra oggi</h3><span class="small muted">${inCant} in cantiere · ${assenti.length} assenti · ${bolOggi} bollettini</span></div>${inCorso.map((c) => { const l = where[c.id] || []; return `<div class="team-row" data-act="open-cantiere" data-id="${c.id}" data-tip="${esc(c.nome + '\n' + (l.map((w) => w.nome).join(', ') || 'nessuno pianificato') + '\nCapo: ' + worker(c.capo).nome)}"><span style="min-width:0"><span class="b">${esc(c.nome)}</span><br><span class="small muted">${esc(c.comune)} · capo ${esc(worker(c.capo).nome.split(' ')[0])}</span></span><span class="row nowrap"><span class="avstack">${l.slice(0, 5).map((w) => avatar(w.nome, avCls(w))).join('')}</span><span class="b num">${l.length}</span></span></div>`; }).join('')}${assenti.length ? `<div class="small muted" style="margin-top:8px">Assenti: ${assenti.map((a) => esc(worker(a.workerId).nome.split(' ')[0]) + ' (' + a.tipo.toLowerCase() + ')').join(', ')}</div>` : ''}</div></div>
  </div>`;
}

// ---------- assistente IA per gli operai (testo e voce) ----------
const OPAI_CHIPS = ['Entrato alle 7', 'Parto adesso verso il cantiere', 'Otto ore oggi, mezz\'ora di viaggio, tinteggiato il corridoio', 'Domani vado dal dottore, arrivo alle 11', 'Vacanze dal 22 al 26 dicembre', 'Quante ore ho fatto questa settimana?'];
VOICE_SAMPLES.opai = ['Entrato alle sette, otto ore e mezza a Villa Bernasconi, mezz\'ora di viaggio con la mia auto. Finito il soffitto del corridoio, manca un secchio di Indeko.', 'Domani sono malato, ho la febbre.', 'Di\' a Stefano che lunedì arrivo alle otto perché porto il bambino a scuola.'];
function opAiBar() { return `<button class="aibar" data-act="nav" data-id="op-ai">${I('sparkles')}<span>Scrivi o detta: "entrato alle 7, otto ore, mezz'ora di viaggio"</span>${I('mic')}</button>`; }
function opAiState() { return S.opAi || (S.opAi = { msgs: [], typing: false }); }
const todayAt = (hm) => { const d = new Date(); const [h, mi] = hm.split(':'); d.setHours(+h, +mi, 0, 0); return d.getTime(); };
const hmOf = (ts) => new Date(ts).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' });
const WN = { una: 1, un: 1, uno: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16, diciassette: 17, diciotto: 18, diciannove: 19, venti: 20, ventuno: 21, ventidue: 22, ventitre: 23, ventitré: 23, ventiquattro: 24, venticinque: 25, ventisei: 26, ventisette: 27, ventotto: 28, ventinove: 29, trenta: 30, trentuno: 31 };
const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
function opAiInterpret(text) {
  const w = me(); const t = text.toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').trim(); const acts = []; const notes = [];
  const num = (s) => WN[s] ?? parseFloat(String(s).replace(',', '.'));
  const NUM = '(\\d{1,2}|' + Object.keys(WN).join('|') + ')';
  const resp = worker(w.ramo === 'G' ? 'C003' : 'C002');
  const c = findCant(text) || myCant(w);
  const futuro = /\bdomani\b|dopodomani|prossim|lunedì|martedì|mercoledì|giovedì|venerdì|sabato/.test(t) && !/\boggi\b/.test(t);
  // domanda informativa
  if (/\?$|quante ore|quanto ho|dove (lavoro|sono|vado)|quante vacanze|mi restano|indennit|stipendio|conguaglio|chi (è|c'è)/.test(t) && !/entrat|uscit|timbr/.test(t)) return { html: aiAnswer(text).html, actions: [] };
  // messaggio esplicito al capo o a un collega
  const mMsg = t.match(/^(scrivi|di'|dì|avvisa|manda|comunica|chiedi)\s+(a\s+)?([\wàèéìòù]+)\s*(che\s+|di\s+|se\s+)?(.*)$/);
  if (mMsg) { const to = findWorker(mMsg[3]) || resp; const testo = mMsg[5] ? mMsg[5].charAt(0).toUpperCase() + mMsg[5].slice(1) : text; acts.push({ k: 'msg', to, testo, label: `Messaggio a ${to.nome.split(' ')[0]}: "${testo}"` }); return finish(); }
  // orari (entrata / uscita)
  const timeRx = new RegExp("(alle|dalle|all')\\s*" + NUM + "(?:[:.h](\\d{2}))?(\\s*e\\s*(mezz[ao]|un quarto|tre quarti|\\d{1,2}))?", 'g'); let m; let tIn = null, tOut = null;
  while ((m = timeRx.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 32), m.index); let h = num(m[2]); let mi = m[3] ? +m[3] : m[5] ? (m[5].startsWith('mezz') ? 30 : m[5] === 'un quarto' ? 15 : m[5] === 'tre quarti' ? 45 : +m[5]) : 0;
    const isOut = /uscit|finit|stacc|smett|chius|fino|torn|a casa/.test(before) || (m[1] === 'alle' && tIn && !/entrat|arriv|inizi/.test(before));
    if (h < 6 && isOut) h += 12; const hm = String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
    if (isOut) tOut = hm; else tIn = hm;
  }
  if (futuro && (tIn || tOut) && !/vacanz|malat|dottore|medico/.test(t)) { acts.push({ k: 'msg', to: resp, testo: text, label: `Avviso a ${resp.nome.split(' ')[0]}: "${text}"` }); return finish(); }
  if (tIn) acts.push({ k: 'clock-in', hm: tIn, label: `Timbratura entrata alle ${tIn} · ${c.nome} · GPS verificato` });
  if (tOut) acts.push({ k: 'clock-out', hm: tOut, label: `Timbratura uscita alle ${tOut}` });
  // viaggio
  const pv = parseVoice(text); const mKm = t.match(/(\d+[.,]?\d*)\s*(km|chilometri)/); const veic = /mia auto|auto privata|macchina mia|mia macchina|con la mia/.test(t) ? 'Auto privata' : /furgone/.test(t) ? (w.veicolo && w.veicolo !== 'privato' ? 'Furgone ' + w.veicolo : 'Furgone') : w.veicolo === 'privato' ? 'Auto privata' : 'Squadra';
  if (/^(parto|sto partendo|vado al cantiere|in viaggio)/.test(t) && !pv.viaggio && !mKm) acts.push({ k: 'trip-start', label: `Avvio il viaggio verso ${c.nome} con tracciamento GPS` });
  else if (/^(sono )?arrivat[oa]( al cantiere)?$/.test(t) && S.trip && !S.trip.end) acts.push({ k: 'trip-end', label: 'Chiudo il viaggio GPS e preparo la timbratura' });
  else if (pv.viaggio != null || mKm) { const km = mKm ? +mKm[1].replace(',', '.') : routeKm(w, c); const min = pv.viaggio != null ? Math.round(pv.viaggio * 60) : Math.max(5, Math.round(km * 1.4)); acts.push({ k: 'trip', km, min, veicolo: veic, label: `Viaggio ${w.residenza} → ${c.nome}: ${n1(km)} km, ${min} min, ${veic.toLowerCase()}${veic === 'Auto privata' ? ' · rimborso ' + chf(km * P.kmTariffa, 2) : ''}` }); }
  // assenze
  const dateRange = () => { const r = t.match(new RegExp('dal(?:l\')?\\s*' + NUM + '\\s*(?:al|all\'|fino al)\\s*' + NUM + '(?:\\s*(?:di\\s*)?(' + MESI.join('|') + '))?')); if (r) { const mo = r[3] ? MESI.indexOf(r[3]) + 1 : +D.TODAY_ISO.slice(5, 7); const y = mo < +D.TODAY_ISO.slice(5, 7) ? 2027 : 2026; const d = (n) => `${y}-${String(mo).padStart(2, '0')}-${String(num(n)).padStart(2, '0')}`; return [d(r[1]), d(r[2])]; } if (/settimana prossima|prossima settimana/.test(t)) return ['2026-11-09', '2026-11-13']; const one = /\bdomani\b/.test(t) ? addDays(D.TODAY_ISO, 1) : /dopodomani/.test(t) ? addDays(D.TODAY_ISO, 2) : (() => { const g = GIORNI.findIndex((x) => t.includes(x)); if (g < 0) return D.TODAY_ISO; const cur = new Date(D.TODAY_ISO + 'T12:00').getDay(); return addDays(D.TODAY_ISO, ((g - cur + 7) % 7) || 7); })(); return [one, one]; };
  if (/malat|febbre|influenz|non sto bene|sto male|raffredd/.test(t)) { const [dal, al] = dateRange(); acts.push({ k: 'assenza', tipo: 'Malattia', dal, al, nota: text, label: `Malattia ${dal === al ? 'il ' + fd(dal) : 'dal ' + fd(dal) + ' al ' + fd(al)} · avviso a ${resp.nome.split(' ')[0]} e all'ufficio, certificato da caricare dopo 3 giorni` }); }
  else if (/infortun|fatto male|ferit/.test(t)) { acts.push({ k: 'assenza', tipo: 'Infortunio', dal: D.TODAY_ISO, al: D.TODAY_ISO, nota: text, label: 'Infortunio segnalato oggi: avviso immediato a ' + resp.nome.split(' ')[0] + ' e Ivo (SUVA)' }); }
  else if (/vacanz|ferie/.test(t)) { const [dal, al] = dateRange(); acts.push({ k: 'assenza', tipo: 'Vacanze', dal, al, nota: text, label: `Richiesta vacanze dal ${fd(dal)} al ${fd(al)} (${Math.round((new Date(al) - new Date(dal)) / 864e5) + 1} giorni, te ne restano ${w.vacanzeTot - w.vacanzeUsate})` }); }
  else if (/dottore|medico|visita|permesso|dentista/.test(t)) { const [dal, al] = dateRange(); acts.push({ k: 'assenza', tipo: 'Permesso non pagato', dal, al, nota: text, label: `Permesso ${dal === D.TODAY_ISO ? 'oggi' : 'il ' + fd(dal)}${tIn ? ', arrivo alle ' + tIn : ''} · avviso a ${resp.nome.split(' ')[0]}` }); if (tIn) acts.splice(acts.findIndex((a) => a.k === 'clock-in'), 1); }
  // bollettino (ore + attività)
  const mine = w.ramo === 'G' ? ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto', 'Isolamento', 'Preparazione'] : ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura', 'Tappezzeria', 'Velatura'];
  const att = pv.att.filter((a) => mine.includes(a));
  let ore = pv.ore; if (!ore && tIn && tOut) { const d = (todayAt(tOut) - todayAt(tIn)) / 36e5; ore = Math.round((d - (d > 6 ? 0.5 : 0)) * 4) / 4; notes.push(`ore calcolate dalle timbrature (${tIn}–${tOut}, pausa 30 min)`); }
  if (ore || att.length || pv.mat) { if (!ore) { ore = 8; notes.push('ho messo 8 ore: correggi se serve'); } acts.push({ k: 'bol', ore, viaggio: pv.viaggio || (acts.find((a) => a.k === 'trip') ? Math.round(acts.find((a) => a.k === 'trip').min / 15) / 4 : 0), att, mat: pv.mat || '', note: text, cantiere: c.id, label: `Bollettino ${c.nome}: ${n1(ore)} h${att.length ? ', ' + att.join(', ').toLowerCase() : ''}${pv.mat ? ' · materiale: ' + pv.mat : ''} → inviato a ${resp.nome.split(' ')[0]} e Ivo` }); }
  else if (/manca|mancano|servono|serve|ordina/.test(t) && !acts.length) { acts.push({ k: 'msg', to: resp, testo: 'Materiale: ' + text, label: `Richiesta materiale a ${resp.nome.split(' ')[0]}: "${text}"` }); }
  return finish();
  function finish() {
    if (!acts.length) return { html: `Non ho capito cosa registrare. Puoi dirmi per esempio: <i>"entrato alle 7"</i>, <i>"otto ore a ${esc(c.nome)}, mezz'ora di viaggio"</i>, <i>"domani sono malato"</i>, <i>"vacanze dal 22 al 26 dicembre"</i> oppure <i>"di' a ${esc(resp.nome.split(' ')[0])} che arrivo alle 8"</i>.`, actions: [] };
    return { html: `Ho capito così${notes.length ? ' (' + esc(notes.join('; ')) + ')' : ''}. Confermi?`, actions: acts };
  }
}
const OPAI_ICON = { 'clock-in': 'clock', 'clock-out': 'clock', 'trip-start': 'pin', 'trip-end': 'pin', trip: 'route', bol: 'clipboard', assenza: 'sun', msg: 'message' };
function opAiRun(actions, vocal) {
  const w = me(); const out = [];
  actions.forEach((a) => {
    if (a.k === 'clock-in') { S.clock = { in: todayAt(a.hm), out: null }; clearInterval(S._ti); S._ti = setInterval(() => { const c = document.getElementById('clock'); if (c) c.textContent = elapsed(); }, 1000); out.push('Entrata registrata alle ' + a.hm + ' (GPS ok)'); }
    if (a.k === 'clock-out') { if (!S.clock.in) S.clock.in = todayAt('07:00'); S.clock.out = todayAt(a.hm); clearInterval(S._ti); S.bolForm._fromClock = false; out.push('Uscita registrata alle ' + a.hm); }
    if (a.k === 'trip-start') { const c = myCant(w); const tot = routeKm(w, c); S.trip = { start: Date.now(), startHM: nowHM(), km: 0, end: null, tot }; clearInterval(S._tt); S._tt = setInterval(() => { if (!S.trip || S.trip.end) return clearInterval(S._tt); S.trip.km = Math.min(S.trip.tot, S.trip.km + S.trip.tot / 18); const el = document.getElementById('tripkm'); if (el) el.textContent = n1(S.trip.km) + ' km'; }, 500); out.push('Viaggio avviato, GPS attivo: vedi la mappa in Oggi'); }
    if (a.k === 'trip-end') { clearInterval(S._tt); const c = myCant(w); const tr = S.trip; tr.end = Date.now(); tr.km = tr.tot; tr.min = Math.max(5, Math.round(tr.tot * 1.4)); DB.viaggi.unshift({ id: uid('TR'), workerId: w.id, data: D.TODAY_ISO, partenza: tr.startHM, arrivo: nowHM(), da: w.residenza + ' (casa)', a: c.nome + ', ' + c.comune, km: tr.km, minuti: tr.min, veicolo: w.veicolo === 'privato' ? 'Auto privata' : w.veicolo || 'Squadra', gps: true }); out.push('Viaggio chiuso: ' + n1(tr.km) + ' km in ' + tr.min + ' min'); }
    if (a.k === 'trip') { const c = cant(a.cantiere) || myCant(w); const arr = S.clock.in ? hmOf(S.clock.in) : nowHM(); const part = hmOf(todayAt(arr) - a.min * 60000); DB.viaggi.unshift({ id: uid('TR'), workerId: w.id, data: D.TODAY_ISO, partenza: part, arrivo: arr, da: w.residenza + ' (casa)', a: c.nome + ', ' + c.comune, km: a.km, minuti: a.min, veicolo: a.veicolo, gps: false, fonte: 'assistente' }); if (a.veicolo === 'Auto privata') DB.kmPrivati.unshift({ id: uid('KM'), workerId: w.id, data: D.TODAY_ISO, da: w.residenza, a: c.nome + ', ' + c.comune, km: Math.round(a.km), rientro: false, stato: 'Inviato' }); out.push('Viaggio registrato: ' + n1(a.km) + ' km, ' + a.min + ' min' + (a.veicolo === 'Auto privata' ? ' · rimborso ' + chf(a.km * P.kmTariffa, 2) + ' in approvazione' : '')); }
    if (a.k === 'bol') { const c = cant(a.cantiere) || myCant(w); const resp = w.ramo === 'G' ? 'C003' : 'C002'; DB.bollettini.unshift({ id: 'B-' + Date.now(), data: D.TODAY_ISO, cantiere: c.id, workerId: w.id, ore: a.ore, viaggio: a.viaggio || 0, attivita: a.att[0] || 'Lavori vari', stato: 'Inviato', anomalia: a.ore > 10 ? 'Oltre 10 h' : null, entrata: S.clock.in ? hmOf(S.clock.in) : '07:15', uscita: S.clock.out ? hmOf(S.clock.out) : '16:45', gps: 35, materiale: a.mat, note: a.note, vocale: !!vocal, fonte: 'assistente' }); notify(w.nome + ' ha inviato il bollettino tramite assistente: ' + n1(a.ore) + ' h su ' + c.nome + (vocal ? ' (vocale)' : ''), 'bollettini', null, ['C001', resp]); S.bolForm = { cantiere: c.id, ore: 8, viaggio: 0.5, att: [], note: '', mat: '' }; out.push('Bollettino inviato a ' + worker(resp).nome.split(' ')[0] + ' e Ivo: ' + n1(a.ore) + ' h'); }
    if (a.k === 'assenza') { const resp = w.ramo === 'G' ? 'C003' : 'C002'; const g = Math.max(1, Math.round((new Date(a.al) - new Date(a.dal)) / 864e5) + 1); DB.assenze.unshift({ id: uid('AS'), workerId: w.id, tipo: a.tipo, dal: a.dal, al: a.al, giorni: g, stato: a.tipo === 'Malattia' || a.tipo === 'Infortunio' ? 'Certificato caricato' : 'Richiesta', nota: a.nota }); notify(w.nome + ': ' + a.tipo.toLowerCase() + ' ' + (a.dal === a.al ? 'il ' + fd(a.dal) : 'dal ' + fd(a.dal) + ' al ' + fd(a.al)), 'bollettini', null, ['C001', 'C004', resp]); sendChat(dmId(w.id, resp), (a.tipo === 'Vacanze' ? 'Ho chiesto le vacanze ' : a.tipo === 'Malattia' ? 'Sono a casa malato ' : a.tipo + ' ') + (a.dal === a.al ? 'il ' + fd(a.dal) : 'dal ' + fd(a.dal) + ' al ' + fd(a.al)) + (a.tipo === 'Permesso non pagato' ? ': ' + a.nota : ''), vocal); out.push(a.tipo + ' registrat' + (a.tipo === 'Vacanze' ? 'e: in attesa di approvazione' : 'a: ufficio e ' + worker(resp).nome.split(' ')[0] + ' avvisati')); }
    if (a.k === 'msg') { sendChat(dmId(w.id, a.to.id), a.testo, vocal); out.push('Messaggio inviato a ' + a.to.nome.split(' ')[0]); }
  });
  return out;
}
function opAiAsk(text, vocal) {
  const A = opAiState(); if (!text || !text.trim()) return; A.msgs.push({ me: true, text, vocal: !!vocal }); A.typing = true; render();
  setTimeout(() => { A.typing = false; const r = opAiInterpret(text); A.msgs.push({ me: false, html: r.html, prop: r.actions.length ? { actions: r.actions, done: false, vocal: !!vocal } : null }); render(); }, 650);
}
function vOpAi() {
  const A = opAiState(); const w = me(); const listening = S.voice.state === 'listening' && S.voice.target === 'opai';
  const msg = (m, i) => m.me ? `<div class="msg me"><div><div class="bub">${esc(m.text)}${m.vocal ? ' ' + I('mic') : ''}</div></div></div>` : `<div class="msg"><div><div class="meta">Assistente</div><div class="bub">${m.html}${m.prop ? `<div class="prop ${m.prop.done === 'ok' ? 'ok' : m.prop.done === 'no' ? 'no' : ''}">${m.prop.actions.map((a) => `<div class="pl">${I(OPAI_ICON[a.k] || 'check')}<span>${esc(a.label)}</span></div>`).join('')}${!m.prop.done ? `<div class="row nowrap" style="margin-top:4px"><button class="btn primary sm" data-act="opai-confirm" data-id="${i}">${I('check')} Conferma</button>${m.prop.actions.some((a) => a.k === 'bol') ? `<button class="btn sm" data-act="opai-edit" data-id="${i}">Modifica</button>` : ''}<button class="btn sm ghost" data-act="opai-cancel" data-id="${i}">Annulla</button></div>` : m.prop.done === 'ok' ? `<div class="small" style="color:var(--good)">${I('check')} Registrato</div>` : '<div class="small muted">Annullato</div>'}</div>` : ''}</div></div></div>`;
  return phone(`<div><div class="eyebrow">Assistente · ${esc(w.nome.split(' ')[0])}</div><h1>Dimmi cosa hai fatto</h1><p class="small muted" style="margin:4px 0 0">Scrivi o detta: timbrature, viaggi, ore e lavori, assenze, messaggi al capo. Ti mostro cosa ho capito e registro solo quando confermi. ${esc(worker(w.ramo === 'G' ? 'C003' : 'C002').nome.split(' ')[0])} e Ivo ricevono tutto subito.</p></div>
    <div class="opai-msgs" id="ai-msgs">${A.msgs.length ? A.msgs.map(msg).join('') : `<div class="msg"><div><div class="meta">Assistente</div><div class="bub">Ciao ${esc(w.nome.split(' ')[0])}! Oggi sei a <b>${esc(myCant(w).nome)}</b>. Prova a dirmi "entrato alle 7", "otto ore, mezz'ora di viaggio, tinteggiato il corridoio" oppure "domani sono malato".</div></div></div>`}${A.typing ? '<div class="msg"><div><div class="bub typing"><i></i><i></i><i></i></div></div></div>' : ''}</div>
    <div class="sugg" style="padding:0">${OPAI_CHIPS.map((q) => `<button data-act="opai-chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="composer opai" data-act="opai-send" style="padding:0;border:0"><button type="button" class="mic ${listening ? 'on' : ''}" data-act="voice-start" data-id="opai" aria-label="Detta">${listening ? '■' : I('mic')}</button><input id="opai-input" placeholder="${listening ? 'Sto ascoltando…' : 'Scrivi o detta…'}" autocomplete="off"><button class="btn primary" type="submit" aria-label="Invia">${I('send')}</button></form>`);
}
function voiceApply(target, text) {
  if (target === 'bol') { const p = parseVoice(text); const F = S.bolForm; const w = me(); const mine = w.ramo === 'G' ? ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto', 'Isolamento', 'Preparazione'] : ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura', 'Tappezzeria', 'Velatura']; if (p.ore) F.ore = p.ore; if (p.viaggio != null) F.viaggio = p.viaggio; const att = p.att.filter((a) => mine.includes(a)); if (att.length) F.att = [...new Set([...F.att, ...att])]; if (p.mat) F.mat = p.mat; F.note = text; F.vocale = true; }
  if (target === 'off') { if (S.modal && S.modal.type === 'offerta-new') S.modal.desc = ((S.modal.desc || '') + ' ' + text).trim(); return; }
  if (target === 'msg') { const inp = document.getElementById('chat-input'); S.sel.msgDraft = text; if (inp) inp.value = text; }
  if (target === 'ai') aiAsk(text);
  if (target === 'opai') { S.voice = { state: 'idle', text: '', target: 'opai' }; opAiAsk(text, true); }
}

// ---------- eventi ----------
document.addEventListener('click', (e) => {
  const h = e.target.closest('[data-act]'); if (!h) return; const act = h.dataset.act, id = h.dataset.id; const ds = h.dataset; const m = S.modal; const w = me();
  const H = {
    'theme-toggle': () => { setTheme(effTheme() === 'dark' ? 'light' : 'dark'); toast(S.theme === 'dark' ? 'Tema scuro' : 'Tema chiaro'); },
    'theme-set': () => { setTheme(id); },
    'lst-toggle': () => { m.lstOpen = !m.lstOpen; if (m.lstOpen) setTimeout(() => { const i = document.getElementById('lst-q'); if (i) i.focus(); }, 30); },
    'lst-cat': () => { m.lstCat = id; },
    'lst-add': () => { const p = LISTINO.find((x) => x.npk === id); (m.rows = m.rows || []).push({ pos: 'NPK ' + p.npk, desc: p.desc, un: p.un, qta: 0, prezzo: p.prezzo, fonte: p.n + ' offerte · ' + n2(p.min) + '–' + n2(p.max) }); toast('Aggiunta: ' + p.desc.slice(0, 40) + '… inserisci la quantità'); },
    'open-pipeline': () => { S.sel.viewOff = 'kanban'; S.tab.comm = 'offerte'; go('commerciale'); },
    'open-fatture': () => { S.tab.comm = 'fatture'; go('commerciale'); },
    'cal-acc': () => { const hd = S.sel.calHide || (S.sel.calHide = []); const i = hd.indexOf(id); if (i >= 0) hd.splice(i, 1); else hd.push(id); },
    'acc-sync': () => { const a = accById(id); a.ultimaSync = nowISO(); const n = 1 + (Date.now() % 3); toast('Sincronizzato ' + a.email + ': ' + n + ' nuove e-mail, 1 evento aggiornato'); },
    'acc-disconnect': () => { const a = accById(id); S.modal = { type: 'confirm', title: 'Disconnettere ' + a.email + '?', text: 'Le e-mail e gli eventi già importati restano nel gestionale; la sincronizzazione si ferma e il token viene revocato presso ' + a.provider + '.', ok: 'Disconnetti', danger: true, fn: () => { DB.accounts = DB.accounts.filter((x) => x.id !== id); toast('Account disconnesso: ' + a.email); } }; },
    'acc-add-open': () => { S.modal = { type: 'account-add', step: 1 }; },
    'acc-step': () => { if (!id) { m.step = 1; return; } m.provider = id; m.step = 2; },
    'acc-finish': () => { const o = m.opts || {}; const srv = ['mail', 'calendar', 'contacts'].filter((k) => o[k] ?? (k !== 'contacts' || m.provider !== 'IMAP / SMTP')); const a = { id: uid('AC'), provider: m.provider, email: m.email, owner: w.id, servizi: srv, stato: 'Connesso', ultimaSync: nowISO(), colore: ACC_COLORS[DB.accounts.length % ACC_COLORS.length], condiviso: o.condiviso ?? true, autoRel: o.autoRel ?? true, pdfFatture: o.pdfFatture ?? false, nMail: 0, nEventi: 0, nome: w.nome.split(' ')[0] + ' · ' + (m.provider === 'Google Workspace' ? 'Gmail' : m.provider === 'Microsoft 365' ? 'Outlook' : m.provider) }; DB.accounts.push(a); S.modal = null; S.tab.imp = 'account'; toast('Account collegato: ' + a.email + '. Importazione dello storico avviata.'); notify('Nuovo account e-mail collegato da ' + w.nome + ': ' + a.email, 'impostazioni', null, ['C001']); setTimeout(() => { a.nMail = 412; a.nEventi = 23; render(); }, 2500); },
    'acc-invite': () => { const x = worker(id); DB.notifiche.unshift({ id: uid('N'), ts: nowISO(), testo: 'Ivo ti invita a collegare il tuo account e-mail e calendario al gestionale', view: 'impostazioni', id2: null, per: [id], letta: false }); toast('Invito inviato a ' + x.nome + ' per collegare ' + x.email); },
    'inbox-folder': () => { S.inbox.folder = id; S.inbox.open = null; },
    'inbox-acc': () => { S.inbox.acc = id; S.inbox.open = null; },
    'inbox-label': () => { S.inbox.label = S.inbox.label === id ? '' : id; S.inbox.open = null; },
    'inbox-open': () => { if (e.target.matches('input[type=checkbox]')) return 'skip'; if (S.view !== 'inbox') { S.inbox = S.inbox || { folder: 'inbox', acc: 'all', label: '', q: '', open: null }; S.inbox.folder = 'all'; S.inbox.open = id; go('inbox'); return 'skip'; } S.inbox.open = id; },
    'inbox-back': () => { S.inbox.open = null; },
    'inbox-compose': () => { openCompose({}); S.modal.account = S.inbox && S.inbox.acc !== 'all' ? S.inbox.acc : defaultAccount(); },
    'inbox-sync': () => { ensureAcc(); DB.accounts.forEach((a) => { a.ultimaSync = nowISO(); }); toast('Sincronizzazione completata: nessuna nuova e-mail'); },
    'inbox-reply': () => { const x = DB.email.find((y) => y.id === id); openCompose({ rel: x.rel, a: x.folder === 'Sent' ? x.a : fromAddr(x.da), oggetto: (x.oggetto.startsWith('Re:') ? '' : 'Re: ') + x.oggetto, testo: '\n\n--- Messaggio originale ---\n' + x.testo, contatto: x.rel ? relName(x.rel) : fromName(x.da) }); S.modal.account = x.account; },
    'inbox-forward': () => { const x = DB.email.find((y) => y.id === id); openCompose({ a: '', oggetto: 'Fwd: ' + x.oggetto, testo: '\n\n--- Messaggio inoltrato ---\nDa: ' + x.da + '\nData: ' + fdt(x.data) + '\n\n' + x.testo, allegati: [...x.allegati] }); S.modal.account = x.account; },
    'inbox-ai-reply': () => { const x = DB.email.find((y) => y.id === id); openCompose({ rel: x.rel, a: fromAddr(x.da), oggetto: (x.oggetto.startsWith('Re:') ? '' : 'Re: ') + x.oggetto, testo: aiReplyFor(x) + '\n\n--- Messaggio originale ---\n' + x.testo, contatto: fromName(x.da) }); S.modal.account = x.account; toast('Bozza proposta dall\'IA: rileggi e invia'); },
    'inbox-to-offer': () => { const x = DB.email.find((y) => y.id === id); S.modal = { type: 'offerta-new', mode: 'ia', clienteId: DB.clienti[0].id, tipo: 'A corpo', oggetto: x.oggetto.replace(/^richiesta offerta:\s*/i, ''), cantiere: null, desc: x.testo.split('\n').filter((l) => /m²|porte|pareti|soffitt|rasat|facciat|cartongesso|appartament|attico|villa|uffic/i.test(l)).join(' ') || x.testo, fromMail: x.id }; toast('Descrizione presa dall\'e-mail di ' + fromName(x.da) + ': genera l\'offerta con l\'IA'); },
    'inbox-read': () => { (ds.key ? selOf('inbox') : [id]).forEach((i) => { const x = DB.email.find((y) => y.id === i); if (x) x.unread = false; }); if (ds.key) S.selected.inbox = []; toast('Segnate come lette'); },
    'inbox-unread': () => { const x = DB.email.find((y) => y.id === id); x.unread = true; S.inbox.open = null; toast('Segnata come non letta'); },
    'inbox-archive': () => { const ids = ds.key ? selOf('inbox') : [id]; ids.forEach((i) => { const x = DB.email.find((y) => y.id === i); if (x) x.folder = 'Archive'; }); if (ds.key) S.selected.inbox = []; if (ids.includes(S.inbox.open)) S.inbox.open = null; toast(ids.length + ' e-mail archiviat' + (ids.length === 1 ? 'a' : 'e')); },
    'inbox-del': () => { const ids = ds.key ? selOf('inbox') : [id]; ids.forEach((i) => { const x = DB.email.find((y) => y.id === i); if (x) x.folder = 'Trash'; }); if (ds.key) S.selected.inbox = []; if (ids.includes(S.inbox.open)) S.inbox.open = null; toast(ids.length + ' e-mail spostat' + (ids.length === 1 ? 'a' : 'e') + ' nel cestino'); },
    'opai-chip': () => { opAiAsk(ds.q); return 'skip'; },
    'opai-confirm': () => { const A = opAiState(); const mm = A.msgs[+id]; if (!mm || !mm.prop || mm.prop.done) return; const out = opAiRun(mm.prop.actions, mm.prop.vocal); mm.prop.done = 'ok'; A.msgs.push({ me: false, html: out.map((x) => I('check') + ' ' + esc(x)).join('<br>') + '<br><span class="small muted">Puoi correggere tutto dalle schede Bollettino e Viaggi.</span>' }); toast('Registrato'); },
    'opai-cancel': () => { const mm = opAiState().msgs[+id]; if (mm && mm.prop) mm.prop.done = 'no'; },
    'opai-edit': () => { const mm = opAiState().msgs[+id]; const b = mm && mm.prop && mm.prop.actions.find((a) => a.k === 'bol'); if (!b) return; mm.prop.done = 'no'; S.bolForm = { cantiere: b.cantiere, ore: b.ore, viaggio: b.viaggio || 0, att: b.att, note: b.note, mat: b.mat, vocale: mm.prop.vocal }; go('op-bol'); return 'skip'; },
  };
  if (!H[act]) return;
  e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-act]'); if (!f) return; const act = f.dataset.act; const m = S.modal;
  if (act === 'opai-send') { e.preventDefault(); const inp = f.querySelector('#opai-input'); const v = inp.value; inp.value = ''; opAiAsk(v, false); return; }
  if (act === 'acc-consent') { e.preventDefault(); m.email = f.email.value; m.step = 3; render(); return; }
});
document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.actChange === 'compose-acc') { m.account = t.value; m.a = t.form.a.value; m.cc = t.form.cc.value; m.oggetto = t.form.oggetto.value; m.testo = t.form.testo.value; render(); return; }
  if (ds.actChange === 'inbox-link' && t.value) { const x = DB.email.find((y) => y.id === ds.id); x.rel = { t: 'cantiere', id: t.value }; if (!x.labels.includes('Cantieri')) x.labels = x.labels.filter((l) => l !== 'Cantieri'); toast('E-mail collegata a ' + cant(t.value).nome); render(); return; }
  if (ds.accToggle) { const a = accById(ds.id); a[ds.accToggle] = t.checked; toast('Impostazione account salvata'); return; }
  if (ds.accOpt && m) { (m.opts = m.opts || {})[ds.accOpt] = t.type === 'checkbox' ? t.checked : t.value; return; }
});
document.addEventListener('input', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.actInput === 'lst-q' && m) { m.lstQ = t.value; const l = document.getElementById('lst-list'); if (l) l.innerHTML = listinoRows(m); return; }
  if (ds.actInput === 'inbox-q') { S.inbox.q = t.value; render(); return; }
});
