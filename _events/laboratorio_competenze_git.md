---
layout: default
title: "Laboratorio delle Competenze - Introduzione a Git"
short_description: "Versionamento del codice e collaborazione"
start_date: 2026-04-15
end_date: 2026-04-22
step: 1
location: "Aula P2.0 Occupata"
description: "Impara a usare Git per gestire il codice e lavorare in team."
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
        15 e 22 aprile 2026, ore 18:30
      </div>

      <div class="meta-box">
        <strong>📍 Luogo</strong><br>
        {{ page.location }}
      </div>

      <div class="meta-box">
        <strong>🎓 Workshop</strong><br>
        Laboratorio delle Competenze
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Introduzione a Git</h2>

    <p>
      Git è uno strumento fondamentale per chi lavora con il codice.
      Permette di tenere traccia delle modifiche, collaborare con altri
      e gestire progetti in modo professionale.
    </p>

    <p>
      In questo workshop, Domenico Violi guiderà i partecipanti
      attraverso le basi di Git, mostrando come utilizzarlo
      nella pratica quotidiana.
    </p>
  </div>

  <div class="section">
    <h2>Cosa vedremo</h2>

    <ul>
      <li>Cos'è Git e perché usarlo</li>
      <li>Creare e gestire repository</li>
      <li>Commit, branch e merge</li>
      <li>Lavorare in team con Git</li>
      <li>Buone pratiche e flussi di lavoro</li>
    </ul>

    <p>
      Un percorso pratico pensato per chi parte da zero
      o vuole consolidare le basi.
    </p>
  </div>

  <div class="section">
    <h2>Relatore</h2>

    <div class="speaker">
      <h3>Domenico Violi</h3>
      <p>
        Sviluppatore e appassionato di tecnologia.
        Si occupa di sviluppo software e strumenti per la collaborazione.
      </p>

      <p>
        Condivide conoscenze pratiche per aiutare altri a crescere nel mondo tech.
      </p>
    </div>
  </div>

  <div class="section">
    <h2>Il Laboratorio delle Competenze</h2>

    <p>
      Questo workshop fa parte del ciclo <strong>Laboratorio delle Competenze</strong>,
      uno spazio aperto dove chiunque può condividere ciò che sa con gli altri.
    </p>

    <p>
      Tecnica, esperienze e strumenti pratici:
      ogni competenza diventa utile quando viene condivisa.
    </p>

    <p>
      La conoscenza cresce quando è condivisa.
    </p>
  </div>

  <div class="cta">
    <p>
      Workshop gratuito e aperto a tutti.
    </p>
  </div>

</div>
