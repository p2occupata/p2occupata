# Eventi

Ogni file Markdown in `_eventi/` produce una sola pagina di dettaglio. Le date nel front matter devono essere stringhe ISO tra apici (`'AAAA-MM-GG'`), così GitHub Pages può ordinarle senza errori.

## Date definite

`data` è la prima data. Ogni voce in `date_aggiuntive` produce un'altra scheda nella timeline, collegata alla stessa pagina. Le date future compaiono tutte; quelle passate sono accessibili con «Mostra altri eventi».

```yaml
data: '2026-11-05'
date_aggiuntive:
  - '2026-11-12'
  - '2026-11-19'
```

## Ricorrenza

`data` è il primo incontro. `ogni_giorni` è il numero di giorni fra due incontri. `fino` è facoltativo e include l'ultimo incontro che cade entro quella data. Nella timeline appaiono tutti gli incontri passati e soltanto il prossimo; il prossimo viene calcolato all'apertura della pagina, senza una nuova build.

```yaml
data: '2026-11-03'
ricorrenza:
  ogni_giorni: 7
  fino: '2027-08-30'
```

Per una ricorrenza senza termine, omettere `fino`. Non usare `date_aggiuntive` e `ricorrenza` nello stesso evento. La pagina di dettaglio resta unica: tutte le schede della timeline rimandano a quella pagina.

La homepage mostra il prossimo incontro di ciascun evento; la timeline mostra tutte le date definite e, per ciascuna ricorrenza, solo la prossima data futura. Gli incontri passati sono caricati nella pagina a gruppi di otto.
