---
title: 'Hello, World'
description: "An introduction, of sorts."
date: 2025-09-01
tags: ['self']
---

Scouring [r/webdev](https://www.reddit.com/r/webdev/) for a solution to a problem, I came across [a thread](https://www.reddit.com/r/webdev/comments/1it5p3f) asking, “I want to ‘blog,’ but I think blogging is dead. What is worth investing into?” Awkard phrasing aside, it seemed like an earnst question, and one I had been considering myself. [A reply from one James Rowe](https://www.reddit.com/r/webdev/comments/1it5p3f/comment/mdmbr30/?context=2) caught my attenion:

{% quote "https://www.reddit.com/r/webdev/comments/1it5p3f/comment/mdmbr30/?context=2" %}
Where do you think so many reddit threads come from? thats right. blogs.
If you like producing content. do it. If you're looking for an ROI analysis on blog posts to revenue I don't think you'll find it.
Writing is like shipbuilding, keep launching ships (posts) from your dock. IMO writing on medium, substack, linkedin is giving away your most valuable asset, your thoughts.
As if to prove my point. [A blog I follow](https://simonwillison.net) posted a quote from another blog
 
{% quote "https://interconnected.org/home/2025/02/19/reflections" %}I was telling him how I had so many thoughts floating round my head about some of the things I had learned recently. He suggested that I “write it down”.
I think he’s a hardcore blogger.
He told me he got into blogging in the “early days”. I didn’t know that was a thing. I didn’t know people were so ‘into’ blogging, or wikis. They didn’t seem like special things to me.
But maybe they are!{% endquote %}

Chefs kiss.
PS I guess I should disclose I'm very biased to self hosting 
https://www.jsrowe.com/journaling-why-write/index.html
{% endquote %}

I’ve thought about blogging for years. I do enjoy writing, but I was never sure about what people would care to read. Should I care if they care? I found answer whilst reading [Matt’s post](https://interconnected.org/home/2025/02/19/reflections):

{% quote "https://interconnected.org/home/2025/02/19/reflections" %} Slowly, slowly, the web was taken over by platforms. Your feeling of success is based on your platform’s algorithm, which may not have your interests at heart. Feeding your words to a platform is a vote for its values, whether you like it or not. And they roach-motel you by owning your audience, making you feel that it’s a good trade because you get “discovery.” (Though I know that chasing popularity is a fool’s dream.)
Writing a blog on your own site is a way to escape all of that. Plus your words build up over time. That’s unique. Nobody else values your words like you do.
Blogs are a backwater (the web itself is a backwater) but keeping one is a statement of how being online can work. Blogging as a kind of Amish performance of a better life.
Oh except that it does work as well as those other platforms, if that’s what you want, that’s the magic.{% endquote %}

I decided to make a project out of it. Bought a domain, spent some time getting a VPS configured with Ngnix, a fancy reverse proxy, autorenewing SSL certificates, the whole shebang. Played around with a few CMSs because I didn’t wanna just slap up a crummy ol’ Wordpress site. After all, this is supposed to be a *learning exercise*. Finally settled on [Astro](https://astro.build/), static site generator with some unique features that give this site room to grow, if needed. Spent some more time sussing out Docker containers and the wrapping my head whole “CL/CD” workflow thing. Even resorted to asking an AI for help untangling Github Actions to automatically deploy from my PC to the VPS. And, I wrote my first “Hello, World” post. Hypothetically, you are reading it now.

So, I just needed to *write*. After reading some of [James’ blog posts](https://www.jsrowe.com/who-am-i/), I believe I now know how to begin.
