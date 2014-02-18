---
layout: page
title: Bar Chart Widget
tagline:
---
{% include JB/setup %}

<img class="widget-banner" src="banner.png" />

<p class="intro">The Bar Chart Widget transforms an ordinary HTML table into a
<a href="http://d3js.org/">D3-powered</a> bar chart.</p>

<p class="intro"><a href="example.html">View the completed example</a></p>


<div class="wordcloud">
All of this text will become the wordcloud source.
</div>




## 1. Link to the library

Add the CTS library, D3 library, and widget link to your web page:

    <script type="text/javascript" src="http://d3js.org/d3.v2.js"></script>
    <script type="text/javascript" src="http://www.treesheets.org/hotlink/cts.js"></script>
    <script type="text/cts" src="http://people.csail.mit.edu/eob/cts/widgets/barchart.cts"></script>

It's best to add this to the `HEAD` element, but anywhere will work.

## 2. Write your Chart Data

Next, pick the place you want the map to actually appear on your page and paste
in the following HTML: 

    <div class="barchart">
       <table class="series">
         <tr>
           <td>Values</td>
           <td>5</td>
           <td>10</td>
           <td>15</td>
         </tr>
       </table>
     </div>

The `barchart` class tells the chart widget that you'd like that table turned
into a chart. When you render your page, you should see the following:

![Bar Chart Example](example1.png)

## 3. Customize the Chart

TODO

### Credits

Thanks to the [Bar Chart
Demo](http://mbostock.github.com/d3/tutorial/bar-1.html) on the D3 website 

<script>
$(function() {
  SelectPage("PageWidgets", "PageWidgetsBarchart");
});
</script>
