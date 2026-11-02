/* MyColor Gestionale – listino posizioni pittura e gessatura (Ticino), storico offerte e generatore IA */
// Prezzi medi appresi dalle offerte storiche (importate da PUNTANET) e dal listino aziendale; unità e NPK secondo CRB.
const LISTINO = [
  // Pittura interni
  { npk: '671.211', desc: 'Tinteggiatura pareti interne, 2 mani dispersione lavabile', un: 'm²', prezzo: 18.5, min: 16.5, max: 21, n: 241, k: ['tinteggi', 'pittur', 'pareti', 'interni', 'appartament', 'villa', 'casa', 'uffici', 'camere', 'locali'], cat: 'Pittura interni' },
  { npk: '671.215', desc: 'Tinteggiatura soffitti, 2 mani dispersione opaca', un: 'm²', prezzo: 19.8, min: 18, max: 22.5, n: 228, k: ['soffitt', 'tinteggi', 'appartament', 'villa', 'casa', 'uffici', 'camere', 'locali'], cat: 'Pittura interni' },
  { npk: '671.120', desc: 'Rasatura pareti a gesso, 2 passate, carteggiatura', un: 'm²', prezzo: 24, min: 21, max: 28, n: 163, k: ['rasat', 'lisci', 'muri nuovi', 'nuova costruzione', 'grezzo'], cat: 'Gessatura' },
  { npk: '671.111', desc: 'Preparazione fondi: stuccatura, carteggiatura, fondo isolante', un: 'm²', prezzo: 6.5, min: 5, max: 8.5, n: 198, k: ['stucc', 'prepar', 'crepe', 'ristruttur', 'vecchi', 'fondo'], cat: 'Pittura interni' },
  { npk: '671.330', desc: 'Smalto satinato su porte, serramenti e telai (2 mani + fondo)', un: 'm²', prezzo: 68, min: 58, max: 78, n: 141, k: ['smalt', 'porte', 'serrament', 'telai', 'finestre', 'legno'], cat: 'Smalti' },
  { npk: '671.340', desc: 'Smalto su radiatori e tubazioni', un: 'pz', prezzo: 95, min: 80, max: 120, n: 74, k: ['radiator', 'termosifon', 'caloriferi'], cat: 'Smalti' },
  { npk: '671.350', desc: 'Smalto ringhiere e parapetti metallici, antiruggine + finitura', un: 'ml', prezzo: 38, min: 32, max: 46, n: 52, k: ['ringhier', 'parapett', 'metallo', 'ferro', 'scale'], cat: 'Smalti' },
  { npk: '671.700', desc: 'Tappezzeria in tessuto non tessuto, fornitura e posa', un: 'm²', prezzo: 54, min: 46, max: 65, n: 37, k: ['tappezz', 'carta da parati', 'parati', 'hotel', 'camere'], cat: 'Decorativi' },
  { npk: '671.900', desc: 'Stucco veneziano / spatolato decorativo', un: 'm²', prezzo: 165, min: 140, max: 190, n: 29, k: ['stucco veneziano', 'spatolat', 'decorativ', 'veneziano'], cat: 'Decorativi' },
  { npk: '671.910', desc: 'Velatura decorativa a effetto', un: 'm²', prezzo: 48, min: 40, max: 58, n: 33, k: ['velatur', 'effetto', 'decorativ'], cat: 'Decorativi' },
  { npk: '671.930', desc: 'Microcemento a spessore 3 mm, finitura opaca', un: 'm²', prezzo: 210, min: 180, max: 240, n: 18, k: ['microcement', 'bagno', 'cucina', 'doccia'], cat: 'Decorativi' },
  { npk: '671.950', desc: 'Resina epossidica autolivellante per pavimenti (garage, lavanderia)', un: 'm²', prezzo: 128, min: 110, max: 150, n: 26, k: ['resin', 'garage', 'pavimento', 'epossid', 'autorimessa'], cat: 'Pavimenti' },
  // Facciate
  { npk: '671.510', desc: 'Pittura facciate silossanica, 2 mani, su intonaco esistente', un: 'm²', prezzo: 42, min: 36, max: 48, n: 96, k: ['facciat', 'esterno', 'esterni', 'silossan', 'stabile', 'condominio'], cat: 'Facciate' },
  { npk: '671.520', desc: 'Rasatura armata facciate con rete e fondo', un: 'm²', prezzo: 31, min: 27, max: 36, n: 61, k: ['facciat', 'rasatura armata', 'crepe', 'rete', 'fessur'], cat: 'Facciate' },
  { npk: '671.610', desc: 'Risanamento calcestruzzo a vista (passivazione, malta, protettivo)', un: 'm²', prezzo: 88, min: 75, max: 105, n: 24, k: ['risanament', 'calcestruzz', 'cemento', 'balcon', 'armatur'], cat: 'Facciate' },
  { npk: '671.620', desc: 'Protettivo anticarbonatazione su calcestruzzo', un: 'm²', prezzo: 36, min: 30, max: 42, n: 24, k: ['anticarbonat', 'calcestruzz', 'protettiv'], cat: 'Facciate' },
  { npk: '671.650', desc: 'Isolamento termico a cappotto EPS 160 mm, rasatura e finitura', un: 'm²', prezzo: 185, min: 160, max: 210, n: 19, k: ['cappotto', 'isolamento termico', 'eps', 'minergie', 'risparmio energetico'], cat: 'Facciate' },
  { npk: '671.820', desc: 'Vernice intumescente R60 su strutture in acciaio, certificata', un: 'm²', prezzo: 96, min: 85, max: 110, n: 14, k: ['intumescent', 'acciaio', 'antincendio', 'r60', 'travi', 'capannon'], cat: 'Protezione fuoco' },
  // Gessatura
  { npk: '642.100', desc: 'Intonaco di fondo a base gesso, 15 mm, su muratura', un: 'm²', prezzo: 34, min: 29, max: 40, n: 88, k: ['intonac', 'muratura', 'grezzo', 'nuova costruzione'], cat: 'Gessatura' },
  { npk: '642.200', desc: 'Intonaco a civile su esterni, 2 strati', un: 'm²', prezzo: 46, min: 40, max: 54, n: 41, k: ['intonaco esterno', 'civile', 'facciat'], cat: 'Gessatura' },
  { npk: '652.410', desc: 'Contropareti / pareti divisorie in cartongesso 12.5 mm, struttura 75 mm, lana minerale', un: 'm²', prezzo: 84, min: 72, max: 98, n: 112, k: ['cartongesso', 'contropar', 'pareti divisor', 'divisor', 'tramezz'], cat: 'Cartongesso' },
  { npk: '652.415', desc: 'Pareti REI 60 doppia lastra, certificate', un: 'm²', prezzo: 118, min: 105, max: 135, n: 31, k: ['rei', 'antincendio', 'scuol', 'ospedal', 'tagliafuoco'], cat: 'Cartongesso' },
  { npk: '652.520', desc: 'Controsoffitto in cartongesso su struttura metallica', un: 'm²', prezzo: 76, min: 66, max: 90, n: 97, k: ['controsoffitt', 'ribassament', 'faretti', 'led'], cat: 'Cartongesso' },
  { npk: '652.525', desc: 'Controsoffitto acustico forato classe A', un: 'm²', prezzo: 112, min: 98, max: 130, n: 22, k: ['acustic', 'forat', 'aule', 'uffici open', 'rumore'], cat: 'Cartongesso' },
  { npk: '652.530', desc: 'Botola d\'ispezione 60×60 in controsoffitto', un: 'pz', prezzo: 180, min: 150, max: 220, n: 45, k: ['botol', 'ispezion'], cat: 'Cartongesso' },
  { npk: '652.600', desc: 'Isolamento acustico/termico in lana minerale 60 mm in intercapedine', un: 'm²', prezzo: 22, min: 18, max: 27, n: 64, k: ['isolamento', 'lana', 'acustic', 'cartongesso'], cat: 'Cartongesso' },
  { npk: '652.700', desc: 'Veletta / ribassamento in cartongesso per impianti', un: 'ml', prezzo: 95, min: 80, max: 115, n: 58, k: ['velett', 'ribass', 'impiant', 'canalizz'], cat: 'Cartongesso' },
  // Generali
  { npk: '114.100', desc: 'Ponteggio di facciata, montaggio, noleggio 4 settimane e smontaggio', un: 'm²', prezzo: 18, min: 14, max: 24, n: 71, k: ['facciat', 'ponteggi', 'esterno', 'condominio', 'stabile'], cat: 'Cantiere' },
  { npk: '114.200', desc: 'Trabattello / ponteggio interno per vani scala e doppie altezze', un: 'forf.', prezzo: 1800, min: 1200, max: 3200, n: 44, k: ['vano scala', 'vani scala', 'doppia altezza', 'scale', 'atrio'], cat: 'Cantiere' },
  { npk: '113.100', desc: 'Installazione cantiere, protezioni pavimenti e serramenti, pulizia finale', un: 'forf.', prezzo: 0, min: 0, max: 0, n: 312, k: [], cat: 'Cantiere' },
  { npk: '113.200', desc: 'Smaltimento rifiuti e materiali di risulta (benna)', un: 'forf.', prezzo: 650, min: 400, max: 1200, n: 139, k: ['smaltiment', 'demolizion', 'rimozione', 'vecchia tappezz', 'cartongesso', 'facciat'], cat: 'Cantiere' },
  { npk: '113.300', desc: 'Rimozione vecchia tappezzeria e preparazione supporto', un: 'm²', prezzo: 12, min: 9, max: 15, n: 36, k: ['rimozione', 'vecchia tappezz', 'carta da parati esistente', 'strappo'], cat: 'Pittura interni' },
];
const NPK_PREZZI = Object.fromEntries(LISTINO.map((p) => [p.npk, p.prezzo]));
const STORICO = { offerte: 312, periodo: '2019–2026', accettate: 61, scontoMedio: 4.1, fonte: 'PUNTANET + offerte 2026 del gestionale', ultimoAggiornamento: '2026-11-05', top: ['Tinteggiatura interni (241 offerte)', 'Cartongesso e controsoffitti (112)', 'Facciate silossaniche (96)', 'Rasature a gesso (163)'] };

// ---- Generatore: dal testo (o dalla dettatura) alle posizioni, con stime di quantità ----
function aiOfferta(desc, tipo) {
  const t = (desc || '').toLowerCase(); const rows = []; const why = []; const has = (k) => t.includes(k);
  const num = (re) => { const m = t.match(re); return m ? parseFloat(m[1].replace(',', '.').replace("'", '')) : null; };
  const area = num(/(\d+[.,']?\d*)\s*(m²|mq|m2|metri quadr)/) ; const locali = num(/(\d+)\s*(locali|stanze|camere)/); const porte = num(/(\d+)\s*(porte|serramenti|finestre)/); const radiatori = num(/(\d+)\s*(radiator|termosifon|calorifer)/); const piani = num(/(\d+)\s*(piani|livelli)/);
  const facciata = num(/facciat\w*[^.\d]{0,40}?(\d+[.,']?\d*)\s*(m²|mq|m2)/) || (has('facciat') ? (area || 600) : 0);
  const interni = has('appartament') || has('villa') || has('casa') || has('uffici') || has('camere') || has('locali') || has('interni') || has('tinteggi') || has('pittur') || has('soffitt') || has('ristruttur') || has('loft') || has('negozio') || has('hotel');
  let calp = area && !has('facciat') ? area : locali ? locali * 24 : has('villa') ? 190 : has('appartament') ? 95 : has('loft') ? 150 : has('uffici') ? 220 : has('hotel') ? 300 : interni ? 100 : 0;
  if (interni && calp) { why.push(`Superficie calpestabile stimata ${n0(calp)} m² (${area && !has('facciat') ? 'indicata nel testo' : locali ? locali + ' locali × 24 m²' : 'valore tipico per ' + (has('villa') ? 'una villa' : has('loft') ? 'un loft' : 'un appartamento')}); pareti ≈ 2.5 × calpestabile, soffitti ≈ calpestabile.`); }
  const push = (npk, qta, note) => { const p = LISTINO.find((x) => x.npk === npk); if (!p || !qta) return; rows.push({ pos: 'NPK ' + p.npk, desc: p.desc, un: p.un, qta: Math.round(qta), prezzo: p.prezzo, fonte: p.n + ' offerte · ' + chf(p.min, 2) + '–' + chf(p.max, 2) }); if (note) why.push(note); };
  const pareti = Math.round(calp * 2.5), soffitti = calp;
  if (interni && calp) {
    if (has('ristruttur') || has('vecchi') || has('crepe') || has('esistent')) push('671.111', pareti + soffitti, 'Edificio esistente: aggiunta la preparazione dei fondi (stuccatura e fondo), come nel 78% delle ristrutturazioni storiche.');
    if (has('grezzo') || has('nuova costruzione') || has('muri nuovi') || has('rasat')) push('671.120', pareti, 'Muri nuovi: rasatura a gesso prima della tinteggiatura.');
    push('671.211', pareti); push('671.215', soffitti);
  }
  if (porte || has('porte') || has('serrament')) push('671.330', (porte || 8) * 2.2, `${porte || 8} porte/serramenti × 2.2 m² per lato (fronte e retro).`);
  if (radiatori || has('radiator') || has('termosifon')) push('671.340', radiatori || Math.max(4, Math.round(calp / 20)));
  if (has('ringhier') || has('parapett')) push('671.350', num(/(\d+)\s*(ml|metri)/) || 24);
  if (has('tappezz') || has('carta da parati')) { if (has('rimoz') || has('vecchi')) push('113.300', Math.round(pareti * 0.6)); push('671.700', Math.round(pareti * 0.6), 'Tappezzeria stimata sul 60% delle pareti (camere), come nelle offerte hotel precedenti.'); }
  if (has('stucco veneziano') || has('veneziano') || has('spatolat')) push('671.900', num(/veneziano[^\d]{0,30}(\d+)/) || 40);
  if (has('velatur')) push('671.910', num(/velatur[^\d]{0,30}(\d+)/) || 30);
  if (has('microcement')) push('671.930', num(/microcement[^\d]{0,30}(\d+)/) || 24);
  if (has('resin') || has('garage') || has('autorimess')) push('671.950', num(/(garage|resin)[^\d]{0,30}(\d+)/) ? +t.match(/(garage|resin)[^\d]{0,30}(\d+)/)[2] : 40, 'Garage: resina epossidica, superficie tipica 40 m² se non indicata.');
  if (facciata) {
    if (has('crepe') || has('fessur') || has('rasatura armata')) push('671.520', facciata, 'Facciata con fessure: rasatura armata prima della pittura.');
    if (has('cappotto') || has('isolamento termico')) push('671.650', facciata); else push('671.510', facciata);
    if (has('calcestruzz') || has('balcon') || has('risanament')) { push('671.610', Math.round(facciata * 0.15)); push('671.620', Math.round(facciata * 0.15)); }
    push('114.100', facciata, `Ponteggio di facciata per ${n0(facciata)} m² (noleggio 4 settimane${piani ? ', ' + piani + ' piani' : ''}).`);
  }
  if (has('cartongesso') || has('contropar') || has('divisor') || has('tramezz')) push('652.410', num(/(cartongesso|contropar\w*|divisor\w*|tramezz\w*)[^\d]{0,30}(\d+)/) ? +t.match(/(cartongesso|contropar\w*|divisor\w*|tramezz\w*)[^\d]{0,30}(\d+)/)[2] : Math.round(calp * 0.4) || 60);
  if (has('rei') || has('tagliafuoco')) push('652.415', num(/rei[^\d]{0,30}(\d+)/) || 120);
  if (has('controsoffitt') || has('ribass') || has('faretti')) { const q = num(/controsoffitt\w*[^\d]{0,30}(\d+)/) || Math.round(calp * 0.5) || 60; push(has('acustic') ? '652.525' : '652.520', q); push('652.530', Math.max(2, Math.round(q / 30)), 'Una botola d\'ispezione ogni 30 m² di controsoffitto (prassi dei cantieri precedenti).'); }
  if (has('velett')) push('652.700', num(/velett\w*[^\d]{0,30}(\d+)/) || 18);
  if (has('intonac') && !facciata) push('642.100', num(/intonac\w*[^\d]{0,30}(\d+)/) || pareti || 120);
  if (has('intumescent') || has('acciaio')) push('671.820', num(/(intumescent\w*|acciaio)[^\d]{0,30}(\d+)/) ? +t.match(/(intumescent\w*|acciaio)[^\d]{0,30}(\d+)/)[2] : 300);
  if (has('vano scala') || has('vani scala') || has('doppia altezza') || has('atrio')) push('114.200', 1);
  if (has('smaltiment') || has('demoliz') || has('rimoz') || facciata || has('cartongesso')) push('113.200', 1);
  const sub = rows.reduce((a, r) => a + r.qta * r.prezzo, 0);
  const inst = Math.max(600, Math.round(sub * 0.035 / 10) * 10); const p = LISTINO.find((x) => x.npk === '113.100');
  if (rows.length) { rows.push({ pos: 'NPK ' + p.npk, desc: p.desc, un: 'forf.', qta: 1, prezzo: inst, fonte: 'in tutte le 312 offerte · 3.5% del subtotale' }); why.push(`Installazione cantiere, protezioni e pulizia a forfait: 3.5% del subtotale (media storica), minimo CHF 600.`); }
  // offerte simili dallo storico del gestionale
  const kw = ['facciat', 'cartongesso', 'controsoffitt', 'tappezz', 'resin', 'intumescent', 'rasatur', 'tinteggi', 'villa', 'hotel', 'scuol', 'uffici', 'loft'].filter(has);
  const simili = DB.offerte.filter((o) => o.deliberato && kw.some((k) => (o.oggetto + ' ' + o.capitolato.map((c) => c[1]).join(' ')).toLowerCase().includes(k))).slice(0, 3);
  const tipoSugg = tipo || (facciata || has('ristruttur') || has('risanament') ? 'A stima' : 'A corpo');
  const conf = rows.length ? Math.min(0.94, 0.55 + rows.length * 0.05 + (area ? 0.1 : 0)) : 0;
  return { rows, why, simili, tipo: tipoSugg, conf, tot: rows.reduce((a, r) => a + r.qta * r.prezzo, 0) };
}
const AI_OFF_SAMPLES = [
  'Appartamento di 4 locali a Lugano, 110 m², da ristrutturare: tinteggiatura pareti e soffitti, smalto su 9 porte e 5 radiatori, controsoffitto con faretti in soggiorno 30 m². Vano scala condominiale escluso.',
  'Villa a Montagnola: facciata 620 m² con fessure da rasare e ripitturare in silossanico, 2 piani, balconi in calcestruzzo da risanare. Interni: garage 45 m² in resina.',
  'Uffici open space 260 m² a Manno: pareti divisorie in cartongesso 140 m², controsoffitto acustico 260 m² con botole, tinteggiatura completa, smaltimento.',
];
