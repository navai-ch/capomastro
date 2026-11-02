/* MyColor Gestionale – dati dimostrativi (inventati, non reali) */
window.MC = (function () {
  const TODAY = new Date(2026, 10, 6); // venerdì 6 novembre 2026 (giorno della demo)
  const TODAY_ISO = '2026-11-06';

  // ---- Parametri azienda + CCL pittura e gessatura (Svizzera tedesca e Ticino) ----
  const PARAMS = {
    oreAnnue: 2088,            // CCL: 261 gg × 8 h (2026/2027)
    oreMese: 174,              // 2088 / 12
    oreSettimana: 40,
    vacanzeGiorni: { under20: 27, standard: 22, over50: 27 },
    festiviPagati: 9,
    oneriSociali: 1.27,        // AVS/AI/IPG, AD, LPP, LAINF, malattia, CPC, 13ª pro rata
    tredicesima: true,
    costoStrutturaOra: 20,     // CHF/h di costi fissi aziendali
    breakEvenOra: 70,          // CHF/h minimo da generare
    tariffaVenditaOra: 82,     // CHF/h fatturati in media
    pranzoGessatoriMese: 340,  // forfait aziendale (CCL minimo 275/mese)
    pranzoPittoriGiorno: 23,   // CCL max 23 CHF/pranzo con ricevuta
    pranzoSogliaKm: 12,        // pittori: indennità solo oltre 12 km dal magazzino
    kmTariffa: 0.70,           // CCL minimo 0.70 CHF/km auto privata
    viaggioNonPagatoMin: 15,   // CCL 2026-29: tempo di viaggio non pagato ridotto a 15 min
    straordinarioPct: 25,
    sabatoPct: 25,
    domenicaNottePct: 100,
    ivaPct: 8.1,
    solleciti: { auto: true, giorni1: 3, giorni2: 15, giorni3: 30, promemoriaFatture: true, invioProgrammato: true },
    base: { nome: 'Magazzino Bioggio', indirizzo: 'Via Industria 17, 6934 Bioggio', lat: 46.012, lng: 8.905 },
  };

  // Salari minimi mensili CCL dal 1.9.2026 (pittori / gessatori)
  const CCL = {
    V: { label: 'Capo operaio', pittore: 5744, gessatore: 5956 },
    Q: { label: 'Capo cantiere', pittore: 5300, gessatore: 5500 },
    A: { label: 'Qualificato AFC +3 anni', pittore: 5051, gessatore: 5267 },
    B: { label: 'Qualificato', pittore: 4667, gessatore: 4841 },
    C: { label: 'Manovale', pittore: 4429, gessatore: 4590 },
    D: { label: 'Estraneo al ramo', pittore: 4147, gessatore: 4258 },
    APP: { label: 'Apprendista', pittore: 1150, gessatore: 1150 },
  };

  // Distanze stradali indicative dal magazzino di Bioggio (km)
  const KM = {
    Bioggio: 0, Manno: 2, Muzzano: 2, Agno: 3, Lamone: 4, Cadempino: 4, Breganzona: 5, Sorengo: 5, Vezia: 5,
    Massagno: 6, Savosa: 6, Cureglia: 6, Lugano: 7, Montagnola: 7, Caslano: 8, Paradiso: 9, Viganello: 9,
    Pregassona: 10, Melide: 13, Tesserete: 14, Morcote: 17, Mendrisio: 24, Chiasso: 28, Luino: 28, Varese: 30,
    Bellinzona: 32, Como: 32, Locarno: 45,
  };

  const COMPETENZE = ['Tinteggiatura', 'Smalti', 'Velature', 'Stucchi decorativi', 'Tappezzeria', 'Facciate', 'Isolamento', 'Resine', 'Pavimenti', 'Intumescenti', 'Risanamento calcestruzzo', 'Intonaco', 'Rasatura', 'Lisciatura', 'Cartongesso', 'Contropareti', 'Controsoffitti', 'Soffitti tecnici', 'Isolamento termico', 'Ponteggi', 'Preparazione', 'Trasporti', 'Piattaforme', 'Direzione', 'Offerte', 'Clienti', 'Capitolati', 'Controllo bollettini', 'Pianificazione', 'Contabilità', 'Salari', 'SelectLine'];

  // ---- Collaboratori (40) ----
  // ramo: G gessatura, P pittura, U ufficio
  const raw = [
    ['Ivo Foletti', 'U', 'DIR', 'Direttore', 'Bioggio', 44, ['Direzione', 'Offerte', 'Clienti'], 'TI 254 118'],
    ['Stefano Montagnese', 'U', 'RESP', 'Responsabile ramo pittura', 'Lugano', 18, ['Capitolati', 'Controllo bollettini', 'Pianificazione'], 'TI 310 772'],
    ['Antonio Scumaci', 'U', 'RESP', 'Responsabile ramo gessatura', 'Massagno', 21, ['Cartongesso', 'Intonaco', 'Pianificazione'], 'TI 98 641'],
    ['Letizia Gottardello', 'U', 'AMM', 'Ufficio amministrazione', 'Agno', 9, ['Contabilità', 'Salari', 'SelectLine'], null],
    ['Marco Bernardi', 'G', 'V', 'Capo operaio gessatura', 'Agno', 22, ['Intonaco', 'Cartongesso', 'Controsoffitti', 'Ponteggi'], 'TI 45 213'],
    ['Luca Ferrari', 'G', 'V', 'Capo operaio gessatura', 'Caslano', 17, ['Cartongesso', 'Soffitti tecnici', 'Isolamento'], 'TI 201 554'],
    ['Giuseppe Russo', 'G', 'A', 'Gessatore AFC', 'Lugano', 12, ['Intonaco', 'Rasatura', 'Lisciatura'], null],
    ['Dario Pellegrini', 'G', 'A', 'Gessatore AFC', 'Mendrisio', 9, ['Cartongesso', 'Contropareti'], 'privato'],
    ['Fabio Colombo', 'G', 'A', 'Gessatore AFC', 'Varese', 14, ['Intonaco', 'Isolamento termico'], 'privato'],
    ['Mirko Jovanović', 'G', 'A', 'Gessatore AFC', 'Massagno', 8, ['Cartongesso', 'Controsoffitti'], null],
    ['Alessandro Rossi', 'G', 'B', 'Gessatore', 'Como', 6, ['Intonaco', 'Rasatura'], 'privato'],
    ['Paolo Fontana', 'G', 'B', 'Gessatore', 'Bioggio', 5, ['Cartongesso'], null],
    ['Daniel Pereira', 'G', 'B', 'Gessatore', 'Lamone', 7, ['Intonaco', 'Lisciatura'], null],
    ['Ricardo Santos', 'G', 'B', 'Gessatore', 'Breganzona', 4, ['Cartongesso', 'Isolamento'], null],
    ['Samir Hoxha', 'G', 'C', 'Manovale gessatura', 'Viganello', 3, ['Preparazione', 'Ponteggi'], null],
    ['Davide Galli', 'G', 'C', 'Manovale gessatura', 'Cadempino', 2, ['Preparazione', 'Trasporti'], null],
    ['Nicola Ferretti', 'G', 'C', 'Manovale gessatura', 'Manno', 1, ['Preparazione'], null],
    ['Tommaso Riva', 'G', 'APP', 'Apprendista gessatore 2° anno', 'Agno', 1, ['Cartongesso'], null],
    ['Kevin Moretti', 'G', 'APP', 'Apprendista gessatore 3° anno', 'Sorengo', 2, ['Intonaco', 'Cartongesso'], null],
    ['Roberto Sala', 'P', 'Q', 'Capo cantiere pittura', 'Lugano', 24, ['Facciate', 'Risanamento calcestruzzo', 'Intumescenti', 'Ponteggi'], 'TI 164 338'],
    ['Andrea Mazzola', 'P', 'V', 'Capo operaio pittura', 'Pregassona', 19, ['Tinteggiatura', 'Smalti', 'Tappezzeria'], 'TI 77 902'],
    ['Claudio Ponti', 'P', 'V', 'Capo operaio pittura', 'Bellinzona', 16, ['Facciate', 'Isolamento', 'Resine'], 'TI 512 090'],
    ['Francesco De Luca', 'P', 'A', 'Pittore AFC', 'Paradiso', 11, ['Tinteggiatura', 'Velature', 'Stucchi decorativi'], null],
    ['Matteo Cattaneo', 'P', 'A', 'Pittore AFC', 'Lugano', 10, ['Resine', 'Pavimenti'], null],
    ['Simone Lupi', 'P', 'A', 'Pittore AFC', 'Tesserete', 13, ['Facciate', 'Risanamento calcestruzzo'], 'privato'],
    ['Gianluca Torres', 'P', 'A', 'Pittore AFC', 'Mendrisio', 7, ['Tinteggiatura', 'Smalti'], 'privato'],
    ['Stefan Petrović', 'P', 'A', 'Pittore AFC', 'Vezia', 9, ['Tappezzeria', 'Tinteggiatura'], null],
    ['Omar Bouzid', 'P', 'B', 'Pittore', 'Lugano', 5, ['Tinteggiatura', 'Smalti'], null],
    ['Michele Crivelli', 'P', 'B', 'Pittore', 'Bioggio', 6, ['Tinteggiatura', 'Intumescenti'], null],
    ['Pietro Valsecchi', 'P', 'B', 'Pittore', 'Varese', 8, ['Facciate', 'Isolamento'], 'privato'],
    ['Enrico Tognetti', 'P', 'B', 'Pittore', 'Savosa', 4, ['Tinteggiatura'], null],
    ['Igor Vukić', 'P', 'B', 'Pittore', 'Lugano', 6, ['Resine', 'Smalti'], null],
    ['Leonardo Brunner', 'P', 'B', 'Pittore', 'Agno', 3, ['Tinteggiatura', 'Velature'], null],
    ['José Ferreira', 'P', 'B', 'Pittore', 'Muzzano', 7, ['Facciate', 'Tinteggiatura'], null],
    ['Younes Kadri', 'P', 'C', 'Manovale pittura', 'Lugano', 2, ['Preparazione', 'Ponteggi'], null],
    ['Carlo Beltrami', 'P', 'C', 'Manovale pittura', 'Cureglia', 3, ['Preparazione', 'Trasporti'], null],
    ['Adrian Ionescu', 'P', 'C', 'Manovale pittura', 'Massagno', 1, ['Preparazione'], null],
    ['Noah Galli', 'P', 'APP', 'Apprendista pittore 1° anno', 'Lugano', 0, ['Tinteggiatura'], null],
    ['Elia Sassi', 'P', 'APP', 'Apprendista pittore 3° anno', 'Caslano', 2, ['Tinteggiatura', 'Smalti'], null],
    ['Sara Medici', 'P', 'APP', 'Apprendista pittrice 2° anno', 'Agno', 1, ['Velature', 'Tappezzeria'], null],
  ];

  function workerCosts(w, P) {
    const ccl = CCL[w.cat];
    if (!w.salario) w.salario = ccl ? (w.ramo === 'G' ? ccl.gessatore : ccl.pittore) : (w.cat === 'DIR' ? 12500 : w.cat === 'RESP' ? 8900 : 6200);
    w.costoOra = Math.round((w.salario * 13 / P.oreAnnue) * P.oneriSociali * 100) / 100;
    w.costoAziendaOra = Math.round((w.costoOra + P.costoStrutturaOra) * 100) / 100;
    w.kmDaBase = KM[w.residenza] ?? 10;
    w.frontaliere = ['Varese', 'Como', 'Luino'].includes(w.residenza);
    return w;
  }

  const WORKERS = raw.map((r, i) => {
    const [nome, ramo, cat, ruolo, residenza, anni, competenze, veicolo] = r;
    const eta = 19 + anni + (i % 7);
    const first = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
    return workerCosts({
      id: 'C' + String(i + 1).padStart(3, '0'),
      nome, ramo, cat, ruolo, residenza, anni, competenze, veicolo,
      eta,
      email: first + '@mycolorgroup.ch',
      permesso: ['Varese', 'Como', 'Luino'].includes(residenza) ? 'G (frontaliere)' : i % 4 === 0 ? 'CH' : i % 4 === 1 ? 'C' : 'B',
      assunzione: (2026 - anni) + '-' + String(1 + (i % 12)).padStart(2, '0') + '-01',
      vacanzeTot: eta < 20 || eta >= 50 ? 27 : 22,
      vacanzeUsate: (i * 7) % 20,
      certificazioni: ramo === 'U' ? [] : ['Sicurezza Suva', i % 3 === 0 ? 'Ponteggi fino a 8 m' : 'PSA anticaduta', i % 5 === 0 ? 'Piattaforme elevabili' : null].filter(Boolean),
      tel: '+41 79 ' + String(300 + i * 13).padStart(3, '0') + ' ' + String(10 + i * 2).padStart(2, '0') + ' ' + String(40 + i).padStart(2, '0'),
      app: ramo === 'U' ? 'Attivo' : i % 9 === 5 ? 'Invitato' : i % 13 === 7 ? 'Non invitato' : 'Attivo',
    }, PARAMS);
  });
  const byName = (n) => WORKERS.find((w) => w.nome === n);
  const W = (n) => byName(n).id;

  // ---- Clienti (CRM) ----
  const CLIENTI = [
    { id: 'K01', nome: 'Fam. Bernasconi', tipo: 'Privato', contatto: 'Giorgio Bernasconi', email: 'g.bernasconi@bluewin.ch', tel: '+41 79 412 88 10', indirizzo: 'Via Collina 12', comune: 'Montagnola', note: 'Architetto di riferimento: Studio Pedrazzini, Lugano', sharepoint: 'Clienti/Bernasconi', pagamento: '30 giorni', ultimoContatto: '2026-11-04', contatti: [{ nome: 'Giorgio Bernasconi', ruolo: 'Proprietario', email: 'g.bernasconi@bluewin.ch', tel: '+41 79 412 88 10' }, { nome: 'Carla Bernasconi', ruolo: 'Proprietaria', email: 'c.bernasconi@bluewin.ch', tel: '+41 79 412 88 11' }] },
    { id: 'K02', nome: 'Amministrazione Immobiliare Lugano SA', tipo: 'Amministrazione', contatto: 'Patrizia Mantegazza', email: 'p.mantegazza@ail-immobiliare.ch', tel: '+41 91 922 40 15', indirizzo: 'Via Pretorio 9', comune: 'Lugano', note: 'Gestisce 14 stabili nel Luganese, pagamenti a 30 gg', sharepoint: 'Clienti/AIL', pagamento: '30 giorni', ultimoContatto: '2026-11-03', contatti: [{ nome: 'Patrizia Mantegazza', ruolo: 'Gestore stabili', email: 'p.mantegazza@ail-immobiliare.ch', tel: '+41 91 922 40 15' }, { nome: 'Marco Delmenico', ruolo: 'Contabilità', email: 'contabilita@ail-immobiliare.ch', tel: '+41 91 922 40 18' }] },
    { id: 'K03', nome: 'Comune di Mendrisio', tipo: 'Ente pubblico', contatto: 'Ufficio tecnico, ing. Rinaldi', email: 'utc@mendrisio.ch', tel: '+41 91 640 31 10', indirizzo: 'Via Municipio 13', comune: 'Mendrisio', note: 'Appalto pubblico, SIA 118, garanzia 2 anni', sharepoint: 'Clienti/Mendrisio', pagamento: '60 giorni', ultimoContatto: '2026-10-29', contatti: [{ nome: 'Ing. Fabio Rinaldi', ruolo: 'Ufficio tecnico comunale', email: 'utc@mendrisio.ch', tel: '+41 91 640 31 10' }] },
    { id: 'K04', nome: 'Hotel Ceresio SA', tipo: 'Azienda', contatto: 'Daniela Ruggeri', email: 'direzione@hotelceresio.ch', tel: '+41 91 825 20 20', indirizzo: 'Viale Stazione 14', comune: 'Bellinzona', note: 'Lavori solo in bassa stagione (nov–mar)', sharepoint: 'Clienti/HotelCeresio', pagamento: '30 giorni', ultimoContatto: '2026-11-02', contatti: [{ nome: 'Daniela Ruggeri', ruolo: 'Direttrice', email: 'direzione@hotelceresio.ch', tel: '+41 91 825 20 20' }] },
    { id: 'K05', nome: 'IG Ticino Costruzioni SA', tipo: 'Impresa generale', contatto: 'Arch. Luca Bianchi', email: 'l.bianchi@igticino.ch', tel: '+41 91 610 55 00', indirizzo: 'Via Cantonale 18', comune: 'Manno', note: 'Subappalto, ritenuta garanzia 10%', sharepoint: 'Clienti/IGTicino', pagamento: '45 giorni', ultimoContatto: '2026-11-05', contatti: [{ nome: 'Arch. Luca Bianchi', ruolo: 'Direzione lavori', email: 'l.bianchi@igticino.ch', tel: '+41 91 610 55 00' }, { nome: 'Sandra Keller', ruolo: 'Acquisti', email: 's.keller@igticino.ch', tel: '+41 91 610 55 03' }] },
    { id: 'K06', nome: 'Condominio Residenza Sole', tipo: 'Amministrazione', contatto: 'Studio Fiduciario Rezzonico', email: 'info@fiduciariarezzonico.ch', tel: '+41 91 649 70 70', indirizzo: 'Via Cantonale 55', comune: 'Melide', note: 'Lavoro concluso, fattura finale pagata', sharepoint: 'Clienti/ResidenzaSole', pagamento: '30 giorni', ultimoContatto: '2026-10-20', contatti: [{ nome: 'Paolo Rezzonico', ruolo: 'Amministratore', email: 'info@fiduciariarezzonico.ch', tel: '+41 91 649 70 70' }] },
    { id: 'K07', nome: 'Studio d\'architettura Pedrazzini', tipo: 'Architetto', contatto: 'Arch. Elena Pedrazzini', email: 'e.pedrazzini@studiopedrazzini.ch', tel: '+41 91 923 11 44', indirizzo: 'Via Nassa 5', comune: 'Lugano', note: 'Porta 3-4 cantieri all\'anno, richiede capitolati NPK dettagliati', sharepoint: 'Clienti/Pedrazzini', pagamento: '30 giorni', ultimoContatto: '2026-11-04', contatti: [{ nome: 'Arch. Elena Pedrazzini', ruolo: 'Titolare', email: 'e.pedrazzini@studiopedrazzini.ch', tel: '+41 91 923 11 44' }] },
    { id: 'K08', nome: 'Rossi Andrea e Chiara', tipo: 'Privato', contatto: 'Andrea Rossi', email: 'andrea.rossi@gmail.com', tel: '+41 76 555 21 90', indirizzo: 'Via Soldini 7', comune: 'Chiasso', note: 'Offerta inviata, attende firma', sharepoint: 'Clienti/Rossi', pagamento: '30 giorni', ultimoContatto: '2026-11-01', contatti: [{ nome: 'Andrea Rossi', ruolo: 'Proprietario', email: 'andrea.rossi@gmail.com', tel: '+41 76 555 21 90' }] },
  ];

  // ---- Fornitori ----
  const CATEGORIE_COSTO = ['Materiale pittura', 'Materiale gessatura', 'Ponteggi', 'Subappalto', 'Noleggio attrezzature', 'Smaltimento', 'Trasporti', 'Attrezzatura', 'Altro'];
  const FORNITORI = [
    { id: 'F01', nome: 'Sumcolor SA', categoria: 'Materiale pittura', contatto: 'Renato Bossi', email: 'ordini@sumcolor.ch', tel: '+41 91 605 22 11', comune: 'Bioggio', pagamento: '30 giorni', sconto: 12, iban: 'CH93 0076 2011 6238 5295 7', note: 'Fornitore principale vernici, consegna in 24 h a Bioggio', sharepoint: 'Fornitori/Sumcolor' },
    { id: 'F02', nome: 'Knauf AG', categoria: 'Materiale gessatura', contatto: 'Sandro Keller', email: 'bestellung@knauf.ch', tel: '+41 58 775 88 00', comune: 'Reinach', pagamento: '30 giorni', sconto: 8, iban: 'CH56 0483 5012 3456 7800 9', note: 'Listino 2026 valido fino a marzo', sharepoint: 'Fornitori/Knauf' },
    { id: 'F03', nome: 'Rigips AG', categoria: 'Materiale gessatura', contatto: 'Beat Huber', email: 'verkauf@rigips.ch', tel: '+41 58 123 45 67', comune: 'Mägenwil', pagamento: '45 giorni', sconto: 10, iban: 'CH21 0900 0000 1500 1234 5', note: 'Lastre RF per scuole e ospedali', sharepoint: 'Fornitori/Rigips' },
    { id: 'F04', nome: 'Sto AG', categoria: 'Materiale pittura', contatto: 'Monica Ghezzi', email: 'ticino@sto.ch', tel: '+41 91 935 60 30', comune: 'Lugano', pagamento: '30 giorni', sconto: 10, iban: 'CH12 0023 0230 1234 5678 9', note: 'Sistemi facciate e isolamento', sharepoint: 'Fornitori/Sto' },
    { id: 'F05', nome: 'Caparol Schweiz', categoria: 'Materiale pittura', contatto: 'Luigi Ferrari', email: 'info@caparol.ch', tel: '+41 56 460 30 30', comune: 'Nänikon', pagamento: '30 giorni', sconto: 9, iban: 'CH44 0070 0110 0012 3456 7', note: '', sharepoint: 'Fornitori/Caparol' },
    { id: 'F06', nome: 'Sika Schweiz AG', categoria: 'Materiale pittura', contatto: 'Carla Rusconi', email: 'ticino@ch.sika.com', tel: '+41 58 436 40 40', comune: 'Zürich', pagamento: '30 giorni', sconto: 7, iban: 'CH89 0024 0240 1234 5678 0', note: 'Risanamento calcestruzzo', sharepoint: 'Fornitori/Sika' },
    { id: 'F07', nome: 'Ponteggi Ticino SA', categoria: 'Ponteggi', contatto: 'Mauro Pedrini', email: 'info@ponteggiticino.ch', tel: '+41 91 857 11 22', comune: 'Taverne', pagamento: '30 giorni', sconto: 0, iban: 'CH70 0900 0000 6900 1234 8', note: 'Montaggio e noleggio ponteggi, prezzi al m² mese', sharepoint: 'Fornitori/PonteggiTicino' },
    { id: 'F08', nome: 'Noleggio Piattaforme Lugano', categoria: 'Noleggio attrezzature', contatto: 'Ivan Colombo', email: 'noleggio@npl.ch', tel: '+41 91 966 12 34', comune: 'Lugano', pagamento: '30 giorni', sconto: 5, iban: 'CH18 0839 0000 1234 5678 9', note: 'Piattaforme e sollevatori', sharepoint: 'Fornitori/NPL' },
    { id: 'F09', nome: 'Ecoservizi Smaltimenti SA', categoria: 'Smaltimento', contatto: 'Daniela Fasola', email: 'ordini@ecoservizi.ch', tel: '+41 91 640 55 66', comune: 'Mendrisio', pagamento: '30 giorni', sconto: 0, iban: 'CH33 0900 0000 6500 9876 5', note: 'Benne e smaltimento rifiuti edili', sharepoint: 'Fornitori/Ecoservizi' },
    { id: 'F10', nome: 'Bosch Professional', categoria: 'Attrezzatura', contatto: 'Shop online', email: 'pro@bosch.ch', tel: '+41 44 847 15 11', comune: 'Solothurn', pagamento: '30 giorni', sconto: 0, iban: 'CH51 0900 0000 8000 1234 2', note: '', sharepoint: 'Fornitori/Bosch' },
    { id: 'F11', nome: 'Jumbo Markt AG', categoria: 'Altro', contatto: 'Filiale Grancia', email: 'grancia@jumbo.ch', tel: '+41 91 994 11 11', comune: 'Grancia', pagamento: 'Carta', sconto: 0, iban: '', note: 'Minuteria e urgenze', sharepoint: 'Fornitori/Jumbo' },
    { id: 'F12', nome: 'Decor Subappalti Sagl', categoria: 'Subappalto', contatto: 'Nino Bertoli', email: 'info@decorsub.ch', tel: '+41 91 600 44 55', comune: 'Lamone', pagamento: '30 giorni', sconto: 0, iban: 'CH62 0900 0000 6900 5555 1', note: 'Squadra esterna per picchi di lavoro, 58 CHF/h', sharepoint: 'Fornitori/Decor' },
  ];
  const F = (n) => FORNITORI.find((f) => f.nome === n).id;

  // ---- Cantieri ----
  const CANTIERI = [
    { id: 'MC 20-26.409', nome: 'Villa Bernasconi', comune: 'Montagnola', indirizzo: 'Via Collina 12, 6926 Montagnola', clienteId: 'K01', tipo: 'Pittura interni + gessatura', stato: 'In corso', inizio: '2026-09-14', fine: '2026-12-18', preventivo: 148500, deliberato: 142000, orePreviste: 1250, oreFatte: 812, avanzamento: 62, lat: 45.985, lng: 8.92, capo: W('Andrea Mazzola'), squadra: [W('Andrea Mazzola'), W('Francesco De Luca'), W('Omar Bouzid'), W('Noah Galli'), W('Giuseppe Russo'), W('Paolo Fontana')] },
    { id: 'MC 20-26.388', nome: 'Residenza al Lago', comune: 'Paradiso', indirizzo: 'Riva Paradiso 30, 6900 Paradiso', clienteId: 'K02', tipo: 'Facciate + pittura 24 appartamenti', stato: 'In corso', inizio: '2026-06-01', fine: '2027-04-30', preventivo: 341000, deliberato: 326000, orePreviste: 3100, oreFatte: 1890, avanzamento: 58, lat: 45.99, lng: 8.95, capo: W('Roberto Sala'), squadra: [W('Roberto Sala'), W('Simone Lupi'), W('José Ferreira'), W('Pietro Valsecchi'), W('Younes Kadri'), W('Carlo Beltrami'), W('Elia Sassi')] },
    { id: 'MC 20-26.415', nome: 'Scuola elementare Canavée', comune: 'Mendrisio', indirizzo: 'Via Canavée 8, 6850 Mendrisio', clienteId: 'K03', tipo: 'Cartongesso + controsoffitti', stato: 'In corso', inizio: '2026-10-05', fine: '2027-02-20', preventivo: 212000, deliberato: 212000, orePreviste: 1900, oreFatte: 540, avanzamento: 27, lat: 45.87, lng: 8.98, capo: W('Marco Bernardi'), squadra: [W('Marco Bernardi'), W('Dario Pellegrini'), W('Mirko Jovanović'), W('Ricardo Santos'), W('Samir Hoxha'), W('Tommaso Riva')] },
    { id: 'MC 20-26.421', nome: 'Hotel Ceresio, camere piano 2-3', comune: 'Bellinzona', indirizzo: 'Viale Stazione 14, 6500 Bellinzona', clienteId: 'K04', tipo: 'Tinteggiatura + tappezzeria', stato: 'In corso', inizio: '2026-11-02', fine: '2026-12-19', preventivo: 98000, deliberato: 94500, orePreviste: 820, oreFatte: 118, avanzamento: 12, lat: 46.19, lng: 9.02, capo: W('Claudio Ponti'), squadra: [W('Claudio Ponti'), W('Stefan Petrović'), W('Gianluca Torres'), W('Enrico Tognetti'), W('Sara Medici')] },
    { id: 'MC 20-26.430', nome: 'Palazzina uffici Suglio', comune: 'Manno', indirizzo: 'Via Cantonale 18, 6928 Manno', clienteId: 'K05', tipo: 'Intumescenti + tinteggiatura', stato: 'In corso', inizio: '2026-10-19', fine: '2026-11-28', preventivo: 78000, deliberato: 74500, orePreviste: 640, oreFatte: 390, avanzamento: 60, lat: 46.03, lng: 8.92, capo: W('Luca Ferrari'), squadra: [W('Luca Ferrari'), W('Michele Crivelli'), W('Fabio Colombo'), W('Daniel Pereira'), W('Davide Galli')] },
    { id: 'MC 20-26.395', nome: 'Stabile Via Nassa', comune: 'Lugano', indirizzo: 'Via Nassa 42, 6900 Lugano', clienteId: 'K02', tipo: 'Rasatura + tinteggiatura vani scala', stato: 'In corso', inizio: '2026-08-24', fine: '2026-11-27', preventivo: 188000, deliberato: 181500, orePreviste: 1600, oreFatte: 1410, avanzamento: 88, lat: 46.0, lng: 8.95, capo: W('Matteo Cattaneo'), squadra: [W('Matteo Cattaneo'), W('Igor Vukić'), W('Leonardo Brunner'), W('Alessandro Rossi'), W('Adrian Ionescu'), W('Kevin Moretti'), W('Nicola Ferretti')] },
    { id: 'MC 20-26.402', nome: 'Risanamento facciata Residenza Sole', comune: 'Melide', indirizzo: 'Via Cantonale 55, 6815 Melide', clienteId: 'K06', tipo: 'Risanamento calcestruzzo + pittura', stato: 'Concluso', inizio: '2026-06-15', fine: '2026-10-09', preventivo: 59800, deliberato: 56000, orePreviste: 520, oreFatte: 498, avanzamento: 100, lat: 45.95, lng: 8.95, capo: W('Roberto Sala'), squadra: [] },
    { id: 'MC 20-26.440', nome: 'Casa Rossi', comune: 'Chiasso', indirizzo: 'Via Soldini 7, 6830 Chiasso', clienteId: 'K08', tipo: 'Pittura interni + resina garage', stato: 'Offerta', inizio: '2027-01-12', fine: '2027-02-13', preventivo: 42300, deliberato: 0, orePreviste: 360, oreFatte: 0, avanzamento: 0, lat: 45.83, lng: 9.03, capo: W('Andrea Mazzola'), squadra: [] },
  ].map((c) => ({ ...c, kmDaBase: KM[c.comune] ?? 10 }));

  // ---- Fatture fornitori (registrate sul cantiere, con categoria di costo) ----
  const FATTURE_FORNITORI = [
    { id: 'FF-2026-1182', cantiere: 'MC 20-26.409', fornitoreId: F('Sumcolor SA'), categoria: 'Materiale pittura', data: '2026-10-28', scadenza: '2026-11-27', importo: 7300.00, stato: 'Registrata', allegato: 'Sumcolor_1182.pdf', voci: [['Smalto acrilico satinato Sikkens 10 l', 12, 128.00], ['Dispersione Caparol Indeko-plus 12.5 l', 36, 98.50], ['Pennelli e rulli assortiti', 1, 486.00], ['Nastri, teli, carta abrasiva', 1, 712.00], ['Fondo isolante 10 l', 8, 76.75]] },
    { id: 'FF-2026-1175', cantiere: 'MC 20-26.409', fornitoreId: F('Knauf AG'), categoria: 'Materiale gessatura', data: '2026-10-21', scadenza: '2026-11-20', importo: 4820.40, stato: 'Esportata SelectLine', allegato: 'Knauf_1175.pdf', voci: [['Lastre cartongesso 12.5 mm', 180, 14.90], ['Profili C/U 50 mm', 240, 6.20], ['Stucco Uniflott 25 kg', 24, 38.60]] },
    { id: 'FF-2026-1168', cantiere: 'MC 20-26.409', fornitoreId: F('Jumbo Markt AG'), categoria: 'Altro', data: '2026-10-15', scadenza: '2026-10-15', importo: 612.30, stato: 'Esportata SelectLine', allegato: 'Jumbo_scontrino.jpg', voci: [['Minuteria e consumabili', 1, 612.30]] },
    { id: 'FF-2026-1177', cantiere: 'MC 20-26.409', fornitoreId: F('Ponteggi Ticino SA'), categoria: 'Ponteggi', data: '2026-10-22', scadenza: '2026-11-21', importo: 4100.00, stato: 'Esportata SelectLine', allegato: 'PonteggiTicino_1177.pdf', voci: [['Ponteggio interno vano scala, 3 settimane', 1, 4100.00]] },
    { id: 'FF-2026-1190', cantiere: 'MC 20-26.388', fornitoreId: F('Sto AG'), categoria: 'Materiale pittura', data: '2026-10-30', scadenza: '2026-11-29', importo: 18640.00, stato: 'Da verificare', allegato: 'Sto_1190.pdf', voci: [['StoColor Silco 15 l', 60, 189.00], ['Rete armatura facciate', 40, 148.00], ['StoLevell Uni 25 kg', 120, 12.50]] },
    { id: 'FF-2026-1171', cantiere: 'MC 20-26.388', fornitoreId: F('Sumcolor SA'), categoria: 'Materiale pittura', data: '2026-10-17', scadenza: '2026-11-16', importo: 9230.00, stato: 'Esportata SelectLine', allegato: 'Sumcolor_1171.pdf', voci: [['Fondo silossanico', 40, 92.00], ['Dispersione facciate', 50, 110.60]] },
    { id: 'FF-2026-1163', cantiere: 'MC 20-26.388', fornitoreId: F('Ponteggi Ticino SA'), categoria: 'Ponteggi', data: '2026-10-10', scadenza: '2026-11-09', importo: 14200.00, stato: 'Esportata SelectLine', allegato: 'PonteggiTicino_1163.pdf', voci: [['Ponteggio facciate 1\'800 m², mese di ottobre', 1, 14200.00]] },
    { id: 'FF-2026-1158', cantiere: 'MC 20-26.388', fornitoreId: F('Noleggio Piattaforme Lugano'), categoria: 'Noleggio attrezzature', data: '2026-10-06', scadenza: '2026-11-05', importo: 3800.00, stato: 'Esportata SelectLine', allegato: 'NPL_1158.pdf', voci: [['Piattaforma 16 m, 2 settimane', 1, 3800.00]] },
    { id: 'FF-2026-1186', cantiere: 'MC 20-26.415', fornitoreId: F('Rigips AG'), categoria: 'Materiale gessatura', data: '2026-10-29', scadenza: '2026-12-13', importo: 22140.00, stato: 'Registrata', allegato: 'Rigips_1186.pdf', voci: [['Lastre Rigips RF 15 mm', 620, 19.80], ['Struttura controsoffitto', 1, 9864.00]] },
    { id: 'FF-2026-1181', cantiere: 'MC 20-26.415', fornitoreId: F('Ecoservizi Smaltimenti SA'), categoria: 'Smaltimento', data: '2026-10-27', scadenza: '2026-11-26', importo: 2000.00, stato: 'Esportata SelectLine', allegato: 'Ecoservizi_1181.pdf', voci: [['Benna 10 m³ rifiuti cartongesso, 2 vuotature', 2, 1000.00]] },
    { id: 'FF-2026-1193', cantiere: 'MC 20-26.430', fornitoreId: F('Sumcolor SA'), categoria: 'Materiale pittura', data: '2026-11-03', scadenza: '2026-12-03', importo: 6480.00, stato: 'Registrata', allegato: 'Sumcolor_1193.pdf', voci: [['Vernice intumescente R60 20 kg', 18, 360.00]] },
    { id: 'FF-2026-1185', cantiere: 'MC 20-26.430', fornitoreId: F('Noleggio Piattaforme Lugano'), categoria: 'Noleggio attrezzature', data: '2026-10-28', scadenza: '2026-11-27', importo: 1200.00, stato: 'Esportata SelectLine', allegato: 'NPL_1185.pdf', voci: [['Sollevatore a forbice 8 m, 1 settimana', 1, 1200.00]] },
    { id: 'FF-2026-1160', cantiere: 'MC 20-26.395', fornitoreId: F('Caparol Schweiz'), categoria: 'Materiale pittura', data: '2026-10-08', scadenza: '2026-11-07', importo: 11920.00, stato: 'Esportata SelectLine', allegato: 'Caparol_1160.pdf', voci: [['Rasante Capatect 25 kg', 160, 24.50], ['Indeko-plus 12.5 l', 82, 98.50]] },
    { id: 'FF-2026-1155', cantiere: 'MC 20-26.395', fornitoreId: F('Decor Subappalti Sagl'), categoria: 'Subappalto', data: '2026-09-30', scadenza: '2026-10-30', importo: 16240.00, stato: 'Esportata SelectLine', allegato: 'Decor_1155.pdf', voci: [['Squadra 2 pittori, settembre', 280, 58.00]] },
    { id: 'FF-2026-1166', cantiere: 'MC 20-26.395', fornitoreId: F('Ponteggi Ticino SA'), categoria: 'Ponteggi', data: '2026-10-12', scadenza: '2026-11-11', importo: 5760.00, stato: 'Esportata SelectLine', allegato: 'PonteggiTicino_1166.pdf', voci: [['Ponteggi vani scala 6 stabili', 6, 960.00]] },
    { id: 'FF-2026-1194', cantiere: null, fornitoreId: F('Bosch Professional'), categoria: 'Attrezzatura', data: '2026-11-04', scadenza: '2026-12-04', importo: 1890.00, stato: 'Da assegnare', allegato: 'Bosch_1194.pdf', voci: [['Levigatrice GTR 55-225 + aspiratore', 1, 1890.00]] },
    { id: 'FF-2026-1150', cantiere: 'MC 20-26.402', fornitoreId: F('Sika Schweiz AG'), categoria: 'Materiale pittura', data: '2026-09-22', scadenza: '2026-10-22', importo: 8410.00, stato: 'Esportata SelectLine', allegato: 'Sika_1150.pdf', voci: [['Sika MonoTop risanamento', 90, 61.00], ['Sikagard protettivo', 20, 146.00]] },
    { id: 'FF-2026-1142', cantiere: 'MC 20-26.402', fornitoreId: F('Ponteggi Ticino SA'), categoria: 'Ponteggi', data: '2026-09-10', scadenza: '2026-10-10', importo: 9800.00, stato: 'Esportata SelectLine', allegato: 'PonteggiTicino_1142.pdf', voci: [['Ponteggio facciata 420 m², 3 mesi', 1, 9800.00]] },
  ];

  // Fatture di esempio che l'IA "legge" dal caricamento (OCR simulato)
  const OCR_SAMPLES = [
    { file: 'Sumcolor_fattura_1201.pdf', fornitore: 'Sumcolor SA', numero: 'FF-2026-1201', data: '2026-11-05', scadenza: '2026-12-05', riferimento: 'Rif. cantiere MC 20-26.421 Hotel Ceresio', cantiere: 'MC 20-26.421', categoria: 'Materiale pittura', iva: 8.1, voci: [['Dispersione Caparol Indeko-plus 12.5 l', 28, 98.50], ['Colla tappezzeria Metylan 10 kg', 12, 34.90], ['Rullo tappezzeria + spatole', 1, 186.00]], confidenza: 0.97 },
    { file: 'PonteggiTicino_1203.pdf', fornitore: 'Ponteggi Ticino SA', numero: 'FF-2026-1203', data: '2026-11-04', scadenza: '2026-12-04', riferimento: 'Ponteggio facciata Riva Paradiso 30 – novembre', cantiere: 'MC 20-26.388', categoria: 'Ponteggi', iva: 8.1, voci: [['Ponteggio facciate 1\'800 m², mese di novembre', 1, 14200.00]], confidenza: 0.92 },
    { file: 'foto_scontrino_jumbo.jpg', fornitore: 'Jumbo Markt AG', numero: 'SC-88213', data: '2026-11-06', scadenza: '2026-11-06', riferimento: 'Scontrino cassa, nessun riferimento cantiere', cantiere: null, categoria: 'Altro', iva: 8.1, voci: [['Viti cartongesso 3.5×35 (1000 pz)', 4, 18.90], ['Nastro carta 50 mm', 10, 6.40]], confidenza: 0.81 },
  ];

  // ---- Movimenti magazzino (prelievi su cantiere = costo materiale interno) ----
  const MOVIMENTI = [
    { id: 'MV-0911', data: '2026-10-02', tipo: 'Scarico', articolo: 'MA-101', qta: 40, cantiere: 'MC 20-26.409', chi: W('Andrea Mazzola'), valore: 3940 },
    { id: 'MV-0918', data: '2026-10-09', tipo: 'Scarico', articolo: 'MA-103', qta: 18, cantiere: 'MC 20-26.409', chi: W('Andrea Mazzola'), valore: 2304 },
    { id: 'MV-0924', data: '2026-10-16', tipo: 'Scarico', articolo: 'MA-105', qta: 120, cantiere: 'MC 20-26.409', chi: W('Giuseppe Russo'), valore: 1788 },
    { id: 'MV-0931', data: '2026-10-23', tipo: 'Scarico', articolo: 'MA-109', qta: 1, cantiere: 'MC 20-26.409', chi: W('Andrea Mazzola'), valore: 1768 },
    { id: 'MV-0905', data: '2026-09-28', tipo: 'Scarico', articolo: 'MA-102', qta: 60, cantiere: 'MC 20-26.388', chi: W('Roberto Sala'), valore: 11340 },
    { id: 'MV-0920', data: '2026-10-12', tipo: 'Scarico', articolo: 'MA-110', qta: 1, cantiere: 'MC 20-26.388', chi: W('Roberto Sala'), valore: 3160 },
    { id: 'MV-0927', data: '2026-10-19', tipo: 'Scarico', articolo: 'MA-104', qta: 110, cantiere: 'MC 20-26.415', chi: W('Marco Bernardi'), valore: 1298 },
    { id: 'MV-0929', data: '2026-10-21', tipo: 'Scarico', articolo: 'MA-105', qta: 330, cantiere: 'MC 20-26.415', chi: W('Marco Bernardi'), valore: 4902 },
    { id: 'MV-0935', data: '2026-11-03', tipo: 'Scarico', articolo: 'MA-101', qta: 24, cantiere: 'MC 20-26.421', chi: W('Claudio Ponti'), valore: 2364 },
    { id: 'MV-0930', data: '2026-10-22', tipo: 'Scarico', articolo: 'MA-107', qta: 11, cantiere: 'MC 20-26.430', chi: W('Luca Ferrari'), valore: 3960 },
    { id: 'MV-0890', data: '2026-09-02', tipo: 'Scarico', articolo: 'MA-106', qta: 400, cantiere: 'MC 20-26.395', chi: W('Matteo Cattaneo'), valore: 9800 },
    { id: 'MV-0912', data: '2026-10-05', tipo: 'Scarico', articolo: 'MA-101', qta: 90, cantiere: 'MC 20-26.395', chi: W('Matteo Cattaneo'), valore: 8865 },
    { id: 'MV-0921', data: '2026-10-13', tipo: 'Scarico', articolo: 'MA-109', qta: 1, cantiere: 'MC 20-26.395', chi: W('Matteo Cattaneo'), valore: 5335 },
    { id: 'MV-0870', data: '2026-07-10', tipo: 'Scarico', articolo: 'MA-102', qta: 22, cantiere: 'MC 20-26.402', chi: W('Roberto Sala'), valore: 4200 },
    { id: 'MV-0936', data: '2026-11-04', tipo: 'Carico', articolo: 'MA-105', qta: 200, cantiere: null, chi: W('Letizia Gottardello'), valore: 2980 },
    { id: 'MV-0937', data: '2026-11-05', tipo: 'Carico', articolo: 'MA-101', qta: 60, cantiere: null, chi: W('Letizia Gottardello'), valore: 5910 },
  ];

  // ---- Bollettini settimana corrente (lun 2 – ven 6 nov 2026) + settimana precedente ----
  const giorni = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
  const giorniPrec = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'];
  const ATTIVITA = { G: ['Montaggio cartongesso', 'Intonaco', 'Rasatura', 'Controsoffitto'], P: ['Tinteggiatura', 'Smalto', 'Preparazione fondi', 'Stuccatura'] };
  let seq = 4400;
  const BOLLETTINI = [];
  CANTIERI.filter((c) => c.stato === 'In corso').forEach((c, ci) => {
    c.squadra.forEach((wid, wi) => {
      const w = WORKERS.find((x) => x.id === wid);
      [...giorniPrec, ...giorni].forEach((g, gi) => {
        const isCurr = gi >= 5;
        const dayIdx = gi % 5;
        if ((wi + dayIdx + ci) % 11 === 0) return; // qualche assenza
        if (isCurr && dayIdx === 4 && wi % 3 === 1) return; // venerdì non ancora compilato
        const base = 8 + ((wi + dayIdx) % 3 === 0 ? 0.5 : 0) - ((wi + ci + dayIdx) % 7 === 0 ? 1 : 0);
        const viaggio = c.kmDaBase > 20 ? 0.75 : c.kmDaBase > 8 ? 0.5 : 0.25;
        let stato = 'Approvato';
        if (isCurr && dayIdx >= 3) stato = 'Inviato';
        if (isCurr && dayIdx === 4) stato = wi % 2 ? 'Bozza' : 'Inviato';
        const anomalia = (isCurr && dayIdx === 2 && wi === 2 && ci % 2 === 0) ? 'GPS a 2.4 km dal cantiere' : (isCurr && dayIdx === 3 && wi === 1 && ci === 1) ? 'Oltre 10 h' : null;
        const vocale = isCurr && dayIdx === 3 && wi === 0 ? 'Finito il soffitto del corridoio piano 2, domani iniziamo le camere lato lago. Manca un secchio di Indeko.' : '';
        BOLLETTINI.push({
          id: 'B-' + (++seq), data: g, cantiere: c.id, workerId: wid, ore: anomalia === 'Oltre 10 h' ? 10.5 : base, viaggio,
          attivita: ATTIVITA[w.ramo === 'G' ? 'G' : 'P'][(wi + dayIdx) % 4], stato, anomalia,
          entrata: '07:' + String(10 + ((wi * 7 + dayIdx * 3) % 25)).padStart(2, '0'), uscita: '16:' + String(30 + ((wi * 5 + dayIdx) % 25)).padStart(2, '0'),
          gps: anomalia && anomalia.startsWith('GPS') ? 2400 : 15 + ((wi * 13 + dayIdx * 7) % 60),
          materiale: (wi + dayIdx) % 4 === 0 ? '2 × Indeko-plus 12.5 l' : '',
          note: vocale, vocale: !!vocale,
        });
      });
    });
  });

  // ---- Veicoli ----
  const VEICOLI = [
    { id: 'V01', targa: 'TI 254 118', modello: 'VW Transporter T6.1', anno: 2022, assegnato: W('Ivo Foletti'), kmMese: 1180, kmTot: 48200, prossimoServizio: '2027-01-12', stato: 'In uso', carburante: 'Diesel', costoKm: 0.62 },
    { id: 'V02', targa: 'TI 310 772', modello: 'Mercedes Vito', anno: 2021, assegnato: W('Stefano Montagnese'), kmMese: 1420, kmTot: 71300, prossimoServizio: '2026-12-03', stato: 'In uso', carburante: 'Diesel', costoKm: 0.65 },
    { id: 'V03', targa: 'TI 98 641', modello: 'Fiat Ducato L2H2', anno: 2020, assegnato: W('Antonio Scumaci'), kmMese: 1650, kmTot: 96800, prossimoServizio: '2026-11-18', stato: 'Servizio a breve', carburante: 'Diesel', costoKm: 0.70 },
    { id: 'V04', targa: 'TI 45 213', modello: 'Renault Master', anno: 2019, assegnato: W('Marco Bernardi'), kmMese: 2240, kmTot: 128400, prossimoServizio: '2027-02-05', stato: 'In uso', carburante: 'Diesel', costoKm: 0.72 },
    { id: 'V05', targa: 'TI 201 554', modello: 'VW Crafter', anno: 2023, assegnato: W('Luca Ferrari'), kmMese: 760, kmTot: 22100, prossimoServizio: '2027-03-20', stato: 'In uso', carburante: 'Diesel', costoKm: 0.68 },
    { id: 'V06', targa: 'TI 164 338', modello: 'Ford Transit Custom', anno: 2021, assegnato: W('Roberto Sala'), kmMese: 1320, kmTot: 64900, prossimoServizio: '2026-12-09', stato: 'In uso', carburante: 'Diesel', costoKm: 0.64 },
    { id: 'V07', targa: 'TI 77 902', modello: 'Fiat Doblò Cargo', anno: 2018, assegnato: W('Andrea Mazzola'), kmMese: 980, kmTot: 142700, prossimoServizio: '2026-11-28', stato: 'In uso', carburante: 'Diesel', costoKm: 0.55 },
    { id: 'V08', targa: 'TI 512 090', modello: 'VW Caddy Maxi', anno: 2022, assegnato: W('Claudio Ponti'), kmMese: 2810, kmTot: 58300, prossimoServizio: '2027-01-15', stato: 'In uso', carburante: 'Diesel', costoKm: 0.52 },
    { id: 'V09', targa: 'TI 88 417', modello: 'Iveco Daily 35S', anno: 2017, assegnato: null, kmMese: 310, kmTot: 188900, prossimoServizio: '2026-11-10', stato: 'In officina', carburante: 'Diesel', costoKm: 0.78 },
  ];

  const KM_PRIVATI = [
    { id: 'KM-01', workerId: W('Dario Pellegrini'), data: '2026-11-05', da: 'Mendrisio', a: 'Scuola Canavée, Mendrisio', km: 6, rientro: false, stato: 'Approvato' },
    { id: 'KM-02', workerId: W('Fabio Colombo'), data: '2026-11-05', da: 'Bioggio', a: 'Palazzina Suglio, Manno', km: 4, rientro: true, stato: 'Approvato' },
    { id: 'KM-03', workerId: W('Simone Lupi'), data: '2026-11-04', da: 'Tesserete', a: 'Residenza al Lago, Paradiso', km: 38, rientro: true, stato: 'Inviato' },
    { id: 'KM-04', workerId: W('Gianluca Torres'), data: '2026-11-04', da: 'Mendrisio', a: 'Hotel Ceresio, Bellinzona', km: 112, rientro: true, stato: 'Inviato' },
    { id: 'KM-05', workerId: W('Pietro Valsecchi'), data: '2026-11-03', da: 'Bioggio', a: 'Residenza al Lago, Paradiso', km: 18, rientro: true, stato: 'Approvato' },
    { id: 'KM-06', workerId: W('Alessandro Rossi'), data: '2026-11-03', da: 'Bioggio', a: 'Stabile Via Nassa, Lugano', km: 14, rientro: true, stato: 'Approvato' },
  ];

  // Viaggi registrati con GPS dall'app (tracciati)
  const VIAGGI = [
    { id: 'TR-101', workerId: W('Dario Pellegrini'), data: '2026-11-05', partenza: '06:52', arrivo: '07:04', da: 'Mendrisio (casa)', a: 'Scuola Canavée, Mendrisio', km: 6.2, minuti: 12, veicolo: 'Auto privata', gps: true },
    { id: 'TR-102', workerId: W('Francesco De Luca'), data: '2026-11-05', partenza: '06:40', arrivo: '07:08', da: 'Magazzino Bioggio', a: 'Villa Bernasconi, Montagnola', km: 7.4, minuti: 28, veicolo: 'TI 77 902', gps: true },
    { id: 'TR-103', workerId: W('Gianluca Torres'), data: '2026-11-04', partenza: '06:05', arrivo: '07:02', da: 'Mendrisio (casa)', a: 'Hotel Ceresio, Bellinzona', km: 56.1, minuti: 57, veicolo: 'Auto privata', gps: true },
    { id: 'TR-104', workerId: W('Simone Lupi'), data: '2026-11-04', partenza: '06:30', arrivo: '06:58', da: 'Tesserete (casa)', a: 'Residenza al Lago, Paradiso', km: 19.3, minuti: 28, veicolo: 'Auto privata', gps: true },
    { id: 'TR-105', workerId: W('Marco Bernardi'), data: '2026-11-05', partenza: '06:35', arrivo: '07:10', da: 'Magazzino Bioggio', a: 'Scuola Canavée, Mendrisio', km: 24.0, minuti: 35, veicolo: 'TI 45 213', gps: true },
  ];

  // ---- Offerte (a corpo oppure a stima/a misura) ----
  const OFFERTE = [
    { id: 'OF-2026-0217', tipo: 'A stima', acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 30, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }, { pct: 10, quando: 'Al collaudo' }], opzionali: [6], link: { token: 'f3a9c1-0217', email: 'g.bernasconi@bluewin.ch', creato: '2026-09-02T17:10' }, eventi: [{ tipo: 'sent', ts: '2026-09-02T17:12', email: 'g.bernasconi@bluewin.ch', dettagli: 'Offerta inviata con link di firma' }, { tipo: 'access', ts: '2026-09-04T20:31', email: 'g.bernasconi@bluewin.ch', dettagli: 'Aperta dal cliente (iPhone)' }, { tipo: 'download', ts: '2026-09-04T20:38', email: 'g.bernasconi@bluewin.ch', dettagli: 'PDF scaricato, tutte le opzioni' }, { tipo: 'access', ts: '2026-09-10T16:35', email: 'g.bernasconi@bluewin.ch', dettagli: 'Riaperta' }, { tipo: 'sign', ts: '2026-09-10T16:42', email: 'g.bernasconi@bluewin.ch', dettagli: 'Firmata da Giorgio Bernasconi, Montagnola' }], cantiere: 'MC 20-26.409', clienteId: 'K01', data: '2026-09-02', validita: '2026-10-02', oggetto: 'Villa Bernasconi: pittura interni e gessatura', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-09-10 16:42', firmatario: 'Giorgio Bernasconi', metodo: 'Firma elettronica (SES)' }, sconto: 4.4, preventivo: 148500, deliberato: 142000,
      capitolato: [
        ['NPK 671.211', 'Tinteggiatura pareti interne, 2 mani dispersione lavabile', 'm²', 1850, 18.50, 1210],
        ['NPK 671.215', 'Tinteggiatura soffitti, 2 mani', 'm²', 640, 19.80, 390],
        ['NPK 671.330', 'Smalto satinato su serramenti e porte interne', 'm²', 210, 68.00, 96],
        ['NPK 671.120', 'Rasatura pareti a gesso, 2 passate', 'm²', 1850, 24.00, 1520],
        ['NPK 652.410', 'Contropareti cartongesso 12.5 mm su struttura metallica', 'm²', 420, 68.00, 420],
        ['NPK 652.520', 'Controsoffitto cartongesso con botole', 'm²', 180, 92.00, 180],
        ['NPK 671.900', 'Stucco veneziano decorativo, zona giorno', 'm²', 48, 165.00, 0],
        ['', 'Installazione cantiere, protezioni, pulizia finale', 'forf.', 1, 4200.00, 1],
      ],
      variazioni: [
        { data: '2026-10-12', desc: 'Ordine aggiuntivo: velatura decorativa camera padronale', importo: 3850, stato: 'Approvata dal cliente' },
        { data: '2026-10-28', desc: 'Risanamento umidità muro cantina (imprevisto)', importo: 2640, stato: 'In attesa approvazione' },
      ] },
    { id: 'OF-2026-0188', tipo: 'A corpo', acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 30, quando: 'A metà lavori' }, { pct: 20, quando: 'A fine facciate' }, { pct: 20, quando: 'Al collaudo' }], opzionali: [], eventi: [{ tipo: 'sent', ts: '2026-04-20T11:00', email: 'p.mantegazza@ail-immobiliare.ch', dettagli: 'Inviata con link di firma' }, { tipo: 'access', ts: '2026-04-22T09:12', email: 'p.mantegazza@ail-immobiliare.ch', dettagli: 'Aperta' }, { tipo: 'sign', ts: '2026-05-12T10:05', email: 'p.mantegazza@ail-immobiliare.ch', dettagli: 'Firmata da Patrizia Mantegazza, Lugano' }], cantiere: 'MC 20-26.388', clienteId: 'K02', data: '2026-04-20', validita: '2026-05-20', oggetto: 'Residenza al Lago: facciate e pittura 24 appartamenti', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-05-12 10:05', firmatario: 'Patrizia Mantegazza', metodo: 'Firma elettronica (SES)' }, sconto: 4.4, preventivo: 341000, deliberato: 326000,
      capitolato: [['NPK 671.510', 'Pittura facciate silossanica, 2 mani', 'm²', 3200, 42.00], ['NPK 671.120', 'Rasatura armata facciate', 'm²', 3200, 31.00], ['NPK 671.211', 'Tinteggiatura interni 24 appartamenti', 'm²', 5400, 17.50], ['', 'Ponteggi e installazione cantiere', 'forf.', 1, 48000]],
      variazioni: [{ data: '2026-09-15', desc: 'Sostituzione lattoneria danneggiata (extra)', importo: 6200, stato: 'Approvata dal cliente' }] },
    { id: 'OF-2026-0231', tipo: 'A corpo', acconti: [{ pct: 25, quando: 'Alla firma' }, { pct: 25, quando: 'Fine fase 1' }, { pct: 25, quando: 'Fine fase 2' }, { pct: 25, quando: 'Al collaudo' }], opzionali: [], eventi: [{ tipo: 'sign', ts: '2026-09-22T09:30', email: 'utc@mendrisio.ch', dettagli: 'Contratto cartaceo firmato (appalto pubblico)' }], cantiere: 'MC 20-26.415', clienteId: 'K03', data: '2026-08-10', validita: '2026-09-30', oggetto: 'Scuola Canavée: cartongesso e controsoffitti', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-09-22 09:30', firmatario: 'Comune di Mendrisio, UTC', metodo: 'Firma cartacea (appalto pubblico)' }, sconto: 0, preventivo: 212000, deliberato: 212000,
      capitolato: [['NPK 652.410', 'Pareti divisorie cartongesso REI 60', 'm²', 1400, 84.00], ['NPK 652.520', 'Controsoffitti acustici aule', 'm²', 980, 76.00], ['', 'Installazione cantiere', 'forf.', 1, 19880]], variazioni: [] },
    { id: 'OF-2026-0244', tipo: 'A stima', acconti: [{ pct: 40, quando: 'Alla firma' }, { pct: 40, quando: 'Fine piano 2' }, { pct: 20, quando: 'A fine lavori' }], opzionali: [1], eventi: [{ tipo: 'sent', ts: '2026-09-15T14:00', email: 'direzione@hotelceresio.ch', dettagli: 'Inviata con link di firma' }, { tipo: 'access', ts: '2026-09-16T08:40', email: 'direzione@hotelceresio.ch', dettagli: 'Aperta' }, { tipo: 'sign', ts: '2026-10-01T14:18', email: 'direzione@hotelceresio.ch', dettagli: 'Firmata da Daniela Ruggeri, Bellinzona' }], cantiere: 'MC 20-26.421', clienteId: 'K04', data: '2026-09-15', validita: '2026-10-15', oggetto: 'Hotel Ceresio: camere piano 2-3', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-10-01 14:18', firmatario: 'Daniela Ruggeri', metodo: 'Firma elettronica (SES)' }, sconto: 3.6, preventivo: 98000, deliberato: 94500,
      capitolato: [['NPK 671.211', 'Tinteggiatura camere e corridoi', 'm²', 2600, 18.00, 310], ['NPK 671.700', 'Tappezzeria in tessuto non tessuto, camere', 'm²', 720, 54.00, 60], ['', 'Installazione cantiere', 'forf.', 1, 12320, 1]], variazioni: [] },
    { id: 'OF-2026-0239', tipo: 'A corpo', acconti: [{ pct: 50, quando: 'Alla firma' }, { pct: 50, quando: 'A fine lavori' }], opzionali: [], eventi: [{ tipo: 'sign', ts: '2026-09-30T11:02', email: 'l.bianchi@igticino.ch', dettagli: 'Firmata da Arch. Luca Bianchi, Manno' }], cantiere: 'MC 20-26.430', clienteId: 'K05', data: '2026-09-08', validita: '2026-10-08', oggetto: 'Palazzina Suglio: intumescenti e tinteggiatura', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-09-30 11:02', firmatario: 'Arch. Luca Bianchi', metodo: 'Firma elettronica (SES)' }, sconto: 4.5, preventivo: 78000, deliberato: 74500,
      capitolato: [['NPK 671.820', 'Vernice intumescente R60 su travi acciaio', 'm²', 560, 96.00], ['NPK 671.211', 'Tinteggiatura uffici', 'm²', 1200, 17.80], ['', 'Installazione cantiere', 'forf.', 1, 2880]], variazioni: [] },
    { id: 'OF-2026-0201', tipo: 'A stima', acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 30, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }, { pct: 10, quando: 'Al collaudo' }], opzionali: [], eventi: [{ tipo: 'sign', ts: '2026-07-20T08:55', email: 'p.mantegazza@ail-immobiliare.ch', dettagli: 'Firmata da Patrizia Mantegazza, Lugano' }], cantiere: 'MC 20-26.395', clienteId: 'K02', data: '2026-07-02', validita: '2026-08-02', oggetto: 'Via Nassa: rasatura e tinteggiatura vani scala', stato: 'Deliberata', firma: { stato: 'Firmata', data: '2026-07-20 08:55', firmatario: 'Patrizia Mantegazza', metodo: 'Firma elettronica (SES)' }, sconto: 3.5, preventivo: 188000, deliberato: 181500,
      capitolato: [['NPK 671.120', 'Rasatura vani scala 6 stabili', 'm²', 2800, 26.00, 2620], ['NPK 671.211', 'Tinteggiatura vani scala', 'm²', 2800, 19.50, 2410], ['NPK 671.330', 'Smalto ringhiere', 'ml', 640, 38.00, 580], ['', 'Installazione cantiere', 'forf.', 1, 29280, 1]], variazioni: [{ data: '2026-10-03', desc: 'Stabile 7 aggiunto (Via Nassa 44)', importo: 24300, stato: 'Approvata dal cliente' }] },
    { id: 'OF-2026-0176', tipo: 'A corpo', acconti: [{ pct: 50, quando: 'Alla firma' }, { pct: 50, quando: 'Fattura finale' }], opzionali: [], eventi: [{ tipo: 'sign', ts: '2026-05-05T17:20', email: 'info@fiduciariarezzonico.ch', dettagli: 'Firmata da Studio Fiduciario Rezzonico' }], cantiere: 'MC 20-26.402', clienteId: 'K06', data: '2026-04-12', validita: '2026-05-12', oggetto: 'Residenza Sole: risanamento facciata', stato: 'Fatturata', firma: { stato: 'Firmata', data: '2026-05-05 17:20', firmatario: 'Studio Fiduciario Rezzonico', metodo: 'Firma elettronica (SES)' }, sconto: 6.4, preventivo: 59800, deliberato: 56000,
      capitolato: [['NPK 671.610', 'Risanamento calcestruzzo a vista', 'm²', 380, 88.00], ['NPK 671.510', 'Protettivo anticarbonatazione', 'm²', 380, 36.00], ['', 'Ponteggio', 'forf.', 1, 12680]], variazioni: [] },
    { id: 'OF-2026-0258', tipo: 'A corpo', acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 40, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }], opzionali: [2], link: { token: '7b2e44-0258', email: 'andrea.rossi@gmail.com', creato: '2026-11-01T09:10' }, eventi: [{ tipo: 'sent', ts: '2026-11-01T09:12', email: 'andrea.rossi@gmail.com', dettagli: 'Offerta inviata con link di firma' }, { tipo: 'access', ts: '2026-11-02T19:48', email: 'andrea.rossi@gmail.com', dettagli: 'Aperta dal cliente (Android)' }, { tipo: 'download', ts: '2026-11-02T19:55', email: 'andrea.rossi@gmail.com', dettagli: 'PDF scaricato senza la resina garage' }], cantiere: 'MC 20-26.440', clienteId: 'K08', data: '2026-10-27', validita: '2026-11-27', oggetto: 'Casa Rossi: pittura interni e resina garage', stato: 'In attesa firma', firma: { stato: 'Inviata per firma', data: '2026-11-01 09:12', firmatario: 'Andrea Rossi', metodo: 'Firma elettronica (SES)' }, sconto: 0, preventivo: 42300, deliberato: 0,
      capitolato: [['NPK 671.211', 'Tinteggiatura interni casa unifamiliare', 'm²', 980, 18.50], ['NPK 671.215', 'Soffitti', 'm²', 310, 19.80], ['NPK 671.950', 'Resina epossidica pavimento garage', 'm²', 42, 128.00], ['', 'Installazione cantiere', 'forf.', 1, 12479]], variazioni: [] },
    { id: 'OF-2026-0261', tipo: 'A stima', acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 40, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }], opzionali: [1], eventi: [], cantiere: null, clienteId: 'K07', data: '2026-11-04', validita: '2026-12-04', oggetto: 'Loft Via Pretorio (progetto Pedrazzini)', stato: 'Bozza', firma: null, sconto: 0, preventivo: 67200, deliberato: 0, capitolatoId: 'CAP-03',
      capitolato: [['NPK 671.211', 'Tinteggiatura loft Via Pretorio', 'm²', 1400, 18.50], ['NPK 671.900', 'Microcemento bagno', 'm²', 36, 210.00], ['', 'Installazione cantiere', 'forf.', 1, 33740]], variazioni: [] },
    { id: 'OF-2026-0262', tipo: 'A corpo', cantiere: null, clienteId: 'K01', data: '2026-11-05', validita: '2026-12-05', oggetto: 'Bernasconi: tinteggiatura garage e cantina', stato: 'Sopralluogo', firma: null, sconto: 0, preventivo: 6800, deliberato: 0, acconti: [{ pct: 50, quando: 'Alla firma' }, { pct: 50, quando: 'A fine lavori' }], opzionali: [], eventi: [], capitolato: [['NPK 671.211', 'Tinteggiatura pareti garage e cantina, 2 mani', 'm²', 210, 17.50], ['NPK 671.215', 'Soffitti', 'm²', 85, 19.80], ['', 'Installazione cantiere e protezioni', 'forf.', 1, 1442]], variazioni: [], note: 'Richiesto dal cliente il 4.11 via e-mail. Sopralluogo da fissare con Stefano.' },
    { id: 'OF-2026-0263', tipo: 'A stima', cantiere: null, clienteId: 'K04', data: '2026-11-06', validita: '2026-12-20', oggetto: 'Hotel Ceresio: hall e reception, ristrutturazione 2027', stato: 'Richiesta', firma: null, sconto: 0, preventivo: 0, deliberato: 0, acconti: [{ pct: 30, quando: 'Alla firma' }, { pct: 40, quando: 'A metà lavori' }, { pct: 30, quando: 'A fine lavori' }], opzionali: [], eventi: [], capitolato: [], variazioni: [], note: 'La direttrice chiede un preventivo per hall e reception entro gennaio (lavori febbraio-marzo 2027).' },
    { id: 'OF-2026-0212', tipo: 'A corpo', cantiere: null, clienteId: 'K05', data: '2026-08-20', validita: '2026-09-20', oggetto: 'IG Ticino: tinteggiatura palazzina Pregassona', stato: 'Persa', firma: null, sconto: 0, preventivo: 54200, deliberato: 0, acconti: [], opzionali: [], eventi: [{ tipo: 'sent', ts: '2026-08-20T16:00', email: 'l.bianchi@igticino.ch', dettagli: 'Inviata' }, { tipo: 'access', ts: '2026-08-21T07:55', email: 'l.bianchi@igticino.ch', dettagli: 'Aperta' }], capitolato: [['NPK 671.211', 'Tinteggiatura 18 appartamenti', 'm²', 2900, 17.80], ['', 'Installazione cantiere', 'forf.', 1, 2580]], variazioni: [], note: 'Persa per prezzo: concorrente a 48\'500. Motivo registrato per l\'analisi IA.' },
  ];

  // ---- Fatture clienti (separate dalle offerte, generate da esse) ----
  const FATTURE = [
    { id: 'FA-2026-0391', offertaId: 'OF-2026-0217', cantiere: 'MC 20-26.409', clienteId: 'K01', tipo: 'Acconto', data: '2026-09-30', scadenza: '2026-10-30', desc: '1º acconto 30%', importo: 42600, stato: 'Pagata', pagataIl: '2026-10-22' },
    { id: 'FA-2026-0428', offertaId: 'OF-2026-0217', cantiere: 'MC 20-26.409', clienteId: 'K01', tipo: 'Avanzamento', data: '2026-10-31', scadenza: '2026-11-30', desc: '2º acconto, avanzamento 60%', importo: 42600, stato: 'Inviata' },
    { id: 'FA-2026-0302', offertaId: 'OF-2026-0188', cantiere: 'MC 20-26.388', clienteId: 'K02', tipo: 'Acconto', data: '2026-06-30', scadenza: '2026-07-30', desc: '1º acconto 30%', importo: 97800, stato: 'Pagata', pagataIl: '2026-07-28' },
    { id: 'FA-2026-0366', offertaId: 'OF-2026-0188', cantiere: 'MC 20-26.388', clienteId: 'K02', tipo: 'Avanzamento', data: '2026-08-31', scadenza: '2026-09-30', desc: '2º acconto 30%', importo: 97800, stato: 'Pagata', pagataIl: '2026-09-29' },
    { id: 'FA-2026-0431', offertaId: 'OF-2026-0188', cantiere: 'MC 20-26.388', clienteId: 'K02', tipo: 'Avanzamento', data: '2026-10-31', scadenza: '2026-11-30', desc: '3º acconto 20%', importo: 65200, stato: 'Inviata' },
    { id: 'FA-2026-0433', offertaId: 'OF-2026-0231', cantiere: 'MC 20-26.415', clienteId: 'K03', tipo: 'Acconto', data: '2026-10-31', scadenza: '2026-12-30', desc: '1º acconto 25%', importo: 53000, stato: 'Inviata' },
    { id: 'FA-2026-0430', offertaId: 'OF-2026-0239', cantiere: 'MC 20-26.430', clienteId: 'K05', tipo: 'Acconto', data: '2026-10-31', scadenza: '2026-12-15', desc: '1º acconto 50%', importo: 37250, stato: 'Pagata', pagataIl: '2026-11-04' },
    { id: 'FA-2026-0355', offertaId: 'OF-2026-0201', cantiere: 'MC 20-26.395', clienteId: 'K02', tipo: 'Acconto', data: '2026-08-31', scadenza: '2026-09-30', desc: '1º acconto 30%', importo: 54450, stato: 'Pagata', pagataIl: '2026-09-25' },
    { id: 'FA-2026-0401', offertaId: 'OF-2026-0201', cantiere: 'MC 20-26.395', clienteId: 'K02', tipo: 'Avanzamento', data: '2026-09-30', scadenza: '2026-10-30', desc: '2º acconto 30%', importo: 54450, stato: 'Pagata', pagataIl: '2026-10-28' },
    { id: 'FA-2026-0432', offertaId: 'OF-2026-0201', cantiere: 'MC 20-26.395', clienteId: 'K02', tipo: 'Avanzamento', data: '2026-10-31', scadenza: '2026-11-30', desc: '3º acconto 30%', importo: 54450, stato: 'Inviata' },
    { id: 'FA-2026-0288', offertaId: 'OF-2026-0176', cantiere: 'MC 20-26.402', clienteId: 'K06', tipo: 'Acconto', data: '2026-06-30', scadenza: '2026-07-30', desc: 'Acconto 50%', importo: 28000, stato: 'Pagata', pagataIl: '2026-07-21' },
    { id: 'FA-2026-0412', offertaId: 'OF-2026-0176', cantiere: 'MC 20-26.402', clienteId: 'K06', tipo: 'Finale', data: '2026-10-15', scadenza: '2026-11-14', desc: 'Fattura finale', importo: 28000, stato: 'Pagata', pagataIl: '2026-11-02' },
    { id: 'FA-2026-0372', offertaId: null, cantiere: null, clienteId: 'K04', tipo: 'Finale', data: '2026-09-05', scadenza: '2026-10-05', desc: 'Ritocchi hall e reception (lavoro a regia, 38 h)', importo: 4180, stato: 'Scaduta', solleciti: [{ livello: 1, data: '2026-10-28' }] },
    { id: 'FA-2026-0429', offertaId: 'OF-2026-0244', cantiere: 'MC 20-26.421', clienteId: 'K04', tipo: 'Acconto', data: '2026-11-04', scadenza: '2026-12-04', desc: '1º acconto 40% alla firma', importo: 37800, stato: 'Bozza' },
  ];

  // ---- Capitolati caricati e analizzati dall'IA ----
  const CAPITOLATI = [
    { id: 'CAP-01', titolo: 'Capitolato d\'appalto Scuola Canavée, opere da gessatore', clienteId: 'K03', cantiere: 'MC 20-26.415', file: 'Capitolato_Canavee_SIA118.pdf', pagine: 58, caricato: '2026-07-28', stato: 'Analizzato', norma: 'SIA 118 / NPK 652',
      riassunto: 'Appalto pubblico per pareti divisorie REI 60 e controsoffitti acustici in 14 aule e corridoi. Lavori in 3 fasi con scuola in funzione: orari ridotti il mercoledì. Penale 0.5% per settimana di ritardo, garanzia 2 anni, ritenuta 10% fino al collaudo.',
      posizioni: [['652.410', 'Pareti divisorie cartongesso REI 60, doppia lastra', 'm²', 1400], ['652.520', 'Controsoffitti acustici classe A, aule', 'm²', 980], ['652.530', 'Botole d\'ispezione 60×60', 'pz', 24], ['652.900', 'Installazione cantiere e protezioni', 'forf.', 1]],
      domande: [
        { q: 'Il capitolato non indica chi fornisce e monta i ponteggi interni per le aule con altezza 4.2 m (pos. 652.520).', stato: 'Aperta' },
        { q: 'La classe di assorbimento acustico richiesta (A) non è compatibile con la struttura indicata a pag. 31: chiedere conferma del prodotto.', stato: 'Chiarita', risposta: 'Confermato Rigips Rigitone 8/18: e-mail UTC del 02.09.2026.' },
        { q: 'Orari ridotti del mercoledì: non è specificato se il tempo perso è compensabile il sabato.', stato: 'Aperta' },
      ],
      richieste: [{ data: '2026-11-03', da: 'Ing. Rinaldi', testo: 'Possibile aggiungere 2 botole supplementari nel corridoio piano 1?', stato: 'Da quotare' }],
      faq: [
        { k: ['ponteggi', 'ponteggio', 'altezza'], a: 'A pagina 12 il capitolato specifica che i ponteggi fino a 3 m sono a carico dell\'appaltatore. Per le aule con altezza 4.2 m (pos. 652.520) non è indicato nulla: è una delle domande aperte da porre al committente prima dell\'inizio.', p: 'pag. 12, 31' },
        { k: ['penale', 'ritardo', 'tempi', 'scadenza', 'consegna'], a: 'Penale dello 0.5% dell\'importo per ogni settimana di ritardo, massimo 5% (pag. 44, art. 9). La consegna finale è fissata al 20.02.2027 con collaudo entro 30 giorni.', p: 'pag. 44' },
        { k: ['garanzia', 'ritenuta', 'collaudo'], a: 'Ritenuta di garanzia del 10% su ogni acconto, svincolata al collaudo. Garanzia 2 anni secondo SIA 118 art. 172 (pag. 46).', p: 'pag. 46' },
        { k: ['orari', 'orario', 'mercoledì', 'scuola', 'rumore'], a: 'Lavori rumorosi vietati il mercoledì dalle 8:00 alle 12:00 (scuola in funzione) e tutti i giorni dopo le 17:00 (pag. 9). Il recupero il sabato non è regolato: da chiarire.', p: 'pag. 9' },
        { k: ['rei', 'fuoco', 'antincendio', 'lastra', 'lastre'], a: 'Pareti REI 60 con doppia lastra 12.5 mm per lato su struttura 75 mm e lana minerale 60 mm (pag. 27). È richiesta la certificazione del sistema (AEAI).', p: 'pag. 27' },
        { k: ['acustic', 'assorbimento', 'classe a', 'rigitone'], a: 'Classe di assorbimento A per i controsoffitti delle aule (pag. 31). Il prodotto confermato dal committente è Rigips Rigitone 8/18 (e-mail del 02.09.2026).', p: 'pag. 31' },
        { k: ['pagamento', 'acconto', 'acconti', 'fattur'], a: 'Acconti mensili su stato di avanzamento certificato dalla DL, pagamento a 60 giorni (pag. 45). Fattura finale dopo collaudo.', p: 'pag. 45' },
        { k: ['botole', 'botola', 'ispezione'], a: 'Previste 24 botole 60×60 (pos. 652.530). La richiesta del 03.11 di 2 botole supplementari nel corridoio piano 1 non è coperta dal capitolato: va quotata come variazione.', p: 'pos. 652.530' },
      ] },
    { id: 'CAP-02', titolo: 'Capitolato IG Ticino, Palazzina Suglio, protezione antincendio e tinteggiatura', clienteId: 'K05', cantiere: 'MC 20-26.430', file: 'Capitolato_Suglio_IGTicino.pdf', pagine: 22, caricato: '2026-08-30', stato: 'Analizzato', norma: 'NPK 671',
      riassunto: 'Subappalto da impresa generale: verniciatura intumescente R60 su 560 m² di travi in acciaio e tinteggiatura uffici. Spessori certificati da misurare con spessimetro e verbalizzare. Ritenuta 10%, pagamento 45 giorni.',
      posizioni: [['671.820', 'Vernice intumescente R60 su acciaio', 'm²', 560], ['671.211', 'Tinteggiatura pareti uffici', 'm²', 1200], ['671.215', 'Soffitti', 'm²', 480]],
      domande: [{ q: 'Il capitolato richiede verbali di spessore ogni 50 m² ma non indica chi fornisce lo spessimetro certificato.', stato: 'Chiarita', risposta: 'A nostro carico: lo abbiamo in magazzino (EQ-009).' }],
      richieste: [],
      faq: [
        { k: ['spessore', 'spessimetro', 'verbale', 'misur'], a: 'Spessore a secco minimo 1\'100 µm per R60, verbale di misura ogni 50 m² firmato dalla DL (pag. 8). Lo spessimetro è a carico dell\'appaltatore.', p: 'pag. 8' },
        { k: ['pagamento', 'ritenuta', 'garanzia', 'acconto'], a: 'Pagamento a 45 giorni, ritenuta di garanzia 10% svincolata dopo 2 anni o contro garanzia bancaria (pag. 19).', p: 'pag. 19' },
        { k: ['intumescente', 'r60', 'prodotto', 'certificat'], a: 'È ammesso solo un sistema certificato AEAI/ETA con primer compatibile; il capitolato cita Sika Unitherm Platinum o equivalente (pag. 7).', p: 'pag. 7' },
        { k: ['tempi', 'consegna', 'scadenza', 'fine'], a: 'Fine lavori contrattuale 28.11.2026, con possibilità di proroga solo per cause imputabili all\'impresa generale (pag. 17).', p: 'pag. 17' },
      ] },
    { id: 'CAP-03', titolo: 'Capitolato Studio Pedrazzini, loft Via Pretorio', clienteId: 'K07', cantiere: null, file: 'Capitolato_Loft_ViaPretorio.pdf', pagine: 24, caricato: '2026-11-04', stato: 'Analizzato', norma: 'NPK 671',
      riassunto: 'Ristrutturazione loft 220 m²: tinteggiatura pareti e soffitti, microcemento in bagno e cucina, smalto serramenti. Consegna richiesta entro marzo 2027. Molte posizioni "secondo campione da approvare".',
      posizioni: [['671.211', 'Tinteggiatura pareti, 2 mani', 'm²', 1400], ['671.215', 'Tinteggiatura soffitti', 'm²', 220], ['671.900', 'Microcemento bagno e cucina', 'm²', 36], ['671.330', 'Smalto serramenti interni', 'm²', 64]],
      domande: [
        { q: 'Non è indicato il numero di mani per i soffitti (pag. 6): da chiarire prima dell\'offerta.', stato: 'Aperta' },
        { q: 'Manca il colore RAL dei serramenti, indicato solo "secondo campione".', stato: 'Aperta' },
        { q: 'Il microcemento richiede un fondo specifico: il massetto esistente è idoneo? Serve sopralluogo.', stato: 'Aperta' },
      ],
      richieste: [],
      faq: [
        { k: ['mani', 'soffitt'], a: 'Per le pareti sono richieste 2 mani (pag. 5). Per i soffitti il capitolato non specifica il numero di mani: è una delle domande aperte.', p: 'pag. 5-6' },
        { k: ['ral', 'colore', 'colori', 'campione'], a: 'I colori sono "secondo campione da approvare dall\'architetto" (pag. 11). Nessun RAL indicato per i serramenti: da chiedere prima della quotazione dello smalto.', p: 'pag. 11' },
        { k: ['microcemento', 'bagno', 'cucina', 'fondo', 'massetto'], a: 'Microcemento 36 m² in bagno e cucina, spessore 3 mm, finitura opaca (pag. 14). L\'idoneità del sottofondo non è trattata: consigliato sopralluogo con prova di umidità.', p: 'pag. 14' },
        { k: ['tempi', 'consegna', 'marzo', 'scadenza'], a: 'Consegna richiesta entro il 31.03.2027, con inizio possibile da metà gennaio (pag. 3).', p: 'pag. 3' },
      ] },
  ];

  // ---- Magazzino ----
  const MAGAZZINO = [
    { cod: 'EQ-001', cat: 'Equipaggiamento', nome: 'Macchina intonacatrice PFT G4', qta: 2, unita: 'pz', valore: 18500, min: 0, ubic: 'Box A', cantiere: 'MC 20-26.415', fornitoreId: 'F02' },
    { cod: 'EQ-002', cat: 'Equipaggiamento', nome: 'Airless Wagner SuperFinish 33', qta: 3, unita: 'pz', valore: 4200, min: 0, ubic: 'Box A', cantiere: 'MC 20-26.388', fornitoreId: 'F01' },
    { cod: 'EQ-003', cat: 'Equipaggiamento', nome: 'Ponteggio mobile Layher 8 m', qta: 4, unita: 'pz', valore: 2900, min: 0, ubic: 'Piazzale', cantiere: 'MC 20-26.409', fornitoreId: 'F07' },
    { cod: 'EQ-004', cat: 'Equipaggiamento', nome: 'Levigatrice Festool Planex LHS 2', qta: 5, unita: 'pz', valore: 1450, min: 0, ubic: 'Scaffale 3', cantiere: null, fornitoreId: 'F10' },
    { cod: 'EQ-005', cat: 'Equipaggiamento', nome: 'Aspiratore Festool CTL 36', qta: 6, unita: 'pz', valore: 890, min: 0, ubic: 'Scaffale 3', cantiere: null, fornitoreId: 'F10' },
    { cod: 'EQ-006', cat: 'Equipaggiamento', nome: 'Compressore Atlas Copco 500 l', qta: 1, unita: 'pz', valore: 6800, min: 0, ubic: 'Box B', cantiere: null, fornitoreId: 'F10' },
    { cod: 'EQ-007', cat: 'Equipaggiamento', nome: 'Piattaforma elevabile Genie 8 m', qta: 1, unita: 'pz', valore: 14200, min: 0, ubic: 'Piazzale', cantiere: 'MC 20-26.388', fornitoreId: 'F08' },
    { cod: 'EQ-008', cat: 'Equipaggiamento', nome: 'Trabattello alluminio 4 m', qta: 8, unita: 'pz', valore: 640, min: 0, ubic: 'Piazzale', cantiere: null, fornitoreId: 'F07' },
    { cod: 'EQ-009', cat: 'Equipaggiamento', nome: 'Spessimetro Elcometer 456 certificato', qta: 1, unita: 'pz', valore: 1650, min: 0, ubic: 'Ufficio', cantiere: 'MC 20-26.430', fornitoreId: 'F10' },
    { cod: 'MA-101', cat: 'Materiale', nome: 'Caparol Indeko-plus 12.5 l', qta: 48, unita: 'secchi', valore: 98.50, min: 30, ubic: 'Scaffale 1', cantiere: null, fornitoreId: 'F01' },
    { cod: 'MA-102', cat: 'Materiale', nome: 'StoColor Silco 15 l (facciate)', qta: 14, unita: 'secchi', valore: 189.00, min: 20, ubic: 'Scaffale 1', cantiere: null, fornitoreId: 'F04' },
    { cod: 'MA-103', cat: 'Materiale', nome: 'Sikkens smalto acrilico satinato 10 l', qta: 22, unita: 'latte', valore: 128.00, min: 10, ubic: 'Scaffale 2', cantiere: null, fornitoreId: 'F01' },
    { cod: 'MA-104', cat: 'Materiale', nome: 'Knauf MP 75 intonaco 30 kg', qta: 120, unita: 'sacchi', valore: 11.80, min: 80, ubic: 'Pallet 4', cantiere: null, fornitoreId: 'F02' },
    { cod: 'MA-105', cat: 'Materiale', nome: 'Lastre cartongesso 12.5 mm 2.5×1.2', qta: 260, unita: 'lastre', valore: 14.90, min: 100, ubic: 'Pallet 5-7', cantiere: null, fornitoreId: 'F02' },
    { cod: 'MA-106', cat: 'Materiale', nome: 'Rasante Capatect 25 kg', qta: 64, unita: 'sacchi', valore: 24.50, min: 40, ubic: 'Pallet 8', cantiere: null, fornitoreId: 'F05' },
    { cod: 'MA-107', cat: 'Materiale', nome: 'Vernice intumescente R60 20 kg', qta: 6, unita: 'latte', valore: 360.00, min: 8, ubic: 'Armadio sicurezza', cantiere: null, fornitoreId: 'F01' },
    { cod: 'MA-108', cat: 'Materiale', nome: 'Resina epossidica pavimenti 20 kg', qta: 9, unita: 'kit', valore: 245.00, min: 6, ubic: 'Armadio sicurezza', cantiere: null, fornitoreId: 'F06' },
    { cod: 'MA-109', cat: 'Materiale', nome: 'Rulli, pennelli, consumabili', qta: 1, unita: 'lotto', valore: 3100, min: 0, ubic: 'Scaffale 2', cantiere: null, fornitoreId: 'F01' },
    { cod: 'MA-110', cat: 'Materiale', nome: 'Teli, nastri, carta abrasiva', qta: 1, unita: 'lotto', valore: 2650, min: 0, ubic: 'Scaffale 2', cantiere: null, fornitoreId: 'F01' },
  ];

  const ORDINI = [
    { id: 'OR-2026-088', fornitoreId: 'F04', data: '2026-11-05', articoli: 'StoColor Silco 15 l × 20', importo: 3780, stato: 'Confermato', consegna: '2026-11-10' },
    { id: 'OR-2026-087', fornitoreId: 'F01', data: '2026-11-03', articoli: 'Vernice intumescente R60 × 10', importo: 3600, stato: 'Consegnato', consegna: '2026-11-05' },
    { id: 'OR-2026-086', fornitoreId: 'F02', data: '2026-10-30', articoli: 'Lastre 12.5 mm × 200, profili', importo: 4460, stato: 'Consegnato', consegna: '2026-11-04' },
  ];

  // ---- Attività CRM (chiamate, riunioni, promemoria, note) ----
  const ATTIVITA_CRM = [
    { id: 'AT-01', tipo: 'Chiamata', rel: { t: 'cliente', id: 'K01' }, titolo: 'Chiamata con Giorgio Bernasconi: tempistiche piano 1', data: '2026-11-04', ora: '10:30', chi: 'C001', esito: 'Conferma consegna piano 1 entro il 20.11. Chiede preventivo per il garage.', done: true },
    { id: 'AT-02', tipo: 'Promemoria', rel: { t: 'cliente', id: 'K01' }, titolo: 'Inviare preventivo garage Bernasconi', data: '2026-11-09', ora: '09:00', chi: 'C001', esito: '', done: false },
    { id: 'AT-03', tipo: 'Riunione', rel: { t: 'cliente', id: 'K02' }, titolo: 'Riunione mensile AIL: avanzamento Residenza al Lago e Via Nassa', data: '2026-11-03', ora: '14:00', chi: 'C002', esito: 'Approvato 3º acconto. Richiesta data fine vani scala.', done: true },
    { id: 'AT-04', tipo: 'Promemoria', rel: { t: 'cliente', id: 'K02' }, titolo: 'Sollecitare pagamento FA-2026-0431 se non incassata', data: '2026-12-01', ora: '09:00', chi: 'C004', esito: '', done: false },
    { id: 'AT-05', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K07' }, titolo: 'Sopralluogo loft Via Pretorio con arch. Pedrazzini', data: '2026-11-10', ora: '08:30', chi: 'C001', esito: '', done: false },
    { id: 'AT-06', tipo: 'Chiamata', rel: { t: 'cliente', id: 'K08' }, titolo: 'Chiamare Andrea Rossi per la firma dell\'offerta', data: '2026-11-06', ora: '11:00', chi: 'C001', esito: '', done: false },
    { id: 'AT-07', tipo: 'E-mail', rel: { t: 'cliente', id: 'K04' }, titolo: 'Inviato sollecito fattura FA-2026-0372 (scaduta)', data: '2026-10-28', ora: '16:10', chi: 'C004', esito: 'Nessuna risposta', done: true },
    { id: 'AT-08', tipo: 'Promemoria', rel: { t: 'cliente', id: 'K04' }, titolo: 'Secondo sollecito FA-2026-0372', data: '2026-11-07', ora: '09:00', chi: 'C004', esito: '', done: false },
    { id: 'AT-09', tipo: 'Nota', rel: { t: 'cliente', id: 'K03' }, titolo: 'UTC chiede 2 botole supplementari corridoio piano 1', data: '2026-11-03', ora: '15:40', chi: 'C003', esito: 'Da quotare come variazione', done: true },
    { id: 'AT-10', tipo: 'Chiamata', rel: { t: 'fornitore', id: 'F01' }, titolo: 'Negoziazione sconto 2027 con Sumcolor', data: '2026-11-05', ora: '09:15', chi: 'C001', esito: 'Proposto 14% su volume > 150k. Risposta scritta entro il 15.11.', done: true },
    { id: 'AT-11', tipo: 'Promemoria', rel: { t: 'fornitore', id: 'F07' }, titolo: 'Disdire ponteggio Riva Paradiso per fine novembre', data: '2026-11-20', ora: '09:00', chi: 'C002', esito: '', done: false },
    { id: 'AT-12', tipo: 'Riunione', rel: { t: 'fornitore', id: 'F04' }, titolo: 'Presentazione nuovo sistema facciate Sto', data: '2026-11-12', ora: '10:00', chi: 'C002', esito: '', done: false },
    { id: 'AT-13', tipo: 'Chiamata', rel: { t: 'cliente', id: 'K05' }, titolo: 'Arch. Bianchi: verbale spessori intumescente', data: '2026-11-05', ora: '17:05', chi: 'C002', esito: 'Verbale accettato, prossima misura il 12.11', done: true },
    { id: 'AT-14', tipo: 'Promemoria', rel: { t: 'cantiere', id: 'MC 20-26.409' }, titolo: 'Far approvare variazione risanamento umidità cantina', data: '2026-11-06', ora: '14:00', chi: 'C002', esito: '', done: false },
  ];

  // ---- E-mail Outlook (sincronizzate per cliente / fornitore) ----
  const ACCOUNTS = [
    { id: 'AC1', provider: 'Microsoft 365', email: 'ivo@mycolorgroup.ch', owner: 'C001', servizi: ['mail', 'calendar', 'contacts'], stato: 'Connesso', ultimaSync: '2026-11-06T07:58', colore: '#0F6CBD', condiviso: true, autoRel: true, pdfFatture: false, nMail: 1240, nEventi: 86, nome: 'Ivo · Outlook' },
    { id: 'AC2', provider: 'Microsoft 365', email: 'stefano@mycolorgroup.ch', owner: 'C002', servizi: ['mail', 'calendar'], stato: 'Connesso', ultimaSync: '2026-11-06T07:58', colore: '#7A5AF8', condiviso: true, autoRel: true, pdfFatture: false, nMail: 860, nEventi: 54, nome: 'Stefano · Outlook' },
    { id: 'AC3', provider: 'Microsoft 365', email: 'letizia@mycolorgroup.ch', owner: 'C004', servizi: ['mail', 'calendar', 'contacts'], stato: 'Connesso', ultimaSync: '2026-11-06T07:58', colore: '#C77A08', condiviso: true, autoRel: true, pdfFatture: true, nMail: 2110, nEventi: 31, nome: 'Letizia · Outlook' },
    { id: 'AC4', provider: 'Google Workspace', email: 'info@mycolorgroup.ch', owner: 'C004', servizi: ['mail', 'calendar'], stato: 'Connesso', ultimaSync: '2026-11-06T07:55', colore: '#1E8E4E', condiviso: true, autoRel: true, pdfFatture: false, nMail: 3480, nEventi: 112, nome: 'Ufficio · Gmail (casella condivisa)' },
  ];
  const MENSILE = [
    { m: 'Gen', fatturato: 388000, costi: 334000, ore: 4980 }, { m: 'Feb', fatturato: 402000, costi: 341000, ore: 5120 }, { m: 'Mar', fatturato: 455000, costi: 378000, ore: 5610 },
    { m: 'Apr', fatturato: 471000, costi: 392000, ore: 5740 }, { m: 'Mag', fatturato: 498000, costi: 409000, ore: 5980 }, { m: 'Giu', fatturato: 512000, costi: 421000, ore: 6080 },
    { m: 'Lug', fatturato: 466000, costi: 397000, ore: 5520 }, { m: 'Ago', fatturato: 391000, costi: 346000, ore: 4710 }, { m: 'Set', fatturato: 508000, costi: 414000, ore: 6020 },
    { m: 'Ott', fatturato: 524000, costi: 425000, ore: 6150 }, { m: 'Nov', fatturato: 171000, costi: 139000, ore: 1890, parziale: true },
  ];
  const EMAIL = [
    { id: 'E-01', rel: { t: 'cliente', id: 'K01' }, folder: 'Inbox', da: 'Giorgio Bernasconi <g.bernasconi@bluewin.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Re: tempistiche consegna piano 1', data: '2026-11-04 09:12', unread: false, testo: 'Buongiorno Ivo,\n\ngrazie per l\'aggiornamento. Per noi va bene la consegna del piano 1 entro il 20 novembre. Ci può mandare anche un preventivo per la tinteggiatura del garage?\n\nCordiali saluti\nGiorgio Bernasconi', allegati: [] },
    { id: 'E-02', rel: { t: 'cliente', id: 'K01' }, folder: 'Sent', da: 'stefano@mycolorgroup.ch', a: 'g.bernasconi@bluewin.ch', oggetto: 'Variazione: risanamento umidità cantina', data: '2026-10-28 17:40', unread: false, testo: 'Gentile signor Bernasconi,\n\ndurante i lavori in cantina abbiamo riscontrato umidità di risalita sul muro nord. Allego la variazione (CHF 2\'640) con foto. Resta in attesa di una sua approvazione.\n\nCordiali saluti\nStefano Montagnese', allegati: ['Variazione_cantina.pdf', 'Foto_umidita.jpg'] },
    { id: 'E-03', rel: { t: 'cliente', id: 'K01' }, folder: 'Inbox', da: 'Giorgio Bernasconi <g.bernasconi@bluewin.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Conferma velatura camera padronale', data: '2026-10-12 18:03', unread: false, testo: 'Confermiamo la velatura decorativa nella camera padronale come da campione visto ieri. Grazie.', allegati: [] },
    { id: 'E-04', rel: { t: 'cliente', id: 'K02' }, folder: 'Inbox', da: 'Patrizia Mantegazza <p.mantegazza@ail-immobiliare.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Verbale riunione 3.11 e 3º acconto', data: '2026-11-03 16:25', unread: true, testo: 'Buonasera,\n\nin allegato il verbale della riunione di oggi. Confermo l\'approvazione del 3º acconto per Residenza al Lago. Per Via Nassa vi chiedo di comunicarci la data di fine lavori dei vani scala.\n\nCordiali saluti\nPatrizia Mantegazza', allegati: ['Verbale_03-11-2026.pdf'] },
    { id: 'E-05', rel: { t: 'cliente', id: 'K02' }, folder: 'Sent', da: 'letizia@mycolorgroup.ch', a: 'contabilita@ail-immobiliare.ch', oggetto: 'Fattura FA-2026-0431, 3º acconto Residenza al Lago', data: '2026-10-31 11:02', unread: false, testo: 'Gentili signori,\n\nallegata la fattura FA-2026-0431 con QR-fattura, scadenza 30.11.2026.\n\nCordiali saluti\nLetizia Gottardello', allegati: ['FA-2026-0431.pdf'] },
    { id: 'E-06', rel: { t: 'cliente', id: 'K03' }, folder: 'Inbox', da: 'UTC Mendrisio <utc@mendrisio.ch>', a: 'antonio@mycolorgroup.ch', oggetto: 'Botole supplementari corridoio piano 1', data: '2026-11-03 15:30', unread: true, testo: 'Buongiorno,\n\nla direzione scolastica chiede se è possibile prevedere 2 botole d\'ispezione supplementari nel corridoio del piano 1. Vi preghiamo di quotare.\n\nIng. F. Rinaldi', allegati: [] },
    { id: 'E-07', rel: { t: 'cliente', id: 'K03' }, folder: 'Inbox', da: 'UTC Mendrisio <utc@mendrisio.ch>', a: 'antonio@mycolorgroup.ch', oggetto: 'Conferma prodotto controsoffitti acustici', data: '2026-09-02 10:18', unread: false, testo: 'Confermiamo Rigips Rigitone 8/18 per i controsoffitti delle aule.', allegati: [] },
    { id: 'E-08', rel: { t: 'cliente', id: 'K04' }, folder: 'Sent', da: 'letizia@mycolorgroup.ch', a: 'direzione@hotelceresio.ch', oggetto: 'Sollecito fattura FA-2026-0372', data: '2026-10-28 16:10', unread: false, testo: 'Gentile signora Ruggeri,\n\nla fattura FA-2026-0372 di CHF 4\'180 è scaduta il 05.10.2026. La preghiamo di provvedere al pagamento.\n\nCordiali saluti\nLetizia Gottardello', allegati: ['FA-2026-0372.pdf'] },
    { id: 'E-09', rel: { t: 'cliente', id: 'K04' }, folder: 'Inbox', da: 'Daniela Ruggeri <direzione@hotelceresio.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Accesso camere piano 3 da lunedì 9.11', data: '2026-11-02 08:45', unread: false, testo: 'Buongiorno, confermo che le camere 301-312 saranno libere da lunedì 9 novembre. Il piano 2 resta disponibile come concordato.', allegati: [] },
    { id: 'E-10', rel: { t: 'cliente', id: 'K05' }, folder: 'Inbox', da: 'Arch. Luca Bianchi <l.bianchi@igticino.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Verbale spessori intumescente, zona B', data: '2026-11-05 17:20', unread: true, testo: 'Verbale accettato. Prossima misurazione il 12.11 alle 10:00 in cantiere.', allegati: ['Verbale_spessori_B.pdf'] },
    { id: 'E-11', rel: { t: 'cliente', id: 'K07' }, folder: 'Inbox', da: 'Elena Pedrazzini <e.pedrazzini@studiopedrazzini.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Capitolato loft Via Pretorio', data: '2026-11-04 11:50', unread: false, testo: 'Caro Ivo,\n\nin allegato il capitolato del loft di Via Pretorio. Ci servirebbe l\'offerta entro fine mese; sopralluogo possibile martedì 10.\n\nElena', allegati: ['Capitolato_Loft_ViaPretorio.pdf'] },
    { id: 'E-12', rel: { t: 'cliente', id: 'K08' }, folder: 'Sent', da: 'ivo@mycolorgroup.ch', a: 'andrea.rossi@gmail.com', oggetto: 'Offerta OF-2026-0258, Casa Rossi: firma digitale', data: '2026-11-01 09:12', unread: false, testo: 'Gentile signor Rossi,\n\ncome concordato le invio l\'offerta per la pittura interni e la resina del garage. Può firmarla direttamente dal link qui sotto, senza stampare.\n\nCordiali saluti\nIvo Foletti', allegati: ['OF-2026-0258.pdf'] },
    { id: 'E-13', rel: { t: 'fornitore', id: 'F01' }, folder: 'Inbox', da: 'Renato Bossi <ordini@sumcolor.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Condizioni 2027', data: '2026-11-05 14:02', unread: true, testo: 'Ciao Ivo,\n\ncome discusso al telefono, ti confermo per iscritto entro il 15.11 la proposta di sconto 14% su volume annuo superiore a 150k.\n\nRenato', allegati: [] },
    { id: 'E-14', rel: { t: 'fornitore', id: 'F01' }, folder: 'Inbox', da: 'Sumcolor SA <ordini@sumcolor.ch>', a: 'letizia@mycolorgroup.ch', oggetto: 'Fattura 1193, Palazzina Suglio', data: '2026-11-03 08:30', unread: false, testo: 'In allegato la fattura 1193 per la vernice intumescente consegnata a Manno.', allegati: ['Sumcolor_1193.pdf'] },
    { id: 'E-15', rel: { t: 'fornitore', id: 'F07' }, folder: 'Sent', da: 'stefano@mycolorgroup.ch', a: 'info@ponteggiticino.ch', oggetto: 'Ponteggio Riva Paradiso: proroga novembre', data: '2026-10-29 10:10', unread: false, testo: 'Buongiorno Mauro,\n\nconfermo la proroga del ponteggio facciate a Riva Paradiso 30 per tutto novembre. Vi avviso per la disdetta entro il 20.11.\n\nStefano', allegati: [] },
    { id: 'E-16', rel: { t: 'fornitore', id: 'F04' }, folder: 'Inbox', da: 'Monica Ghezzi <ticino@sto.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Conferma ordine OR-2026-088', data: '2026-11-05 11:40', unread: false, testo: 'Ordine confermato, consegna a Bioggio il 10.11 mattina.', allegati: ['Conferma_OR-2026-088.pdf'] },
    { id: 'E-17', rel: { t: 'fornitore', id: 'F03' }, folder: 'Inbox', da: 'Beat Huber <verkauf@rigips.ch>', a: 'letizia@mycolorgroup.ch', oggetto: 'Rechnung 1186 / Scuola Canavée', data: '2026-10-29 09:05', unread: false, testo: 'Anbei die Rechnung 1186 für die Lieferung nach Mendrisio. Zahlbar innert 45 Tagen.', allegati: ['Rigips_1186.pdf'] },
    { id: 'E-18', rel: { t: 'fornitore', id: 'F12' }, folder: 'Inbox', da: 'Nino Bertoli <info@decorsub.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Disponibilità squadra dicembre', data: '2026-11-04 16:30', unread: false, testo: 'Ciao Stefano, a dicembre abbiamo 2 pittori liberi dal 7 al 18. Se vi servono per l\'Hotel Ceresio fammi sapere.', allegati: [] },
    { id: 'E-19', rel: null, account: 'AC4', folder: 'Inbox', da: 'Arch. Lara Pedrazzini <l.pedrazzini@studiopedrazzini.ch>', a: 'info@mycolorgroup.ch', oggetto: 'Richiesta offerta: ristrutturazione attico Via Besso, Lugano', data: '2026-11-06 08:41', unread: true, labels: ['Richiesta offerta'], testo: 'Buongiorno,\n\nper conto dei nostri clienti vi chiediamo un\'offerta per la pittura completa di un attico di 140 m² in Via Besso a Lugano: pareti e soffitti in dispersione, 9 porte da smaltare, piccola rasatura nel soggiorno (circa 25 m²). I lavori dovrebbero iniziare a gennaio.\n\nIn allegato planimetria e capitolato. Saremmo disponibili per un sopralluogo la prossima settimana.\n\nCordiali saluti\nLara Pedrazzini\nStudio Pedrazzini architetti', allegati: ['Planimetria_attico.pdf', 'Capitolato_pittura.docx'] },
    { id: 'E-20', rel: null, account: 'AC1', folder: 'Inbox', da: 'Ufficio tecnico Comune di Bioggio <ut@bioggio.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Autorizzazione occupazione area pubblica per ponteggio, Via Industria', data: '2026-11-06 07:30', unread: true, labels: ['Autorità'], testo: 'Gentile signor Foletti,\n\nla richiesta di occupazione dell\'area pubblica per il ponteggio in Via Industria 12 è stata approvata dal 10 al 28 novembre 2026. La tassa di CHF 320.- verrà fatturata separatamente.\n\nCordiali saluti\nUfficio tecnico comunale', allegati: ['Autorizzazione_2026-412.pdf'] },
    { id: 'E-21', rel: null, account: 'AC3', folder: 'Inbox', da: 'SUVA <no-reply@suva.ch>', a: 'letizia@mycolorgroup.ch', oggetto: 'Conteggio premi 2026: acconto 4º trimestre', data: '2026-11-05 10:15', unread: false, labels: ['Assicurazioni'], testo: 'Gentili signori,\n\nin allegato il conteggio dell\'acconto premi per il 4º trimestre 2026, importo CHF 14\'380.-, scadenza 30.11.2026.\n\nSUVA Agenzia di Lugano', allegati: ['Suva_Q4_2026.pdf'] },
    { id: 'E-22', rel: { t: 'cliente', id: 'K01' }, account: 'AC2', folder: 'Inbox', da: 'Giorgio Bernasconi <g.bernasconi@bluewin.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Garage: possiamo fare la prossima settimana?', data: '2026-11-06 09:05', unread: true, labels: [], testo: 'Buongiorno Stefano,\n\nper la tinteggiatura del garage di cui parlavamo: sareste liberi la prossima settimana? Noi saremmo via da giovedì.\n\nGrazie\nGiorgio', allegati: [] },
    { id: 'E-23', rel: null, account: 'AC4', folder: 'Inbox', da: 'Marco Scalzi <m.scalzi@gmail.com>', a: 'info@mycolorgroup.ch', oggetto: 'Candidatura spontanea pittore AFC', data: '2026-11-05 19:22', unread: true, labels: ['Candidature'], testo: 'Buonasera,\n\nsono pittore con AFC e 6 anni di esperienza, attualmente a Lugano. Allego il mio CV e resto a disposizione per un colloquio.\n\nMarco Scalzi\n079 456 12 34', allegati: ['CV_Scalzi.pdf'] },
    { id: 'E-24', rel: { t: 'cliente', id: 'K02' }, account: 'AC3', folder: 'Inbox', da: 'Contabilità AIL Immobiliare <contabilita@ail-immobiliare.ch>', a: 'letizia@mycolorgroup.ch', oggetto: 'Pagamento FA-2026-0431 eseguito', data: '2026-11-05 15:48', unread: false, labels: ['Pagamenti'], testo: 'Buongiorno,\n\nvi confermiamo il bonifico di CHF 48\'600.- relativo alla fattura FA-2026-0431, con valuta 6 novembre.\n\nCordiali saluti\nContabilità AIL Immobiliare', allegati: [] },
    { id: 'E-25', rel: null, account: 'AC1', folder: 'Inbox', da: 'Banca Raiffeisen <ebanking@raiffeisen.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Avviso di accredito CHF 18\'900.00', data: '2026-11-06 06:10', unread: true, labels: ['Banca'], testo: 'Sul conto CH93 0076 2011 6238 5295 7 è stato accreditato l\'importo di CHF 18\'900.00 da Condominio Via Nassa, riferimento QR 21 00000 00003 13947 14300 09017.', allegati: [] },
    { id: 'E-26', rel: { t: 'fornitore', id: 'F12' }, account: 'AC2', folder: 'Inbox', da: 'Nino Bertoli <info@decorsub.ch>', a: 'stefano@mycolorgroup.ch', oggetto: 'Re: Disponibilità squadra dicembre: confermiamo 2 persone', data: '2026-11-05 17:30', unread: false, labels: [], testo: 'Ciao Stefano,\n\nconfermiamo due persone dal 1º al 19 dicembre per Via Nassa, tariffa come concordato.\n\nNino', allegati: [] },
    { id: 'E-27', rel: null, account: 'AC1', folder: 'Sent', da: 'ivo@mycolorgroup.ch', a: 'l.pedrazzini@studiopedrazzini.ch', oggetto: 'Re: Richiesta offerta attico Via Besso: sopralluogo giovedì?', data: '2026-11-06 09:20', unread: false, labels: ['Richiesta offerta'], testo: 'Gentile architetto Pedrazzini,\n\ngrazie per la richiesta. Proporrei un sopralluogo giovedì 12 novembre alle 9:00; seguirà offerta entro due giorni lavorativi.\n\nCordiali saluti\nIvo Foletti', allegati: [] },
    { id: 'E-28', rel: { t: 'cliente', id: 'K02' }, account: 'AC3', folder: 'Draft', da: 'letizia@mycolorgroup.ch', a: 'contabilita@ail-immobiliare.ch', oggetto: 'Promemoria scadenza FA-2026-0372', data: '2026-11-06 08:05', unread: false, labels: ['Pagamenti'], testo: 'Gentili signori,\n\nci permettiamo di ricordare la fattura FA-2026-0372 di CHF 4\'180.-, scaduta il 5 ottobre.\n\nCordiali saluti\nLetizia Gottardello', allegati: [] },
    { id: 'E-29', rel: null, account: 'AC4', folder: 'Inbox', da: 'Caparol Newsletter <news@caparol.ch>', a: 'info@mycolorgroup.ch', oggetto: 'Novità 2027: tinte per facciate e listino aggiornato', data: '2026-11-04 11:00', unread: true, labels: ['Newsletter'], testo: 'Scoprite le nuove tinte per facciate e il listino 2027 in vigore dal 1º gennaio. Formazione gratuita per applicatori a Bellinzona il 20 novembre.', allegati: [] },
    { id: 'E-30', rel: { t: 'cliente', id: 'K02' }, account: 'AC1', folder: 'Inbox', da: 'Patrizia Mantegazza <p.mantegazza@ail-immobiliare.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Via Nassa: data fine lavori vani scala?', data: '2026-11-06 08:12', unread: true, labels: [], testo: 'Buongiorno Ivo,\n\nmi conferma la data di fine lavori dei vani scala di Via Nassa? Devo comunicarla agli inquilini.\n\nGrazie\nPatrizia', allegati: [] },
    { id: 'E-31', rel: null, account: 'AC1', folder: 'Archive', da: 'Zurich Assicurazioni <agenzia.lugano@zurich.ch>', a: 'ivo@mycolorgroup.ch', oggetto: 'Polizza RC aziendale: rinnovo 2027', data: '2026-10-29 14:20', unread: false, labels: ['Assicurazioni'], testo: 'Gentile signor Foletti,\n\nallego la proposta di rinnovo della polizza RC aziendale per il 2027, premio invariato.\n\nCordiali saluti\nZurich, Agenzia di Lugano', allegati: ['Rinnovo_RC_2027.pdf'] },
    { id: 'E-32', rel: { t: 'fornitore', id: 'F03' }, account: 'AC3', folder: 'Inbox', da: 'Beat Huber <verkauf@rigips.ch>', a: 'letizia@mycolorgroup.ch', oggetto: 'Rechnung 1192 / Palazzina Manno', data: '2026-11-06 07:45', unread: true, labels: ['Fatture fornitori'], testo: 'Guten Tag\n\nIm Anhang die Rechnung 1192 für die Lieferung vom 3.11. (Palazzina Manno), CHF 3\'864.50, zahlbar innert 30 Tagen.\n\nFreundliche Grüsse\nBeat Huber', allegati: ['Rechnung_1192.pdf'] },
  ];

  // ---- Calendario (Outlook): settimana 2–8 novembre e seguenti ----
  const EVENTI = [
    { id: 'EV-01', titolo: 'Riunione mensile AIL Immobiliare', inizio: '2026-11-03T14:00', fine: '2026-11-03T15:30', tipo: 'Riunione', rel: { t: 'cliente', id: 'K02' }, luogo: 'Via Pretorio 9, Lugano', partecipanti: ['C001', 'C002'], outlook: true },
    { id: 'EV-02', titolo: 'Sopralluogo cantina Villa Bernasconi', inizio: '2026-11-04T08:00', fine: '2026-11-04T09:00', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K01' }, luogo: 'Montagnola', partecipanti: ['C002'], outlook: true },
    { id: 'EV-03', titolo: 'Consegna Sumcolor a Manno', inizio: '2026-11-05T07:30', fine: '2026-11-05T08:00', tipo: 'Consegna', rel: { t: 'fornitore', id: 'F01' }, luogo: 'Palazzina Suglio', partecipanti: ['C006'], outlook: true },
    { id: 'EV-04', titolo: 'Chiamata Sumcolor: condizioni 2027', inizio: '2026-11-05T09:15', fine: '2026-11-05T09:45', tipo: 'Chiamata', rel: { t: 'fornitore', id: 'F01' }, luogo: 'Teams', partecipanti: ['C001'], outlook: true },
    { id: 'EV-05', titolo: 'Misura spessori intumescente, zona B', inizio: '2026-11-05T16:30', fine: '2026-11-05T17:30', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K05' }, luogo: 'Palazzina Suglio, Manno', partecipanti: ['C002', 'C006'], outlook: true },
    { id: 'EV-06', titolo: 'Demo gestionale (Ivo)', inizio: '2026-11-06T10:00', fine: '2026-11-06T11:30', tipo: 'Riunione', rel: null, luogo: 'Ufficio Bioggio', partecipanti: ['C001'], outlook: true },
    { id: 'EV-07', titolo: 'Chiamare Andrea Rossi per firma offerta', inizio: '2026-11-06T11:00', fine: '2026-11-06T11:15', tipo: 'Chiamata', rel: { t: 'cliente', id: 'K08' }, luogo: 'Telefono', partecipanti: ['C001'], outlook: true },
    { id: 'EV-08', titolo: 'Chiusura bollettini settimana 45', inizio: '2026-11-06T16:00', fine: '2026-11-06T17:00', tipo: 'Interno', rel: null, luogo: 'Ufficio', partecipanti: ['C002', 'C003'], outlook: true },
    { id: 'EV-09', titolo: 'Inizio lavori camere piano 3 Hotel Ceresio', inizio: '2026-11-09T07:00', fine: '2026-11-09T08:00', tipo: 'Cantiere', rel: { t: 'cliente', id: 'K04' }, luogo: 'Bellinzona', partecipanti: ['C022'], outlook: true },
    { id: 'EV-10', titolo: 'Consegna Sto a Bioggio (OR-2026-088)', inizio: '2026-11-10T08:00', fine: '2026-11-10T09:00', tipo: 'Consegna', rel: { t: 'fornitore', id: 'F04' }, luogo: 'Magazzino Bioggio', partecipanti: ['C004'], outlook: true },
    { id: 'EV-11', titolo: 'Sopralluogo loft Via Pretorio con arch. Pedrazzini', inizio: '2026-11-10T08:30', fine: '2026-11-10T10:00', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K07' }, luogo: 'Via Pretorio, Lugano', partecipanti: ['C001', 'C002'], outlook: true },
    { id: 'EV-12', titolo: 'Presentazione sistema facciate Sto', inizio: '2026-11-12T10:00', fine: '2026-11-12T11:30', tipo: 'Riunione', rel: { t: 'fornitore', id: 'F04' }, luogo: 'Ufficio Bioggio', partecipanti: ['C002', 'C001'], outlook: true },
    { id: 'EV-13', titolo: 'Misura spessori intumescente, zona C', inizio: '2026-11-12T10:00', fine: '2026-11-12T11:00', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K05' }, luogo: 'Palazzina Suglio, Manno', partecipanti: ['C002'], outlook: true },
    { id: 'EV-14', titolo: 'Servizio Iveco TI 88 417', inizio: '2026-11-10T13:00', fine: '2026-11-10T17:00', tipo: 'Interno', rel: null, luogo: 'Officina Lamone', partecipanti: ['C004'], outlook: true },
    { id: 'EV-15', titolo: 'Collaudo parziale fase 1 Scuola Canavée', inizio: '2026-11-13T09:00', fine: '2026-11-13T11:00', tipo: 'Sopralluogo', rel: { t: 'cliente', id: 'K03' }, luogo: 'Mendrisio', partecipanti: ['C003', 'C005'], outlook: true },
    { id: 'EV-16', titolo: 'Scadenza fattura FA-2026-0431 (AIL)', inizio: '2026-11-30T09:00', fine: '2026-11-30T09:15', tipo: 'Scadenza', rel: { t: 'cliente', id: 'K02' }, luogo: '', partecipanti: ['C004'], outlook: true },
    { id: 'EV-17', titolo: 'Riunione di squadra responsabili', inizio: '2026-11-02T07:30', fine: '2026-11-02T08:15', tipo: 'Interno', rel: null, luogo: 'Ufficio Bioggio', partecipanti: ['C001', 'C002', 'C003'], outlook: true },
    { id: 'EV-18', titolo: 'Ferie Marco Bernardi', inizio: '2026-11-16T07:00', fine: '2026-11-20T17:00', tipo: 'Assenza', rel: null, luogo: '', partecipanti: ['C005'], outlook: false },
  ];

  // ---- Messaggistica interna ----
  const CANALI = [
    { id: 'gen', nome: 'Generale', tipo: 'canale', desc: 'Avvisi a tutta l\'azienda' },
    { id: 'c-409', nome: 'Villa Bernasconi', tipo: 'cantiere', cant: 'MC 20-26.409' },
    { id: 'c-388', nome: 'Residenza al Lago', tipo: 'cantiere', cant: 'MC 20-26.388' },
    { id: 'c-415', nome: 'Scuola Canavée', tipo: 'cantiere', cant: 'MC 20-26.415' },
    { id: 'c-421', nome: 'Hotel Ceresio', tipo: 'cantiere', cant: 'MC 20-26.421' },
    { id: 'c-430', nome: 'Palazzina Suglio', tipo: 'cantiere', cant: 'MC 20-26.430' },
    { id: 'c-395', nome: 'Stabile Via Nassa', tipo: 'cantiere', cant: 'MC 20-26.395' },
  ];
  const MESSAGGI = [
    { id: 'M-01', ch: 'gen', autore: 'C001', testo: 'Buongiorno a tutti. Venerdì 6 chiudiamo i bollettini di ottobre: chi ha ancora bozze le invii entro oggi, grazie.', ts: '2026-11-06T07:05' },
    { id: 'M-02', ch: 'gen', autore: 'C004', testo: 'Ricordo che le ricevute pranzo di ottobre vanno fotografate nell\'app entro lunedì.', ts: '2026-11-05T16:40' },
    { id: 'M-03', ch: 'gen', autore: 'C003', testo: 'Il furgone TI 88 417 torna dall\'officina lunedì 9. Chi lo aveva prenotato per Paradiso è a posto.', ts: '2026-11-04T12:15' },
    { id: 'M-04', ch: 'c-409', autore: 'C021', testo: 'Piano 1 quasi finito, domani iniziamo le camere lato lago. Serve un secchio di Indeko in più.', ts: '2026-11-05T17:02' },
    { id: 'M-05', ch: 'c-409', autore: 'C002', testo: 'Ok Andrea, lo porto io domattina alle 7. Il cliente ha confermato il piano 1 per il 20.11.', ts: '2026-11-05T17:20' },
    { id: 'M-06', ch: 'c-409', autore: 'C023', testo: 'Foto della velatura camera padronale caricata nel bollettino di ieri 👍', ts: '2026-11-05T17:31' },
    { id: 'M-07', ch: 'c-388', autore: 'C020', testo: 'Vento forte sul ponteggio lato lago: oggi lavoriamo solo sul lato strada.', ts: '2026-11-06T07:40' },
    { id: 'M-08', ch: 'c-388', autore: 'C002', testo: 'Giusto. Se peggiora, spostate la squadra sugli interni del piano 4.', ts: '2026-11-06T07:52' },
    { id: 'M-09', ch: 'c-415', autore: 'C005', testo: 'Consegnate le lastre Rigips RF, 620 pezzi. Le botole arrivano la settimana prossima.', ts: '2026-11-04T09:10' },
    { id: 'M-10', ch: 'c-415', autore: 'C003', testo: 'Perfetto Marco. Il Comune chiede 2 botole in più nel corridoio piano 1: la quoto come variazione.', ts: '2026-11-04T09:30' },
    { id: 'M-11', ch: 'c-421', autore: 'C022', testo: 'Da lunedì abbiamo accesso alle camere 301-312. Ci servono altri 2 rulli tappezzeria.', ts: '2026-11-05T16:05' },
    { id: 'M-12', ch: 'c-430', autore: 'C006', testo: 'Zona B misurata con l\'architetto, tutto ok. Zona C giovedì 12.', ts: '2026-11-05T17:45' },
    { id: 'M-13', ch: 'dm-C002-C023', autore: 'C002', testo: 'Francesco, domani puoi arrivare alle 7 per aprire il cantiere? Andrea arriva alle 8.', ts: '2026-11-05T18:10' },
    { id: 'M-14', ch: 'dm-C002-C023', autore: 'C023', testo: 'Sì nessun problema, ci penso io.', ts: '2026-11-05T18:14' },
    { id: 'M-15', ch: 'dm-C001-C002', autore: 'C001', testo: 'Stefano, la variazione cantina Bernasconi è ancora da approvare: senti il cliente oggi?', ts: '2026-11-06T08:02' },
    { id: 'M-16', ch: 'dm-C001-C004', autore: 'C004', testo: 'Ivo, Hotel Ceresio non ha ancora pagato la 0372. Mando il secondo sollecito domani?', ts: '2026-11-06T08:20' },
    { id: 'M-17', ch: 'dm-C003-C008', autore: 'C003', testo: 'Dario, lunedì vai diretto a Mendrisio con la tua auto, non passare da Bioggio.', ts: '2026-11-05T17:00' },
    { id: 'M-18', ch: 'dm-C003-C008', autore: 'C008', testo: 'Ok Antonio, grazie.', ts: '2026-11-05T17:08' },
  ];

  // ---- Notifiche ----
  const NOTIFICHE = [
    { id: 'N-01', ts: '2026-11-06T08:20', testo: 'Letizia ti ha scritto: Hotel Ceresio non ha ancora pagato la 0372', view: 'messaggi', id2: 'dm-C001-C004', per: ['C001'] },
    { id: 'N-02', ts: '2026-11-06T07:58', testo: '7 nuovi bollettini inviati dagli operai, 2 con anomalia', view: 'bollettini', per: ['C001', 'C002', 'C003'] },
    { id: 'N-03', ts: '2026-11-05T17:20', testo: 'Arch. Bianchi (IG Ticino): verbale spessori zona B accettato', view: 'cliente', id2: 'K05', per: ['C001', 'C002'] },
    { id: 'N-04', ts: '2026-11-05T14:02', testo: 'Sumcolor: condizioni 2027, sconto 14% in arrivo per iscritto', view: 'fornitore', id2: 'F01', per: ['C001'] },
    { id: 'N-05', ts: '2026-11-05T09:00', testo: 'Fattura FA-2026-0372 Hotel Ceresio scaduta da 31 giorni', view: 'commerciale', id2: 'fatture', per: ['C001', 'C004'] },
    { id: 'N-06', ts: '2026-11-04T11:50', testo: 'Nuovo capitolato da Studio Pedrazzini: analisi IA completata, 3 domande aperte', view: 'capitolato', id2: 'CAP-03', per: ['C001', 'C002'] },
    { id: 'N-07', ts: '2026-11-04T09:30', testo: 'Scuola Canavée sotto break-even: 49.8 CHF/h', view: 'cantiere', id2: 'MC 20-26.415', per: ['C001', 'C003'] },
    { id: 'N-08', ts: '2026-11-03T16:25', testo: 'AIL Immobiliare ha approvato il 3º acconto Residenza al Lago', view: 'cliente', id2: 'K02', per: ['C001', 'C004'] },
  ];

  // ---- Assenze e richieste ----
  const ASSENZE = [
    { id: 'AS-01', workerId: W('Marco Bernardi'), tipo: 'Vacanze', dal: '2026-11-16', al: '2026-11-20', giorni: 5, stato: 'Approvata', nota: 'Settimana bianca' },
    { id: 'AS-02', workerId: W('Omar Bouzid'), tipo: 'Vacanze', dal: '2026-11-23', al: '2026-11-27', giorni: 5, stato: 'Richiesta', nota: '' },
    { id: 'AS-03', workerId: W('Samir Hoxha'), tipo: 'Malattia', dal: '2026-11-04', al: '2026-11-05', giorni: 2, stato: 'Certificato caricato', nota: 'Influenza' },
    { id: 'AS-04', workerId: W('Elia Sassi'), tipo: 'Scuola professionale', dal: '2026-11-09', al: '2026-11-09', giorni: 1, stato: 'Approvata', nota: 'Corso interaziendale' },
    { id: 'AS-05', workerId: W('Gianluca Torres'), tipo: 'Vacanze', dal: '2026-12-21', al: '2026-12-31', giorni: 8, stato: 'Richiesta', nota: 'Natale in famiglia' },
  ];

  // ---- Documenti per cantiere (SharePoint) ----
  const DOCUMENTI = {
    'MC 20-26.409': [['Capitolato NPK firmato.pdf', '2026-09-10', 'Offerta'], ['Planimetrie piano terra.dwg', '2026-09-01', 'Progetto'], ['Foto stato iniziale (48).zip', '2026-09-14', 'Foto'], ['Verbale sopralluogo 12.09.pdf', '2026-09-12', 'Verbali'], ['Scheda sicurezza smalto Sikkens.pdf', '2026-10-02', 'Sicurezza'], ['Variazione_cantina.pdf', '2026-10-28', 'Variazioni']],
    'MC 20-26.388': [['Offerta firmata OF-2026-0188.pdf', '2026-05-12', 'Offerta'], ['Piano ponteggi facciate.pdf', '2026-06-01', 'Sicurezza'], ['Foto facciata sud (120).zip', '2026-10-15', 'Foto'], ['Verbale riunione AIL 03.11.pdf', '2026-11-03', 'Verbali']],
    'MC 20-26.415': [['Capitolato_Canavee_SIA118.pdf', '2026-07-28', 'Offerta'], ['Contratto d\'appalto.pdf', '2026-09-22', 'Contratto'], ['Certificazione sistema REI 60.pdf', '2026-10-05', 'Sicurezza'], ['Piano fasi lavori.xlsx', '2026-10-01', 'Pianificazione']],
    'MC 20-26.421': [['Offerta firmata OF-2026-0244.pdf', '2026-10-01', 'Offerta'], ['Campioni tappezzeria approvati.pdf', '2026-10-20', 'Progetto'], ['Planimetria camere piano 2-3.pdf', '2026-10-15', 'Progetto']],
    'MC 20-26.430': [['Capitolato_Suglio_IGTicino.pdf', '2026-08-30', 'Offerta'], ['Verbale_spessori_A.pdf', '2026-10-28', 'Verbali'], ['Verbale_spessori_B.pdf', '2026-11-05', 'Verbali'], ['Scheda tecnica Sika Unitherm.pdf', '2026-09-15', 'Sicurezza']],
    'MC 20-26.395': [['Offerta firmata OF-2026-0201.pdf', '2026-07-20', 'Offerta'], ['Elenco stabili e vani scala.xlsx', '2026-08-20', 'Pianificazione'], ['Foto prima/dopo stabili 1-4.zip', '2026-10-20', 'Foto']],
    'MC 20-26.402': [['Offerta firmata OF-2026-0176.pdf', '2026-05-05', 'Offerta'], ['Verbale collaudo 09.10.pdf', '2026-10-09', 'Verbali'], ['Fattura finale FA-2026-0412.pdf', '2026-10-15', 'Fatture']],
    'MC 20-26.440': [['OF-2026-0258.pdf', '2026-10-27', 'Offerta'], ['Foto sopralluogo (12).zip', '2026-10-22', 'Foto']],
  };

  // ---- Utenti e inviti (accessi al gestionale) ----
  const INVITI = [
    { id: 'IN-01', email: 'igor@mycolorgroup.ch', nome: 'Igor Vukić', ruolo: 'Operaio (app)', inviato: '2026-11-03', stato: 'In attesa' },
    { id: 'IN-02', email: 'fiduciaria@studiorezzonico.ch', nome: 'Studio Rezzonico (fiduciaria)', ruolo: 'Contabile esterno', inviato: '2026-10-30', stato: 'In attesa' },
  ];
  const RUOLI = [
    { id: 'Direzione', desc: 'Tutto, inclusi margini, salari, impostazioni e inviti', n: 1 },
    { id: 'Responsabile', desc: 'Cantieri, bollettini, pianificazione, offerte, fornitori; salari solo del proprio ramo', n: 2 },
    { id: 'Amministrazione', desc: 'Fatture, contabilità, SelectLine, conguagli, anagrafiche', n: 1 },
    { id: 'Capo squadra (app)', desc: 'App cantiere + bollettini della squadra + chat', n: 6 },
    { id: 'Operaio (app)', desc: 'App cantiere: timbrature, bollettini, km, messaggi', n: 30 },
    { id: 'Contabile esterno', desc: 'Sola lettura su contabilità ed export', n: 0 },
  ];

  // ---- SelectLine: piano dei conti KMU e mapping ----
  const SELECTLINE = {
    mandante: 'MYCOLOR_2026',
    api: 'https://sl-api.mycolorgroup.ch/slmobileApi',
    versione: 'SelectLine Rechnungswesen 25.1',
    ultimaSync: '2026-11-06 06:30',
    mapping: [
      ['3000', 'Ricavi da lavori pittura', 'Fatture clienti ramo pittura'],
      ['3010', 'Ricavi da lavori gessatura', 'Fatture clienti ramo gessatura'],
      ['4000', 'Materiale pittura', 'Fatture fornitori categoria materiale pittura'],
      ['4010', 'Materiale gessatura', 'Fatture fornitori categoria materiale gessatura'],
      ['4400', 'Lavori di terzi / subappalti', 'Fatture fornitori categoria subappalto'],
      ['4410', 'Ponteggi e noleggi', 'Fatture fornitori ponteggi e noleggio'],
      ['4420', 'Smaltimento e trasporti', 'Fatture fornitori smaltimento, trasporti'],
      ['5000', 'Salari produttivi', 'Ore approvate × costo orario'],
      ['5700', 'Oneri sociali', 'Calcolo automatico 27%'],
      ['5820', 'Indennità pranzo', 'Gessatori forfait / pittori > 12 km'],
      ['5830', 'Rimborso km veicolo privato', 'Km approvati × 0.70'],
      ['6200', 'Veicoli: carburante e manutenzione', 'Flotta'],
      ['1100', 'Debitori', 'Fatture clienti aperte'],
      ['2000', 'Creditori', 'Fatture fornitori aperte'],
    ],
  };

  return { TODAY, TODAY_ISO, PARAMS, CCL, KM, COMPETENZE, CATEGORIE_COSTO, workerCosts, WORKERS, CLIENTI, FORNITORI, CANTIERI, FATTURE_FORNITORI, OCR_SAMPLES, MOVIMENTI, BOLLETTINI, VEICOLI, KM_PRIVATI, VIAGGI, OFFERTE, FATTURE, CAPITOLATI, MAGAZZINO, ORDINI, ATTIVITA_CRM, EMAIL, EVENTI, ACCOUNTS, MENSILE, CANALI, MESSAGGI, NOTIFICHE, ASSENZE, DOCUMENTI, INVITI, RUOLI, SELECTLINE };
})();
