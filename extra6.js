/* MyColor Gestionale – v11: fattura fornitore riga per riga con visto, rapporto lavori a regia con firma del cliente,
   lista materiale per cantiere e memoria colori nel cliente. Vedi REQUISITI-IVO.md, sezione 2, punti 1-3. */

// ---------- costanti ----------
const CANT_CHIUSI_GG = 90;
const REGIA_CAT = { 'Capo operaio': 92, 'Operaio qualificato': 82, Manovale: 68, Apprendista: 45 };
const MAT_TIPI = ['Dispersione opaca', 'Pittura lavabile', 'Smalto', 'Tappezzeria', 'Intonaco', 'Rasante', 'Silossanica facciate', 'Resina', 'Altro'];
const KIT_PITTURA = [['Rotolo plastica', '1'], ['Nastro carta 50 mm', '4'], ['Nastro gold', '3'], ['Paperelle', '3'], ['Silicone acrilico', '3'], ['Quick mask', '2'], ['Sacchi neri', '5'], ['Stracci', '5'], ['Scala 5 gradini', '1'], ['Scala 6 gradini', '1'], ['Secchio vuoto', '2'], ['Stucco', '2 kg'], ['Carta vetrata 180', '6'], ['Scopa più paletta', '1'], ['Aspirapolvere', '1'], ['Pintasol completi', '2'], ['Rulli 25 cm + griglia', '2'], ['Pennelli assortiti', '1 set'], ['Fondo isolante', '10 l'], ['Dispersione (colore dal cliente)', 'da listino']];
const KIT_GESSO = [['Lastre cartongesso 12.5 mm', 'da piano'], ['Profili C/U 50', 'da piano'], ['Viti 3.5×35', '2000 pz'], ['Nastro giunti', '4'], ['Stucco Uniflott 25 kg', '4'], ['Spatole + cazzuola', '2 set'], ['Avvitatore + inserti', '2'], ['Livella laser', '1'], ['Taglierino + lame', '2'], ['Sacchi neri', '5'], ['Scala 6 gradini', '1'], ['Protezione pavimenti', '2 rotoli']];
const SIG_SVG = ['M10 70 C 30 10, 50 90, 70 40 S 110 20, 130 60 S 170 90, 190 40 S 240 30, 280 55', 'M12 60 C 40 20, 60 80, 90 45 C 110 20, 120 70, 150 55 C 190 35, 200 75, 280 40'];
const SEED_MATERIALI = {
  K01: [{ data: '2026-10-20', cantiere: 'MC 20-26.409', dove: 'Soggiorno e corridoi', prodotto: 'Caparol Indeko-plus', colore: 'NCS S 0502-Y (bianco caldo)', tipo: 'Dispersione opaca', note: '2 mani; il cliente vuole lo stesso bianco per i ritocchi' }, { data: '2026-10-22', cantiere: 'MC 20-26.409', dove: 'Cucina', prodotto: 'Caparol Latex Samtex 7', colore: 'RAL 9010', tipo: 'Pittura lavabile', note: '' }, { data: '2026-10-27', cantiere: 'MC 20-26.409', dove: 'Porte e battiscopa', prodotto: 'Sikkens Rubbol BL Satura', colore: 'RAL 9016', tipo: 'Smalto', note: 'satinato, all\'acqua' }],
  K04: [{ data: '2026-11-03', cantiere: 'MC 20-26.421', dove: 'Camere piano 2', prodotto: 'Caparol Indeko-plus', colore: 'Elephant\'s Breath 229 (campione approvato)', tipo: 'Dispersione opaca', note: '' }, { data: '2026-11-04', cantiere: 'MC 20-26.421', dove: 'Corridoi', prodotto: 'Tappezzeria Marburg Opulence', colore: 'ref. 58241', tipo: 'Tappezzeria', note: '3 rotoli di scorta in magazzino' }],
  K02: [{ data: '2026-09-30', cantiere: 'MC 20-26.388', dove: 'Facciate', prodotto: 'StoColor Silco', colore: 'Sto 32117 (beige)', tipo: 'Silossanica facciate', note: 'stesso colore per i prossimi stabili AIL' }],
  K06: [{ data: '2026-10-05', cantiere: 'MC 20-26.402', dove: 'Facciata', prodotto: 'Sika Sikagard 675 W', colore: 'RAL 7035', tipo: 'Altro', note: 'protettivo elastico' }],
};
const SEED_LISTA_421 = [['rotolo plastica', '1', 1, 1], ['nastri gold', '4', 1, 1], ['nastri carta', '3', 1, 1], ['paperelle', '3', 1, 1], ['silicone acrilico', '3', 1, 1], ['quick mask', '3', 1, 1], ['sacchi neri', '5', 1, 1], ['stracci', '5', 1, 1], ['scala 5 gradini', '1', 1, 1], ['secchio vuoto', '2', 1, 1], ['living bianco', '1', 1, 1], ['diluente nitro', '1 lt', 1, 1], ['antimuffa', '1 kg', 1, 0], ['secchio 5 kg', '2', 1, 0], ['stucco', '2 kg', 1, 0], ['carta vetrata 180', '6', 1, 0], ['scopa più paletta', '1', 1, 0], ['scala 6 gradini', '1', 1, 0], ['aspirapolvere', '1', 1, 0], ['colla bianca', 'mezzo', 1, 0], ['stucco bicomponente', '1', 1, 0], ['antimacchia', '1', 1, 0], ['pintasol completi', '2', 1, 0], ['geolite', '1', 1, 0]];
const SEED_LISTA_409 = [['Rotolo plastica', '2', 1, 1], ['Nastro carta 50 mm', '6', 1, 1], ['Nastro gold', '4', 1, 1], ['Indeko-plus 12.5 l (NCS S 0502-Y)', '6', 1, 0], ['Latex Samtex 7 RAL 9010', '2', 1, 0], ['Rubbol BL Satura RAL 9016', '2', 0, 0], ['Fondo isolante 10 l', '2', 0, 0], ['Carta vetrata 180', '10', 1, 0], ['Rulli 25 cm + griglia', '3', 1, 0], ['Scala 6 gradini', '1', 0, 0]];

// ---------- migrazione dati (idempotente, anche per DB salvati prima della v11) ----------
const wid6 = (nome) => (DB.workers.find((w) => w.nome === nome) || {}).id || null;
function ffMaxInt() { let n = 0; DB.fattForn.forEach((f) => { const m = String(f.nInt || '').match(/^F(\d+)$/); if (m) n = Math.max(n, +m[1]); }); return n; }
function ffNumForn(f) { const m = String(f.allegato || '').match(/(\d{3,})/); if (m) return (f.allegato.includes('scontrino') ? 'SC-' : 'R') + m[1]; const k = String(f.id).match(/(\d+)$/); return 'R' + (k ? k[1] : f.id); }
function seedRegie() {
  return [
    { id: 'RG-2026-0041', data: '2026-11-04', cantiere: 'MC 20-26.409', workerId: wid6('Francesco De Luca'), desc: 'Ritocchi pareti corridoio piano 1 dopo il passaggio dell\'elettricista: stuccatura fori, carteggiatura e ripresa colore. Non previsto nell\'offerta.', richiesto: 'Sig. Bernasconi', mo: [{ cat: 'Operaio qualificato', n: 1, ore: 3.5 }], mat: 'Indeko-plus 12.5 l × 1, stucco 1 kg', matChf: 110, firma: { nome: 'Giorgio Bernasconi', ts: '2026-11-04T16:40', svg: SIG_SVG[0] }, stato: 'Inviato', fatturaId: null },
    { id: 'RG-2026-0038', data: '2026-10-29', cantiere: 'MC 20-26.421', workerId: wid6('Claudio Ponti'), desc: 'Preparazione supporto per finitura, sala colazione (richiesta della direzione durante i lavori alle camere).', richiesto: 'Direzione hotel', mo: [{ cat: 'Operaio qualificato', n: 2, ore: 8 }], mat: '', matChf: 0, firma: { nome: 'Daniela Ruggeri', ts: '2026-10-29T17:05', svg: SIG_SVG[1] }, stato: 'Controllato', fatturaId: null },
    { id: 'RG-2026-0035', data: '2026-10-27', cantiere: 'MC 20-26.395', workerId: wid6('Andrea Mazzola') || wid6('Francesco De Luca'), desc: 'Rimozione vecchia tappezzeria vano scala B, non prevista.', richiesto: 'Amministrazione', mo: [{ cat: 'Operaio qualificato', n: 1, ore: 4 }, { cat: 'Manovale', n: 1, ore: 4 }], mat: '', matChf: 0, firma: null, stato: 'Da firmare', fatturaId: null },
  ];
}
function seedListe() {
  const mk = (rows, chi, data) => ({ aggiornata: data, chi, righe: rows.map((r) => ({ m: r[0], q: r[1], prep: !!r[2], car: !!r[3] })) });
  return { 'MC 20-26.421': mk(SEED_LISTA_421, 'C002', '2026-11-02'), 'MC 20-26.409': mk(SEED_LISTA_409, 'C002', '2026-11-05') };
}
function ensure6() {
  if (!DB.regie) DB.regie = seedRegie();
  if (!DB.liste) DB.liste = seedListe();
  DB.clienti.forEach((k) => { if (!k.materiali) k.materiali = SEED_MATERIALI[k.id] ? clone(SEED_MATERIALI[k.id]) : []; });
  const senza = DB.fattForn.filter((f) => !f.nInt).sort((a, b) => (a.data || '').localeCompare(b.data || '') || String(a.id).localeCompare(String(b.id)));
  if (senza.length) { let n = ffMaxInt() || (1013 - senza.length); senza.forEach((f) => { f.nInt = 'F' + (++n); }); }
  DB.fattForn.forEach((f) => { if (!f.nForn) f.nForn = ffNumForn(f); if (!f.voci) f.voci = []; if (f.cantiere) f.voci.forEach((v) => { if (v.length < 4) v[3] = f.cantiere; }); });
  const sto = DB.fattForn.find((f) => f.id === 'FF-2026-1190');
  if (sto && !sto._v11) { sto._v11 = true; sto.stato = 'Da vistare'; if (sto.voci[2]) sto.voci[2][3] = 'MC 20-26.395'; sto.multi = true; }
  if (!S.regiaForm) regiaReset();
  if (!S.sig) S.sig = { strokes: [], cur: null, nome: '' };
}
function regiaReset() { S.regiaForm = { cantiere: null, desc: '', richiesto: '', mo: [{ cat: 'Operaio qualificato', n: 1, ore: '' }], mat: '', matChf: '' }; }

// ---------- fatture fornitori: righe, quote, numerazione ----------
const rowTot = (v) => (+v[1] || 0) * (+v[2] || 0);
const ffIva = (f) => f.iva != null ? f.iva : P.ivaPct;
const ffNetto = (f) => f.voci.reduce((a, v) => a + rowTot(v), 0);
function ffQuote(f) {
  const q = {}; const netto = ffNetto(f);
  if (!netto || !f.voci.length) { if (f.cantiere) q[f.cantiere] = f.importo; return q; }
  f.voci.forEach((v) => { const c = v[3] || null; if (!c) return; q[c] = (q[c] || 0) + rowTot(v) / netto * f.importo; });
  return q;
}
const ffNonAssegnato = (f) => Math.max(0, f.importo - Object.values(ffQuote(f)).reduce((a, x) => a + x, 0));
const ffCantieri = (f) => Object.keys(ffQuote(f));
function ffSyncPrimary(f) { const q = ffQuote(f); const ks = Object.keys(q).sort((a, b) => q[b] - q[a]); f.cantiere = ks[0] || null; f.multi = ks.length > 1; }
const isGesso = (c) => !!c && /gess|cartong|intonac|controsoff|rasatur/i.test(c.tipo || '');
function ffResp(f) { if (f.categoria === 'Materiale gessatura') return 'C003'; const c = cant(f.cantiere); if (isGesso(c)) return 'C003'; if (f.categoria === 'Materiale pittura') return 'C002'; return c ? 'C002' : 'C002'; }
const nextNInt = () => 'F' + (ffMaxInt() + 1);
function cantAssegnabili() { const lim = addDays(D.TODAY_ISO, -CANT_CHIUSI_GG); return DB.cantieri.filter((c) => c.stato !== 'Concluso' || (c.fine || '') >= lim); }
const cantOpt = (sel) => `<option value="">Da assegnare</option>${cantAssegnabili().map((c) => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${c.id} · ${esc(c.nome)}${c.stato === 'Concluso' ? ' (concluso il ' + fd(c.fine) + ')' : ''}</option>`).join('')}`;
const pill6 = (s) => s === 'Da vistare' ? `<span class="pill warn">Da vistare</span>` : pill(s);
const allegatoLink = (f) => { const file = f.allegato || ''; const known = ['Suncolor_fattura_1201.pdf', 'foto_scontrino_jumbo.jpg']; const hit = known.find((k) => k === file); return hit ? `<a class="btn sm" href="esempi/${hit}" target="_blank" rel="noopener">${I('attach')} ${esc(file)}</a>` : file ? `<button class="btn sm" data-act="toast" data-msg="Apre ${esc(file)} in SharePoint/Fornitori">${I('attach')} ${esc(file)}</button>` : ''; };
function ffQuoteBar(f) {
  const q = ffQuote(f); const na = ffNonAssegnato(f); const ks = Object.keys(q);
  return `<div class="row" style="flex-wrap:wrap;gap:6px">${ks.map((k) => `<span class="pill info" title="${esc((cant(k) || {}).nome || '')}">${k} · ${chf(q[k], 2)}</span>`).join('')}${na > 0.05 ? `<span class="pill bad">non assegnato · ${chf(na, 2)}</span>` : ''}${!ks.length && na <= 0.05 ? '<span class="pill">–</span>' : ''}</div>`;
}

// calc(c) riscritta: fatture fornitori in quota per cantiere, riga per riga
function calc(c) {
  const off = DB.offerte.find((o) => o.cantiere === c.id);
  const varApp = off ? off.variazioni.filter((v) => v.stato === 'Approvata dal cliente').reduce((a, v) => a + v.importo, 0) : 0;
  const contratto = (c.deliberato || c.preventivo || 0) + varApp;
  const maturato = contratto * (c.avanzamento || 0) / 100;
  const ffq = []; let forn = 0; const byCat = {};
  DB.fattForn.forEach((f) => { const q = ffQuote(f)[c.id]; if (q) { ffq.push({ f, quota: q }); forn += q; byCat[f.categoria] = (byCat[f.categoria] || 0) + q; } });
  const prelievi = DB.movimenti.filter((m) => m.cantiere === c.id && m.tipo === 'Scarico').reduce((a, m) => a + m.valore, 0);
  const cmedio = costoMedioSquadra(c);
  const costoOre = (c.oreFatte || 0) * cmedio;
  const costi = costoOre + forn + prelievi;
  const margine = maturato - costi;
  const chfOra = c.oreFatte ? (maturato - forn - prelievi) / c.oreFatte : 0;
  const fatt = DB.fatture.filter((f) => f.cantiere === c.id);
  const fatturato = fatt.reduce((a, f) => a + f.importo, 0);
  const incassato = fatt.filter((f) => f.stato === 'Pagata').reduce((a, f) => a + f.importo, 0);
  return { contratto, varApp, maturato, forn, byCat, prelievi, cmedio, costoOre, costi, margine, margPct: maturato ? margine / maturato * 100 : 0, chfOra, fatturato, incassato, off, ff: ffq.map((x) => x.f), ffq };
}

// buildBatch riscritta: una riga contabile per cantiere dalle quote
function buildBatch() {
  const ore = DB.bollettini.filter((b) => b.stato === 'Approvato');
  const byCant = {}; ore.forEach((b) => { const w = worker(b.workerId); byCant[b.cantiere] = (byCant[b.cantiere] || 0) + (b.ore + b.viaggio) * w.costoOra; });
  const lines = Object.entries(byCant).map(([c, v]) => ({ accountNumber: '5000', contraAccountNumber: '2050', amount: Math.round(v * 100) / 100, text: 'Salari produttivi ' + c, costCenter: c, date: D.TODAY_ISO }));
  DB.fattForn.filter((f) => f.stato === 'Registrata').forEach((f) => { const q = ffQuote(f); Object.entries(q).forEach(([c, v]) => lines.push({ accountNumber: CONTO_CAT[f.categoria] || '4000', contraAccountNumber: '2000', amount: Math.round(v * 100) / 100, text: fornitore(f.fornitoreId).nome + ' ' + (f.nInt || f.id) + ' (' + (f.nForn || '') + ')', costCenter: c, date: D.TODAY_ISO, vatCode: 'VM81', reference: f.id })); });
  DB.fatture.filter((f) => f.stato === 'Inviata' && f.data >= '2026-11-01').forEach((f) => lines.push({ accountNumber: '1100', contraAccountNumber: '3000', amount: f.importo, text: cliente(f.clienteId).nome + ' ' + f.id, costCenter: f.cantiere, date: f.data, vatCode: 'UM81' }));
  return { batchPostingId: null, name: 'Gestionale ' + D.TODAY_ISO, currency: 'CHF', postings: lines };
}

// ---------- OCR: lettura riga per riga con "Assegna a" ----------
const ocrModal0 = ocrModal;
ocrModal = function (m) {
  if (m.step !== 'result') return ocrModal0(m);
  ensure6(); const s = m.data; if (!s.sel) s.sel = []; if (!s.nForn) { const nums = String(s.numero || '').match(/\d{3,}/g); s.nForn = nums ? (/scontrino|^SC/i.test(s.numero + ' ' + (s.file || '')) ? 'SC-' : 'R') + nums[nums.length - 1] : s.numero; }
  s.voci.forEach((v) => { if (v.length < 4) v[3] = s.cantiere || null; });
  const forn = DB.fornitori.find((f) => f.nome === s.fornitore); const tot = ffNetto(s); const ivaV = Math.round(tot * s.iva) / 100; const importo = tot + ivaV;
  s.importo = importo; const resp = worker(ffResp({ categoria: s.categoria, cantiere: s.cantiere, fornitoreId: forn && forn.id }));
  const canVisto = ['C001', 'C002', 'C003'].includes(S.user.wid);
  return `<form data-act="ocr-submit" class="stack"><div class="row between"><h2>Fattura letta ${s.confidenza >= 0.9 ? `<span class="conf">affidabilità ${Math.round(s.confidenza * 100)}%</span>` : `<span class="conf mid">affidabilità ${Math.round(s.confidenza * 100)}%: verifica i campi</span>`}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label>Numero interno <span class="conf">automatico</span></label><input value="${nextNInt()}" disabled></div><div><label>Numero fattura del fornitore <span class="conf">letto</span></label><input name="nForn" data-ocr6="nForn" value="${esc(s.nForn)}"></div>
    <div><label>Fornitore ${forn ? '<span class="conf">in anagrafica</span>' : '<span class="conf mid">nuovo</span>'}</label><select name="fornitoreId">${DB.fornitori.map((f) => `<option value="${f.id}" ${forn && forn.id === f.id ? 'selected' : ''}>${esc(f.nome)}</option>`).join('')}</select></div><div><label>Categoria di costo <span class="conf">suggerita</span></label><select name="categoria">${D.CATEGORIE_COSTO.map((x) => `<option ${x === s.categoria ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    <div><label>Data</label><input name="data" type="date" data-ocr6="data" value="${s.data}"></div><div><label>Scadenza</label><input name="scadenza" type="date" data-ocr6="scadenza" value="${s.scadenza}"></div></div>
    <div class="small muted">${s.cantiere ? `Riferimento trovato nel documento: "<b>${esc(s.riferimento)}</b>". Le righe sono proposte su ${s.cantiere}: correggi quelle che vanno su un altro cantiere.` : `Nessun riferimento al cantiere nel documento: assegna ogni riga.`} ${forn && forn.sconto ? `Sconto contrattuale <b>${forn.sconto}%</b>: controlla che sia applicato.` : ''}</div>
    ${ffRowsEditor(s, 'ocr')}
    <div class="row between" style="flex-wrap:wrap"><span class="small muted">Imponibile ${chf(tot, 2)} + IVA ${s.iva}% ${chf(ivaV, 2)} · <b>Totale ${chf(importo, 2)}</b> · visto di ${esc(resp.nome.split(' ')[0])}</span><div class="row"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn ${canVisto ? '' : 'primary'}" type="submit" name="mode" value="vistare">Registra (da vistare)</button>${canVisto ? `<button class="btn primary" type="submit" name="mode" value="visto">Registra e vista</button>` : ''}</div></div></form>`;
};
// editor righe condiviso (OCR e modale visto): checkbox + select per riga + barra bulk + riepilogo quote
function ffRowsEditor(f, key) {
  const sel = f.sel || (f.sel = []); const q = ffQuote(f); const na = ffNonAssegnato(f);
  return `<div class="card pad0"><div class="row between" style="padding:8px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap"><span class="small"><b>${sel.length}</b> righe selezionate</span><div class="row nowrap"><select id="ff-bulk-${key}" style="min-width:220px">${cantOpt('')}</select><button type="button" class="btn sm primary" data-act="ff-bulk" data-id="${key}" ${sel.length ? '' : 'disabled'}>Assegna le selezionate</button></div></div>
    <div class="tw"><table><thead><tr><th class="ck"><input type="checkbox" data-act="ff-selall" data-id="${key}" ${sel.length === f.voci.length && f.voci.length ? 'checked' : ''} aria-label="Seleziona tutte"></th><th class="wrap">Voce letta</th><th class="right num">Q.tà</th><th class="right num">Prezzo</th><th class="right num">Totale</th><th>Assegna a</th></tr></thead><tbody>${f.voci.map((v, i) => `<tr class="${sel.includes(i) ? 'sel' : ''}"><td class="ck"><input type="checkbox" data-act="ff-sel" data-id="${key}|${i}" ${sel.includes(i) ? 'checked' : ''} aria-label="Seleziona riga"></td><td class="wrap">${esc(v[0])}</td><td class="right num">${n0(v[1])}</td><td class="right num">${chf(v[2], 2)}</td><td class="right num">${chf(rowTot(v), 2)}</td><td><select data-ffrow="${key}|${i}" style="min-width:200px" class="${v[3] ? '' : 'warnsel'}">${cantOpt(v[3])}</select></td></tr>`).join('')}</tbody></table></div>
    <div class="row between" style="padding:10px 12px;flex-wrap:wrap"><span class="small muted">Quote per cantiere (IVA inclusa)</span>${ffQuoteBar(f)}</div>${na > 0.05 ? `<div class="small muted" style="padding:0 12px 10px">I cantieri conclusi da più di 3 mesi non compaiono nell'elenco.</div>` : ''}</div>`;
}
function ocrSubmit(form) {
  ensure6(); const fdata = new FormData(form); const s = S.modal.data; const tot = ffNetto(s); const importo = Math.round(tot * (1 + s.iva / 100) * 100) / 100;
  const mode = (form.querySelector('button[type=submit]:focus') || {}).value || (S._ocrMode) || 'vistare';
  const f = { id: nextId('FF-2026-', DB.fattForn), nInt: nextNInt(), nForn: fdata.get('nForn') || s.nForn, cantiere: null, fornitoreId: fdata.get('fornitoreId'), categoria: fdata.get('categoria'), data: fdata.get('data'), scadenza: fdata.get('scadenza'), importo, iva: s.iva, stato: 'Da vistare', allegato: S.modal.file, voci: s.voci.map((v) => [v[0], v[1], v[2], v[3] || null]) };
  ffSyncPrimary(f);
  if (mode === 'visto') { f.visto = { chi: S.user.wid, ts: nowISO() }; f.stato = ffNonAssegnato(f) > 0.05 ? 'Da assegnare' : 'Registrata'; }
  else { f.stato = 'Da vistare'; const r = ffResp(f); notify(`Fattura ${f.nInt} ${fornitore(f.fornitoreId).nome} ${chf(f.importo)} da vistare`, 'contabilita', 'ff', ['C001', r]); }
  DB.fattForn.unshift(f); S.modal = null; S._ocrMode = null;
  toast(`Fattura ${f.nInt} (${f.nForn}) registrata` + (f.stato === 'Da vistare' ? ', in attesa del visto di ' + worker(ffResp(f)).nome.split(' ')[0] : f.stato === 'Registrata' ? ' su ' + ffCantieri(f).length + ' cantier' + (ffCantieri(f).length === 1 ? 'e' : 'i') + ' · pronta per SelectLine' : ', righe da assegnare'));
}

// ---------- modale visto fattura (ff-vista) ----------
function ffVistaModal(m) {
  ensure6(); const f = DB.fattForn.find((x) => x.id === m.id); if (!f) return '<p>Fattura non trovata</p>';
  if (!f.sel) f.sel = []; const fo = fornitore(f.fornitoreId); const resp = worker(ffResp(f)); const na = ffNonAssegnato(f);
  const canVisto = S.user.role !== 'operaio';
  return `<div class="row between"><h2>${I('file')} Fattura ${f.nInt} <span class="muted" style="font-weight:400">· ${esc(fo.nome)} n. ${esc(f.nForn)}</span></h2><div class="row nowrap">${pill6(f.stato)}<button class="btn sm" data-act="close">Chiudi</button></div></div>
    <div class="grid2"><div class="card" style="padding:12px 14px"><dl class="dl"><dt>Numero interno</dt><dd class="num b">${f.nInt}</dd><dt>Numero fornitore</dt><dd class="num">${esc(f.nForn)}</dd><dt>Fornitore</dt><dd><button class="lnk" data-act="open-fornitore" data-id="${fo.id}">${esc(fo.nome)}</button> · ${esc(fo.pagamento || '')}</dd><dt>Data · scadenza</dt><dd class="num">${fd(f.data)} · ${fd(f.scadenza)}</dd><dt>Categoria</dt><dd>${esc(f.categoria)}</dd></dl></div>
    <div class="card" style="padding:12px 14px"><dl class="dl"><dt>Importo (IVA incl.)</dt><dd class="num b">${chf(f.importo, 2)}</dd><dt>Visto di</dt><dd>${f.visto ? `${esc(worker(f.visto.chi).nome)} · ${fdt(f.visto.ts)}` : `<span class="pill warn">atteso da ${esc(resp.nome.split(' ')[0])}</span>`}</dd><dt>Allegato</dt><dd>${allegatoLink(f) || '–'}</dd><dt>SelectLine</dt><dd>${f.stato === 'Esportata SelectLine' ? '<span class="pill good">esportata</span>' : f.stato === 'Registrata' ? '<span class="pill info">pronta per l\'export</span>' : '<span class="pill">non ancora</span>'}</dd></dl></div></div>
    ${fo.sconto ? `<div class="alert info"><span>${I('info')}</span><span>Sconto contrattuale <b>${fo.sconto}%</b> con ${esc(fo.nome)}: controlla che sia applicato sulle righe. Se manca, segnala l'errore al fornitore prima del visto.</span></div>` : ''}
    ${ffRowsEditor(f, 'vista')}
    <div class="row between" style="flex-wrap:wrap"><button class="btn" data-act="ff-err" data-id="${f.id}">${I('mail')} Segnala errore al fornitore</button><div class="row">${f.stato === 'Esportata SelectLine' ? '<span class="small muted">Già esportata: le modifiche alle righe generano una rettifica in SelectLine.</span>' : canVisto ? `<button class="btn primary" data-act="ff-visto" data-id="${f.id}">${I('check')} ${na > 0.05 ? 'Vista (restano righe da assegnare)' : 'Vista e registra'}</button>` : ''}</div></div>`;
}

// ---------- Contabilità → tab fatture fornitori ----------
function ffTab6() {
  ensure6(); const fl = S.sel.ffFiltro || 'tutte';
  const daV = DB.fattForn.filter((f) => f.stato === 'Da vistare'); const daA = DB.fattForn.filter((f) => f.stato === 'Da assegnare' || ffNonAssegnato(f) > 0.05); const pronte = DB.fattForn.filter((f) => f.stato === 'Registrata');
  const list = DB.fattForn.filter((f) => fl === 'tutte' || (fl === 'vistare' && f.stato === 'Da vistare') || (fl === 'assegnare' && daA.includes(f)) || (fl === 'registrate' && f.stato === 'Registrata') || (fl === 'esportate' && f.stato === 'Esportata SelectLine')).slice().sort((a, b) => (b.nInt || '').localeCompare(a.nInt || '', undefined, { numeric: true }));
  const righeNA = DB.fattForn.reduce((a, f) => a + f.voci.filter((v) => !v[3]).length, 0);
  return `<div class="kpis" style="grid-template-columns:repeat(3,1fr)">${kpi('Da vistare', daV.length, `gessatura ${daV.filter((f) => ffResp(f) === 'C003').length} · pittura ${daV.filter((f) => ffResp(f) === 'C002').length}`, daV.length ? 'warn' : 'good')}${kpi('Righe senza cantiere', righeNA, daA.length + ' fatture', righeNA ? 'bad' : 'good')}${kpi('Pronte per SelectLine', pronte.length, chf(pronte.reduce((a, f) => a + f.importo, 0)))}</div>
    <div class="row between" style="flex-wrap:wrap">${chips('ff-filtro', fl, [['tutte', 'Tutte (' + DB.fattForn.length + ')'], ['vistare', 'Da vistare (' + daV.length + ')'], ['assegnare', 'Righe da assegnare (' + daA.length + ')'], ['registrate', 'Registrate (' + pronte.length + ')'], ['esportate', 'Esportate']])}<div class="row"><button class="btn" data-act="export-csv" data-id="ff">${I('download')} Esporta</button><button class="btn primary" data-act="ocr-open">${I('camera')} Carica fattura</button></div></div>
    <p class="small muted">Ogni fattura entra con un numero interno progressivo e il numero del fornitore, passa al visto di Antonio (gessatura) o Stefano (pittura) e viene assegnata ai cantieri riga per riga. Ogni costo nel cantiere rimanda alla fattura d'origine.</p>
    ${selbar('ff', 'fatturaForn', [{ label: 'Esporta a SelectLine', act: 'bulk-export-ff' }])}
    <div class="card pad0">${table([{ h: 'N. interno' }, { h: 'N. fornitore' }, { h: 'Fornitore', cls: 'wrap' }, { h: 'Data · scad.' }, { h: 'Importo', cls: 'right num' }, { h: 'Cantieri', cls: 'wrap' }, { h: 'Visto' }, { h: 'Stato' }, { h: '' }],
      list.map((f) => ({ id: f.id, c: [`<span class="b num">${f.nInt}</span>`, `<span class="num">${esc(f.nForn)}</span>${f.allegato ? `<br><span class="small muted">${I('attach')} ${esc(f.allegato)}</span>` : ''}`, esc(fornitore(f.fornitoreId).nome) + `<br><span class="pill">${esc(f.categoria)}</span>`, `<span class="num small">${fd(f.data)}<br>${fd(f.scadenza)}</span>`, chf(f.importo, 2), ffQuoteBar(f), f.visto ? `<span class="small">${esc(worker(f.visto.chi).nome.split(' ')[0])}<br><span class="muted">${fshort(f.visto.ts)}</span></span>` : `<span class="small muted">${esc(worker(ffResp(f)).nome.split(' ')[0])}</span>`, pill6(f.stato), `<button class="btn sm ${f.stato === 'Da vistare' ? 'primary' : ''}" data-act="ff-vista" data-id="${f.id}">${f.stato === 'Da vistare' ? 'Vista' : 'Apri'}</button>`] })), { sel: 'ff', empty: 'Nessuna fattura con questo filtro' })}</div>`;
}
const vContabilita0 = vContabilita;
vContabilita = function () {
  ensure6(); const out = vContabilita0(); const tb = curTab('cont', 'sync');
  const i0 = out.indexOf('<div class="tabs">'); if (i0 < 0) return out; const i1 = out.indexOf('</div>', i0) + 6;
  const bar = tabs('cont', [['sync', 'Sincronizzazione'], ['ff', 'Fatture fornitori (' + DB.fattForn.length + ')'], ['fc', 'Fatture clienti (' + DB.fatture.length + ')'], ['conti', 'Mapping conti']]);
  return out.slice(0, i0) + bar + (tb === 'ff' ? ffTab6() : out.slice(i1));
};

// ---------- Cantiere: tab costi riscritta + tab materiale ----------
const CAT_COL6 = ['var(--s3)', 'var(--s5)', 'var(--info)', 'var(--good)', 'var(--muted)', 'var(--s1)', 'var(--s2)'];
function costiTab6(c, r) {
  const fc = S.sel.filtroCat || 'tutte'; const cats = Object.entries(r.byCat).sort((a, b) => b[1] - a[1]);
  const lst = r.ffq.filter((x) => fc === 'tutte' || x.f.categoria === fc).sort((a, b) => (b.f.data || '').localeCompare(a.f.data || ''));
  const mov = DB.movimenti.filter((m) => m.cantiere === c.id);
  return `<div class="grid3">${kpi('Fatture fornitori', chf(r.forn), r.ffq.length + ' fatture, in quota')}${kpi('Prelievi magazzino', chf(r.prelievi), mov.filter((m) => m.tipo === 'Scarico').length + ' scarichi')}${kpi('Ore (squadra)', chf(r.costoOre), n0(c.oreFatte) + ' h × ' + chf(r.cmedio, 2))}</div>
    <div class="card"><h3>Costi per categoria</h3>${hbars([...cats.map(([k, v], i) => ({ label: k, segs: [{ v, color: CAT_COL6[i % CAT_COL6.length], name: k }], right: chf(v) })), { label: 'Prelievi magazzino', segs: [{ v: r.prelievi, color: 'var(--ink-2)', name: 'Magazzino' }], right: chf(r.prelievi) }], Math.max(...cats.map((x) => x[1]), r.prelievi, 1) * 1.05)}</div>
    <div class="row between"><div class="chips">${[['tutte', 'Tutte le categorie'], ...cats.map(([k]) => [k, k])].map((x) => `<button data-act="filtro-cat" data-id="${esc(x[0])}" class="${fc === x[0] ? 'on' : ''}">${esc(x[1])}</button>`).join('')}</div><div class="row"><button class="btn" data-act="export-csv" data-id="ff-cant">${I('download')} Esporta</button><button class="btn primary" data-act="ocr-open" data-cant="${c.id}">${I('camera')} Carica fattura</button></div></div>
    <p class="small muted">Ogni costo rimanda alla fattura d'origine. Se la fattura copre più cantieri, qui vedi solo la quota e le righe di ${esc(c.nome)}.</p>
    <div class="stack">${lst.map(({ f, quota }) => { const righe = f.voci.filter((v) => v[3] === c.id); const nC = ffCantieri(f).length; return `<div class="card"><div class="row between" style="flex-wrap:wrap"><div><span class="b" data-act="open-fornitore" data-id="${f.fornitoreId}" style="cursor:pointer">${esc(fornitore(f.fornitoreId).nome)}</span> <span class="muted small">· <span class="num">${f.nInt}</span> · n. forn. ${esc(f.nForn)} · ${fd(f.data)} · scad. ${fd(f.scadenza)}</span><br><span class="pill">${esc(f.categoria)}</span> ${nC > 1 ? `<span class="pill info">quota di ${chf(f.importo, 2)} su ${nC} cantieri</span>` : ''} ${f.visto ? `<span class="small muted">visto ${esc(worker(f.visto.chi).nome.split(' ')[0])}</span>` : ''}</div><div class="row nowrap"><span class="b num">${chf(quota, 2)}</span>${pill6(f.stato)}<button class="btn sm" data-act="ff-vista" data-id="${f.id}">${I('file')} Apri fattura</button></div></div>
      ${righe.length ? table([{ h: 'Voce', cls: 'wrap' }, { h: 'Q.tà', cls: 'right num' }, { h: 'Prezzo', cls: 'right num' }, { h: 'Totale', cls: 'right num' }], righe.map((v) => ({ c: [esc(v[0]), n0(v[1]), chf(v[2], 2), chf(rowTot(v), 2)] }))) : ''}</div>`; }).join('') || '<p class="muted">Nessuna fattura in questa categoria</p>'}</div>
    <div class="card pad0"><div class="cardhd"><h3>Prelievi dal magazzino</h3><button class="btn sm" data-act="stock-open" data-cant="${c.id}">+ Scarico</button></div>${table([{ h: 'Data' }, { h: 'Articolo', cls: 'wrap' }, { h: 'Q.tà', cls: 'right num' }, { h: 'Chi' }, { h: 'Valore', cls: 'right num' }], mov.filter((m) => m.tipo === 'Scarico').map((m) => { const a = DB.magazzino.find((x) => x.cod === m.articolo) || {}; return { c: [fd(m.data), esc(a.nome || m.articolo), n0(m.qta) + ' ' + (a.unita || ''), worker(m.chi).nome, chf(m.valore)] }; }), { empty: 'Nessun prelievo' })}</div>`;
}
const listaDi = (cid) => DB.liste[cid] || (DB.liste[cid] = { aggiornata: D.TODAY_ISO, chi: S.user ? S.user.wid : 'C002', righe: [] });
const listaProg = (cid) => { const l = DB.liste[cid]; if (!l || !l.righe.length) return '0'; return l.righe.filter((r) => r.car).length + '/' + l.righe.length; };
function prepTab6(c) {
  const l = listaDi(c.id); const n = l.righe.length; const np = l.righe.filter((r) => r.prep).length; const nc = l.righe.filter((r) => r.car).length; const k = cliente(c.clienteId);
  const kit = isGesso(c) ? 'gesso' : 'pittura';
  return `<div class="grid2"><div class="card"><div class="row between" style="flex-wrap:wrap"><div><h3>Lista materiale del cantiere</h3><p class="small muted" style="margin:2px 0 0">Preparata in magazzino da ${esc(worker(l.chi).nome.split(' ')[0])} · aggiornata ${fd(l.aggiornata)}. La stampi e la attacchi alla scala, oppure l'operaio spunta dal telefono.</p></div><div class="row nowrap"><button class="btn sm" data-act="lista-print" data-id="${c.id}">${I('printer')} Stampa lista</button></div></div>
    <div class="row" style="margin:10px 0;gap:14px;flex-wrap:wrap"><div style="flex:1;min-width:160px"><div class="row between small"><span>Preparato</span><span class="b num">${np}/${n}</span></div><div class="progress"><i style="width:${n ? np / n * 100 : 0}%"></i></div></div><div style="flex:1;min-width:160px"><div class="row between small"><span>Caricato sul furgone</span><span class="b num">${nc}/${n}</span></div><div class="progress brand"><i style="width:${n ? nc / n * 100 : 0}%"></i></div></div></div>
    <div class="tw"><table><thead><tr><th class="wrap">Materiale</th><th class="right">Pz / quantità</th><th style="text-align:center">Preparato</th><th style="text-align:center">Caricato</th><th></th></tr></thead><tbody>${l.righe.map((r, i) => `<tr class="${r.car ? 'muted' : ''}"><td class="wrap">${esc(r.m)}</td><td class="right num">${esc(r.q)}</td><td style="text-align:center"><input type="checkbox" class="big" data-act="lista-ck" data-id="${c.id}|${i}|prep" ${r.prep ? 'checked' : ''} aria-label="Preparato"></td><td style="text-align:center"><input type="checkbox" class="big" data-act="lista-ck" data-id="${c.id}|${i}|car" ${r.car ? 'checked' : ''} aria-label="Caricato"></td><td><button class="btn sm ghost" data-act="lista-del" data-id="${c.id}|${i}" aria-label="Elimina">${I('trash')}</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Lista vuota: aggiungi righe o genera il kit standard</td></tr>'}</tbody></table></div>
    <form data-act="lista-add" data-id="${c.id}" class="row nowrap" style="margin-top:10px"><input name="m" placeholder="materiale (es. nastro carta 50 mm)" required style="flex:2"><input name="q" placeholder="pz / quantità" style="flex:1;max-width:140px"><button class="btn sm primary" type="submit">+ Riga</button></form>
    <div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn sm" data-act="lista-all" data-id="${c.id}|prep">Segna tutto preparato</button><button class="btn sm" data-act="lista-all" data-id="${c.id}|car">Segna tutto caricato</button><button class="btn sm" data-act="lista-kit" data-id="${c.id}|${kit}">${I('package')} Kit standard ${kit}</button><button class="btn sm ghost" data-act="lista-kit" data-id="${c.id}|${kit === 'gesso' ? 'pittura' : 'gesso'}">Kit ${kit === 'gesso' ? 'pittura' : 'gesso'}</button><button class="btn sm" data-act="mat-add" data-id="${c.clienteId}" data-cant="${c.id}">${I('edit')} Salva colori e prodotti nel cliente</button></div></div>
    <div class="stack"><div class="card"><div class="row between"><h3>Dal CRM del cliente: colori e prodotti già usati</h3><button class="btn sm ghost" data-act="open-cliente" data-id="${k.id}">${esc(k.nome)}</button></div><p class="small muted">Per ritocchi, rifiniture e cantieri che si ripetono: qui c'è cosa è stato usato e dove.</p>${matList6(k, true)}</div>
    <div class="card"><h3>Prelievi dal magazzino registrati</h3>${DB.movimenti.filter((m) => m.cantiere === c.id && m.tipo === 'Scarico').slice(0, 5).map((m) => { const a = DB.magazzino.find((x) => x.cod === m.articolo) || {}; return `<div class="listrow"><span>${esc(a.nome || m.articolo)} <span class="small muted">· ${fd(m.data)}</span></span><span class="num">${n0(m.qta)} ${a.unita || ''}</span></div>`; }).join('') || '<p class="small muted">Nessun prelievo</p>'}<button class="btn sm" style="margin-top:8px" data-act="stock-open" data-cant="${c.id}">+ Scarico su cantiere</button></div></div></div>`;
}
const vCantiere0 = vCantiere;
vCantiere = function () {
  ensure6(); const out = vCantiere0(); const c = cant(S.id); if (!c) return out;
  const tb = curTab('cant', 'redd'); const i0 = out.indexOf('<div class="tabs">'); if (i0 < 0) return out; const i1 = out.indexOf('</div>', i0) + 6;
  const r = calc(c); const bols = DB.bollettini.filter((b) => b.cantiere === c.id);
  const bar = tabs('cant', [['redd', 'Redditività'], ['ore', 'Squadra e ore'], ['costi', 'Costi e fatture (' + r.ffq.length + ')'], ['prep', I('package') + ' Materiale (' + listaProg(c.id) + ')'], ['bol', 'Bollettini (' + bols.length + ')'], ['doc', 'Documenti, e-mail, calendario']]);
  return out.slice(0, i0) + bar + (tb === 'costi' ? costiTab6(c, r) : tb === 'prep' ? prepTab6(c) : out.slice(i1));
};

// ---------- Cliente: materiali e colori usati ----------
function matList6(k, compact) {
  const rows = (k.materiali || []);
  if (!rows.length) return '<p class="small muted">Nessun prodotto salvato per questo cliente.</p>';
  return `<div class="tw"><table><thead><tr><th>Data</th>${compact ? '' : '<th>Cantiere</th>'}<th class="wrap">Dove</th><th class="wrap">Prodotto</th><th class="wrap">Colore</th><th>Tipo</th>${compact ? '' : '<th class="wrap">Note</th><th></th>'}</tr></thead><tbody>${rows.map((m, i) => `<tr><td class="num small">${fd(m.data)}</td>${compact ? '' : `<td class="num small">${m.cantiere ? `<button class="lnk" data-act="open-cantiere" data-id="${m.cantiere}">${m.cantiere}</button>` : '–'}</td>`}<td class="wrap">${esc(m.dove)}</td><td class="wrap b">${esc(m.prodotto)}</td><td class="wrap">${esc(m.colore)}</td><td><span class="pill">${esc(m.tipo)}</span></td>${compact ? '' : `<td class="wrap small">${esc(m.note || '')}</td><td><button class="btn sm ghost" data-act="mat-del" data-id="${k.id}|${i}" aria-label="Elimina">${I('trash')}</button></td>`}</tr>`).join('')}</tbody></table></div>`;
}
function matCard6(k) {
  return `<div class="card" style="margin-top:14px"><div class="row between"><h3>${I('package')} Materiali e colori usati</h3><button class="btn sm primary" data-act="mat-add" data-id="${k.id}">+ Aggiungi</button></div><p class="small muted">Memoria per ritocchi e cantieri ripetuti: prodotto, codice colore e tipo di materiale per ogni locale o facciata.</p>${matList6(k, false)}</div>`;
}
function matAddModal(m) {
  const k = cliente(m.kid); const cs = DB.cantieri.filter((c) => c.clienteId === k.id);
  return `<form data-act="mat-save" data-id="${k.id}" class="stack"><div class="row between"><h2>Salva prodotto e colore · ${esc(k.nome)}</h2><button type="button" class="btn sm" data-act="close">Chiudi</button></div>
    <div class="form"><div><label>Cantiere</label><select name="cantiere">${cs.map((c) => `<option value="${c.id}" ${m.cant === c.id ? 'selected' : ''}>${c.id} · ${esc(c.nome)}</option>`).join('')}<option value="">–</option></select></div><div><label>Dove</label><input name="dove" placeholder="es. camere piano 2, facciata sud" required></div><div><label>Prodotto</label><input name="prodotto" placeholder="es. Caparol Indeko-plus" required></div><div><label>Colore / codice</label><input name="colore" placeholder="es. NCS S 0502-Y, RAL 9010"></div><div><label>Tipo di materiale</label><select name="tipo">${MAT_TIPI.map((t) => `<option>${t}</option>`).join('')}</select></div><div><label>Note</label><input name="note" placeholder="es. 2 mani, cliente vuole lo stesso per i ritocchi"></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" data-act="close">Annulla</button><button class="btn primary" type="submit">Salva nel cliente</button></div></form>`;
}
const vCliente0 = vCliente;
vCliente = function () { ensure6(); const out = vCliente0(); const k = cliente(S.id); if (!DB.clienti.includes(k) || curTab('cliente', 'pan') !== 'pan') return out; return out + matCard6(k); };

// ---------- stampa lista materiale ----------
const printModal0 = printModal;
printModal = function (m) {
  if (m.kind !== 'lista') return printModal0(m);
  const c = cant(m.id); const l = listaDi(c.id);
  return `<div class="row between"><h2>Lista materiale · ${esc(c.nome)}</h2><div class="row"><button class="btn sm" data-act="print-now">${I('printer')} Stampa / salva PDF</button><button class="btn sm" data-act="close">Chiudi</button></div></div>
    <div class="print-area"><div class="doc"><div class="row between" style="align-items:flex-start"><img src="${LOGO}" alt="MY COLOR" style="width:140px"><div class="small right">Preparazione cantiere<br><b>${esc(worker(l.chi).nome)}</b><br>${fd(l.aggiornata)}</div></div>
    <table style="margin-top:16px;width:100%"><tr><td style="border:0;padding:4px 0"><b>cantiere:</b> ${c.id} · ${esc(c.nome)}, ${esc(c.comune)}</td><td style="border:0;padding:4px 0;text-align:right"><b>pronto il:</b> <span style="color:#CD2527">${fd(c.inizio > D.TODAY_ISO ? c.inizio : D.TODAY_ISO)}</span></td></tr></table>
    <table style="width:100%;margin-top:10px;border-collapse:collapse"><thead><tr><th style="text-align:left">materiale</th><th style="width:110px">pz/quantità</th><th style="width:70px">prep.</th><th style="width:70px">caricato</th></tr></thead><tbody>${l.righe.map((r) => `<tr><td>${esc(r.m)}</td><td style="text-align:center">${esc(r.q)}</td><td style="text-align:center;font-size:1.1rem">${r.prep ? '✓' : '☐'}</td><td style="text-align:center;font-size:1.1rem">${r.car ? '✓' : '☐'}</td></tr>`).join('')}${Array.from({ length: Math.max(0, 6 - l.righe.length % 6) }).map(() => '<tr><td>&nbsp;</td><td></td><td style="text-align:center">☐</td><td style="text-align:center">☐</td></tr>').join('')}</tbody></table>
    <p class="small" style="margin-top:14px">Spuntare la colonna "prep." in magazzino e "caricato" sul furgone. Materiale mancante: scriverlo sul bollettino o nell'app.</p></div></div>`;
};

// ---------- RAPPORTO LAVORI A REGIA ----------
const regiaResp = (r) => { const c = cant(r.cantiere); return isGesso(c) ? 'C003' : 'C002'; };
const regiaOreTot = (r) => r.mo.reduce((a, x) => a + (+x.n || 0) * (+x.ore || 0), 0);
const regiaImporto = (r) => r.mo.reduce((a, x) => a + (+x.n || 0) * (+x.ore || 0) * (REGIA_CAT[x.cat] || 82), 0) + (+r.matChf || 0);
const sigImg = (firma, cls = 'sigimg') => !firma ? '' : firma.img ? `<img src="${firma.img}" class="${cls}" alt="Firma">` : `<svg class="${cls}" viewBox="0 0 300 100" aria-label="Firma"><path d="${firma.svg}" fill="none" stroke="#1a2340" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const pillR = (s) => `<span class="pill ${{ Inviato: 'info', Controllato: 'good', Fatturato: 'good', 'Da firmare': 'warn', 'Da correggere': 'bad' }[s] || ''}">${esc(s)}</span>`;
function regiaDoc(r) {
  const w = worker(r.workerId); const c = cant(r.cantiere) || { id: r.cantiere, nome: '', comune: '' }; const k = cliente(c.clienteId);
  return `<div class="doc regia-doc"><div class="row between" style="align-items:flex-start"><img src="${LOGO}" alt="MY COLOR" style="width:150px"><div class="small right">MY COLOR Isella & Foletti SA<br>Via Industria 17, 6934 Bioggio<br>+41 91 605 00 00 · info@mycolorgroup.ch</div></div>
    <div class="row between" style="margin-top:22px;align-items:baseline"><h2 style="margin:0">RAPPORTO LAVORI A REGIA</h2><span class="num"><b>No.</b> ${r.id.replace('RG-2026-', '')}</span></div>
    <table style="width:100%;margin-top:10px"><tr><td style="border:0"><b>del</b> ${fd(r.data)}</td><td style="border:0"><b>Cantiere</b> ${c.id} · ${esc(c.nome)}, ${esc(c.comune)}</td><td style="border:0"><b>Cliente</b> ${esc(k.nome)}</td></tr></table>
    <div style="margin-top:12px"><div class="small muted">Descrizione delle opere eseguite${r.richiesto ? ' · richieste da ' + esc(r.richiesto) : ''}</div><p style="margin:4px 0 0;white-space:pre-wrap;min-height:48px">${esc(r.desc)}</p></div>
    <div style="margin-top:12px"><div class="small muted">Mano d'opera</div><table style="width:100%"><thead><tr><th style="text-align:left">Categoria</th><th class="right">N.</th><th class="right">Ore</th><th class="right">Tariffa</th><th class="right">Totale</th></tr></thead><tbody>${r.mo.map((x) => `<tr><td>${esc(x.cat)}</td><td class="right num">${x.n}</td><td class="right num">${n1(x.ore)}</td><td class="right num">${chf(REGIA_CAT[x.cat] || 82)}/h</td><td class="right num">${chf((+x.n || 0) * (+x.ore || 0) * (REGIA_CAT[x.cat] || 82))}</td></tr>`).join('')}</tbody></table></div>
    <div style="margin-top:12px"><div class="small muted">Materiale</div><p style="margin:4px 0 0">${esc(r.mat || '–')}${r.matChf ? ` · ${chf(r.matChf)}` : ''}</p></div>
    <div class="row between" style="margin-top:8px"><span class="small muted">Totale ore ${n1(regiaOreTot(r))}</span><span class="b num">Totale a regia ${chf(regiaImporto(r))} + IVA</span></div>
    <div class="row between sigblock" style="margin-top:22px;align-items:flex-end"><div><div class="small muted">L'impresa</div><div class="b">${esc(w.nome)}</div><div class="small muted">${esc(w.ruolo)}</div></div><div style="text-align:right"><div class="small muted">La Direzione / il cliente</div>${r.firma ? `${sigImg(r.firma)}<div class="b">${esc(r.firma.nome)}</div><div class="small muted">${fdt(r.firma.ts)} · firmato sul telefono</div>` : '<div style="height:60px;border-bottom:1px solid #999;width:220px"></div><div class="small" style="color:#C8102E">Non firmato: il rapporto vale solo con la firma del cliente</div>'}</div></div></div>`;
}
function regiaDetailModal(m) {
  ensure6(); const r = DB.regie.find((x) => x.id === m.id); if (!r) return '<p>Rapporto non trovato</p>';
  const isOp = S.user.role === 'operaio'; const w = worker(r.workerId); const resp = worker(regiaResp(r));
  return `<div class="row between"><h2>${I('clipboard')} Rapporto a regia ${r.id}</h2><div class="row nowrap">${pillR(r.stato)}<button class="btn sm" data-act="print-now">${I('printer')} Stampa / PDF</button><button class="btn sm" data-act="close">Chiudi</button></div></div>
    ${r.stato === 'Da firmare' ? `<div class="alert warn"><span>${I('alert')}</span><span>Manca la firma del cliente: ${isOp ? 'fallo firmare dal telefono alla prossima visita.' : 'chiedere a ' + esc(w.nome.split(' ')[0]) + ' di farlo firmare prima di fatturare.'}</span></div>` : ''}
    ${r.stato === 'Da correggere' ? `<div class="alert bad"><span>${I('alert')}</span><span>Rinviato a ${esc(w.nome.split(' ')[0])} per correzione${r.notaResp ? ': ' + esc(r.notaResp) : ''}.</span></div>` : ''}
    <div class="print-area">${regiaDoc(r)}</div>
    ${isOp ? '' : `<div class="row between" style="flex-wrap:wrap"><div class="row">${['Inviato', 'Da firmare', 'Da correggere'].includes(r.stato) ? `<button class="btn good" data-act="regia-check" data-id="${r.id}">${I('check')} Controllato</button>` : ''}${r.stato !== 'Fatturato' ? `<button class="btn" data-act="regia-back" data-id="${r.id}">${I('reply')} Rinvia all'operaio</button>` : ''}</div><div class="row">${r.stato === 'Controllato' ? `<button class="btn primary" data-act="regia-fatt" data-id="${r.id}">${I('receipt')} Crea fattura a regia ${chf(regiaImporto(r))}</button>` : r.stato === 'Fatturato' && r.fatturaId ? `<button class="btn" data-act="open-fattura" data-id="${r.fatturaId}">Apri fattura ${r.fatturaId}</button>` : `<span class="small muted">Controllo di ${esc(resp.nome.split(' ')[0])}, poi fattura a regia</span>`}</div></div>`}`;
}
function regiaTab6() {
  ensure6(); const list = DB.regie.slice().sort((a, b) => b.data.localeCompare(a.data));
  const daC = list.filter((r) => r.stato === 'Inviato').length;
  return `<div class="row between" style="flex-wrap:wrap"><p class="muted small">Il rapporto a regia si compila dall'app e <b>il cliente firma col dito sul telefono</b>: senza firma non vale. Antonio e Stefano controllano, poi diventa fattura a regia.</p><div class="row"><button class="btn" data-act="export-csv" data-id="regie">${I('download')} Esporta</button></div></div>
    <div class="kpis" style="grid-template-columns:repeat(3,1fr)">${kpi('Da controllare', daC, 'inviati dagli operai', daC ? 'warn' : 'good')}${kpi('Senza firma', list.filter((r) => !r.firma).length, 'non validi', list.some((r) => !r.firma) ? 'bad' : 'good')}${kpi('Da fatturare', chf(list.filter((r) => r.stato === 'Controllato').reduce((a, r) => a + regiaImporto(r), 0)), list.filter((r) => r.stato === 'Controllato').length + ' rapporti controllati')}</div>
    <div class="card pad0">${table([{ h: 'N.' }, { h: 'Data' }, { h: 'Cantiere', cls: 'wrap' }, { h: 'Operaio', cls: 'wrap' }, { h: 'Opere', cls: 'wrap' }, { h: 'Ore', cls: 'right num' }, { h: 'Importo', cls: 'right num' }, { h: 'Firma cliente' }, { h: 'Stato' }, { h: '' }],
      list.map((r) => { const c = cant(r.cantiere) || { id: r.cantiere, nome: '' }; return { id: r.id, act: 'regia-open', cls: 'click', c: [`<span class="b num">${r.id.replace('RG-2026-', '')}</span>`, fshort(r.data), `<span class="num small">${c.id}</span><br>${esc(c.nome)}`, esc(worker(r.workerId).nome), `<span class="small">${esc(r.desc.slice(0, 70))}${r.desc.length > 70 ? '…' : ''}</span>`, n1(regiaOreTot(r)), chf(regiaImporto(r)), r.firma ? `<span class="row nowrap">${sigImg(r.firma, 'sigimg sm')}<span class="small">${esc(r.firma.nome)}</span></span>` : '<span class="pill bad">manca</span>', pillR(r.stato), `<button class="btn sm" data-act="regia-open" data-id="${r.id}">Apri</button>`] }; }), { empty: 'Nessun rapporto a regia' })}</div>`;
}
const vBollettini0 = vBollettini;
vBollettini = function () {
  ensure6(); const out = vBollettini0(); const tb = curTab('bol', 'coda');
  const i0 = out.indexOf('<div class="tabs">'); if (i0 < 0) return out; const i1 = out.indexOf('</div>', i0) + 6;
  const daC = DB.regie.filter((r) => r.stato === 'Inviato').length;
  const bar = tabs('bol', [['coda', 'Coda di approvazione'], ['regia', 'Rapporti a regia' + (daC ? ' (' + daC + ' da controllare)' : '')], ['cong', 'Conguaglio mensile ottobre'], ['ass', 'Assenze e vacanze (' + DB.assenze.filter((a) => a.stato === 'Richiesta').length + ')']]);
  return out.slice(0, i0) + bar + (tb === 'regia' ? regiaTab6() : out.slice(i1));
};

// --- app operaio: nuovo rapporto + firma a tutto schermo ---
function vOpRegia() {
  ensure6(); const w = me(); const F = S.regiaForm; const c = cant(F.cantiere) || myCant(w); F.cantiere = c.id;
  const mine = DB.regie.filter((r) => r.workerId === w.id).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  const resp = worker(regiaResp({ cantiere: c.id }));
  const body = `<div class="row small"><button class="btn sm" data-act="nav" data-id="op-bol">${I('back')} Bollettino</button></div><div><div class="eyebrow">${flong(D.TODAY_ISO)}</div><h1>Rapporto lavori a regia</h1><p class="small muted">Per i lavori extra chiesti dal cliente. Compila, poi fai firmare il cliente col dito: senza firma non vale.</p></div>
    <div class="stack"><div><label for="r-cant">Cantiere</label><select id="r-cant" data-regia="cantiere">${DB.cantieri.filter((x) => x.stato === 'In corso').map((x) => `<option value="${x.id}" ${F.cantiere === x.id ? 'selected' : ''}>${x.id} · ${esc(x.nome)}</option>`).join('')}</select></div>
    <div><label for="r-desc">Descrizione delle opere eseguite</label><textarea id="r-desc" rows="3" data-regia="desc" placeholder="es. preparazione supporto per finitura, sala colazione">${esc(F.desc)}</textarea></div>
    <div><label for="r-rich">Richiesto da</label><input id="r-rich" data-regia="richiesto" value="${esc(F.richiesto)}" placeholder="es. direzione hotel, sig. Bernasconi"></div>
    <div><label>Mano d'opera</label>${F.mo.map((x, i) => `<div class="row nowrap" style="margin-bottom:6px"><select data-regia-mo="${i}|cat" style="flex:2">${Object.keys(REGIA_CAT).map((k) => `<option ${x.cat === k ? 'selected' : ''}>${k}</option>`).join('')}</select><input type="number" min="1" step="1" inputmode="numeric" value="${x.n}" data-regia-mo="${i}|n" aria-label="Numero" style="flex:0 0 58px;text-align:center"><input type="number" step="0.5" inputmode="decimal" value="${x.ore}" data-regia-mo="${i}|ore" placeholder="ore" aria-label="Ore" style="flex:0 0 72px;text-align:center">${F.mo.length > 1 ? `<button type="button" class="btn sm ghost" data-act="regia-mo-del" data-id="${i}" aria-label="Togli">${I('x')}</button>` : ''}</div>`).join('')}<button type="button" class="btn sm" data-act="regia-mo-add">+ Riga mano d'opera</button></div>
    <div class="row nowrap"><div style="flex:2"><label for="r-mat">Materiale</label><input id="r-mat" data-regia="mat" value="${esc(F.mat)}" placeholder="es. Indeko-plus 12.5 l × 1"></div><div style="flex:1"><label for="r-matchf">CHF materiale</label><input id="r-matchf" type="number" step="1" inputmode="decimal" data-regia="matChf" value="${esc(F.matChf)}"></div></div>
    <div class="card" style="padding:10px 12px;background:var(--surface-2)"><div class="row between"><span class="small muted">Totale ore</span><span class="b num">${n1(regiaOreTot(F))}</span></div><div class="row between"><span class="small muted">Valore a regia (tariffe CCL)</span><span class="b num">${chf(regiaImporto(F))}</span></div></div>
    <button class="btn primary xl block" data-act="regia-sign">${I('edit')} Fai firmare al cliente</button>
    <button class="btn block" data-act="regia-nosig">Salva senza firma (da far firmare dopo)</button>
    <p class="small muted" style="text-align:center;margin:0">Va a ${esc(resp.nome.split(' ')[0])} per il controllo, poi diventa fattura.</p></div>
    <div><div class="eyebrow" style="margin-bottom:6px">I miei rapporti a regia</div>${mine.map((r) => `<div class="listrow click" data-act="regia-open" data-id="${r.id}"><span><span class="b">${fshort(r.data)}</span> · ${esc((cant(r.cantiere) || {}).nome || '')}<br><span class="small muted">${esc(r.desc.slice(0, 48))}${r.desc.length > 48 ? '…' : ''} · ${n1(regiaOreTot(r))} h${r.firma ? ' · firmato da ' + esc(r.firma.nome) : ''}</span></span>${pillR(r.stato)}</div>`).join('') || '<p class="small muted">Nessun rapporto</p>'}</div>`;
  return phone(body) + (S.sigOpen ? sigOverlay(c) : '');
}
function sigOverlay(c) {
  const k = cliente(c.clienteId); const nome = S.sig.nome || k.contatto || '';
  return `<div class="sigfull"><div class="sighead"><div><div class="eyebrow">Firma del cliente</div><div class="b">${esc(c.nome)} · ${fd(D.TODAY_ISO)}</div></div><button class="btn sm" data-act="sig-cancel">Annulla</button></div>
    <div class="small muted" style="padding:0 16px">Gira il telefono se vuoi più spazio. Il cliente firma col dito nel riquadro.</div>
    <canvas id="regiapad" class="sigcanvas"></canvas>
    <div class="sigfoot"><input id="sig-nome" data-sig="nome" value="${esc(nome)}" placeholder="Nome e cognome di chi firma"><div class="row nowrap"><button class="btn" data-act="sig-clear">Cancella</button><button class="btn primary" data-act="sig-ok" style="flex:1">${I('check')} Conferma firma</button></div></div></div>`;
}
function sigPt(cv, e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
function sigDraw(cv) {
  const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
  const dpr = window.devicePixelRatio || 1; x.strokeStyle = '#ccc'; x.lineWidth = 1; x.beginPath(); x.moveTo(24 * dpr, cv.height - 60 * dpr); x.lineTo(cv.width - 24 * dpr, cv.height - 60 * dpr); x.stroke();
  x.strokeStyle = '#1a2340'; x.lineWidth = 2.5 * dpr; x.lineCap = 'round'; x.lineJoin = 'round';
  S.sig.strokes.forEach((s) => { if (!s.length) return; x.beginPath(); x.moveTo(s[0].x, s[0].y); s.forEach((p) => x.lineTo(p.x, p.y)); x.stroke(); });
}
function sigSetup(cv) { const dpr = window.devicePixelRatio || 1; const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } sigDraw(cv); }
document.addEventListener('pointerdown', (e) => { const cv = e.target.closest && e.target.closest('#regiapad'); if (!cv) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} const p = sigPt(cv, e); S.sig.cur = [p]; S.sig.strokes.push(S.sig.cur); sigDraw(cv); });
document.addEventListener('pointermove', (e) => { if (!S.sig || !S.sig.cur) return; const cv = document.getElementById('regiapad'); if (!cv) return; const p = sigPt(cv, e); const prev = S.sig.cur[S.sig.cur.length - 1]; S.sig.cur.push(p); const x = cv.getContext('2d'); const dpr = window.devicePixelRatio || 1; x.strokeStyle = '#1a2340'; x.lineWidth = 2.5 * dpr; x.lineCap = 'round'; x.beginPath(); x.moveTo(prev.x, prev.y); x.lineTo(p.x, p.y); x.stroke(); });
['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, () => { if (S.sig) S.sig.cur = null; }));
function regiaCommit(firma) {
  const w = me(); const F = S.regiaForm; const c = cant(F.cantiere) || myCant(w);
  const r = { id: nextId('RG-2026-', DB.regie), data: D.TODAY_ISO, cantiere: c.id, workerId: w.id, desc: F.desc.trim(), richiesto: F.richiesto.trim(), mo: F.mo.map((x) => ({ cat: x.cat, n: +x.n || 1, ore: +x.ore || 0 })), mat: F.mat.trim(), matChf: +F.matChf || 0, firma, stato: firma ? 'Inviato' : 'Da firmare', fatturaId: null };
  DB.regie.unshift(r); const resp = regiaResp(r);
  notify(`${w.nome} ha inviato un rapporto a regia su ${c.nome}: ${n1(regiaOreTot(r))} h${firma ? ', firmato da ' + firma.nome : ', SENZA firma del cliente'}`, 'bollettini', null, ['C001', resp]);
  regiaReset(); S.sigOpen = false; S.sig = { strokes: [], cur: null, nome: '' };
  toast(firma ? `Rapporto ${r.id} firmato da ${firma.nome} e inviato a ${worker(resp).nome.split(' ')[0]}` : `Rapporto ${r.id} salvato senza firma: vale solo quando il cliente firma`);
}
function regiaValid() { const F = S.regiaForm; if (!F.desc.trim()) { toast('Scrivi cosa è stato fatto'); return false; } if (!regiaOreTot(F)) { toast('Inserisci le ore di mano d\'opera'); return false; } return true; }

// --- app operaio: lista materiale dal telefono ---
function vOpLista() {
  ensure6(); const w = me(); const c = cant(S.sel.opListaCant) || myCant(w); const l = listaDi(c.id); const nc = l.righe.filter((r) => r.car).length;
  return phone(`<div class="row small"><button class="btn sm" data-act="nav" data-id="op-oggi">${I('back')} Oggi</button></div><div><div class="eyebrow">${c.id} · ${esc(c.comune)}</div><h1>Materiale da caricare</h1><p class="small muted">Lista preparata in magazzino. Spunta quello che carichi sul furgone: l'ufficio lo vede subito.</p></div>
    <div class="card" style="padding:10px 12px"><div class="row between"><span class="small muted">Caricato</span><span class="b num">${nc}/${l.righe.length}</span></div><div class="progress brand"><i style="width:${l.righe.length ? nc / l.righe.length * 100 : 0}%"></i></div></div>
    <div class="card pad0">${l.righe.map((r, i) => `<label class="listrow oplista ${r.car ? 'done' : ''}" style="padding:10px 12px;cursor:pointer"><span><span class="b">${esc(r.m)}</span><br><span class="small muted">${esc(r.q)}${r.prep ? '' : ' · <span style="color:var(--warn)">non ancora preparato</span>'}</span></span><input type="checkbox" class="big" data-act="lista-ck" data-id="${c.id}|${i}|car" ${r.car ? 'checked' : ''} aria-label="Caricato"></label>`).join('') || '<p class="muted small" style="padding:12px">Nessuna lista per questo cantiere</p>'}</div>
    <button class="btn block" data-act="lista-all" data-id="${c.id}|car">Tutto caricato</button>`);
}
const vOpOggi0 = vOpOggi;
vOpOggi = function () {
  ensure6(); const out = vOpOggi0(); const w = me(); const c = myCant(w); const l = DB.liste[c.id]; if (!l || !l.righe.length) return out;
  const nc = l.righe.filter((r) => r.car).length;
  const card = `<div class="card click" data-act="op-lista-open" data-id="${c.id}" style="padding:12px 14px"><div class="row between"><div><div class="eyebrow">${I('package')} Materiale del cantiere</div><span class="b">${nc}/${l.righe.length} caricati sul furgone</span></div><span class="go">${I('chevron-r')}</span></div><div class="progress brand" style="margin-top:6px"><i style="width:${nc / l.righe.length * 100}%"></i></div></div>`;
  const mark = '<div class="row"><button class="btn sm" data-act="op-vac"'; return out.includes(mark) ? out.replace(mark, card + mark) : out;
};
const vOpBol0 = vOpBol;
vOpBol = function () {
  ensure6(); const out = vOpBol0(); const w = me(); const mine = DB.regie.filter((r) => r.workerId === w.id);
  const card = `<div class="card" style="padding:12px 14px"><div class="row between"><div><div class="eyebrow">Lavori a regia</div><span class="small muted">${mine.length ? mine.length + ' rapporti' + (mine.some((r) => r.stato === 'Da firmare') ? ', <span style="color:var(--warn)">uno da far firmare</span>' : '') : 'Lavori extra chiesti dal cliente'}</span></div><button class="btn sm primary" data-act="nav" data-id="op-regia">+ Rapporto a regia</button></div></div>`;
  const mark = '<div><div class="eyebrow" style="margin-bottom:6px">I miei ultimi bollettini'; return out.includes(mark) ? out.replace(mark, card + mark) : out;
};

// ---------- modali, attività automatiche, afterRender ----------
const MODALS6 = { 'ff-vista': ffVistaModal, 'regia-detail': regiaDetailModal, 'mat-add': matAddModal };
const renderModal0 = renderModal;
renderModal = function () { const m = S.modal; if (m && MODALS6[m.type]) return `<div class="modal-bg" data-act="close-bg"><div class="modal ${m.type === 'mat-add' ? '' : 'wide'}">${MODALS6[m.type](m)}</div></div>`; return renderModal0(); };
const sysAttivita0 = sysAttivita;
sysAttivita = function (all) {
  ensure6(); const L = sysAttivita0(all); const st = sysDone(); const add = [];
  const push = (key, o) => add.push({ id: 'SYS|' + key, sys: true, data: D.TODAY_ISO, ora: '', esito: '', done: false, ...o });
  DB.fattForn.filter((f) => f.stato === 'Da vistare').forEach((f) => push('ffv|' + f.id, { tipo: 'Controllo', prio: 'warn', titolo: `Fattura ${f.nInt} ${fornitore(f.fornitoreId).nome} ${chf(f.importo)} da vistare (${worker(ffResp(f)).nome.split(' ')[0]})`, html: `Fattura <span class="t b">${f.nInt} ${esc(fornitore(f.fornitoreId).nome)} ${chf(f.importo)}</span> da vistare e assegnare riga per riga (${esc(worker(ffResp(f)).nome.split(' ')[0])}).`, act: 'ff-vista', aid: f.id }));
  DB.regie.filter((r) => r.stato === 'Inviato').forEach((r) => push('rg|' + r.id, { tipo: 'Controllo', prio: 'info', titolo: `Rapporto a regia ${r.id} di ${worker(r.workerId).nome} su ${(cant(r.cantiere) || {}).nome || r.cantiere} da controllare`, html: `Rapporto a regia <span class="t b">${r.id}</span> di ${esc(worker(r.workerId).nome)} su ${esc((cant(r.cantiere) || {}).nome || r.cantiere)} da controllare${r.firma ? ' (firmato da ' + esc(r.firma.nome) + ')' : ''}.`, act: 'regia-open', aid: r.id }));
  DB.regie.filter((r) => r.stato === 'Da firmare').forEach((r) => push('rgf|' + r.id, { tipo: 'Firma', prio: 'warn', titolo: `Rapporto a regia ${r.id} senza firma del cliente: non valido`, html: `Rapporto a regia <span class="t b">${r.id}</span> (${esc(worker(r.workerId).nome)}) senza firma del cliente: non si può fatturare.`, act: 'regia-open', aid: r.id }));
  add.forEach((a) => { const s = st[a.id]; if (s && s.done) { a.done = true; a.doneTs = s.ts; } if (s && s.snooze && s.snooze > D.TODAY_ISO) a.snoozed = s.snooze; });
  return L.concat(all ? add : add.filter((a) => !a.snoozed));
};
const afterRender0 = typeof afterRender === 'function' ? afterRender : () => {};
afterRender = function () { afterRender0(); const cv = document.getElementById('regiapad'); if (cv && S.sig) sigSetup(cv); };
window.addEventListener('DOMContentLoaded', () => { if (typeof OPV === 'object') { OPV['op-regia'] = vOpRegia; OPV['op-lista'] = vOpLista; } ensure6(); if (S.user && ['op-regia', 'op-lista'].includes(S.view)) render(); });

// ---------- gestori ----------
document.addEventListener('click', (e) => {
  const h = e.target.closest('[data-act]'); if (!h) return; const act = h.dataset.act, id = h.dataset.id, ds = h.dataset; const m = S.modal; const isInput = e.target.tagName === 'INPUT';
  const selOfKey = (key) => key === 'ocr' ? (m && m.data) : DB.fattForn.find((x) => x.id === (m && m.id));
  const H = {
    'ff-vista': () => { ensure6(); const f = DB.fattForn.find((x) => x.id === id); if (!f) return 'skip'; f.sel = []; S.modal = { type: 'ff-vista', id }; },
    'ff-filtro': () => { S.sel.ffFiltro = id; },
    'ff-sel': () => { const [key, i] = id.split('|'); const f = selOfKey(key); if (!f) return 'skip'; f.sel = f.sel || []; const n = +i; f.sel = f.sel.includes(n) ? f.sel.filter((x) => x !== n) : f.sel.concat(n); },
    'ff-selall': () => { const f = selOfKey(id); if (!f) return 'skip'; f.sel = (f.sel || []).length === f.voci.length ? [] : f.voci.map((_, i) => i); },
    'ff-bulk': () => { const f = selOfKey(id); if (!f) return 'skip'; const sel = document.getElementById('ff-bulk-' + id); const c = sel ? sel.value : ''; (f.sel || []).forEach((i) => { if (f.voci[i]) f.voci[i][3] = c || null; }); const n = (f.sel || []).length; f.sel = []; if (f.id) { ffSyncPrimary(f); if (f.stato === 'Da assegnare' && ffNonAssegnato(f) <= 0.05) f.stato = 'Registrata'; } toast(n + ' righe assegnate a ' + (c ? c + ' · ' + cant(c).nome : 'nessun cantiere')); },
    'ff-visto': () => { const f = DB.fattForn.find((x) => x.id === id); if (!f) return 'skip'; ffSyncPrimary(f); f.visto = { chi: S.user.wid, ts: nowISO() }; const na = ffNonAssegnato(f); f.stato = na > 0.05 ? 'Da assegnare' : 'Registrata'; S.modal = null; toast(`Fattura ${f.nInt} vistata da ${me().nome.split(' ')[0]}` + (na > 0.05 ? ': restano righe da assegnare' : ' · ' + ffCantieri(f).length + ' cantier' + (ffCantieri(f).length === 1 ? 'e' : 'i') + ', pronta per SelectLine')); },
    'ff-err': () => { const f = DB.fattForn.find((x) => x.id === id); const fo = fornitore(f.fornitoreId); openCompose({ rel: { t: 'fornitore', id: fo.id }, oggetto: `Vostra fattura ${f.nForn} del ${fd(f.data)}: richiesta di verifica`, testo: `Buongiorno ${fo.contatto},\n\nnella vostra fattura ${f.nForn} del ${fd(f.data)} (nostro riferimento ${f.nInt}) abbiamo riscontrato una differenza rispetto alle condizioni concordate${fo.sconto ? ' (sconto ' + fo.sconto + '%)' : ''}. Vi chiediamo di verificare e di inviarci una nota di credito o la fattura corretta.\n\nCordiali saluti\n${me().nome}\nMY COLOR Isella & Foletti SA` }); return 'skip'; },
    'regia-open': () => { if (isInput) return 'skip'; S.modal = { type: 'regia-detail', id }; },
    'regia-check': () => { const r = DB.regie.find((x) => x.id === id); r.stato = 'Controllato'; r.controllo = { chi: S.user.wid, ts: nowISO() }; toast('Rapporto ' + r.id + ' controllato: pronto per la fattura a regia'); },
    'regia-back': () => { const r = DB.regie.find((x) => x.id === id); r.stato = 'Da correggere'; r.notaResp = 'verificare ore e descrizione'; DB.messaggi.push({ id: uid('M'), ch: dmId(S.user.wid, r.workerId), autore: S.user.wid, testo: `Rapporto a regia ${r.id} (${(cant(r.cantiere) || {}).nome}): controlla ore e descrizione e rimandamelo. Serve la firma del cliente.`, ts: nowISO(), letto: false }); S.modal = null; toast('Rinviato a ' + worker(r.workerId).nome.split(' ')[0] + ' con messaggio'); },
    'regia-fatt': () => { const r = DB.regie.find((x) => x.id === id); const c = cant(r.cantiere); const f = { id: nextId('FA-2026-', DB.fatture), offertaId: null, cantiere: c.id, clienteId: c.clienteId, tipo: 'Regia', data: D.TODAY_ISO, scadenza: addDays(D.TODAY_ISO, 30), desc: `Lavori a regia, rapporto ${r.id} del ${fd(r.data)} (${n1(regiaOreTot(r))} h, firmato da ${r.firma ? r.firma.nome : '–'})`, importo: Math.round(regiaImporto(r)), stato: 'Bozza', regiaId: r.id }; DB.fatture.unshift(f); r.stato = 'Fatturato'; r.fatturaId = f.id; S.modal = { type: 'print', kind: 'fattura', id: f.id }; toast('Fattura a regia ' + f.id + ' creata in bozza da ' + r.id); },
    'regia-mo-add': () => { S.regiaForm.mo.push({ cat: 'Manovale', n: 1, ore: '' }); },
    'regia-mo-del': () => { S.regiaForm.mo.splice(+id, 1); },
    'regia-sign': () => { if (!regiaValid()) return 'skip'; S.sig = { strokes: [], cur: null, nome: '' }; S.sigOpen = true; },
    'regia-nosig': () => { if (!regiaValid()) return 'skip'; regiaCommit(null); },
    'sig-cancel': () => { S.sigOpen = false; },
    'sig-clear': () => { S.sig.strokes = []; S.sig.cur = null; const cv = document.getElementById('regiapad'); if (cv) sigDraw(cv); return 'skip'; },
    'sig-ok': () => { const cv = document.getElementById('regiapad'); const nome = (document.getElementById('sig-nome') || {}).value || S.sig.nome; if (!S.sig.strokes.some((s) => s.length > 2)) { toast('Il cliente deve firmare nel riquadro'); return 'skip'; } if (!nome.trim()) { toast('Scrivi il nome di chi firma'); return 'skip'; } let img = null; try { img = cv.toDataURL('image/png'); } catch (_) {} regiaCommit({ nome: nome.trim(), ts: nowISO(), img, svg: img ? null : SIG_SVG[0] }); },
    'lista-ck': () => { const [cid, i, k] = id.split('|'); const l = listaDi(cid); const r = l.righe[+i]; if (!r) return 'skip'; r[k] = !r[k]; if (k === 'car' && r.car) r.prep = true; l.aggiornata = D.TODAY_ISO; },
    'lista-del': () => { const [cid, i] = id.split('|'); listaDi(cid).righe.splice(+i, 1); },
    'lista-all': () => { const [cid, k] = id.split('|'); const l = listaDi(cid); l.righe.forEach((r) => { r[k] = true; if (k === 'car') r.prep = true; }); l.aggiornata = D.TODAY_ISO; toast(k === 'car' ? 'Tutto caricato sul furgone' : 'Tutto preparato'); },
    'lista-kit': () => { const [cid, kit] = id.split('|'); const l = listaDi(cid); const have = l.righe.map((r) => r.m.toLowerCase()); let n = 0; (kit === 'gesso' ? KIT_GESSO : KIT_PITTURA).forEach((x) => { if (!have.includes(x[0].toLowerCase())) { l.righe.push({ m: x[0], q: x[1], prep: false, car: false }); n++; } }); l.aggiornata = D.TODAY_ISO; toast(n + ' righe aggiunte dal kit standard ' + kit); },
    'lista-print': () => { S.modal = { type: 'print', kind: 'lista', id }; },
    'op-lista-open': () => { S.sel.opListaCant = id; go('op-lista'); return 'skip'; },
    'mat-add': () => { S.modal = { type: 'mat-add', kid: id, cant: ds.cant || null }; },
    'mat-del': () => { const [kid, i] = id.split('|'); cliente(kid).materiali.splice(+i, 1); toast('Riga eliminata'); },
  };
  if (!H[act]) return; if (!isInput) e.preventDefault(); const r = H[act](); if (r !== 'skip') render();
});
document.addEventListener('change', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.ffrow) { const [key, i] = ds.ffrow.split('|'); const f = key === 'ocr' ? (m && m.data) : DB.fattForn.find((x) => x.id === (m && m.id)); if (!f || !f.voci[+i]) return; f.voci[+i][3] = t.value || null; if (f.id) { ffSyncPrimary(f); if (f.stato === 'Da assegnare' && ffNonAssegnato(f) <= 0.05) f.stato = 'Registrata'; } render(); return; }
  if (ds.ocr6 && m && m.data) { m.data[ds.ocr6] = t.value; return; }
  if (ds.regia) { S.regiaForm[ds.regia] = t.value; if (ds.regia === 'cantiere') render(); return; }
  if (ds.regiaMo) { const [i, k] = ds.regiaMo.split('|'); const x = S.regiaForm.mo[+i]; if (x) { x[k] = t.value; render(); } return; }
  if (ds.sig) { S.sig[ds.sig] = t.value; }
});
document.addEventListener('input', (e) => {
  const t = e.target; const ds = t.dataset; const m = S.modal;
  if (ds.ocr6 && m && m.data) m.data[ds.ocr6] = t.value;
  if (ds.regia) S.regiaForm[ds.regia] = t.value;
  if (ds.regiaMo) { const [i, k] = ds.regiaMo.split('|'); const x = S.regiaForm.mo[+i]; if (x) x[k] = t.value; }
  if (ds.sig) S.sig[ds.sig] = t.value;
});
document.addEventListener('click', (e) => { const b = e.target.closest('form[data-act="ocr-submit"] button[type=submit]'); if (b) S._ocrMode = b.value; }, true);
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-act]'); if (!f) return; const act = f.dataset.act, id = f.dataset.id;
  if (act === 'lista-add') { e.preventDefault(); const l = listaDi(id); const mtxt = f.m.value.trim(); if (!mtxt) return; l.righe.push({ m: mtxt, q: f.q.value.trim() || '1', prep: false, car: false }); l.aggiornata = D.TODAY_ISO; render(); return; }
  if (act === 'mat-save') { e.preventDefault(); const k = cliente(id); k.materiali = k.materiali || []; k.materiali.unshift({ data: D.TODAY_ISO, cantiere: f.cantiere.value || null, dove: f.dove.value.trim(), prodotto: f.prodotto.value.trim(), colore: f.colore.value.trim(), tipo: f.tipo.value, note: f.note.value.trim() }); S.modal = null; toast('Salvato nella scheda di ' + k.nome + ': ' + f.prodotto.value.trim()); render(); }
});
// export CSV dei rapporti a regia (aggancio alla funzione esistente)
window.addEventListener('DOMContentLoaded', () => { if (typeof exportCsv === 'function' && !exportCsv._v11) { const orig = exportCsv; exportCsv = function (key) { if (key === 'regie') { ensure6(); return csvDownload('rapporti-regia', ['Numero', 'Data', 'Cantiere', 'Operaio', 'Opere', 'Ore', 'Importo', 'Firma', 'Stato'], DB.regie.map((r) => [r.id, r.data, r.cantiere, worker(r.workerId).nome, r.desc, regiaOreTot(r), Math.round(regiaImporto(r)), r.firma ? r.firma.nome : '', r.stato])); } return orig(key); }; exportCsv._v11 = true; } });
