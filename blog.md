---
layout: default
#title: "Blog"
#description: "I nostri articoli"
---

# Blog

{% assign sorted_posts = site.posts | sort: 'publication_date' %}
<div class="post-list row">
  {% for post in sorted_posts %}
    <div class="col-4">
        {% include _components/post_card.html post=post %}
    </div>
  {% endfor %}
</div>




