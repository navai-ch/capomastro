# Capomastro – valutazione del gestionale e proposte di miglioramento

Stato: versione 7 della demo (3 novembre 2026). Valutazione fatta modulo per modulo guardando cosa serve a un'impresa di pittura e gessatura da 40 persone e cosa si aspetta chi la dirige guardando i margini.

## Cosa funziona già bene

- **Il filo conduttore del margine**: ogni cantiere ha contratto, maturato, costi per categoria e CHF/ora, e la dashboard lo mette davanti agli occhi. È l'argomento di vendita principale e regge.
- **La catena commerciale è completa**: richiesta → sopralluogo → offerta (anche con IA dal listino) → firma digitale → cantiere → acconti → fattura → sollecito. Pochi gestionali per artigiani la chiudono tutta.
- **L'app operaio è davvero semplice**: timbratura GPS, viaggio, bollettino a voce, assistente IA che registra tutto dopo conferma. È ciò che fa la differenza nell'adozione in cantiere.
- **Inbox, calendario e account collegati** tolgono il "doppio lavoro" tra Outlook e gestionale.
- **Tutto è cliccabile** (persone, clienti, fornitori, cantieri, offerte, fatture) e i KPI hanno un'analisi mese per mese con trend.

## Lacune e proposte, per area

### 1. Cantieri e margini
- **Manca il preventivo di costo a inizio cantiere** (ore previste per fase, materiale previsto): oggi si confronta il costo con il maturato, non con il budget. Proposta: budget per fase (preparazione, fondi, finitura…) e scostamento "a finire" con previsione del margine finale, non solo del margine a oggi.
- **Variazioni in corso d'opera**: esistono come attività e-mail ma non come oggetto con importo, stato (proposta/approvata/rifiutata) e impatto sul contratto. Proposta: modulo variazioni con approvazione del cliente dal link di firma.
- **Diario di cantiere e foto**: i bollettini hanno foto, ma non c'è una timeline per cantiere (foto, note, consegne, visite). Utile per contestazioni e per il collaudo.
- **Subappaltatori e terzi** (Decorsub ecc.): oggi sono fatture fornitore; servono contratti, ore e SAL dei terzi per il margine corretto.

### 2. Offerte
- **Listino con prezzi per cliente/tipologia** (privato, amministrazione immobiliare, impresa generale) e sconti quadro per cliente.
- **Versioni dell'offerta** (v1, v2 dopo trattativa) con confronto e motivo delle modifiche; oggi si sovrascrive.
- **Apprendimento vero dallo storico**: la demo usa un listino con medie; in produzione ogni offerta accettata o persa deve aggiornare i prezzi medi per zona e tipologia e il tasso di chiusura per fascia di prezzo.
- **Sopralluogo guidato dal telefono**: foto per locale, misure (anche da planimetria con IA), check-list fondi e accessi, che generano direttamente le posizioni.

### 3. Fatturazione e incassi
- **QR-fattura reale e riconciliazione camt.054**: oggi i pagamenti si segnano a mano. Con il file della banca le fatture si chiudono da sole e i solleciti partono solo su ciò che è davvero scoperto.
- **Fatture a misura con SAL**: per le offerte a stima manca il computo delle quantità eseguite firmato dal capo e dal cliente prima di fatturare.
- **Note di credito, acconti ricevuti prima della fattura, IVA al momento del pagamento**: casi reali che oggi non esistono.
- **Trasmissione contabile**: i batch SelectLine sono simulati; serve la mappatura dei conti e il registro di ciò che è stato trasmesso.

### 4. Bollettini, ore, paghe
- **Regole CCL applicate in automatico**: straordinari (+25%), sabato, notte, festivi, viaggio non pagato 15 min, pause. Oggi il conguaglio è una stima.
- **Approvazione a due livelli** (capo squadra → ufficio) e correzioni tracciate: chi ha cambiato cosa e perché.
- **Mese chiuso**: dopo il 5 del mese i bollettini vanno bloccati e la chiusura esportata a SelectLine Lohn.
- **Assenze con saldi**: vacanze, ore di recupero, malattia con certificato dopo 3 giorni, con saldo visibile al collaboratore.

### 5. Pianificazione
- **Capacità e carico**: la griglia assegna persone a cantieri ma non confronta le ore disponibili con le ore previste; manca l'avviso "a questo ritmo il cantiere finisce in ritardo".
- **Trascinamento multi-giorno, copia settimana, squadre fisse, competenze richieste** (es. serve un gessatore con ponteggio).
- **Vista per collaboratore** (dove sono questa settimana) e notifica push del cambio pianificazione.

### 6. Persone e HR
- **Documenti con scadenza** (permessi di soggiorno, patenti, certificati, corsi sicurezza) con avvisi 60/30 giorni.
- **Onboarding**: invito, firma del contratto, consegna attrezzatura e DPI con firma.
- **Valutazione e costi reali**: costo orario per persona da Lohn, non da categoria; vista "chi rende di più per tipo di lavoro".

### 7. Magazzino, acquisti, veicoli
- **Ordini a fornitore dal fabbisogno del cantiere** (materiale previsto meno scaricato), con conferma ordine e bolla di consegna letta dall'OCR.
- **Scarico con QR o codice a barre** dal telefono, sul cantiere, con foto del materiale.
- **Veicoli**: libretto digitale, multe assegnate a chi guidava (incrocio con i viaggi GPS), scadenze collaudo e assicurazione.

### 8. Comunicazione
- **Portale cliente**: il link di firma può diventare un'area dove il cliente vede avanzamento, foto, variazioni da approvare, fatture e QR per pagare.
- **WhatsApp Business per i clienti privati** (conferme sopralluogo, promemoria) accanto all'e-mail.
- **Regole automatiche sulla posta**: la demo classifica le e-mail; in produzione servono regole modificabili dall'ufficio e la coda "da smistare".

### 9. Sicurezza, ruoli, dati
- **Permessi reali per modulo e per campo** (i margini e i salari solo a Direzione): oggi è descritto, non applicato.
- **Audit log** di ogni modifica su offerte, fatture, bollettini approvati.
- **Backup, esportazione completa, cancellazione dati** (LPD svizzera) e hosting in Svizzera dichiarato nel contratto.
- **Accesso con Microsoft 365 (SSO)** per l'ufficio e PIN/biometria per l'app.

### 10. App operaio
- **Modalità offline** (cantine, gallerie): timbrature e bollettini salvati sul telefono e inviati dopo.
- **Lingue degli operai** (portoghese, albanese, spagnolo, tedesco) per l'app e per l'assistente vocale.
- **Check-list sicurezza e segnalazione pericoli** con foto, come richiesto da SUVA.
- **Geofence intelligente**: timbratura proposta automaticamente all'arrivo sul cantiere.

### 11. IA
- **Assistente di direzione proattivo**: ogni mattina "tre cose da guardare" (cantiere che scivola sotto il break-even, cliente che paga tardi, offerta ferma da 10 giorni) invece di aspettare la domanda.
- **Previsione di fine lavori e margine finale** dal ritmo reale dei bollettini.
- **Lettura di capitolati lunghi** con estrazione automatica delle posizioni nel formato NPK e segnalazione delle clausole rischiose (penali, termini di pagamento).

## Cosa farei prima della demo di venerdì (poche ore ciascuna)

1. **Budget per fase e margine "a finire"** sul cantiere: è la domanda che Ivo farà per prima.
2. **Variazioni come oggetto** con approvazione dal link cliente: chiude il cerchio con la firma digitale già fatta.
3. **Saldi assenze** nell'app operaio (vacanze, recuperi) e nella scheda persona.
4. **Documenti con scadenza** per persone e veicoli con avvisi in dashboard.
5. **Portale cliente** minimo riusando la pagina di firma: avanzamento, foto, fatture.

## Cosa fa parte di un MVP vero (mesi 1–3)

- Backend e database con permessi, audit log, hosting svizzero.
- Integrazioni reali: Microsoft Graph e Google per posta e calendario, SelectLine (SL.mobile), banca camt.054, QR-fattura.
- App mobile pubblicata (PWA o store) con offline e notifiche push.
- OCR reale per fatture e capitolati; modello IA con i dati dell'azienda per offerte e assistente.
- Importazione dello storico da PUNTANET e SelectLine (cantieri, clienti, prezzi).

## Da decidere con il cliente

- Chi approva i bollettini (capo squadra, responsabile di ramo, ufficio) e entro quando.
- Quali e-mail devono essere condivise con tutto l'ufficio e quali restano personali.
- Il livello di dettaglio del listino (posizioni NPK complete o un listino interno semplificato).
- Se il portale cliente va offerto a tutti i clienti o solo alle amministrazioni immobiliari.
