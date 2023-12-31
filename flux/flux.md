---
layout: page
title: Flux
comment: false
skipfeed: true
date: 2023-05-06 11:45
---

<dl id="fluxlist">
{% for cat in search.values("flux") | sort %}
<div><dt>{{ cat }}</dt>
{% for art in search.pages("flux*=" + cat, "title") %}
<dd><a href="{{ art.url }}">{{ art.title }}</a></dd>
{% endfor %}
</div>
{% endfor %}

<hr>

</dl>

A digital garden is a collection of notes, post, comments. There are several good explanations
of it like [maggie's](https://maggieappleton.com/garden-history) and [how the blog broke the web](https://stackingthebricks.com/how-blogs-broke-the-web/).
