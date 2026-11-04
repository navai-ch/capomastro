# Capomastro – valutazione del gestionale e proposte di miglioramento

Stato: versione 10 della demo (4 novembre 2026). Valutazione fatta modulo per modulo guardando cosa serve a un'impresa di pittura e gessatura da 40 persone e cosa si aspetta chi la dirige guardando i margini. La sezione "Obiettivi e persone" (v10) è la lettura più recente; le sezioni per area sotto restano valide e i punti già realizzati sono segnati.

## Obiettivi e persone (valutazione v10, 4 novembre)

### Che cosa deve ottenere un'impresa come MY COLOR

1. **Sapere ogni settimana se un cantiere rende** (break-even 70 CHF/h) e accorgersene prima della fine, non alla fattura finale.
2. **Ore giuste, in tempo**: bollettini il giorno stesso, conguaglio entro il 5 del mese, nessuna ricostruzione a memoria.
3. **Offerte rapide e ben prezzate**, con lo storico che insegna; firma e acconti senza rincorrere il cliente.
4. **Liquidità**: fatturare appena maturato, incassare prima, solleciti senza imbarazzo.
5. **40 persone al posto giusto** ogni giorno, con pochi viaggi e poche ore morte.
6. **Zero doppio lavoro** tra PUNTANET, SelectLine, Outlook ed Excel.
7. **Conformità senza fatica**: CCL, SUVA, permessi, scadenze.

### Chi lo userà e quanto è "digitale"

| Persona | Rapporto con la tecnologia | Cosa deve fare nel gestionale | Cosa non deve vedere |
|---|---|---|---|
| **Operai (circa 36)**, molti non di madrelingua italiana | Telefono personale, WhatsApp, foto. Niente tastiera, niente menu. | Arrivo, bollettino (a voce), vedere dove vado domani, chiedere vacanze. Tre tocchi al giorno. | Margini, prezzi, tutto il resto. |
| **Capi squadra (5–6)** | Come gli operai, ma responsabili di 3–6 persone. | Ore della squadra in un colpo, foto e note di cantiere, segnalare materiale mancante. | Costi orari dei colleghi. |
| **Stefano e Antonio (rami)** | Spesso in auto o in cantiere, tablet/telefono più del PC. | Approvare bollettini, spostare persone nel piano, vedere i cantieri che scivolano. | Contabilità, impostazioni. |
| **Letizia (amministrazione)** | Usa Excel, SelectLine, Outlook tutto il giorno: vuole elenchi, azioni in blocco, esportazioni. | Fatture, incassi, solleciti, fatture fornitori, chiusura mese, documenti. | Nulla da nascondere, ma serve velocità. |
| **Ivo (direzione)** | Vuole risposte, non schermate. Guarda la sera dal telefono. | Dashboard, attività del giorno, margine per cantiere, decidere su offerte e persone. | Dettagli operativi se non sono un problema. |

### Dove la demo è già forte

- Il filo del margine (cantiere → ore → costi → CHF/h → fine stimata) e i controlli automatici in **Attività** rispondono agli obiettivi 1 e 4.
- La catena offerta → firma → acconti → fattura → sollecito copre il 3 e parte del 4.
- La pianificazione con ore per persona e la scheda "La mia settimana" coprono il 5.
- L'app operaio con voce e assistente è nella direzione giusta per il livello tecnico degli operai.

### Dove non basta ancora, in ordine di impatto

1. **L'app operaio chiede ancora troppo.** Il bollettino parte vuoto: cantiere, ore e orario sono già nel piano della settimana, quindi devono arrivare precompilati e l'operaio deve solo confermare o correggere a voce. Obiettivo: "arrivo, conferma, vai a casa" in tre tocchi, con numeri grandi e poche parole.
2. **Non c'è il capo squadra.** Oggi ogni operaio compila il suo bollettino; nella pratica il capo squadra sa le ore di tutti. Serve il bollettino di squadra (un elenco, un tocco per persona, correzioni rare) e l'approvazione in cantiere, così l'ufficio riceve dati già puliti.
3. **Lingua.** Portoghese, albanese, spagnolo e tedesco nell'app operaio e nell'assistente vocale, scelte dalla scheda persona. Senza questo l'adozione resta al 60 %.
4. **Troppe funzioni tutte insieme per l'ufficio.** La demo mostra tutto; il prodotto deve partire in "modalità semplice" per ruolo: Letizia vede amministrazione, Stefano e Antonio il loro ramo, Ivo la direzione; i moduli avanzati (IA, capitolati, magazzino) si attivano quando servono.
5. **Approvazioni dal telefono per i responsabili di ramo**: coda bollettini e assenze con approvazione a un tocco, piano "per persona" usabile sul tablet con trascinamento.
6. **Chiusura del mese guidata per Letizia**: bollettini bloccati dopo il 5, conguaglio, esportazione a SelectLine Lohn e creditori, riconciliazione bancaria camt.054, in un percorso unico a passi invece di sei schermate.
7. **Offline e notifiche vere**: cantine, gallerie e sotterranei sono il pane dei gessatori; la timbratura deve funzionare senza rete e sincronizzarsi dopo.
8. **Onboarding senza password**: invito via WhatsApp o SMS, PIN o impronta, nessun indirizzo e-mail obbligatorio (molti operai non lo usano).

### Come introdurlo in azienda (non è un problema di software)

- **Pilota di due settimane con una squadra** (un capo, 4 operai, un cantiere), con Stefano o Antonio come sponsor. Misurare: percentuale di bollettini entro le 18:00, minuti di approvazione, errori nel conguaglio.
- **Formazione di 20 minuti al magazzino** alle 7, con il telefono in mano, e un foglio plastificato con i tre tocchi. Un mese di carta in parallelo, poi stop.
- **Un referente per lingua** tra gli operai senior.
- **Metriche di adozione in Impostazioni**: chi usa l'app, chi manda tardi, chi non la apre: Ivo lo vede senza chiedere.
- **Migrazione da PUNTANET** di cantieri, clienti, prezzi e un mese di storico prima del pilota, così la demo diventa subito "la nostra azienda".

### Cosa aggiungere alla demo prima di venerdì (poche ore ciascuna, in ordine)

1. **Bollettino precompilato dal piano** nell'app operaio, con conferma a un tocco e correzione a voce.
2. **Bollettino di squadra** per il capo squadra: ore di tutta la squadra in una schermata, invio unico.
3. **Lingua per operaio** (almeno portoghese e tedesco) nell'app operaio e nell'assistente.
4. **Modalità semplice per ruolo**: menu ridotto per Letizia, Stefano, Antonio; "mostra tutto" in Impostazioni.
5. **Chiusura mese guidata** in Contabilità: passi 1–5 con blocco bollettini ed esportazione.


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
- *Fatto nella v9*: ore e orario per persona, giornate divise, capacità e carico per giorno, obiettivo settimanale e fine stimata per cantiere, competenze richieste, vista per collaboratore, copia settimana, invio push alle squadre, settimana nell'app operaio.
- **Ancora da fare**: trascinamento delle persone tra caselle, squadre fisse riutilizzabili, pianificazione a più settimane (Gantt per cantiere) e vincoli reali (patente, veicolo, lingua).

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

## Cosa farei prima della demo di venerdì (valutazione v7)

*Tutti e cinque i punti sono stati realizzati nella v8 (3 novembre); la pianificazione dettagliata e il modulo Attività nella v9.*

1. ~~Budget per fase e margine "a finire"~~ fatto (v8).
2. ~~Variazioni come oggetto con approvazione dal portale~~ fatto (v8).
3. ~~Saldi assenze~~ fatto (v8).
4. ~~Documenti con scadenza~~ fatto (v8).
5. ~~Portale cliente~~ fatto (v8).

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
