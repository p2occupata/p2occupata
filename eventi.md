---
layout: default
title: "Eventi"
description: "Cosa facciamo"
---

{% assign today = 'now' | date: "%Y-%m-%d" %}

{% assign next_events = site.events | sort: 'date' %}
{% for event in next_events %} 
  {% assign event_date = event.date | date: "%Y-%m-%d" %}
  {% if event_date >= today %}
# Prossimo evento
  <div>
      {% include _components/next_event_card.html event=event %}
  </div>
  {% break %}
  {% endif %}
{% endfor %}

## Timeline eventi
{% assign sorted_events = site.events | sort: 'date' | reverse %}
<div class="timeline">
{% for event in sorted_events %}
  {% assign event_date = event.date | date: "%Y-%m-%d" %}
  {% if event_date >= today %}
    {% include _components/event_card.html event=event %}
  {% else %}
    {% include _components/event_card.html event=event %}
  {% endif %}
{% endfor %}
</div>