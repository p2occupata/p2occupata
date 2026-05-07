---
layout: default
title: "Laboratorio delle Competenze - Scopri Docker"
short_description: "Introduzione a Docker e ai container"
start_date: 2026-05-14
step: 10
end_date: 2026-05-21
location: "Aula P2.0 Occupata"
description: "Due incontri per scoprire Docker, i container e il loro utilizzo nello sviluppo software moderno."
---

<style>
.event-container{
  max-width: 900px;
  margin: 60px auto;
  padding: 0 20px;
}

.event-header{
  margin-bottom: 40px;
}

.event-title{
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.event-subtitle{
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.event-meta{
  display:flex;
  flex-wrap:wrap;
  gap:20px;
  margin-top:20px;
  margin-bottom:40px;
}

.meta-box{
  padding:14px 18px;
  border:1px solid #ddd;
  border-radius:8px;
  font-size:0.95rem;
}

.section{
  margin-top:50px;
}

.section h2{
  font-size:1.6rem;
  margin-bottom:15px;
}

.section p{
  font-size:1.05rem;
  line-height:1.6;
  margin-bottom:18px;
}

.section ul{
  margin-top:10px;
  padding-left:20px;
}

.section li{
  margin-bottom:8px;
}

.speaker{
  margin-top:20px;
  padding:20px;
  border:1px solid #e5e5e5;
  border-radius:10px;
}

.speaker h3{
  font-size:1.2rem;
  margin-bottom:6px;
}

.cta{
  margin-top:50px;
  padding:25px;
  border:1px solid #ddd;
  border-radius:10px;
  text-align:center;
}

.cta p{
  font-size:1.1rem;
  margin:0;
}
</style>

<div class="event-container">

  <div class="event-header">
    <h1 class="event-title">{{ page.title }}</h1>
    <p class="event-subtitle">{{ page.description }}</p>

    <div class="event-meta">
      <div class="meta-box">
        <strong>📅 Date</strong><br>
        14 e 21 maggio 2026, ore 18:30
      </div>

      <div class="meta-box">
        <strong>📍 Luogo</strong><br>
        {{ page.location }}
      </div>

      <div class="meta-box">
        <strong>🐳 Workshop</strong><br>
        Introduzione a Docker
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Scopri Docker</h2>

    <p>
      Docker è uno degli strumenti più utilizzati
      nello sviluppo software moderno per creare,
      distribuire ed eseguire applicazioni in ambienti isolati e portabili.
    </p>

    <p>
      Questo workshop introduttivo è pensato per chi vuole capire
      cosa sono i container, come funzionano
      e perché Docker è diventato fondamentale
      nel mondo dello sviluppo e del cloud computing.
    </p>

    <p>
      Attraverso esempi pratici e spiegazioni accessibili,
      esploreremo le basi di Docker
      e il suo utilizzo in contesti reali.
    </p>
  </div>

  <div class="section">
    <h2>Cosa vedremo</h2>

    <ul>
      <li>Cos’è Docker e a cosa serve</li>
      <li>Differenza tra container e macchine virtuali</li>
      <li>Installazione e primi comandi</li>
      <li>Creazione ed esecuzione di container</li>
      <li>Gestione delle immagini Docker</li>
      <li>Utilizzo pratico nello sviluppo software</li>
      <li>Introduzione a Docker Compose</li>
    </ul>

    <p>
      Il workshop sarà aperto anche a chi parte da zero
      e vuole avvicinarsi per la prima volta a questi strumenti.
    </p>
  </div>

  <div class="section">
    <h2>Relatore</h2>

    <div class="speaker">
      <h3>Giovanni Burza</h3>

      <p>
        Solution Architect di NTT Data,
        si occupa di infrastrutture software,
        architetture cloud e tecnologie containerizzate.
      </p>

      <p>
        Durante il workshop condividerà strumenti,
        esempi pratici ed esperienze maturate
        nel mondo dello sviluppo e dell’enterprise software.
      </p>
    </div>
  </div>

  <div class="section">
    <h2>Il Laboratorio delle Competenze</h2>

    <p>
      Questo workshop fa parte del ciclo
      <strong>Laboratorio delle Competenze</strong>,
      uno spazio aperto dove chiunque può condividere
      conoscenze, esperienze e strumenti con gli altri.
    </p>

    <p>
      Tecnologia, creatività, esperienze e percorsi personali:
      ogni competenza ha valore quando viene condivisa.
    </p>

    <p>
      La conoscenza cresce quando circola.
    </p>
  </div>

  <div class="section">
    <h2>L'aula P2.0</h2>

    <p>
      L’evento si terrà nell’Aula P2.0 Occupata,
      spazio libero, autogestito e aperto a chiunque
      all’interno dell’Università della Calabria.
    </p>

    <p>
      Un luogo nato dalla partecipazione studentesca,
      dedicato alla condivisione,
      alla cultura e alla socialità.
    </p>
  </div>

  <div class="cta">
    <p>
      Workshop gratuito e aperto a tutti.
    </p>
  </div>

</div>
