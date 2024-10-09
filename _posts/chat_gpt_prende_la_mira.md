# ChatGPT Prende la Mira
## Trasformare il Gioco delle Freccette con l’AI

Era una di quelle serate perfette per una sfida tra amici.

Un bersaglio da freccette, una manciata di freccette lucide, e l’aria carica di sfida. Ma c’era un problema… nessuno di noi sapeva davvero tutte le regole delle diverse varianti del gioco delle freccette.

Eccoci lì, tra l’eccitazione di una nuova partita e il dubbio su come impostare il gioco correttamente. Questo mix di entusiasmo e leggera confusione è stato il punto di partenza per la stesura di questo articolo. Perché non creare qualcosa che non solo ci spiegasse le regole, ma che ci guidasse passo dopo passo in ogni partita, adattandosi al volo a qualsiasi variante volessimo esplorare?

Con un po’ di ingegnosità e una dose sana di curiosità geek, ho deciso di vedere se potevo utilizzare ChatGPT per trasformare una normale partita a freccette in un’avventura interattiva, adattabile a qualsiasi variante del gioco semplicemente modificando una parola nel prompt. In questo articolo, condividerò con voi come sono arrivato a creare un’interfaccia che ha rivoluzionato il modo in cui gioco a freccette, rendendo ogni partita un’esperienza unica e personalizzabile. E il bello? La conclusione a cui sono arrivato è sorprendentemente semplice e accessibile a tutti.

# Conclusione rapida per chi ha fretta di giocare

Se siete qui solo per farvi una partita a freccette, ecco la formula magica: il prompt finale.

> Quali sono le regole di **killer** a freccette?  
> Da adesso sei un menu interattivo che aiuta un gruppo di giocatori a giocare al gioco che hai descritto un passo alla volta.  
> Basati sulle regole che hai descritto e aiuta questo gruppo di giocatori ad impostare la partita facendo una domanda alla volta. Ottieni il nome dei giocatori e l’ordine di inserimento sarà l’ordine dei turni per i giocatori. Se nelle regole sono previste azioni preliminari fai compiere tutte le azioni necessarie ai giocatori descritte sul regolamento senza saltare i turni dei giocatori. Nel momento in cui il primo giocatore dovrà tirare la prima freccetta devi mostrare anche un tabellone in ascii, prima di ogni domanda che farai, adeguato per questo gioco. Assicurati che vengano mostrate tutte le informazioni per gestire la partita e aiutare i giocatori ad avere tutte le informazioni, inserendo anche le informazioni riguardo ai punteggi e ai turni.

La bellezza di questo prompt risiede nella sua semplicità: cambiando solamente il nome del gioco potrete adattare l’interfaccia a qualsiasi variante delle freccette. Se sei solo un appassionato di freccette ora che conosci il trucco puoi tornare a lanciare le freccette con questo nuovo strumento, ma se sei curioso di sapere il viaggio ed i prompt utilizzati per arrivare a questa conclusione allora ti consiglio di continuare a leggere.

# Inizia la partita

La creazione del prompt definitivo è stata un’avventura fatta di diverse fasi e numerosi tentativi andati male. L’idea di usare ChatGPT per assistere il nostro gioco a freccette è nata quasi per caso. Avevamo scelto di giocare a Scram, ma non sapevamo esattamente le regole, quindi ho chiesto a ChatGPT di spiegarcele. Le regole sembravano complesse, così per semplificarle, ho richiesto:

> Dammi la lista dei passi da fare e elencami i turni per Giocatore 1, Giocatore 2 e Giocatore 3.

Questo ci ha aiutato a rendere le regole meno oscure. In breve, un giocatore colpisce il bersaglio (scram) e se il giocatore successivo colpisce lo stesso numero, il primo non guadagna punti (unscram).

Era arrivato il momento di tenere traccia dei punti, chiedendo a ChatGPT di visualizzare un’immagine del bersaglio con le sezioni colpite, ma i risultati erano disastrosi, quindi ho optato per un tabellone in grafica ASCII.

Anche questo tentativo non ha dato i frutti sperati, le informazioni rappresentate erano insufficienti per gestire adeguatamente la nostra partita. Così, armato di infinita pazienza, ho iniziato a inserire manualmente tutte le informazioni necessarie fino a raggiungere una soluzione soddisfacente:

> Giocatore 1 ha colpito i numeri 4, 14 e 10. Dal momento che il 14 era stato “unscrammato” nel turno precedente, ora è stato “scrammato” di nuovo da Giocatore 1. I numeri 4 e 10 sono nuovi “scrammati”.  
> Ecco la tabella aggiornata dei numeri “scrammati”:

| **1** | 2 | 3 | **4** | 5 |  
| **6** | 7 | **8** | **9** | **10** |  
| 11 | 12 | 13 | **14** | 15 |  
| 16 | 17 | **18** | 19 | 20 |

E la lista aggiornata dei numeri “scrammati”:

- 1: Scrammato da Giocatore 2
- 4: Scrammato da Giocatore 1
- 6: Scrammato da Giocatore 1
- 8: Scrammato da Giocatore 2
- 9: Scrammato da Giocatore 3
- 10: Scrammato da Giocatore 1
- 14: Scrammato da Giocatore 1
- 18: Scrammato da Giocatore 3

Riepilogo dei punti:

- Giocatore 1: Ha “scrammato” 4, 6, 10 e 14.
- Giocatore 2: Ha “scrammato” 1 e 8.
- Giocatore 3: Ha “scrammato” 9 e 18.

Ora è il turno di Giocatore 2, che può cercare di “scrammare” nuovi numeri o “unscrammare” quelli attivi. Dopo il turno di Giocatore 2, fammi sapere quali numeri ha colpito.

Nonostante tutto, il risultato non era ancora all’altezza delle aspettative. Pertanto, con la stessa perseveranza, ho personalizzato ulteriormente la visualizzazione:

> Dammi la risposta in questo modo:
> - Turno corrente: <nome del giocatore>
> - Numeri da unscrammare: <numeri da unscrummare colpiti nel turno precedente>
> - Prossimo turno: <nome del prossimo giocatore>

> — — — — — — — — — — — — — — — — — —

> - Punti Giocatore 1: <punti Giocatore 1>
> - Punti Giocatore 2: <punti Giocatore 2>
> - Punti Giocatore 3: <punti Giocatore 3>

> — — — — — — — — — — — — — — — — — —

> - Numeri Scrammati:
> - <numero>: <giocatore che lo ha scrammato> per ogni giocatore.

Questo è il risultato:

> Turno corrente: Giocatore 2  
> Numeri da unscrammare: Nessuno (Giocatore 1 non ha colpito alcun numero nel turno precedente)  
> Prossimo turno: Giocatore 3  
> Punti Giocatore 1: 20 (4 + 6 + 10)  
> Punti Giocatore 2: 1  
> Punti Giocatore 3: 47 (9 + 18 + 20)

> Numeri Scrammati:

> - 1: Giocatore 2
> - 4: Giocatore 1
> - 6: Giocatore 1
> - 9: Giocatore 3
> - 10: Giocatore 1
> - 18: Giocatore 3
> - 20: Giocatore 3

> Dopo il turno di Giocatore 2, fammi sapere quali numeri ha colpito.

Poiché non ci prendiamo troppo sul serio, abbiamo anche deciso di aggiungere una telecronaca e commenti dal vivo in dialetto locale per rendere la serata incredibilmente divertente!!!

# Giochiamo ancora

Una serata insieme non è mai abbastanza. Il giorno seguente, ci siamo lasciati tentare da una variante del gioco delle freccette chiamata killer, notevolmente più complessa fin dalle prime fasi. Non era sufficiente lanciare le freccette, poiché esistono delle procedure preliminari prima di poter iniziare effettivamente a giocare.

La preparazione della sera precedente, che ho sintetizzato in poche righe, in realtà era stata lunga e piena di correzioni, riducendo il tempo disponibile

per il divertimento, inoltre, per poter giocare a killer, era prevista un’altra fase preparatoria che avrebbe ulteriormente prolungato l’attesa prima di poter giocare.

Fu in quel momento che iniziai a riflettere su soluzioni per un prompt facilmente modificabile e che potesse fornire esattamente il comportamento desiderato.

# Bersaglio centrato

Finalmente capii il problema principale del mio approccio… ero andato in tunnel vision. Mi ero fissato sull’idea che il tabellone dovesse contenere tutte le informazioni, quando in realtà queste potevano essere tranquillamente discorsive. Non c’era bisogno di schematizzarle in una tabella; il tabellone doveva semplicemente servire a tenere traccia dei punti e non gestire anche le informazioni sulla partita. Inoltre, l’idea di trasformarlo in un UX designer aveva funzionato quasi alla perfezione. Quindi, perché non trasformarlo in quello che realmente cercavo? Ovvero, un menù interattivo che ti guida passo dopo passo, facendo una domanda alla volta!

> Da adesso sei un menu interattivo che aiuta un gruppo di giocatori a giocare a **killer** a freccette un passo alla volta.  
> Aiuta questo gruppo di giocatori ad impostare la partita facendo una domanda alla volta. Nel momento in cui il primo giocatore dovrà tirare la prima freccetta devi mostrare anche un tabellone in ascii, prima di ogni domanda che farai, adeguato per questo gioco, assicurati che vengano mostrate tutte le informazioni per gestire la partita e aiutare i giocatori ad avere tutte le informazioni.

Durante i miei esperimenti, notai che le regole esposte cambiavano di tanto in tanto, a volte anche specificando il motivo; ad esempio, le regole possono variare a seconda della regione o del pub in cui si gioca. Quasi stavo per arrendermi, pensando che avrei dovuto inserire le regole del gioco ogni volta che desideravo giocare… ma poi un’illuminazione! Le regole me le può fornire lui, quindi perché non far creare direttamente il prompt a ChatGPT?

E così si concluse questa fantastica e soddisfacente avventura. Il prompt che avevo trovato era esattamente quello che cercavo; bastava cambiare il nome della variante del gioco desiderata e in un attimo eri pronto per giocare a freccette, anche se era la tua prima volta.

# Conclusioni

Nel corso di questo esperimento con ChatGPT, è emerso chiaramente il potenziale trasformativo degli strumenti di intelligenza artificiale. ChatGPT non è solo una novità temporanea; si sta affermando come uno strumento che, nel prossimo futuro, potrebbe diventare altrettanto indispensabile quanto oggi lo sono gli smartphone. La facilità con cui questo sistema può adattarsi e gestire compiti complessi, come la creazione di un menù interattivo per il gioco delle freccette, è solo un assaggio di ciò che potrebbe offrire.

È importante sottolineare, tuttavia, che ChatGPT e simili strumenti di IA sono innanzitutto facilitatori di idee e creatività. Questa tecnologia dovrebbe servire come un catalizzatore per l’ispirazione, non come un sostituto dell’intuizione umana o un risolutore autonomo di problemi. Non possiamo affidarci ciecamente alle risposte fornite dall’IA, poiché essa opera entro i limiti dei dati su cui è stata addestrata e delle direttive che riceve.

Inoltre, proprio come questo articolo è stato scritto con l’ausilio di ChatGPT, l’IA continuerà a svolgere un ruolo sempre più rilevante nella nostra capacità di esprimere, creare e comunicare. L’essenziale è utilizzare queste tecnologie con consapevolezza, valutando criticamente i risultati ottenuti e integrandoli nella nostra capacità di ragionamento e decisione.

Siamo all’alba di una nuova era, dove gli strumenti come ChatGPT promettono di arricchire e ampliare il nostro orizzonte creativo. L’ottimismo per il futuro è giustificato, a patto di mantenere un approccio equilibrato e consapevole, valorizzando il contributo umano insostituibile, mentre abbracciamo le infinite possibilità offerte dall’intelligenza artificiale.