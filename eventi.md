---
layout: default
title: "Eventi"
description: "Cosa facciamo"
---

# Eventi Organizzati da P2.0 Occupata

{% assign events = site.events | sort: 'date' %}

<ul>
{% for event in events %}
  {% include _components/event_card.html event=event %}
{% endfor %}
</ul>
