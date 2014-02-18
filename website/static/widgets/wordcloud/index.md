---
layout: page
title: Word Cloud Widget
tagline:
---
{% include JB/setup %}

<img class="widget-banner" src="banner.png" />

<p class="intro">The Word Cloud Widget helps you turn text into a wordcloud.</p>

<p class="intro"><a href="example.html">View the completed example</a></p>

## 1. Link to the library

Add the CTS library, D3 library, and widget link to your web page:

    <script type="text/javascript" src="http://d3js.org/d3.v2.js"></script>
    <script type="text/javascript" src="http://www.treesheets.org/hotlink/cts.js"></script>
    <script type="text/javascript" src="http://www.jasondavies.com/wordcloud/d3.layout.cloud.js"></script>
    <script type="text/cts" src="http://people.csail.mit.edu/eob/cts/widgets/word-cloud.cts"></script>

These should be added to the `HEAD` element if possible.

## 2. Write some text to turn into a word cloud.

The Word Cloud works manually: you tell it what words you want to be big,
small, and medium sized and what color you want each size bucket to be.

    <div class="wordcloud">
      <div class ="medium">
        <div class="medium-color">reds</div>
        <div class="medium-words">
          All these words will be medium sized.
        </div>
      </div>
    </div>

The color scheme can be `greens`, `reds`, `blues`, `purples`, `yellows` or
omitted completely, in which case we'll default to a primary-color based
scheme.

## 3. That's it!

When you render the page, you'll your text appear as a word cloud. See the
[example page](example.html) for a more involved example with small, medium,
and large buckets.

### Credits

Sarah Scodel, with thanks to the [D3 Word Cloud Demo](http://www.jasondavies.com/wordcloud).

<script>
$(function() {
  SelectPage("PageWidgets", "PageWidgetsWordcloud");
});
</script>
