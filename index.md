---
layout: default
title: "Benvenuti"
description: "Ecco le novità"
---

# Articoli recenti

{% assign sorted_posts = site.posts | sort: 'publication_date' | limit: 2 %}
<div class="post-list mb-5">
  {% for post in sorted_posts %}
    {% include _components/post_card.html post=post %}
  {% endfor %}
</div>

# Eventi in programma
{% assign today = 'now' | date: "%Y-%m-%d" %}

{% assign next_events = site.events | sort: 'date' %}
{% for event in next_events %}
{% assign event_date = event.date | date: "%Y-%m-%d" %}
{% if event_date >= today %}
## Prossimo evento
  <div>
      {% include _components/next_event_card.html event=event %}
  </div>
  {% break %}
  {% endif %}
{% endfor %}

## Altri eventi organizzati
{% assign sorted_events = site.events | sort: 'date' | reverse %}
<div class="timeline">
{% for event in sorted_events %}
  {% assign event_date = event.date | date: "%Y-%m-%d" %}
  {% if event_date >= today %}
    {% include _components/event_card.html event=event %}
  {% else %}
    {% break %}
  {% endif %}
{% endfor %}
</div>
# Rimani in contatto

Ci piacerebbe conoscere la tua opinione! Seguici sui nostri [canali]({{ site.baseurl }}/contatti).