# Capomastro, gestionale MY COLOR: requisiti tecnici per la stima

Versione 1.0 · 6 novembre 2026 · destinatario: il collega che stima le ore di sviluppo

Questo documento descrive il prodotto da costruire per MY COLOR Isella & Foletti SA (impresa di pittura e gessatura, Bioggio, circa 40 operai e 5 persone in ufficio) partendo dalla demo Capomastro (https://capomastro-self.vercel.app, solo front-end, dati in memoria) e dagli appunti dell'incontro di 3 ore con il direttore Ivo Foletti (vedi REQUISITI-IVO.md).

Come usarlo: le sezioni 3 e 4 sono la lista dei moduli con requisiti e criteri di accettazione, con le colonne delle ore lasciate vuote. La sezione 10 elenca le criticità che vediamo noi: da confermare, smentire o ampliare. La sezione 11 raccoglie le domande aperte. Tutto il resto (stack, server, costi) è una proposta su cui vogliamo un parere.

---

## 1. Contesto e numeri di base

| Voce | Valore | Nota |
|---|---|---|
| Operai (app telefono) | 40 | pittori e gessatori, più apprendisti e interinali di agenzia |
| Ufficio (web app) | 5-6 | Ivo (direzione), Stefano (pittura), Antonio (gessatura), Letizia (amministrazione), Claudia (preventivi gesso) |
| Clienti con portale | 20-50 attivi | architetti, amministrazioni, privati; accesso saltuario |
| Contabile esterno / fiduciaria | 1-2 | sola lettura ed export |
| Cantieri in corso contemporanei | 25-35 | codice tipo MC 286/26 (progressivo/anno) |
| Fatture fornitori | ~100 al mese | 2-3 fornitori pittura, ~15 gessatura, più scontrini |
| Bollettini | 40 operai × ~250 giorni = ~10'000 all'anno | da conservare almeno 5 anni (Commissione paritetica) |
| Foto di cantiere | stima 3 foto/operaio/giorno × 2 MB = ~60 GB all'anno | object storage, non database |
| Offerte | storico 2 anni da ingerire per il preventivatore; stima 300-600 documenti PDF | serve per il listino di base |
| Capitolati complessi | 3-6 al mese, importi > 50'000 CHF, da evadere in 10 giorni | oggi 5-10 ore di lavoro ciascuno, obiettivo 1 ora |
| Lingue | italiano principale; operai anche portoghese, spagnolo, albanese, tedesco | interfaccia operaio multilingua |
| Sistemi esistenti | SelectLine (contabilità, Luca Mennella contatto), PUNTANET (ore, da sostituire), Microsoft 365 (Outlook, OneDrive, Teams), scanner QR per polizze | |

Carico reale: basso. Picco prevedibile tra le 16:30 e le 17:30 quando 40 operai inviano il bollettino, e al mattino per timbrature e viaggi. Nessun requisito di alta disponibilità multi-regione; serve affidabilità, backup e ripristino rapido.

---

## 2. Architettura proposta

```
Telefono operaio (iOS/Android, React Native)  ──┐
Web app ufficio (browser)                       ├──  API HTTPS (REST + eventi)  ──  PostgreSQL
Portale cliente (browser, link + PIN/e-mail)   ──┘            │                       Object storage (PDF, foto, firme)
                                                              │
                     coda lavori (OCR, IA, export, notifiche, PDF)
                                                              │
         Claude API (OCR, capitolati, preventivatore, assistente)   Microsoft Graph (Outlook, OneDrive, Teams)
         SelectLine (scambio file, poi API)   Google Maps / OSRM (distanze)   FCM + APNs (push)
```

Principi:
- Un solo backend, un solo database, una sola API consumata da tre front-end (ufficio, operaio, portale cliente).
- Tutto ciò che è lento o costoso (lettura fatture, analisi capitolati, export, PDF, e-mail) passa da una coda di lavori con retry.
- Ogni calcolo CCL è una funzione pura versionata per anno e per ramo (pittura, gessatura), testata con casi reali della fiduciaria.
- Audit log su tutto ciò che tocca ore, soldi e firme (chi, quando, prima/dopo).
- La demo attuale (vanilla JS) è una specifica navigabile, non codice da riusare: i flussi e i testi sì, il codice no.

---

## 3. Moduli e requisiti funzionali

Legenda complessità: B bassa, M media, A alta. Le colonne "Ore" sono da compilare.

### M0 · Fondamenta

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Autenticazione ufficio | SSO Microsoft Entra ID (hanno già M365), ruoli: direzione, responsabile ramo, amministrazione, contabile esterno (sola lettura) | M |
| Autenticazione operaio | accesso senza password: QR o link d'invito dall'ufficio, poi PIN a 4-6 cifre o biometria del telefono; dispositivo registrato | M |
| Autenticazione cliente | link per e-mail con codice monouso, scadenza; nessuna password | B |
| Ruoli e permessi | per ramo (pittura/gessatura) e per funzione; l'operaio vede solo i propri dati | M |
| Audit log | tabella eventi immutabile per bollettini, fatture, offerte, firme, parametri CCL | M |
| Backup e ripristino | backup giornaliero DB + storage, conservazione 30 giorni + mensili per 10 anni, prova di ripristino trimestrale | B |
| Multilingua | it/de/fr/en ufficio; operaio anche pt/es/sq; testi in file di traduzione | M |
| Parametri | tabella parametri per anno (CCL, tariffe, IVA 8.1%, soglie) modificabile dall'ufficio con storico | B |

Criteri di accettazione: un operaio nuovo entra nell'app in meno di 2 minuti con il QR ricevuto dall'ufficio; un ripristino completo da backup è documentato e provato.

### M1 · Anagrafiche

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Collaboratori | dati personali, categoria CCL, ramo, costo orario aziendale calcolato (salario + oneri + struttura), competenze, certificazioni con scadenze, permesso, veicolo assegnato, lingua | M |
| Clienti | tipo (privato, amministrazione, architetto, impresa generale, ente), contatti multipli, note, cartella OneDrive collegata, memoria colori e prodotti usati per cantiere | M |
| Fornitori | categoria di costo, condizioni di pagamento, sconto contrattuale, IBAN, numero fornitore su fattura | B |
| Cantieri | codice MC progressivo/anno, cliente, tipo lavoro, ramo, stato (offerta, acquisito, in corso, sospeso, concluso), date, squadra, furgoni, cartella OneDrive, file copertina, analisi conteggi SUVA | M |
| Veicoli | targa, tipo, costo al km, assegnazione, scadenze | B |
| Import PUNTANET | import CSV/Excel dei cantieri e delle ore storiche con mappatura campi | M |

### M2 · CRM e richieste

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Registrazione richiesta | da e-mail info@ (lettura Outlook via Graph), telefono (nota vocale trascritta), modulo portale | M |
| Smistamento | regola: gesso/cartongesso ad Antonio, pittura a Stefano o Ivo; Letizia inoltra con un clic; notifica | B |
| Attività | chiamate, sopralluoghi, promemoria, scadenze, collegate a cliente/cantiere; calendario Outlook sincronizzato | M |
| Sopralluogo | checklist (laser, metro, planimetrie, piani, foto prima), caricamento foto in OneDrive nella cartella del cantiere | M |

### M3 · Offerte e preventivatore

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Listino storico | ingestione di 2 anni di offerte PDF: estrazione voci, unità (ac, mq, ml, ore, %), prezzi, capitoli; costruzione di un listino con prezzo medio, min, max, ultima data, per ramo | A |
| Builder offerta | capitoli e posizioni (Pos, descrizione, unità, quantità, prezzo, totale), capitoli fissi sempre proposti (impianto cantiere, protezioni, smaltimento e tassa ecologica, ponteggio con rinvio a preventivo esterno), sconti, voci manuali, varianti (A, B), opzionali | A |
| Generazione assistita | da descrizione testuale o vocale + foto/planimetrie: proposta di posizioni e quantità dal listino storico; sempre rivista a mano prima dell'invio | A |
| Documento | PDF con layout MY COLOR identico all'attuale preventivo (intestazione, Rif., No. IVA, tabella), numerazione 2026/0364 A | M |
| Firma e accettazione | invio per e-mail, firma elettronica semplice del cliente su pagina web, tracciamento aperture, accettazione crea il cantiere con codice MC e stampa "Acquisito" | M |
| Acconti | piano acconti per offerta (30/40/30 ecc.), fatture generate dal piano | M |
| Due flussi | offerta semplice (sopralluogo) e capitolato complesso (M4) con ingresso diverso ma stesso builder | B |

Criteri di accettazione: Stefano apre una nuova offerta pittura esterni, sceglie "da sopralluogo", detta la descrizione, carica 3 foto e una planimetria, ottiene una bozza con i capitoli fissi e le posizioni del listino storico, la corregge e la invia in meno di 20 minuti.

### M4 · Capitolati con IA

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Caricamento | più file in una volta: PDF capitolato, modulo d'offerta da compilare, piani esecutivi, planimetrie, render, DWG/DXF, immagini; categorizzazione automatica | M |
| Analisi | riassunto, elenco posizioni richieste (CPN/NPK), domande aperte, scadenze, condizioni (ponteggi, penali, pagamenti) con riferimento alla pagina | A |
| Misure | lettura di superfici e lunghezze da planimetrie quotate (PDF/immagine); DWG in una seconda fase tramite conversione a PDF/SVG | A |
| Bozza offerta | posizioni con quantità stimate e prezzi dal listino storico, compilazione del modulo d'offerta del committente quando fornito | A |
| Chat sul capitolato | domande in linguaggio naturale con citazione di pagina | M |
| Tempi | obiettivo: da 5-10 ore a circa 1 ora di lavoro umano per capitolato; scadenza 10 giorni gestita come attività | |

### M5 · Cantieri

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Scheda cantiere | redditività (maturato, costi ore, fatture fornitori per quota, prelievi magazzino, margine, CHF/ora contro break-even), squadra, bollettini, documenti, e-mail, calendario, chat | A |
| Documenti | cartella OneDrive del cantiere integrata (lettura/scrittura via Graph), file copertina, verbali, foto prima/dopo con promemoria "foto prima" il primo giorno | M |
| Lista materiale | lista per cantiere preparata da Stefano/Antonio, pezzi/quantità, doppia spunta (preparato, caricato), stampa, kit standard per tipo di lavoro, spunta dal telefono quando si carica il furgone | M |
| Memoria colori | per ogni cantiere: prodotto, colore (NCS/RAL/campione), tipo (dispersione, lavabile, smalto…), dove; visibile nella scheda cliente per ritocchi e cantieri ripetuti | B |
| Variazioni | lavori extra approvati dal cliente (dal portale o firma in cantiere), entrano nel contratto | M |
| Fasi e budget | fasi con ore previste, avanzamento %, proiezione margine a fine lavori | M |

### M6 · Pianificazione (la lavagna)

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Tavola per cantiere | colonne per cantiere con targhette operai trascinabili, furgoni numerati, colonna agenzia, stagiaire, coda dei cantieri acquisiti non ancora pianificati, note sul giorno ("riservato Masoni") | A |
| Vista per persona e per settimana | giornata divisa su più cantieri, copia settimana, assenze e vacanze bloccano la cella | M |
| Notifica | invio della pianificazione agli operai (push + messaggio), bollettino precompilato dal piano | B |
| Competenze | avviso se la squadra non ha le competenze richieste (ponteggi, intumescenti) | B |

### M7 · App operaio (iOS e Android)

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Oggi | cantiere del giorno dal piano, viaggio (partenza/arrivo), timbratura entrata/uscita con posizione, riepilogo settimana, indennità pranzo | M |
| GPS | attivo solo in una finestra oraria configurabile (es. 06:00-18:30), geofence di 500 m attorno al cantiere, eventi arrivo/partenza; nessun tracciamento continuo; promemoria pausa alle 11:55 se dentro il geofence; informativa e consenso dell'operaio | A |
| Viaggi | veicolo privato o aziendale (quale furgone), km, rientro, rimborso CCL; chi usa quale veicolo visibile in ufficio | M |
| Bollettino | precompilato dal piano e dalla timbratura, ore, viaggio, attività, materiale usato/mancante, note, foto, dettatura vocale (riconoscimento vocale del telefono), invio al responsabile del ramo; stati: bozza, inviato, approvato, rinviato con modifiche | A |
| Rapporto lavori a regia | descrizione opere, mano d'opera per categoria (numero × ore), materiale, firma del cliente a tutto schermo col dito, invio a Stefano/Antonio, PDF uguale al blocchetto cartaceo | M |
| Lista materiale | spunta "caricato" dal furgone | B |
| Messaggi | chat di cantiere e diretta con l'ufficio, push | M |
| Assenze | richiesta vacanze, segnalazione malattia con foto certificato | B |
| Profilo | saldi ore, vacanze, documenti personali in scadenza, lingua | B |
| Offline | timbrature, bollettini e foto salvati sul telefono se manca rete (cantine, sotterranei) e sincronizzati dopo | A |
| Assistente vocale | "ho fatto 8 ore a Villa Bernasconi, mezz'ora di viaggio": compila il bollettino; domande semplici (saldo vacanze) | M |

Criteri di accettazione: un operaio con telefono Android di 4 anni e poca dimestichezza compila e invia il bollettino in meno di 60 secondi nel caso normale; il rapporto a regia firmato dal cliente arriva in ufficio come PDF entro un minuto.

### M8 · Bollettini, ore e CCL

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Coda di approvazione | per responsabile di ramo, anomalie (GPS lontano, oltre 10 h, fuori finestra), approvazione singola e multipla, "rinvia con modifiche per conoscenza" con notifica all'operaio | M |
| Calendario aziendale | per ramo e per anno: ore giornaliere per mese (8 o 8.5), festivi, totale annuo (2'016 pittura, 2'018 gesso nel 2026), con/senza flessibilità | M |
| Regole CCL | straordinari (25% oltre la soglia settimanale: 44 h o 44.5 h, da confermare sul testo), sabato, notte, tempo di viaggio (prima parte a carico dell'operaio), indennità pranzo gessatori a scaglioni di km (0-30: 15, 31-40: 20, 41-60: 27, oltre 60: 37 CHF), indennità pittori, km auto privata, 13ª, vacanze per età; motore versionato per anno | A |
| Conguaglio | mensile per i gessatori, periodico per i pittori; saldi ore, recuperi, vacanze; export per SelectLine Lohn | A |
| Export Commissione paritetica | da data a data, per persona o cantiere: nome, luogo, ore, orario, km, indennità pranzo; PDF e CSV | M |
| Archivio | ricerca su tutti i bollettini degli ultimi 5 anni (poi 10), per persona, cantiere, periodo; immodificabili dopo l'approvazione, correzioni come nuove versioni | M |
| Agenzie interinali | bollettino di tipo "agenzia" (doppia copia, firmato), registrazione manuale con upload della scansione, costo su cantiere | B |
| Guida CCL | pagina di consultazione con le regole dei due CCL ticinesi in vigore, aggiornabile dall'ufficio | B |

### M9 · Fatture fornitori

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Acquisizione | PDF da e-mail (casella dedicata letta via Graph), upload, foto da telefono (scontrini), scansione del codice QR della polizza (standard Swiss QR-bill) | M |
| Lettura automatica | fornitore, numero fattura fornitore, date, IVA, righe con articolo, quantità, prezzo unitario, riferimento cantiere nel testo; confidenza per campo; sempre conferma umana | A |
| Numerazione interna | progressiva cronologica (F1014, F1015…), separata dal numero del fornitore, allineata con SelectLine | B |
| Visto | stato "da vistare" per ramo (Antonio gesso, Stefano pittura), controllo prezzi e sconti contrattuali, segnalazione errori al fornitore via e-mail | M |
| Assegnazione per riga | ogni riga a un cantiere (dropdown senza i cantieri conclusi da più di 3 mesi), selezione multipla righe con "assegna a", quota per cantiere, righe non assegnate in evidenza | M |
| Tracciabilità | dal costo nel cantiere link alla fattura originale (PDF) e alle righe | B |
| Pagamenti | scadenze, stato pagato (da SelectLine), 30/40/30 e saldo fino a 5'000 CHF post-lavoro per i clienti | B |

### M10 · Fatturazione clienti

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Fatture da offerta | acconti dal piano, avanzamento, finale, regia (dai rapporti firmati), variazioni | M |
| QR-fattura | PDF con sezione pagamento QR conforme (SIX, IBAN/QR-IBAN, riferimento), numerazione | M |
| Solleciti | automatici a 3 livelli con parametri, promemoria "da fatturare" quando l'avanzamento supera il fatturato | B |
| Portale cliente | offerte da firmare, fatture, documenti, foto, variazioni da approvare, upload file (verbali), notifiche | M |

### M11 · Contabilità e SelectLine

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Fase 1: scambio file | export creditori (fatture fornitori vistate, con conto per categoria, centro di costo = cantiere, numero interno), export debitori (fatture clienti), export salari/ore per SelectLine Lohn; import pagamenti e anagrafiche; formato da concordare con Luca Mennella | M |
| Fase 2: API | SelectLine API (SL.mobile / Toolbox) se disponibile sul mandante; sincronizzazione notturna e manuale, log e riconciliazione | A |
| Mapping conti | piano dei conti PMI, modificabile | B |
| Costi struttura | costi non di cantiere (IT, software, affitto) spalmati come 20 CHF/h sul costo orario, parametro | B |

### M12 · Magazzino e ordini

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Articoli | materiale e attrezzatura, scorte minime, ubicazione, valore | B |
| Movimenti | carichi da ordini, scarichi su cantiere (anche da telefono con scansione codice), costo sul cantiere | M |
| Ordini | ordine a fornitore per e-mail, consegna, aggancio alla fattura | M |

### M13 · Assistente IA

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Ufficio | chat che risponde sui dati del gestionale (margini, scadenze, chi lavora dove) e crea attività, e-mail, offerte; con permessi dell'utente | A |
| Operaio | vocale per bollettino, viaggio, assenze; risposte in lingua dell'operaio | M |
| Costi | controllo del consumo per utente e per funzione, limite mensile | B |

### M14 · Notifiche, messaggi e integrazioni Microsoft 365

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Push | iOS/Android per pianificazione, approvazioni, messaggi, promemoria; centro notifiche web | M |
| E-mail | invio dalle caselle M365 degli utenti via Graph (offerte, fatture, solleciti, ordini), associazione automatica delle e-mail in arrivo a cliente/cantiere | M |
| Calendario | eventi Outlook condivisi, Teams per riunioni | M |
| OneDrive/SharePoint | cartelle cliente e cantiere, upload e lettura, struttura esistente rispettata | M |

### M15 · Reporting e direzione

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Cruscotto | margine per cantiere, CHF/ora, ore vendibili, fatturato e costi mensili, incassi, scadenze, approvazioni in attesa | M |
| Storico | confronto per mese e per anno, export Excel | B |

### M16 · Messa in produzione

| Requisito | Dettaglio | Compl. |
|---|---|---|
| Ambienti | sviluppo, staging, produzione; CI/CD; migrazioni DB | M |
| Store | pubblicazione App Store e Google Play, aggiornamenti over-the-air per la parte JavaScript | M |
| Migrazione dati | anagrafiche, cantieri aperti, storico ore da PUNTANET, listino da offerte | M |
| Formazione | 20 minuti per operaio (con referente per lingua), 2 ore per l'ufficio, guide brevi con video | |
| Pilota | 2 settimane con una squadra per ramo prima del passaggio di tutti | |

---

## 4. Tabella di stima (da compilare)

| Modulo | Compl. | Ore analisi | Ore sviluppo | Ore test e correzioni | Note del collega |
|---|---|---|---|---|---|
| M0 Fondamenta | M | | | | |
| M1 Anagrafiche | M | | | | |
| M2 CRM e richieste | M | | | | |
| M3 Offerte e preventivatore | A | | | | |
| M4 Capitolati con IA | A | | | | |
| M5 Cantieri | A | | | | |
| M6 Pianificazione | A | | | | |
| M7 App operaio | A | | | | |
| M8 Bollettini e CCL | A | | | | |
| M9 Fatture fornitori | A | | | | |
| M10 Fatturazione clienti | M | | | | |
| M11 Contabilità e SelectLine | M/A | | | | |
| M12 Magazzino | M | | | | |
| M13 Assistente IA | A | | | | |
| M14 Notifiche e M365 | M | | | | |
| M15 Reporting | M | | | | |
| M16 Messa in produzione | M | | | | |
| Gestione progetto, riunioni con MY COLOR | | | | | |
| Riserva per imprevisti (consigliato 20-25%) | | | | | |

Proposta di fasi (da discutere):
- Fase 1, il cuore: M0, M1, M7 (senza offline e regia), M8 (approvazioni, calendario, regole base, export CPC), M9, M11 fase 1, M14 push. Sostituisce PUNTANET e la carta.
- Fase 2, il commerciale: M3, M4, M5 completo, M6, M7 regia e lista materiale, M10.
- Fase 3, il resto: M12, M13, M15, portale cliente completo, offline, M11 API.

---

## 5. Stack tecnologico proposto

| Livello | Proposta | Perché | Alternativa |
|---|---|---|---|
| Backend | Node.js 22 + TypeScript, NestJS (o Fastify), Prisma | un linguaggio per web, app e server; tipizzazione condivisa; grande disponibilità di librerie (QR-bill, PDF, Graph) | Python + FastAPI se il collega preferisce per la parte IA |
| Database | PostgreSQL 16 | affidabile, JSONB per dati flessibili, estensioni geografiche (PostGIS) per i geofence | |
| Coda e cache | Redis + BullMQ | lavori asincroni (OCR, IA, PDF, e-mail, export) con retry e priorità | |
| Object storage | S3 compatibile (Infomaniak Swiss Backup/Public Cloud, Exoscale SOS) | PDF, foto, firme, export; versioning e lifecycle | |
| Web app ufficio | React 19 + TypeScript (Vite) o Next.js; componenti shadcn/ui; TanStack Query e Table | produttività, tabelle complesse, stampa | |
| App operaio | React Native con Expo (SDK 52+): expo-location, expo-notifications, expo-camera, firma su canvas, SQLite locale per offline, EAS Build/Update | una base di codice per iOS e Android, aggiornamenti JavaScript senza passare dagli store, il collega ha già la licenza Apple | PWA: niente store e meno attrito, ma su iOS niente geofence in background né push affidabili: sconsigliata per il GPS |
| Portale cliente | pagine della web app con layout ridotto | | |
| PDF | Puppeteer/Chromium headless da template HTML; libreria swissqrbill per la QR-fattura | stesso rendering della web app | |
| IA | Claude API (Anthropic): Opus 5.5 per capitolati e preventivatore, Sonnet 5.5 per lettura fatture e offerte storiche, Haiku 5.5 per assistente e intenti vocali; input PDF nativo; Batch API per l'ingestione dello storico | qualità sulla lettura di documenti e tabelle; un solo fornitore | stessi modelli via Vertex AI o Bedrock se serve una regione europea |
| Voce | riconoscimento vocale del sistema operativo (iOS/Android), gratis e in lingua | zero costi, funziona offline su iOS recenti | Whisper/Deepgram (~0.006 USD/min) per qualità in ambienti rumorosi |
| Mappe e distanze | Google Maps Platform: Geocoding (indirizzi cantiere, una volta) e Route Matrix/Distance Matrix (km casa-cantiere); geofence calcolato sul telefono | volumi entro le quote gratuite | OSRM self-hosted con dati OpenStreetMap: gratis, nessun limite, più lavoro di gestione |
| Push | Firebase Cloud Messaging + APNs (tramite Expo Push) | gratuiti | |
| E-mail transazionale | Microsoft Graph dalle caselle M365 esistenti; Brevo/Postmark come riserva per notifiche di sistema | le e-mail partono dall'indirizzo vero di chi scrive | |
| Integrazione M365 | Microsoft Graph API con app registrata nel tenant mycolorgroup.ch (consenso dell'amministratore) | Outlook, calendario, OneDrive/SharePoint, Teams | |
| SelectLine | fase 1 scambio file (CSV/XML nel formato di import di SelectLine), fase 2 API | da chiarire con Luca Mennella | |
| Monitoraggio | Sentry (errori web/app/server), Uptime Kuma o Better Stack, log centralizzati | | |
| CI/CD | GitHub Actions; EAS Build per le app; migrazioni Prisma | | |

---

## 6. Server e dimensionamento

Utenti: ~50 interni più clienti saltuari. Richieste di picco stimate: 40 operai × (timbratura + bollettino + 3 foto) in un'ora = qualche centinaio di richieste all'ora, più i lavori in coda. È un carico piccolo: il dimensionamento è guidato da affidabilità, backup e dalla residenza dei dati in Svizzera, non dalla potenza.

| Ambiente | Risorse | Note |
|---|---|---|
| Produzione, applicazione | 1 VM 4 vCPU, 8 GB RAM, 80 GB NVMe | API, coda, worker, Chromium per i PDF; Docker Compose o un piccolo Kubernetes gestito se preferito |
| Produzione, database | PostgreSQL gestito 2 vCPU, 4-8 GB, 50 GB, backup automatici | oppure sulla stessa VM con backup su storage esterno (più economico, meno comodo) |
| Object storage | 200 GB il primo anno, +100 GB all'anno | foto, PDF, firme, export; lifecycle verso archivio freddo dopo 2 anni |
| Staging | 1 VM 2 vCPU, 4 GB | copia anonimizzata dei dati |
| Backup off-site | storage in un secondo datacenter | giornaliero, test di ripristino trimestrale |

Hosting proposto, in ordine di preferenza:
1. Infomaniak Public Cloud / VPS (Ginevra): dati in Svizzera, prezzi bassi (VPS 4 vCPU/8 GB intorno a 20 EUR/mese, Public Cloud a consumo), storage S3 compatibile, buona reputazione in Ticino presso i clienti.
2. Exoscale (Svizzera): Kubernetes e database gestiti, un po' più caro.
3. Hetzner (Germania): il più economico, ma dati fuori dalla Svizzera (accettabile sotto nLPD con le garanzie dell'UE, ma meno facile da spiegare a Ivo).

Stima costi di esercizio mensili (CHF, da verificare sui listini attuali):

| Voce | Stima mensile | Nota |
|---|---|---|
| VM produzione + staging | 40-80 | |
| PostgreSQL gestito | 0-60 | 0 se sulla stessa VM |
| Object storage 200-500 GB + backup off-site | 10-30 | |
| Dominio, certificati, DNS | 2-5 | Let's Encrypt gratuito |
| Monitoraggio (Sentry team, uptime) | 0-30 | piani gratuiti sufficienti all'inizio |
| IA (Claude API), vedi sezione 7 | 60-200 | dipende dall'uso dell'assistente |
| Google Maps | 0-20 | entro le quote gratuite ai volumi previsti |
| Push, e-mail via Graph | 0 | |
| EAS Build/Update (Expo) | 0-100 | piano gratuito con build limitate; a pagamento se si fanno molte build; alternativa: build locali con Xcode/Android Studio |
| Apple Developer Program | ~8 (99 USD/anno) | il collega ha già la licenza: vedi sezione 8 su chi deve esserne titolare |
| Google Play Console | una tantum 25 USD | |
| Totale esercizio | circa 150-450 CHF/mese | esclusi sviluppo, supporto e canone |

---

## 7. Costi delle API di IA e delle altre tecnologie

Prezzi Anthropic (novembre 2026, per milione di token): Opus 5.5 4 USD input / 20 USD output; Sonnet 5.5 2 / 10; Haiku 5.5 0.10 / 0.50; Batch API al 50%. Un PDF pesa circa 1'500-3'000 token per pagina.

| Uso | Volume mensile | Modello | Stima mensile |
|---|---|---|---|
| Lettura fatture fornitori e scontrini | 100-150 documenti × ~6'000 token in, 1'000 out | Sonnet 5.5 | 2-4 USD |
| Capitolati complessi | 5 × (150'000 in + 30'000 out) con 2-3 iterazioni | Opus 5.5 | 20-40 USD |
| Preventivatore (bozze offerte) | 40 × (30'000 in + 5'000 out) | Opus 5.5 | 8-15 USD |
| Assistente ufficio | 6 utenti × 30 domande/giorno × 22 giorni, ~10'000 token in con contesto, 400 out | Haiku 5.5 (Sonnet per le domande complesse) | 10-80 USD |
| Vocale operai (interpretazione testo) | 40 × 1.5/giorno × 22 = ~1'300 richieste × 2'000 token | Haiku 5.5 | < 1 USD |
| Associazione e-mail, classificazioni | 2'000 e-mail × 2'000 token | Haiku 5.5 | < 1 USD |
| Una tantum: ingestione storico offerte | 500 PDF × 30'000 token | Sonnet 5.5 in Batch | 15-30 USD una volta |
| Totale IA | | | circa 50-150 USD/mese, con un tetto configurabile |

Altre tecnologie:
- Google Maps Platform: Geocoding circa 10'000 richieste gratuite al mese poi ~5 USD ogni 1'000; matrice distanze con quota gratuita simile per prodotto e poi ~5 USD ogni 1'000 elementi (prezzi 2025-2026 da fonti terze, da verificare sul listino Google). Ai nostri volumi (poche centinaia di geocodifiche, 2'000-4'000 distanze al mese) il costo atteso è zero o quasi. Il geofence si calcola sul telefono e non costa nulla.
- Push: FCM e APNs gratuiti; Expo Push gratuito.
- Riconoscimento vocale: gratuito se si usa quello del telefono; 0.006 USD/minuto circa con un servizio cloud.
- SMS (codici di accesso, solo se serve): 0.05-0.10 CHF a messaggio.
- QR-fattura: libreria open source, nessun costo; serve il QR-IBAN della banca di MY COLOR.
- SelectLine: eventuale modulo API/licenza aggiuntiva da chiedere a Luca Mennella (costo sconosciuto).
- Microsoft Graph: incluso nelle licenze M365 esistenti.

---

## 8. Pubblicazione delle app e implicazioni

Store e account:
- Apple: 99 USD/anno (Apple Developer Program). Il collega ha già la licenza. Punto da decidere: l'app va pubblicata sotto un account intestato alla nostra società (il fornitore) o a MY COLOR? Consigliamo un account aziendale del fornitore (serve il numero D-U-N-S, gratuito) con MY COLOR come cliente; così gli aggiornamenti non dipendono da una persona fisica. Un account personale esistente non è trasferibile a un'azienda senza passaggi con Apple.
- Google: 25 USD una tantum per la Play Console (dal 2023 richiede verifica dell'identità e, per i nuovi account personali, un test chiuso con 12 tester per 14 giorni prima della produzione; un account organizzazione evita il test).
- Distribuzione: l'app è privata ma la via più semplice è la pubblicazione pubblica sugli store con accesso solo su invito. Alternative: Apple Business Manager "custom apps" (MY COLOR deve iscriversi, gratuito) e Google Play "managed" (richiede Google Workspace in azienda, che non hanno). TestFlight va bene per il pilota (scadenza build 90 giorni), non per l'esercizio.
- Revisione Apple: 1-3 giorni per ogni versione; la posizione in background e le notifiche richiedono testi di giustificazione chiari, una privacy policy pubblicata e la dimostrazione del beneficio per l'utente, altrimenti rifiuto. Gli aggiornamenti della sola parte JavaScript passano con EAS Update senza revisione; i cambi nativi (nuovi permessi, librerie) no.
- Telefoni: capire se gli operai usano telefoni personali (BYOD) o aziendali; versioni minime iOS 16 e Android 10; politica per chi non ha o non vuole lo smartphone (timbratura dal capo squadra o da un tablet di cantiere).

---

## 9. Supporto e ruolo del collega

Oltre allo sviluppo, il collega sarà talvolta il punto di appoggio tecnico, soprattutto nel primo periodo. Proposta da discutere:

| Aspetto | Proposta |
|---|---|
| Livelli | L1 ufficio MY COLOR (Letizia e i responsabili di ramo: password, come si fa, errori di inserimento); L2 collega (bug, dati, integrazioni, store); L3 fornitori esterni (SelectLine, Microsoft, Anthropic) |
| Canale | un solo indirizzo e-mail di supporto con ticket (anche semplice casella condivisa), più un gruppo Teams o WhatsApp Business per le urgenze; nessun contatto diretto degli operai con il collega se non tramite l'ufficio |
| Orari | giorni lavorativi 7:00-17:30 (gli operai partono presto); fuori orario solo per blocchi totali |
| Tempi di risposta | blocco totale (nessuno timbra, app giù): presa in carico entro 2 ore; bug che impedisce una funzione: 1 giorno lavorativo; richieste e migliorie: raccolte e pianificate ogni 2 settimane |
| Carico stimato | primi 2 mesi dopo il go-live: 15-25 ore al mese; a regime: 4-8 ore al mese, più i rilasci |
| Strumenti | pagina di stato, log degli errori con alert, accesso in sola lettura ai dati per diagnosi, procedura per reset accesso operaio, guide brevi e video per ufficio e operai, FAQ aggiornate dai ticket |
| Comunicazione con clienti finali di MY COLOR | solo per problemi del portale (accesso, firma, download); mai sul merito dei lavori; con risposta in italiano, tedesco, inglese |
| Comunicazione con gli operai | tramite l'ufficio; eccezione: sessione di formazione iniziale e pilota, dove il collega è presente |
| Continuità | documentazione del sistema, credenziali in un password manager condiviso, almeno una seconda persona che sa fare deploy e ripristino (bus factor) |

---

## 10. Criticità proposte (da confermare, smentire o ampliare)

| # | Criticità | Impatto | Proposta | Confermata | Note del collega |
|---|---|---|---|---|---|
| 1 | GPS in background: permessi iOS/Android, batteria, rifiuti in revisione Apple, sorveglianza dei lavoratori (art. 26 OLL 3: vietato il controllo del comportamento, ammesso per sicurezza e prestazioni se proporzionato) | alto | geofence a eventi (arrivo/partenza) in finestra oraria, niente tracciato continuo, informativa firmata dagli operai, dati conservati il minimo | | |
| 2 | SelectLine senza API pubblica documentata; dipendenza dal consulente | alto | partire dallo scambio file; chiamare Luca Mennella la settimana prossima; chiedere formato import, campi obbligatori, licenza API | | |
| 3 | Lettura automatica fatture: scansioni di bassa qualità, fatture multi-pagina, layout di 15+ fornitori, righe con sconti e resi | medio | conferma umana sempre; confidenza per campo; apprendimento per fornitore (mappatura salvata); QR-bill per importo e riferimento sicuri | | |
| 4 | Preventivatore: dipende dalla quantità e qualità delle offerte storiche; prezzi che cambiano; responsabilità dell'offerta | alto | ingestione guidata con revisione del listino da parte di Stefano/Antonio; prezzi con data; sempre revisione umana; nessun invio automatico | | |
| 5 | Capitolati: file grandi (100+ pagine, DWG, 3D), misure dai disegni | alto | fase 1 solo PDF e immagini; DWG convertiti a PDF; misure proposte con incertezza e verifica umana; chunking e riassunti per restare nel contesto | | |
| 6 | Connettività in cantiere (cantine, sotterranei, Malcantone) | medio | app offline-first (SQLite + coda di sync); vale solo per timbrature, bollettini, foto | | |
| 7 | Alfabetizzazione digitale e lingue degli operai | alto | interfaccia a pochi tasti, vocale, multilingua, referente per lingua, pilota con una squadra per ramo, modalità "capo squadra compila per la squadra" | | |
| 8 | Valore legale della firma del cliente sui rapporti a regia (firma elettronica semplice, non qualificata) | medio | immagine firma + nome + data/ora + posizione + hash del documento + e-mail di conferma al cliente; per contratti grandi resta la firma su carta o una firma qualificata | | |
| 9 | Protezione dei dati (nLPD 2023): dati personali degli operai (posizione, salari, salute), dati clienti; hosting; fornitori esteri di IA | alto | hosting in Svizzera; contratto di trattamento dati con ogni fornitore; minimizzazione (nessun dato sanitario nell'app, solo "malattia sì/no" e certificato in allegato); registro dei trattamenti; cancellazione programmata | | |
| 10 | Motore CCL: due contratti, soglie da confermare (44 o 44.5 h), cambi annuali, calendario aziendale; un errore si riflette sulle paghe | alto | regole versionate e testate contro casi reali forniti dalla fiduciaria; conguagli sempre validati da Letizia prima dell'export | | |
| 11 | Microsoft 365: consenso dell'amministratore del tenant, permessi Graph ampi (posta, file), struttura cartelle OneDrive esistente da rispettare | medio | app registrata con permessi minimi e per utente dove possibile; mappatura cartelle concordata | | |
| 12 | Migrazione da PUNTANET: qualità dell'export, storico ore da 5 anni da conservare | medio | import con report delle anomalie; storico conservato in archivio consultabile anche se non ricalcolato | | |
| 13 | Account store: proprietà dell'account Apple/Google, revisione Apple sugli aggiornamenti urgenti | medio | account aziendale del fornitore; hotfix JavaScript via EAS Update; piano B TestFlight | | |
| 14 | Un solo sviluppatore: continuità, ferie, malattia | alto | documentazione, CI/CD riproducibile, seconda persona formata sul deploy | | |
| 15 | Sicurezza: portale clienti esposto su internet, dati sensibili, accessi degli operai da telefoni personali | medio | 2FA per l'ufficio, link monouso per i clienti, rate limiting, test di sicurezza prima del go-live, aggiornamenti mensili | | |
| 16 | Costi IA variabili e limiti di velocità delle API | basso | tetto mensile per funzione, cache dei prompt, Batch per lo storico, modelli piccoli dove bastano | | |
| 17 | Affidabilità delle notifiche (promemoria pausa 11:55, pianificazione) su iOS in background | basso | promemoria calcolati sul telefono (notifiche locali), push solo come complemento | | |
| 18 | PDF conformi: QR-fattura secondo SIX, offerte con layout esistente, rapporti a regia | medio | libreria dedicata + test con la banca; template HTML approvati da Letizia | | |
| 19 | Agenzie interinali: bollettini cartacei a colori, doppia copia, firme | basso | tipo bollettino "agenzia" con scansione allegata; nessuna automazione | | |
| 20 | Dipendenza da terzi per la demo attuale (Vercel) e passaggio al prodotto reale | basso | il prodotto nasce su infrastruttura propria; la demo resta come specifica | | |

---

## 11. Domande aperte per il collega

1. Stack: condividi Node/TypeScript + React Native, o preferisci un'altra base (es. Flutter per l'app, Python per il backend)? Motiva, perché incide sulla stima.
2. Offline-first per l'app operaio: la metteresti in Fase 1 o la rimanderesti? Quante ore in più?
3. Hosting: Infomaniak, Exoscale o altro? Hai esperienza con uno di questi?
4. SelectLine: hai già lavorato con i suoi formati di import o con l'API? Partecipi alla chiamata con Luca Mennella?
5. Store: pubblichiamo con il tuo account o ne apriamo uno aziendale? Hai un numero D-U-N-S?
6. IA: va bene Claude API in chiamata diretta o preferisci passare da Vertex AI/Bedrock per la regione europea?
7. Supporto: quante ore al mese ritieni sostenibili e con quali orari?
8. Quali delle 20 criticità confermi, quali smentisci, quali aggiungi?
9. Fasi: la divisione in 3 fasi ti sembra giusta? Cosa sposteresti?
10. Quanto tempo di calendario stimi per la Fase 1 lavorando da solo, e con una seconda persona?

---

## 12. Da chiedere a MY COLOR prima di iniziare

- I due CCL ticinesi 2026 (pittura, gessatura) in PDF, i calendari aziendali 2026 in Excel, il foglio "Riepilogo pasti".
- 20-30 offerte e 3-4 capitolati degli ultimi due anni con i prezzi usati; esempio di modulo d'offerta ricevuto per un capitolato con gli allegati tipici.
- Export SelectLine dei creditori di un mese e il formato di import usato da Letizia; piano dei conti.
- Export PUNTANET completo (cantieri, ore, operai).
- Lista fornitori reale, lista operai con categoria CCL, ramo, lingua, telefono (personale o aziendale).
- Contatto dell'amministratore del tenant Microsoft 365 e struttura attuale delle cartelle OneDrive.
- QR-IBAN e coordinate bancarie per la QR-fattura.
- Chi firma l'informativa GPS per gli operai e chi è il referente per la protezione dei dati.
