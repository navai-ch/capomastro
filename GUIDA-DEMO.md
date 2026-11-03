# MyColor Gestionale – guida alla demo di venerdì 6 novembre 2026

**Link demo (online, pubblico):** https://capomastro-self.vercel.app
Si apre da qualsiasi browser e telefono senza login. Per l'app operaio: https://capomastro-self.vercel.app/?u=operaio

**Link alternativo (artifact Claude, privato):** https://claude.ai/artifact/QEukzh2RDbvtzoUsYpvVkU (va condiviso dal menu Share).

**Copia offline (piano B senza internet):** apri `mycolor-demo/index.html` nel browser. Funziona anche senza rete.

**Codice:** https://github.com/navai-ch/capomastro. Dopo ogni modifica: `git push` e `vercel deploy --prod` dalla cartella (il deploy automatico da GitHub si attiva installando l'app GitHub di Vercel sull'organizzazione navai-ch).

Tutti i dati sono inventati. Nomi dell'ufficio (Ivo, Stefano, Antonio, Letizia) presi dal sito mycolorgroup.ch; operai, cantieri, clienti, fornitori e importi sono finti ma verosimili. Le modifiche fatte durante la demo restano salvate sul dispositivo: in **Impostazioni → Dati → Ripristina dati demo** torni allo stato iniziale.

## Utenti demo

| Account | Chi è | Cosa mostra |
|---|---|---|
| Ivo Foletti | Direzione | Tutto: dashboard margini, cantieri, commerciale, impostazioni, utenti |
| Stefano Montagnese | Responsabile pittura | Coda bollettini, pianificazione, chat cantieri |
| Letizia Gottardello | Amministrazione | Fatture, contabilità, SelectLine, lettura fatture IA |
| Francesco De Luca | Pittore AFC, app cantiere | Viaggio GPS, timbratura, bollettino con voce, 7 km dalla base → niente indennità |
| Dario Pellegrini | Gessatore AFC, app cantiere | Forfait pranzo 340 CHF, auto privata, km, chat con Antonio |

Login: "Accedi con Microsoft 365" apre il selettore account. L'e-mail/password funziona con qualsiasi valore ed entra come Stefano. Dal cerchietto del profilo in alto a destra: profilo, impostazioni, utenti e inviti, lingua, cambia utente.

## Cosa c'è (mappa delle funzioni)

- **Barra in alto**: ricerca globale (tasto `/`), bottone **+** per creare qualsiasi cosa (cantiere, collaboratore, cliente, fornitore, offerta, fattura da offerta, fattura fornitore da foto/PDF, capitolato, attività, appuntamento, e-mail, messaggio, veicolo, articolo, scarico, assenza, invito), campanella notifiche, profilo con iniziali.
- **Assistente IA** (✦ in basso a destra, anche sul telefono): risponde sui dati (margini, bollettini, fatture scadute, chi lavora dove, scorte, veicoli) e fa azioni (scrive e-mail, crea clienti/fornitori/promemoria, apre la fattura da offerta, manda messaggi).
- **Dashboard**: KPI margini, CHF/ora per cantiere, "da fare oggi", la mia giornata.
- **Cantieri**: lista con filtri, selezione multipla, export CSV, nuovo/modifica/elimina. Scheda cantiere: redditività, squadra e ore, **costi e fatture per categoria** (materiale pittura/gessatura, ponteggi, subappalto, noleggio, smaltimento…) con **caricamento fattura letta dall'IA**, prelievi magazzino, bollettini, documenti SharePoint, e-mail Outlook, calendario, chat.
- **Pianificazione**: griglia settimanale cantieri × giorni, assenti, non pianificati; clic su una casella per aggiungere/spostare persone.
- **Bollettini**: coda con filtri (anomalie, note vocali 🎤), approvazione singola, multipla e "tutti senza anomalie", rinvio con messaggio all'operaio; conguaglio mensile; **assenze e vacanze** da approvare.
- **Persone**: sotto-tab Collaboratori / Clienti / Fornitori, tutti con CRUD, bulk select, bulk edit campo, bulk delete, export. Scheda cliente e fornitore con tab: panoramica e **attività CRM** (chiamate, riunioni, promemoria, note, sopralluoghi), **e-mail Outlook** sincronizzate per contatto con composizione e modelli, **calendario** per contatto, fatture/ordini. Contatti multipli per cliente.
- **Veicoli e km**: flotta CRUD, km auto private da approvare, **viaggi GPS** tracciati dall'app, proposte IA car pooling.
- **Offerte e fatture**: tre sotto-tab. **Offerte** a corpo (prezzo fisso) o a stima (a misura): editor posizioni NPK, importazione dal capitolato, firma digitale. **Fatture clienti** separate: generate dall'offerta con wizard (acconto %, avanzamento a corpo o a misura con quantità eseguite, saldo), fattura a regia, invio, pagamento, solleciti, anteprima stampabile con QR-fattura. **Capitolati**: caricamento, analisi IA (riassunto, posizioni, punti da chiarire prima dell'inizio, richieste del cliente in corso d'opera) e **chat per fare domande al documento** con citazione pagina.
- **Calendario**: settimana Outlook con filtri per persona e tipo, nuovo appuntamento collegato a cliente/fornitore/cantiere.
- **Messaggi**: canale generale, canale per cantiere, messaggi diretti; sul telefono anche con nota vocale.
- **Magazzino**: materiale ed equipaggiamento CRUD, movimenti (carico/scarico su cantiere che finisce nei costi), ordini ai fornitori, riordino.
- **Contabilità**: SelectLine (batch API reale), fatture fornitori con categoria e cantiere, fatture clienti, mapping conti.
- **Impostazioni**: profilo e notifiche, azienda e parametri (break-even, struttura, indennità… ricalcolo live), **utenti e inviti** (invita via Microsoft o PIN, reinvia, revoca, disattiva), ruoli, **lingua** (IT/DE/FR/EN sul menu) e **tema** (chiaro/scuro/auto), integrazioni, dati (ripristino, export JSON, import PUNTANET).
- **App operaio** (telefono): Oggi (viaggio GPS "Parto/Sono arrivato", timbratura con geofence, cambio cantiere, vacanze, malattia, scansione materiale), Bollettino (**detta a voce**: ore, viaggio, attività e note compilate in automatico, inviate a responsabile e direttore), Viaggi e km, Messaggi (con voce), Io (conguaglio, vacanze, dati).

## Novità della versione 8 (3 novembre)

- **Budget per fase e margine a finire** (scheda cantiere → Redditività): fasi con ore previste/fatte/a finire e materiale, margine a fine lavori previsto contro margine preventivato, costo a finire, avviso quando le ore corrono più dei lavori; "Modifica budget" per correggere ore e materiale per fase.
- **Variazioni in corso d'opera come oggetto**: stati Proposta → Inviata al cliente → Approvata/Rifiutata, "Invia al cliente" manda l'e-mail con il link del portale; il cliente approva o rifiuta (con motivo) dal portale e il contratto del cantiere si aggiorna; tutto tracciato nella scheda offerta. Visibili sia nella scheda offerta sia nel cantiere.
- **Saldi assenze**: vacanze disponibili (residui meno richieste e pianificate), recupero ore da straordinari, malattia e permessi 2026, nell'app operaio (scheda Io, con "Recupero ore") e nella scheda persona.
- **Scadenze documenti**: permessi B/C/G, corsi SUVA, visite mediche, patenti, attestati ponteggi; per i veicoli collaudo MFK, servizio, assicurazione, vignetta. Card e avviso in dashboard a 60 giorni, elenco completo con filtri, scadenze nella scheda persona e nella tabella veicoli, "Rinnovato" con un clic.
- **Portale cliente** sullo stesso link della firma (`#firma/<token>`, accesso con l'e-mail del cliente): schede Offerta, Lavori (avanzamento, fasi, aggiornamenti dal cantiere, foto, referenti), Variazioni da approvare, Fatture con QR-fattura per pagare, Documenti con caricamento file. Da provare: scheda offerta → "Apri come cliente".

## Novità della versione 7 (3 novembre)

- **Analisi dei KPI**: clic su un riquadro della dashboard (o sul menu dell'analisi) apre la pagina con l'andamento mese per mese o per trimestre, la retta di regressione con proiezione a 3 periodi, R² come affidabilità del trend, filtro "da data a data" con preset, confronto con l'anno precedente e tabella con variazioni; clic su un mese apre il riepilogo del mese. Export CSV. Sette KPI: margine, CHF/ora, fatturato, ore, bollettini, incassi/scoperto, offerte.
- **Bollettini cliccabili**: ogni riga (anche nell'app operaio) apre il dettaglio con giornata, GPS, costo e valore, nota vocale, approvazione e altri bollettini della persona.
- **Entità cliccabili ovunque**: nomi di collaboratori, clienti, fornitori, cantieri e numeri di offerte e fatture sono link in tutte le tabelle, elenchi e avvisi (sottolineatura puntinata). Il nome di una persona apre la sua scheda sotto Persone → Collaboratori.
- **Valutazione del gestionale** con proposte prioritarie in `VALUTAZIONE.md`.

## Novità della versione 6 (2 novembre, sera)

- **Tema chiaro/scuro**: icona sole/luna in alto a destra, oppure Auto/Chiaro/Scuro nel menu del profilo (in alto a destra e in basso a sinistra) e in Impostazioni → Lingua e aspetto.
- **Logo cliccabile**: in ufficio porta alla dashboard, nell'app operaio alla schermata Oggi.
- **Dashboard più completa**: 7 KPI cliccabili con mini-trend, grafico CHF/ora con tooltip al passaggio del mouse (clic apre il cantiere), fatturato e costi per mese 2026, pipeline offerte a imbuto, incassi e scadenze per fascia di ritardo, squadra di oggi per cantiere. Tutto ha hover e porta alla pagina giusta.
- **Listino nell'offerta manuale**: il vecchio menu a tendina è sostituito da "Cerca nel listino": ricerca per parola (es. "soffitti"), filtri per categoria, prezzo medio e intervallo storico, clic per aggiungere la posizione.
- **Account e-mail e calendari** (Impostazioni → E-mail e calendari, anche dal menu profilo): Outlook/Microsoft 365 di Ivo, Stefano, Letizia e Gmail condiviso info@. "+ Collega account" simula l'autorizzazione OAuth (Microsoft, Google, IMAP, iCloud) e la scelta di cosa sincronizzare. Il Calendario mostra i calendari collegati con un colore per account, attivabili/disattivabili.
- **Inbox** (sotto Comunicazione): tutta la posta dell'ufficio con cartelle, filtro per account ed etichette, ricerca, lettura con riassunto IA e "Suggerisci risposta", "Crea offerta con IA" dalle richieste di preventivo (prova con l'e-mail dell'arch. Pedrazzini), "Registra fattura" dagli allegati PDF (Rigips), collegamento a cantiere, inoltra, archivia, elimina, selezione multipla. Nuova e-mail con scelta dell'account mittente.
- **Assistente IA per gli operai** (app operaio, scheda "Assistente" o barra in Oggi): scrive o detta in italiano e l'IA propone le azioni da confermare. Esempi da provare: "Entrato alle 7", "Otto ore oggi, mezz'ora di viaggio con la mia auto, tinteggiato il corridoio a Villa Bernasconi, manca un secchio di Indeko" (timbratura + viaggio + bollettino), "Uscito alle 16 e mezza", "Domani vado dal dottore, arrivo alle 11", "Vacanze dal 22 al 26 dicembre", "Sono malato", "Di' a Stefano che lunedì arrivo alle 8", "Parto adesso verso il cantiere", "Dalle 7 alle 16 a Scuola Canavée, montaggio cartongesso". Dopo la conferma tutto arriva al capo e a Ivo (bollettini, notifiche, messaggi).

## Novità della versione 5 (2 novembre)

- **Kanban**: Cantieri → bottone "Kanban" (colonne In offerta, Pianificati, In corso, Sospesi, Conclusi). Offerte → vista "Pipeline" con le fasi del deal: Richiesta → Sopralluogo → Offerta in bozza → Inviata/attesa firma → Firmata → Fatturata → Persa. Trascina le schede con il mouse; sul telefono usa le frecce ‹ ›. Spostando in "Inviata" si crea il link di firma, in "Persa" si registra il motivo per far imparare l'IA.
- **Offerta con IA** (bottone rosso "Offerta con IA" o "+"): descrivi il lavoro o dettalo, oppure usa uno dei tre esempi; carica una foto/planimetria; "Genera offerta" propone le posizioni NPK con quantità stimate e prezzi medi appresi da 312 offerte storiche, spiega il ragionamento e cita le offerte simili; poi correggi nel listino (i prezzi fuori dall'intervallo storico si colorano). "Cosa ha imparato l'IA dallo storico" mostra il listino Ticino con min–max e numero di offerte.
- **Firma digitale** (come nel navAI Admin Hub): nella scheda offerta "Crea link di firma" → link con accesso riservato all'e-mail del cliente → "Apri come cliente" mostra la pagina pubblica: accesso con e-mail, offerta interattiva con opzioni attivabili e totale live, "Scarica PDF", "Firma l'offerta" con nome/luogo/data, firma disegnata con il dito o nome digitato, consenso, conferma, PDF firmato. Ogni accesso, download e firma finisce nel **tracciamento** della scheda. "Fai firmare ora (tablet in ufficio)" salta l'accesso e-mail.
- **Piano acconti** su ogni offerta (es. 30/30/30/10 con "alla firma, a metà lavori, a fine lavori, al collaudo"), modificabile. "Fattura da offerta" propone automaticamente la prossima rata con la percentuale giusta, mostra già fatturato e avanzamento, e permette la percentuale libera, l'avanzamento a misura o il saldo.
- **Promemoria fatturazione e solleciti**: nella dashboard e in Fatture clienti compaiono "Da creare" (rata raggiunta dall'avanzamento, o maturato non fatturato sulle offerte a stima), "Da inviare" (bozze), "In scadenza" e "Sollecito 1/2 / Diffida" in base ai giorni di ritardo; i giorni e gli automatismi si impostano in Impostazioni → Azienda → Fatturazione automatica. L'assistente risponde a "cosa devo fatturare?".
- Il profilo in basso a sinistra è cliccabile (stesso menu di quello in alto a destra); la barra di ricerca non perde più il cursore.

## Percorso consigliato (Ivo ragiona sui margini: parti da lì)

1. **Dashboard (Ivo)** · 2 min. Margine, CHF/ora contro break-even 70 e tariffa 82. Scuola Canavée è rossa (49.8): cliccala dall'alert. Prova la ricerca con "bern" e l'assistente con "Qual è il margine di Villa Bernasconi?".
2. **Villa Bernasconi** · 4 min. Tab **Costi e fatture**: costi per categoria, poi **Carica fattura** → scegli la fattura di esempio Sumcolor: l'IA legge fornitore, voci, importo, trova "MC 20-26.421" nel testo e propone la categoria; Registra. Tab Squadra e ore: costo aziendale per operaio e indennità pranzo. Redditività: "Genera fattura da offerta".
3. **Offerte e fatture** · 5 min. Pipeline kanban: trascina "Bernasconi: garage" da Sopralluogo a Offerta in bozza. "Offerta con IA" → esempio "Villa + facciata" → Genera → mostra il ragionamento e crea la bozza. Casa Rossi OF-2026-0258: tracciamento (aperta e PDF scaricato dal cliente), "Apri come cliente" → accedi con andrea.rossi@gmail.com → togli l'opzione resina → Firma l'offerta → disegna con il dito → Conferma: torna sul gestionale e vedi firma, cantiere in pianificazione e prima rata da fatturare. Villa Bernasconi OF-2026-0217: "Fattura" sulla rata "A fine lavori" → fattura pronta con QR. Tab Capitolati: Scuola Canavée → chat "Chi fornisce i ponteggi?" e "Invia domande al cliente". "+ Carica capitolato" con l'esempio: analisi in 2 secondi.
4. **Persone → Clienti → Fam. Bernasconi** · 2 min. Attività (chiamata, promemoria), tab E-mail con risposta e modelli, tab Calendario. Seleziona più clienti → "E-mail a tutti".
5. **App operaio (Francesco)** · 3 min, meglio sul telefono. Oggi: "Parto" (GPS), "Sono arrivato", Timbra entrata/uscita. Bollettino: tocca il microfono e detta "otto ore e mezza, mezz'ora di viaggio, finito il soffitto, manca un secchio di Indeko" (se il browser non dà il microfono, la demo usa una frase di esempio): i campi si compilano; Invia. Messaggi: nota vocale ad Antonio. Io: Chiedi vacanze.
6. **Torna su Stefano**: Bollettini → il bollettino appena inviato con 🎤, approva; Assenze → la richiesta vacanze; Messaggi → risposta.
7. **Pianificazione, Veicoli (car pooling), Magazzino (scarico su cantiere), Contabilità (batch SelectLine)** · 3 min.
8. **Impostazioni** · 1 min. Cambia il break-even da 70 a 75: tutto si ricalcola. Utenti e inviti: invita un operaio. Lingua → Deutsch. Tema scuro.

## Cose vere da dire (fonti verificate)

- CCL pittura e gessatura Svizzera tedesca e Ticino, versione dal 1.4.2026: 2'088 h/anno, vacanze 22/27 gg, pranzo forfait 275 CHF/mese o max 23 CHF/pasto con ricevuta, km auto privata min. 0.70 CHF, viaggio non pagato ridotto a 15 min, straordinari +25%, salari minimi capo operaio 5'744/5'956 e AFC +3 anni 5'051/5'267 (pittori/gessatori). Il forfait 340 di MyColor è sopra il minimo CCL.
- SelectLine ha un'API REST (SL.mobile API) con rotte FiBu per batch di registrazioni dalla versione 25; serve la licenza Toolbox Runtime.
- Login Microsoft (Entra ID) copre Outlook, Calendario, SharePoint, OneDrive e Teams con un'unica identità (Microsoft Graph): e-mail e appuntamenti si associano a clienti e fornitori in automatico.

## Cose da dichiarare come "demo"

- Geolocalizzazione e tracciato GPS simulati; nell'app vera GPS del telefono e geofence per cantiere.
- La dettatura usa il riconoscimento vocale del browser se disponibile (Safari/Chrome con permesso microfono), altrimenti una frase di esempio. In produzione: modello vocale dedicato, anche in portoghese e albanese.
- Lettura fatture (OCR) e analisi capitolati sono simulate con esempi realistici; in produzione un modello legge il PDF vero.
- Google Maps, firma elettronica (Skribble / Swisscom Sign), invio e-mail Outlook e SelectLine sono rappresentati, non collegati.
- Le proposte IA car pooling sono scritte a mano.
- Importazione da PUNTANET: da verificare quali export offre. Chiedi a Ivo un export di esempio.

## Domande utili da fare a Ivo

1. Quanti bollettini al giorno e chi li compila oggi (operaio o capo squadra)? Dettatura vocale utile?
2. Quali export dà PUNTANET e cosa vuole tenere dello storico.
3. Versione di SelectLine in uso e se hanno già la Toolbox.
4. Chi approva ore, km e vacanze: solo Stefano/Antonio o anche Letizia?
5. Operai sull'app con PIN o con account Microsoft? Quante lingue servono?
6. Le fatture fornitori arrivano via e-mail (PDF) o cartacee? Chi le registra oggi?
7. Quante offerte sono a corpo e quante a stima? Capitolati NPK sempre dagli architetti?
