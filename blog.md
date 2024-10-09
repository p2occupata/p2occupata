---
layout: default
title: "Blog"
description: "I nostri articoli"
---

## I nostri articoli
{% assign sorted_posts = site.posts | sort: 'publication_date' %}
<div class="post-list">
  {% for post in sorted_posts %}
    {% include _components/post_card.html post=post %}
  {% endfor %}
</div>




