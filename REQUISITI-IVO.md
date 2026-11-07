# Requisiti emersi dall'incontro con Ivo (6 novembre 2026)

Lettura degli appunti e delle foto (riepilogo pasti, calendari aziendali gesso e pittura, lavagna di pianificazione, rastrelliera dei bollettini, liste materiale sulle scale, preventivo 2026/0364 A, rapporto lavori a regia n. 2882), confrontata con quello che la demo Capomastro fa oggi (v10.5).

Legenda stato: **C'è** = già in demo · **Adattare** = c'è ma funziona diversamente da come lavora MY COLOR · **Manca** = da costruire.

---

## 1. I sei processi reali di MY COLOR

### 1.1 Fatture fornitori (circa 100 al mese)
Come lavorano oggi: Letizia scansiona la polizza QR con uno strumento che crea la fattura in SelectLine. Le fatture vanno in un conto transitorio e passano al visto di Antonio (gesso) o Stefano (pittura), che controllano prezzi, sconti ed errori del fornitore e assegnano **ogni riga** (non la fattura intera) al cantiere giusto. Una fattura può coprire più cantieri.

| Requisito | Stato | Note |
|---|---|---|
| Numerazione interna progressiva (F1014, F1015…) in ordine cronologico | Manca | Oggi la demo usa il numero del fornitore come id |
| Numero fattura fornitore separato, da far combaciare con SelectLine | Adattare | Esiste il campo, ma non è distinto dal numero interno |
| Caricamento "generico" (non dentro un cantiere) con OCR riga per riga: articolo, pezzi, prezzo unitario | Adattare | L'OCR legge le righe, ma la fattura finisce su un solo cantiere |
| Campo "Assegna a" per ogni riga con dropdown cantieri (esclusi quelli chiusi da più di 3 mesi) | Manca | |
| Selezione multipla righe + "Assegna le righe selezionate al cantiere X" | Manca | |
| Stato "Transitorio, da vistare" e coda del visto per Antonio / Stefano per ramo | Adattare | Le approvazioni esistono per i bollettini, non per le fatture |
| Nel cantiere ogni costo mostra la fattura d'origine, con link che la apre | Manca | |
| Costi non di cantiere (IT, affitto, software) spalmati come costo struttura 20 CHF/h | C'è | `costoStrutturaOra: 20` è già il parametro |
| Fornitori reali: 2-3 pittura, circa 15 gessatura | Adattare | Anagrafica demo da riallineare |

### 1.2 Bollettini, ore e CCL
Come lavorano oggi: rapporti cartacei nella rastrelliera a nome, una cartellina per operaio. La Commissione paritetica cantonale può chiedere i bollettini (nome, luogo, ore, orario, km, indennità pranzo). Gesso e pittura hanno calendari aziendali diversi e regole diverse.

| Requisito | Stato | Note |
|---|---|---|
| Bollettino con nome, cantiere, orario di lavoro, ore, km, indennità pranzo | C'è | |
| Export bollettini da data a data, mensile, annuale (formato per la CPC) | Manca | Oggi c'è solo l'export CSV generico |
| Archivio di tutti i bollettini degli ultimi 5 anni, consultabile | Manca (demo) | In produzione: conservazione e ricerca per persona, cantiere, periodo |
| Registro giornaliero dei bollettini con filtri | Adattare | Lista con filtri c'è, manca la vista "registro" per giorno |
| Calendario aziendale per ramo: gesso 2'018 h e pittura 2'016 h nel 2026, 247 giorni, 8 h o 8.5 h al giorno secondo il mese | Manca | La demo usa 2'088 h e 40 h fisse |
| Indennità pranzo gessatori a scaglioni di km: 0-30 km 15.-, 31-40 km 20.-, 41-60 km 27.-, oltre 60 km 37.- | Adattare | La demo usa un forfait mensile |
| Straordinario 25% sopra il massimo settimanale (Ivo dice 44.5 h, da verificare sul testo CCL) | Adattare | La demo ha 25% ma soglia 40 h |
| Tempo di trasferta: prima ora a carico dell'operaio, poi pagato (da verificare 5/10 km ecc.) | Adattare | La demo ha "15 min non pagati" |
| Conguaglio ore: mensile per i gessatori, diverso per i pittori | Manca | |
| Bollettini agenzie interinali: colore diverso, doppia copia, firmati, registrazione manuale con upload | Manca | |
| "Rinvia con modifiche per conoscenza" con notifica all'operaio | Manca | Oggi c'è approva / rifiuta |
| Flag spostamento con veicolo privato o aziendale, e quale veicolo | Adattare | I viaggi hanno il veicolo, manca nel bollettino |
| Chi usa quale furgone, vista 2D della flotta | Adattare | Pagina veicoli c'è, manca la mappa d'uso |
| GPS attivo solo in una finestra oraria, geofence 500 m dal cantiere, promemoria pausa alle 11:55 | Adattare | GPS simulato c'è, manca la logica e il reminder |
| Linea guida CCL consultabile nell'app (strumento di riferimento) | Manca | Da scrivere dai testi 2026 dei due CCL ticinesi |

### 1.3 Pianificazione (la lavagna)
Come lavorano oggi: lavagna magnetica, una colonna per cantiere (codice MC xxx/26), targhette con i nomi degli operai, furgoni numerati (N° 6, 8, 9, 10), colonna "Agenzia", stagiaire, cantieri in attesa in basso a sinistra, note tipo "Giovedì 12 riservato Masoni".

| Requisito | Stato | Note |
|---|---|---|
| Codice cantiere "MC 286/26" | Adattare | La demo usa "MC 20-26.409": basta cambiare il formato |
| Tavola con colonne per cantiere e targhette operai trascinabili | Adattare | La pianificazione settimanale c'è, ma per persona non per cantiere |
| Furgoni assegnati alla squadra | Adattare | Veicoli esistono, non sono "targhette" nella tavola |
| Operai di agenzia e stagiaire come risorse | Manca | |
| Cantieri "in attesa" (acquisiti, non pianificati) come coda laterale | Manca | |
| Note libere sul giorno ("riservato Masoni") | Manca | |

### 1.4 Preparazione cantiere e materiale (Stefano)
Come lavorano oggi: lista materiale stampata per cantiere con pezzi/quantità, due colonne di spunte (preparato, caricato), attaccata alla scala. Le informazioni importanti (colore, tipo di materiale) oggi non vengono salvate per i ritocchi futuri.

| Requisito | Stato | Note |
|---|---|---|
| Lista materiale per cantiere con spunta "preparato" e "caricato sul furgone" | Manca | Il magazzino ha i prelievi, non la checklist di preparazione |
| Stampa della lista (resta cartacea sulla scala) | Manca | |
| Memoria cliente: colori, codici, tipo di materiale (dispersione, lavabile) per cantieri ripetuti e ritocchi | Manca | Scheda cliente c'è, serve la sezione "Materiali e colori usati" |
| File copertina cantiere + analisi conteggi per la SUVA | Manca | |

### 1.5 Offerte e capitolati
Come lavorano oggi: richiesta su info@ o telefono, Letizia inoltra ad Antonio (gesso e cartongesso) o a Stefano/Ivo (pittura). Pittura: sopralluogo con laser, metro, planimetrie, foto, tutto su OneDrive. Gesso: meno sopralluogo, più planimetrie e file CAD; Claudia prepara il preventivo con tipologia lastre, struttura, contropareti. Capitolati con schede tecniche e certificati entro 10 giorni, importi spesso sopra 50'000 CHF, oggi 5-10 ore di lavoro.

| Requisito | Stato | Note |
|---|---|---|
| Registrazione richiesta nel CRM con vocale e inoltro per ramo | Adattare | CRM e vocale ci sono, manca lo smistamento automatico per ramo |
| OneDrive integrato (foto, planimetrie, preventivi nel cantiere) | Manca | Solo citato nella pagina integrazioni |
| Foto "prima" obbligatoria (gli operai la dimenticano) | Manca | Promemoria nel bollettino del primo giorno |
| Due flussi distinti: offerta semplice e capitolato complesso | Adattare | Esistono entrambi, ma non sono presentati come flussi diversi |
| Preventivatore basato sullo storico (offerte degli ultimi 2 anni): voci, unità, prezzi, capitoli fissi (impianto cantiere, protezioni, smaltimento) | Manca | È il requisito "fondamentale" di Ivo |
| Layout offerta come il preventivo reale: Pos, descrizione, unità (ac, mq, ore, %, ml), quantità, prezzo, totale, con sottotitoli per capitolo | Adattare | Il generatore IA produce voci ma non questo layout |
| Capitolato IA: carico di tutti i file (piani esecutivi, CAD, render, modulo d'offerta) + prompt; misure prese dai disegni; prezzi dallo storico; obiettivo 1 ora invece di 5-10 | Manca | La demo legge un PDF e risponde a domande |
| Builder manuale: modifica voci, sconti, voci aggiunte a mano | Adattare | Modifica basilare c'è |
| Stampa "Acquisito" + assegnazione codice MC al momento dell'accettazione | C'è | L'accettazione crea il cantiere |

### 1.6 Rapporto lavori a regia
Come lavorano oggi: blocchetto cartaceo n. 2882 (data, cantiere, descrizione opere, mano d'opera per categoria con numero e ore, materiale), quasi mai compilato bene, deve essere firmato dal cliente per essere valido.

| Requisito | Stato | Note |
|---|---|---|
| Rapporto a regia nell'app operaio: descrizione, mano d'opera per categoria, materiale | Manca | |
| Firma del cliente a schermo intero col dito (come la posta) | Manca | |
| Invio automatico ad Antonio / Stefano per il controllo, poi in fattura | Manca | |

---

## 2. Cosa aggiungere alla demo, in ordine di valore

**Stato al 6 novembre sera**: i punti 1-3 sono nella demo (v11, `extra6.js`), i punti 4-10 anche (v12, `extra7.js`). I punti 9 e 10 sono simulazioni del concetto: il preventivatore vero ha bisogno delle offerte reali degli ultimi due anni, il capitolato IA dei documenti veri. Dettagli in GUIDA-DEMO.md.

Sforzo stimato sulla demo attuale: **S** mezza giornata, **M** 1-2 giorni, **L** più di 2 giorni.

1. **Fattura fornitore riga per riga con "Assegna a"** (M). Caricamento generico, numero interno F-progressivo, righe OCR, dropdown cantiere per riga, selezione multipla, stato "da vistare" con coda per Antonio e Stefano, link dal costo alla fattura. È il processo che Ivo ha descritto con più dettaglio.
2. **Rapporto a regia con firma del cliente** (S). Nuova scheda nell'app operaio, firma a tutto schermo, invio al responsabile. Effetto immediato: oggi è il documento che non viene mai compilato.
3. **Lista materiale per cantiere con doppia spunta e stampa** (S), più la sezione "Materiali e colori" nella scheda cliente. Riproduce esattamente la foto sulla scala.
4. **Tavola di pianificazione per cantiere** (M). Colonne per cantiere con targhette operai e furgoni, colonna Agenzia, coda dei cantieri in attesa, note sul giorno. Ivo riconosce la sua lavagna.
5. **Parametri CCL per ramo e calendario aziendale** (S per i dati, M per i calcoli). Gesso e pittura con ore annue e mensili dai due calendari, giorni a 8 e 8.5 h, pranzo gessatori a scaglioni di km, soglia straordinario, trasferta prima ora. Più una pagina "Guida CCL" nell'app.
6. **Export per la Commissione paritetica** (S). Da data a data, per persona o per cantiere, PDF e CSV con le colonne richieste.
7. **Bollettini: rinvio con modifiche, veicolo privato/aziendale, agenzia** (S). Tre aggiunte piccole alla stessa schermata.
8. **GPS con finestra oraria, geofence e promemoria pausa** (S in demo). Da simulare: "GPS attivo 06:30-18:00", avviso alle 11:55 se entro 500 m dal cantiere.
9. **Preventivatore dallo storico** (L). Richiede le offerte reali degli ultimi 2 anni: senza quelle si può solo mostrare il concetto con il listino attuale. Chiedere a Ivo i PDF delle offerte.
10. **Capitolato IA da più file** (L). Upload multiplo, prompt, bozza con misure dai disegni. In demo si può simulare con il capitolato Trevano più una planimetria.

Pulizie veloci da fare comunque: codice cantiere nel formato "MC 286/26", fornitori ridotti a 2-3 pittura e 15 gessatura, colonna "Numero fornitore" separata.

---

## 3. Cosa manca per il prodotto vero (oltre la demo)

- **Backend e dati persistenti**: oggi tutto vive nel browser. Servono database, utenti, ruoli, log delle modifiche, backup. Conservazione dei bollettini per almeno 5 anni e ricerca storica.
- **OCR reale** per fatture e scontrini, con lettura della polizza QR (lo strumento che usa già Letizia va sostituito o integrato).
- **SelectLine**: contattare Luca Mennella la settimana prossima. Ipotesi di lavoro: scambio file (export creditori e cantieri, import pagamenti) prima di qualsiasi API. Da chiarire con lui il formato che SelectLine importa e i campi obbligatori (numero interno, numero fornitore, conto, centro di costo = cantiere).
- **Microsoft 365 / OneDrive**: accesso regolarizzato alla cartella cantieri per foto, planimetrie, offerte. Senza questo Stefano continua a lavorare fuori dal gestionale.
- **App operaio nativa o PWA installabile** con GPS in background limitato a una finestra oraria, geofence, notifiche push, firma del cliente, foto. Attenzione a consumo batteria e costi delle API di mappe: il geofence si calcola sul telefono, il server riceve solo gli eventi (arrivo, partenza).
- **Motore CCL** con le regole dei due contratti ticinesi, versionato per anno: calendario aziendale, straordinari, trasferte, indennità, conguagli. Base per i salari e per la CPC.
- **Preventivatore**: serve lo storico reale (offerte, capitolati, prezzi) per costruire il listino e i capitoli ricorrenti. È il pezzo con più valore e più lavoro.
- **Firma elettronica** valida per offerte e rapporti a regia.
- **Multi-lingua** per gli operai e modalità semplice per ruolo (già in VALUTAZIONE.md).

---

## 4. Da chiedere o farsi mandare da Ivo

- I due CCL ticinesi in vigore nel 2026 (pittura ASIP TI e gessatori), per confermare: massimo settimanale (44 o 44.5 h), straordinari, tempo di viaggio, tabella pranzo, conguagli.
- I calendari aziendali 2026 gesso e pittura in Excel, e il foglio "Riepilogo pasti 2026".
- 20-30 offerte e 3-4 capitolati degli ultimi due anni in PDF, con i prezzi di listino usati da Claudia e Stefano.
- Un export di SelectLine dei creditori di un mese e il formato di import che usa Letizia.
- La lista fornitori reale e la lista operai con categoria CCL e ramo.
- Esempio di modulo d'offerta ricevuto per un capitolato e i file allegati tipici (planimetrie, CAD).
- Contatto Luca Mennella per fissare la chiamata su SelectLine.

---

## 5. Nota sui CCL (verifica del 6 novembre)

Ivo ha citato 44.5 h settimanali e il 25% oltre quella soglia. Dalle fonti pubbliche risulta:
- CCL pittura, verniciatura, tappezzeria e sabbiatura **TI** (ASIP TI, Unia, OCST): in vigore dal 1° maggio 2026 al 31 marzo 2029, settimana di 5 giorni, oltre **44 h** settimanali supplemento del 25% in tempo o in denaro, forfait pranzo 200 CHF/mese. Fonte: https://gav-service.ch/gav/355009/version/5/vertrag/12320
- CCL pittura e gessatura nazionale (ASIPG, Unia, Syna): in Ticino vale solo per i pittori, i gessatori hanno il CCL cantonale separato; 40 h normali, 48 h massime, pranzo 275 CHF/mese o 23 CHF a pasto. Fonte: https://unia.ch/it/professioni-rami/pittura-e-gessatura e https://www.seco.admin.ch/dam/it/sd-web/WX-UsyoaBSKF/GAV_maler_gipser_neuer_Grundbeschluss_11_08_2026_IT.pdf
- CCL gessatori, stuccatori, montatori a secco, plafonatori e intonacatori **TI**: trovata solo la versione 2017-2025; l'edizione 2026 è elencata da OCST ma il testo va chiesto a Ivo o scaricato da https://www.ocst.ch/ccl. Fonte versione precedente: https://gav-service.ch/gav/355006/version/10/vertrag/12100

Quindi i parametri in `data.js` (2'088 h, 40 h, pranzo 275/340, 23 CHF, 15 min viaggio) vanno sostituiti con i valori per ramo che Ivo ha mostrato: 2'016/2'018 h annue, 247 giorni, pranzo gessatori per scaglione di km, soglia straordinario dal testo CCL.
