# Eventi

Ogni file Markdown in `_eventi/` produce una sola pagina di dettaglio. Le date nel front matter devono essere stringhe ISO tra apici (`'AAAA-MM-GG'`), così GitHub Pages può ordinarle senza errori.

## Categorie

Un evento può avere più categorie. Sono mostrate tutte con lo stesso peso nella timeline, nella homepage e nella pagina di dettaglio:

```yaml
categorie:
  - workshop
  - dibattito
```

Per una categoria con un nome personalizzato si può indicare anche il testo da mostrare:

```yaml
categorie:
  - workshop
  - id: arte
    nome: Arte
```

Il colore dipende dal nome visibile della categoria: lo stesso nome mantiene lo stesso colore. La scelta avviene tra i cinque colori già usati dal sito; categorie diverse possono condividere un colore. I vecchi campi `categoria` e `categoria_nome` continuano a funzionare per gli eventi esistenti.

## Locandina

`locandina` è facoltativo: è il percorso di un'immagine del sito in `images/eventi/`. Nella pagina dell'evento compare a grandezza piena.

`locandina_miniatura` è la versione ridotta, in `images/eventi/miniature/`: è quella usata nella scheda del prossimo evento, nei volantini e nell'archivio, così gli elenchi non caricano l'immagine grande. Se manca, anche lì viene usata `locandina`.

```yaml
locandina: /images/eventi/2026-11-05-serata-giochi.png
locandina_miniatura: /images/eventi/miniature/2026-11-05-serata-giochi.jpg
```

Gli eventi senza locandina restano come sono.

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
