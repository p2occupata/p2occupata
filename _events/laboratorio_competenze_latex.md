
---
layout: default
title: "Laboratorio delle Competenze - LaTeX"
short_description: "Workshop su LaTeX"
start_date: 2026-11-03
step: 7
end_date: 2026-18-03
location: "Aula P2.0 Occupata"
description: "LaTeX, lo strumento usato per creare documenti puliti, ordinati e professionali."
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
        <strong>📅 Data</strong><br>
        {{ page.start_date }}
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
    <h2>Cos’è LaTeX</h2>

    <p>
      LaTeX è uno strumento utilizzato in università e nel mondo della ricerca per creare
      documenti strutturati, precisi e tipograficamente eleganti.
    </p>

    <p>
      A differenza dei normali editor di testo, permette di concentrarsi sul contenuto
      mentre il sistema si occupa automaticamente della formattazione.
      Il risultato sono documenti puliti, leggibili e professionali.
    </p>
  </div>

  <div class="section">
    <h2>Cosa impareremo</h2>

    <ul>
      <li>Creare il primo documento LaTeX</li>
      <li>Strutturare correttamente un testo</li>
      <li>Inserire formule matematiche</li>
      <li>Aggiungere immagini e riferimenti</li>
      <li>Gestire bibliografie in modo automatico</li>
      <li>Generare PDF di alta qualità</li>
    </ul>

    <p>
      Il workshop parte dalle basi e non richiede esperienza tecnica.
    </p>
  </div>

  <div class="section">
    <h2>Relatrice</h2>

    <div class="speaker">
      <h3>Giusy Varano</h3>
      <p>
        PhD Student in Fisica. Utilizza LaTeX quotidianamente
        per la scrittura scientifica e la produzione di documenti accademici.
      </p>

      <p>
        Profilo LinkedIn:
        <a href="https://www.linkedin.com/in/giusy-varano/" target="_blank">
          linkedin.com/in/giusy-varano
        </a>
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
      Tecnica, arte, scrittura, strumenti digitali, manualità:
      ogni sapere ha valore quando viene messo in circolo.
    </p>

    <p>
      La conoscenza cresce quando è condivisa.
    </p>
  </div>

  <div class="cta">
    <p>
      Workshop gratuito e aperto a tuttə.
      Porta il tuo computer se vuoi provare direttamente.
    </p>
  </div>

</div>
