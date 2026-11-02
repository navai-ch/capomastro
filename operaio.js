/* MyColor Gestionale – app operaio (telefono): timbrature GPS, viaggi, bollettino con voce, messaggi, il mio mese */

function phone(inner, tab) {
  const w = me();
  const unreadMsg = DB.messaggi.filter((m) => m.autore !== w.id && !m.letto && (m.ch === 'gen' || (m.ch.startsWith('dm-') && m.ch.includes(w.id)) || DB.canali.some((c) => c.id === m.ch && c.tipo === 'cantiere' && (cant(c.cant) || { squadra: [] }).squadra.includes(w.id)))).length;
  const TB = [['op-oggi', I('clock'), 'Oggi'], ['op-bol', I('clipboard'), 'Bollettino'], ['op-ai', I('sparkles'), 'Assistente'], ['op-km', I('route'), 'Viaggi'], ['op-msg', I('message'), 'Messaggi'], ['op-mese', I('user'), 'Io']];
  return `<div class="phone-wrap"><div class="phone"><div class="phone-head"><button class="logo" data-act="nav" data-id="op-oggi" aria-label="Vai a Oggi"><img src="${LOGO}" alt="MY COLOR"></button><div class="row nowrap" style="gap:8px"><button class="iconbtn" style="width:34px;height:34px" data-act="nav" data-id="op-ai" aria-label="Assistente">${I('sparkles')}</button>${avatar(w.nome, avCls(w))}<button class="btn sm" data-act="logout">Esci</button></div></div><div class="phone-body">${inner}</div><nav class="tabbar">${TB.map((x) => `<button data-act="nav" data-id="${x[0]}" class="${S.view === x[0] ? 'on' : ''}"><span class="ic">${x[1]}</span>${x[2]}${x[0] === 'op-msg' && unreadMsg ? `<span class="dot">${unreadMsg}</span>` : ''}</button>`).join('')}</nav></div></div>`;
}
function elapsed() { if (!S.clock.in) return '00:00:00'; const end = S.clock.out || Date.now(); const s = Math.floor((end - S.clock.in) / 1000); return [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map((x) => String(x).padStart(2, '0')).join(':'); }
const myCant = (w) => cantiereDi(w.id, D.TODAY_ISO) || DB.cantieri.find((c) => c.stato === 'In corso');
function routeKm(w, c) { const home = w.kmDaBase, site = c.kmDaBase; return Math.max(3, Math.round((Math.abs(home - site) + Math.min(home, site) * 0.35) * 10) / 10); }

// ---------- OGGI: viaggio GPS + timbratura ----------
function vOpOggi() {
  const w = me(); const c = myCant(w); const ip = indennitaPranzo(w, c);
  const mine = DB.bollettini.filter((b) => b.workerId === w.id && b.data >= '2026-11-02'); const oreSett = mine.reduce((a, b) => a + b.ore, 0);
  const stato = !S.clock.in ? 'pre' : !S.clock.out ? 'in' : 'done';
  const tr = S.trip; const kmTot = routeKm(w, c);
  let tripBox = '';
  if (!tr && stato === 'pre') tripBox = `<div class="card" style="padding:12px 14px"><div class="row between"><div><div class="eyebrow">Viaggio verso il cantiere</div><div class="small muted">${esc(w.residenza)} → ${esc(c.nome)} · ~${kmTot} km · ${w.veicolo === 'privato' ? 'auto privata' : w.veicolo ? 'furgone ' + w.veicolo : 'con la squadra'}</div></div><button class="btn primary sm" data-act="trip-start">${I('pin')} Parto</button></div></div>`;
  else if (tr && !tr.end) tripBox = `<div class="mapbox">${mapSvg(0, { route: true, progress: Math.min(tr.km / kmTot, 1), from: w.residenza })}</div><div class="card" style="padding:12px 14px;text-align:center"><div class="eyebrow">In viaggio · GPS attivo</div><div class="clock" id="tripkm">${n1(tr.km)} km</div><div class="small muted">partito alle ${tr.startHM} · ${Math.round((Date.now() - tr.start) / 60000)} min</div></div><button class="bigbtn green" data-act="trip-end">Sono arrivato<small>chiude il viaggio e prepara la timbratura</small></button>`;
  else if (tr && tr.end && stato === 'pre') tripBox = `<div class="alert good"><span>${I('pin')}</span><span>Viaggio registrato: <span class="t b">${n1(tr.km)} km in ${tr.min} min</span>${w.veicolo === 'privato' ? ' · rimborso ' + chf(tr.km * P.kmTariffa, 2) : ''}. Il tempo di viaggio finisce nel bollettino.</span></div>`;
  return phone(`<div><div class="eyebrow">${flong(D.TODAY_ISO)}</div><h1>Ciao ${esc(w.nome.split(' ')[0])}</h1></div>
    ${opAiBar()}
    <div class="card" style="padding:12px 14px"><div class="eyebrow">Cantiere di oggi</div><div class="row between"><div><span class="b">${esc(c.nome)}</span><br><span class="small muted num">${c.id} · ${esc(c.comune)} · ${c.kmDaBase} km dalla base</span></div><button class="btn sm" data-act="op-change-cant">Cambia</button></div>${S.sel.opPick ? `<div class="chips" style="margin-top:8px">${DB.cantieri.filter((x) => x.stato === 'In corso').map((x) => `<button data-act="op-pick-cant" data-id="${x.id}" class="${x.id === c.id ? 'on' : ''}">${esc(x.nome)}</button>`).join('')}</div>` : ''}</div>
    ${tripBox}
    ${(!tr || tr.end) ? `<div class="mapbox">${mapSvg(35)}</div><div class="gpsok">✓ Posizione verificata: 35 m dal cantiere</div>` : ''}
    ${(!tr || tr.end) ? (stato === 'pre' ? `<button class="bigbtn" data-act="clock-in">Timbra entrata<small>registra ora e posizione GPS</small></button>` : stato === 'in' ? `<div class="card" style="text-align:center"><div class="eyebrow">Al lavoro da</div><div class="clock" id="clock">${elapsed()}</div><div class="small muted">entrata ${new Date(S.clock.in).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit' })} · GPS ok</div></div><button class="bigbtn out" data-act="clock-out">Timbra uscita<small>chiude la giornata e prepara il bollettino</small></button>` : `<div class="alert good"><span>${I('check')}</span><span>Giornata chiusa: <span class="t b">${elapsed()}</span> registrati. Completa il bollettino per ${esc(worker(w.ramo === 'G' ? 'C003' : 'C002').nome.split(' ')[0])}.</span></div><button class="btn primary xl block" data-act="nav" data-id="op-bol">Compila il bollettino →</button>`) : ''}
    <div class="card" style="padding:12px 14px"><div class="row between"><span class="small muted">Questa settimana</span><span class="b num">${n1(oreSett)} h</span></div><div class="row between"><span class="small muted">Indennità pranzo</span><span class="small b">${ip.val ? chf(ip.val) + ip.unit : 'non dovuta (entro ' + P.pranzoSogliaKm + ' km)'}</span></div><div class="row between"><span class="small muted">Bollettini in attesa</span><span class="small b">${mine.filter((b) => b.stato === 'Inviato').length} inviati · ${mine.filter((b) => b.stato === 'Bozza').length} bozze</span></div></div>
    <div class="row"><button class="btn sm" data-act="op-vac">${I('sun')} Chiedi vacanze</button><button class="btn sm" data-act="op-sick">${I('thermometer')} Segnala malattia</button><button class="btn sm" data-act="op-scan">${I('scan')} Scansiona materiale</button></div>`);
}

// ---------- BOLLETTINO con prompt vocale ----------
function voiceBox(target) {
  const v = S.voice; const on = v.state === 'listening' && v.target === target;
  return `<div class="voice"><button type="button" class="mic ${on ? 'on' : ''}" data-act="voice-start" data-id="${target}" aria-label="Detta a voce">${on ? '■' : I('mic')}</button><div style="flex:1;min-width:0">${on ? `<div class="wave"><i></i><i></i><i></i><i></i><i></i></div><div class="small muted">Sto ascoltando… parla normalmente, es. "otto ore, mezz'ora di viaggio, tinteggiato il corridoio"</div>` : v.state === 'done' && v.target === target ? `<div class="small muted">Ho capito:</div><div class="transcript">"${esc(v.text)}"</div>` : `<div class="b">Detta a voce</div><div class="small muted">Ore, viaggio, cosa hai fatto, materiale mancante: compilo io i campi.</div>`}</div></div>`;
}
function parseVoice(text) {
  const t = text.toLowerCase(); const out = {};
  const num = (s) => ({ una: 1, uno: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12 }[s] ?? parseFloat(s.replace(',', '.')));
  const mOre = t.match(/(\d+[.,]?\d*|una|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici)\s*(ore|ora)\b(?!\s*(di|in)\s*viaggio)/); if (mOre) out.ore = num(mOre[1]);
  if (/e mezz[ao]/.test(t) && out.ore) out.ore += 0.5;
  const MIN = { dieci: 10, quindici: 15, venti: 20, venticinque: 25, trenta: 30, quaranta: 40, quarantacinque: 45, cinquanta: 50, sessanta: 60 };
  const mVia = t.match(/(\d+|dieci|quindici|venti|venticinque|trenta|quaranta|quarantacinque|cinquanta|sessanta)\s*minuti\s*(di\s*)?viaggio/) || t.match(/viaggio\s*(di\s*)?(\d+|dieci|quindici|venti|trenta|quaranta|sessanta)\s*minuti/); if (mVia) { const v = mVia[1] && !/^di$/.test(mVia[1]) ? mVia[1] : mVia[2]; out.viaggio = Math.round((MIN[v] || +v) / 15) / 4; }
  if (/mezz'?ora\s*(di\s*)?viaggio|viaggio\s*(di\s*)?mezz'?ora/.test(t)) out.viaggio = 0.5;
  const mViaH = t.match(/(\d+[.,]?\d*|una|un)\s*or[ae]\s*(di\s*)?viaggio/); if (mViaH) out.viaggio = mViaH[1] === 'un' || mViaH[1] === 'una' ? 1 : num(mViaH[1]);
  const atts = { Tinteggiatura: /tinteggi|pittur|dipin|dispersione/, Smalto: /smalt|serrament|porte/, 'Preparazione fondi': /prepar|fondo|fondi|carteggi/, Stuccatura: /stucc|rasat/, Tappezzeria: /tappezz|carta da parati/, Velatura: /velatur|decorativ/, 'Montaggio cartongesso': /cartongesso|lastre|contropar/, Intonaco: /intonac/, Rasatura: /rasat|lisci/, Controsoffitto: /controsoff|soffitt/, Isolamento: /isolament|lana/, Preparazione: /prepar|pulizi|protezion/ };
  out.att = Object.keys(atts).filter((k) => atts[k].test(t));
  const mMat = t.match(/(manca|mancano|servono|serve|servirebbe)\s+([^.,;]+)/); if (mMat) out.mat = mMat[0].charAt(0).toUpperCase() + mMat[0].slice(1);
  out.note = text.trim();
  return out;
}
const VOICE_SAMPLES = { bol: ['Oggi otto ore e mezza, mezz\'ora di viaggio. Finito il soffitto del corridoio piano due e iniziato lo smalto delle porte. Manca un secchio di Indeko e domani serve il trabattello.', 'Sette ore e quindici minuti di viaggio. Stuccatura e preparazione fondi nelle camere lato lago. Il cliente chiede se possiamo fare anche la cantina.', 'Otto ore, viaggio di quaranta minuti. Montaggio cartongesso contropareti aula tre, finite. Mancano le viti da trentacinque.'], msg: ['Stefano domani arrivo alle sette per aprire il cantiere, ci penso io.', 'Antonio le lastre sono finite, ne servono altre venti per giovedì.'], ai: ['Quante ore ho fatto questa settimana?'] };
function voiceStart(target) {
  S.voice = { state: 'listening', text: '', target }; render();
  let done = false;
  const finish = (text) => { if (done) return; done = true; clearTimeout(S._vt); S.voice = { state: 'done', text, target }; voiceApply(target, text); render(); };
  const sample = VOICE_SAMPLES[target][(S._vn = ((S._vn || 0) + 1) % VOICE_SAMPLES[target].length)];
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR && window.isSecureContext) {
    try { const r = new SR(); r.lang = 'it-CH'; r.interimResults = false; r.maxAlternatives = 1; S._rec = r; r.onresult = (e) => finish(e.results[0][0].transcript); r.onerror = () => finish(sample); r.onend = () => { if (!done) finish(sample); }; r.start(); S._vt = setTimeout(() => { try { r.stop(); } catch (_) {} finish(sample); }, 7000); return; } catch (_) {}
  }
  S._vt = setTimeout(() => finish(sample), 2600);
}
function voiceStop() { clearTimeout(S._vt); try { S._rec && S._rec.stop(); } catch (_) {} }
function voiceApply(target, text) {
  if (target === 'bol') { const p = parseVoice(text); const F = S.bolForm; const w = me(); const mine = w.ramo === 'G' ? ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto', 'Isolamento', 'Preparazione'] : ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura', 'Tappezzeria', 'Velatura']; if (p.ore) F.ore = p.ore; if (p.viaggio != null) F.viaggio = p.viaggio; const att = p.att.filter((a) => mine.includes(a)); if (att.length) F.att = [...new Set([...F.att, ...att])]; if (p.mat) F.mat = p.mat; F.note = text; F.vocale = true; }
  if (target === 'off') { if (S.modal && S.modal.type === 'offerta-new') S.modal.desc = ((S.modal.desc || '') + ' ' + text).trim(); return; }
  if (target === 'msg') { const inp = document.getElementById('chat-input'); S.sel.msgDraft = text; if (inp) inp.value = text; }
  if (target === 'ai') { aiAsk(text); }
}
function vOpBol() {
  const w = me(); const c = myCant(w); const F = S.bolForm;
  if (!F.cantiere) F.cantiere = c.id;
  if (S.clock.out && !F._fromClock) { F.ore = Math.round((S.clock.out - S.clock.in) / 36e4 * 4) / 4 || 8; F._fromClock = true; }
  if (S.trip && S.trip.end && !F._fromTrip) { F.viaggio = Math.round(S.trip.min / 15) / 4 || 0.25; F._fromTrip = true; }
  const atts = w.ramo === 'G' ? ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto', 'Isolamento', 'Preparazione'] : ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura', 'Tappezzeria', 'Velatura'];
  const mine = DB.bollettini.filter((b) => b.workerId === w.id).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  const resp = worker(w.ramo === 'G' ? 'C003' : 'C002');
  return phone(`<div><div class="eyebrow">${flong(D.TODAY_ISO)}</div><h1>Bollettino di oggi</h1></div>
    ${voiceBox('bol')}
    <div class="stack"><div><label for="f-cant">Cantiere</label><select id="f-cant" data-bind="cantiere">${DB.cantieri.filter((x) => x.stato === 'In corso').map((x) => `<option value="${x.id}" ${F.cantiere === x.id ? 'selected' : ''}>${x.id} · ${esc(x.nome)}</option>`).join('')}</select></div>
    <div class="row nowrap"><div style="flex:1"><label for="f-ore">Ore lavoro</label><input id="f-ore" type="number" step="0.25" inputmode="decimal" value="${F.ore}" data-bind="ore"></div><div style="flex:1"><label for="f-via">Ore viaggio</label><input id="f-via" type="number" step="0.25" inputmode="decimal" value="${F.viaggio}" data-bind="viaggio"></div></div>
    <div><label>Attività svolte</label><div class="chips">${atts.map((a) => `<button type="button" data-act="att" data-id="${a}" class="${F.att.includes(a) ? 'on' : ''}">${a}</button>`).join('')}</div></div>
    <div><label for="f-mat">Materiale usato o mancante</label><input id="f-mat" placeholder="es. 2 × Indeko-plus 12.5 l" value="${esc(F.mat)}" data-bind="mat"></div>
    <div><label for="f-note">Descrizione lavori e note per l'ufficio ${F.vocale ? I('mic') : ''}</label><textarea id="f-note" rows="3" data-bind="note" placeholder="imprevisti, materiale mancante, extra richiesti dal cliente">${esc(F.note)}</textarea></div>
    <div><label for="f-foto">Foto del lavoro</label><input id="f-foto" type="file" accept="image/*" capture="environment" multiple data-act-change="bol-foto">${F.foto ? `<div class="small muted" style="margin-top:4px">${I('camera')} ${F.foto} foto allegate</div>` : ''}</div>
    <button class="btn primary xl block" data-act="send-bol">Invia a ${esc(resp.nome.split(' ')[0])} e Ivo</button></div>
    <div><div class="eyebrow" style="margin-bottom:6px">I miei ultimi bollettini</div>${mine.map((b) => `<div class="listrow click" data-act="bol-open" data-id="${b.id}"><span><span class="b">${fshort(b.data)}</span> · ${esc((cant(b.cantiere) || {}).nome || '')}<br><span class="small muted">${esc(b.attivita)} · ${n1(b.ore)} h + ${n1(b.viaggio)} viaggio${b.vocale ? (' · ' + I('mic')) : ''}</span></span>${pill(b.stato)}</div>`).join('')}</div>`);
}

// ---------- VIAGGI E KM ----------
function vOpKm() {
  const w = me(); const c = myCant(w); const K = S.kmForm;
  const mine = DB.kmPrivati.filter((k) => k.workerId === w.id); const trips = DB.viaggi.filter((v) => v.workerId === w.id);
  const veic = DB.veicoli.find((v) => v.assegnato === w.id);
  const kmSugg = w.kmDaBase + c.kmDaBase;
  return phone(`<div><div class="eyebrow">Veicoli e km</div><h1>Viaggi</h1></div>
    ${S.trip && S.trip.end ? `<div class="alert good"><span>${I('pin')}</span><span>Viaggio di oggi tracciato con GPS: <span class="t b">${n1(S.trip.km)} km</span>, ${S.trip.min} min.</span></div>` : `<div class="alert info"><span>${I('pin')}</span><span>Premi "Parto" nella schermata Oggi: il telefono traccia il percorso e registra i km reali, senza scriverli a mano.</span></div>`}
    <div class="stack"><div><label for="k-v">Veicolo di oggi</label><select id="k-v" data-bind-km="veicolo"><option value="privato" ${K.veicolo === 'privato' ? 'selected' : ''}>Auto privata (rimborso ${P.kmTariffa.toFixed(2)} CHF/km)</option>${DB.veicoli.map((v) => `<option value="${v.targa}" ${K.veicolo === v.targa ? 'selected' : ''}>${v.targa} · ${esc(v.modello)}${v.assegnato === w.id ? ' (il mio)' : ''}</option>`).join('')}<option value="squadra" ${K.veicolo === 'squadra' ? 'selected' : ''}>Passaggio con la squadra</option></select></div>
    <div class="card" style="padding:12px 14px"><div class="eyebrow">Tragitto proposto (Google Maps)</div><div class="small">${esc(w.residenza)} → Bioggio (base) → ${esc(c.nome)}, ${esc(c.comune)}</div><div class="row between" style="margin-top:6px"><span class="b num">${kmSugg} km</span><span class="row nowrap"><button class="btn sm" data-act="km-sugg" data-id="${kmSugg}">Solo andata</button><button class="btn sm" data-act="km-sugg" data-id="${kmSugg * 2}">Andata e ritorno</button></span></div>${S.trip && S.trip.end ? `<button class="btn sm" style="margin-top:6px" data-act="km-sugg" data-id="${Math.round(S.trip.km)}">Usa km GPS di oggi (${n1(S.trip.km)})</button>` : ''}</div>
    <div><label for="k-km">Km percorsi</label><input id="k-km" type="number" inputmode="numeric" value="${K.km}" data-bind-km="km" placeholder="0"></div>
    <label class="row" style="font-weight:500"><input type="checkbox" data-bind-km="rientro" ${K.rientro ? 'checked' : ''}> Rientro del veicolo a Bioggio a fine giornata</label>
    <button class="btn primary xl block" data-act="send-km">Registra km</button></div>
    ${veic ? `<div class="alert info"><span>${I('truck')}</span><span>Hai in carico il furgone <span class="t b num">${veic.targa}</span>: ${n0(veic.kmMese)} km questo mese, servizio il ${fd(veic.prossimoServizio)}.</span></div>` : ''}
    <div><div class="eyebrow" style="margin-bottom:6px">I miei km del mese</div>${mine.length ? mine.map((k) => `<div class="listrow"><span><span class="b">${fshort(k.data)}</span> · ${esc(k.da)} → ${esc(k.a)}<br><span class="small muted">${k.km} km · ${chf(k.km * P.kmTariffa, 2)}${k.rientro ? ' · rientro a Bioggio' : ''}</span></span>${pill(k.stato)}</div>`).join('') : '<p class="muted small">Nessun km registrato: viaggi con il furgone della squadra.</p>'}</div>
    <div><div class="eyebrow" style="margin-bottom:6px">Viaggi tracciati</div>${trips.map((v) => `<div class="listrow"><span><span class="b">${fshort(v.data)}</span> ${v.partenza}–${v.arrivo} · ${esc(v.a)}<br><span class="small muted">${n1(v.km)} km · ${v.minuti} min · ${esc(v.veicolo)}</span></span><span class="pill good">GPS</span></div>`).join('') || '<p class="muted small">Nessun viaggio tracciato</p>'}</div>`);
}

// ---------- MESSAGGI (telefono) ----------
function vOpMsg() {
  const w = me(); const chs = myChannels(); if (!chs.some((c) => c.id === S.chatCh)) S.chatCh = chs[0].id;
  const cur = chs.find((c) => c.id === S.chatCh);
  const msgs = DB.messaggi.filter((m) => m.ch === cur.id).sort((a, b) => a.ts.localeCompare(b.ts)); msgs.forEach((m) => { if (m.autore !== w.id) m.letto = true; });
  const resp = worker(w.ramo === 'G' ? 'C003' : 'C002'); if (!chs.some((c) => c.id === dmId(w.id, resp.id))) chs.push({ id: dmId(w.id, resp.id), nome: resp.nome, tipo: 'dm', wid: resp.id });
  return phone(`<div><div class="eyebrow">Comunicazione</div><h1>Messaggi</h1></div>
    <div class="chips">${chs.map((c) => `<button data-act="open-chat-op" data-id="${c.id}" class="${c.id === cur.id ? 'on' : ''}">${c.tipo === 'canale' ? '# ' : c.tipo === 'cantiere' ? (I('building') + ' ') : ''}${esc(c.nome.split(' ')[0] + (c.tipo === 'dm' ? ' ' + c.nome.split(' ')[1][0] + '.' : ''))}</button>`).join('')}<button data-act="new-dm">+</button></div>
    <div class="msgs" style="padding:8px 0;min-height:220px">${msgs.map((m) => { const mine = m.autore === w.id; const a = worker(m.autore); return `<div class="msg ${mine ? 'me' : ''}">${mine ? '' : avatar(a.nome, avCls(a) + ' sm')}<div><div class="meta">${mine ? '' : esc(a.nome.split(' ')[0]) + ' · '}${m.ts.slice(0, 10) === D.TODAY_ISO ? m.ts.slice(11, 16) : fdt(m.ts)}</div><div class="bub">${esc(m.testo)}${m.vocale ? (' ' + I('mic')) : ''}</div></div></div>`; }).join('') || '<p class="muted small center">Nessun messaggio</p>'}</div>
    ${voiceBox('msg')}
    <form class="composer" data-act="chat-send" data-id="${cur.id}" style="padding:0"><input id="chat-input" placeholder="Scrivi a ${esc(cur.nome)}…" autocomplete="off" value="${esc(S.sel.msgDraft || '')}"><button class="btn primary" type="submit">Invia</button></form>`);
}

// ---------- IL MIO MESE ----------
function vOpMese() {
  const w = me(); const c = myCant(w); const ip = indennitaPranzo(w, c);
  const mine = DB.bollettini.filter((b) => b.workerId === w.id);
  const ore = mine.reduce((a, b) => a + b.ore, 0), via = mine.reduce((a, b) => a + b.viaggio, 0);
  const oreOtt = 176 + 6; const straord = 6; const pranzoOtt = w.ramo === 'G' ? P.pranzoGessatoriMese : ip.val * 21;
  const km = DB.kmPrivati.filter((k) => k.workerId === w.id).reduce((a, k) => a + k.km, 0) * 3;
  const lordo = w.salario + straord * (w.salario * 13 / P.oreAnnue) * (1 + P.straordinarioPct / 100) + pranzoOtt + km * P.kmTariffa;
  const ass = DB.assenze.filter((a) => a.workerId === w.id);
  return phone(`<div><div class="eyebrow">Riepilogo personale</div><h1>${esc(w.nome)}</h1><p class="muted small">${esc(w.ruolo)} · cat. ${w.cat}</p></div>
    <div class="kpis" style="grid-template-columns:1fr 1fr">${kpi('Ore novembre (1–6)', n1(ore) + ' h', n1(via) + ' h viaggio')}${kpi('Vacanze residue', (w.vacanzeTot - w.vacanzeUsate) + ' gg', 'su ' + w.vacanzeTot + ' (CCL)')}</div>
    <div class="card"><h3>Conguaglio ottobre (stima)</h3><dl class="dl"><dt>Ore contratto</dt><dd class="num">176 h</dd><dt>Ore effettive</dt><dd class="num b">${oreOtt} h</dd><dt>Straordinari +${P.straordinarioPct}%</dt><dd class="num">${straord} h</dd><dt>Vacanze prese</dt><dd>1 giorno</dd><dt>Indennità pranzo</dt><dd class="num">${pranzoOtt ? chf(pranzoOtt) + ' (' + ip.tipo + ')' : 'nessuna (' + ip.tipo + ')'}</dd><dt>Km auto privata</dt><dd class="num">${km ? km + ' km · ' + chf(km * P.kmTariffa) : '–'}</dd><dt>Lordo stimato</dt><dd class="num b">${chf(lordo)}</dd></dl><p class="small muted" style="margin-top:8px">Salario mensile su base oraria: il conguaglio definitivo arriva con la busta paga dopo la chiusura dei bollettini.</p></div>
    <div class="card"><h3>Assenze e richieste</h3>${ass.map((a) => `<div class="listrow"><span>${a.tipo}<br><span class="small muted">${fd(a.dal)} – ${fd(a.al)} · ${a.giorni} gg</span></span>${pill(a.stato)}</div>`).join('') || '<p class="muted small">Nessuna</p>'}<div class="row" style="margin-top:10px"><button class="btn sm" data-act="op-vac">${I('sun')} Chiedi vacanze</button><button class="btn sm" data-act="op-sick">${I('thermometer')} Segnala malattia</button></div></div>
    <div class="card"><h3>I miei dati</h3><dl class="dl"><dt>Competenze</dt><dd>${w.competenze.join(', ')}</dd><dt>Certificazioni</dt><dd>${(w.certificazioni || []).join(', ') || '–'}</dd><dt>Telefono</dt><dd>${esc(w.tel)}</dd><dt>Residenza</dt><dd>${esc(w.residenza)}</dd></dl><div class="row" style="margin-top:10px"><button class="btn sm" data-act="toast" data-msg="Richiesta di modifica dati inviata all'ufficio">Modifica dati</button><button class="btn sm" data-act="toast" data-msg="Buste paga e certificati in OneDrive personale">Documenti</button></div></div>`);
}
