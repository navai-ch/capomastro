# Capomastro

Gestionale per gli artigiani del cantiere: pittori, gessatori e imprese edili. Demo realizzata per MY COLOR Isella & Foletti SA (Bioggio).

Ogni cantiere con il suo margine in tempo reale, offerte generate dall'IA dal listino di mestiere e dallo storico, firma digitale del cliente, fatture ad acconti con promemoria e solleciti automatici, pianificazione, magazzino, veicoli e un'app mobile per la squadra con ore dettate a voce e viaggi GPS.

## Come si usa

È una single-page app in vanilla JS senza build né backend: basta aprire `index.html` o servire la cartella.

```bash
npx serve .
```

Parametri utili per la demo (vedi [GUIDA-DEMO.md](GUIDA-DEMO.md)):

- `?u=ivo|stefano|antonio|letizia|operaio` sceglie l'utente loggato
- `&theme=dark|light` forza il tema
- `#firma/<token>` apre la pagina di firma del cliente

I dati sono di esempio e restano nel browser (localStorage); "Ripristina dati demo" nelle impostazioni li azzera.

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | layout, stili e caricamento degli script |
| `data.js` | dati di esempio (collaboratori, clienti, cantieri, offerte, fatture…) |
| `core.js` | stato, persistenza, calcoli di margine, componenti, registro entità, modali |
| `views.js`, `views2.js` | viste ufficio |
| `listino.js` | listino NPK pittura e gessatura e generazione offerte con IA |
| `operaio.js` | interfaccia mobile per gli operai |
| `assistant.js` | assistente IA in basso a destra |
| `extra.js` | kanban, firma digitale, piano acconti, promemoria |
| `main.js` | routing, rendering ed eventi |
