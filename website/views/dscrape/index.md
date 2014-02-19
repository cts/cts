---
layout: page
title: DScrape
subtitle: "Simple declarative web scraping"
group: primary
section: dscrape
---
{% include JB/setup %}

<p align="center">
  <img src="/images/dscrape-twitter-example.png" alt="DScrape Example" />
</p>

DScrape is a declarative web scraping toolkit based on Cascading Tree Sheets.
Given a tree sheet that maps a web page onto an implicit JSON structure,
DScrape will produce that structure for you and output it in a variety of
formats.

<div class="row" style="margin-top: 20px; margin-bottom:20px">
  <div class="span8 well">
    <div class="row">
  <div class="span4">
    <h3>Installing</h3>
    <p><i>Install DScrape using the <a href="http://npmjs.org/">Node Package Manager</a></i>:</p>
    <code style="margin-left: 15px">npm install dscrape</code>
  </div>
  <div class="span4">
    <h3>Contribute</h3>
    <a href="http://github.com/cts/dscrape" class="btn btn-success">DScrape on GitHub</a>
  </div>
</div></div></div>

# Using DScrape with a Registered Tree Sheet

The [DScrape GitHub repository](http://www.github.com/cts/dscrape) maintains a
list of pre-written tree sheets you can use for scraping. If you only provide a
URL to DScrape (and no tree sheet), it will search this scraper repository for
a URL match and use the pre-written scraper if available.

Here's a list of scrapers already written for you to use along with example
invocations. Please consider <a href="#contribute">contributing your own</a>!

* **Reddit** (and subreddits) article listings ([scraper link](https://github.com/cts/dscrape/blob/master/examples/reddit.cts))
    
     <pre>dscrape http://www.reddit.com</pre>

* **Kickstarter** project pages ([scraper link](https://github.com/cts/dscrape/blob/master/examples/kickstarter.cts))

     <pre>dscrape http://www.kickstarter.com/projects/1068932801/new-york-london</pre>

* **Twitter** profile and latest tweets ([scraper link](https://github.com/cts/dscrape/blob/master/examples/twitter-profile.cts))

     <pre>dscrape http://www.twitter.com/edwardbenson</pre>

# Using DScrape with your own Tree Sheet

To use DScrape with your own tree sheet, provide a reference to the tree sheet
after the URL. This reference can either be:

* **A file on your local drive**

    <pre>dscrape http://www.reddit.com ~/treesheets/reddit.cts</pre>

* **A URL**

    <pre>dscrape http://www.reddit.com http://example.org/reddit.cts</pre>

* **A GitHub URL**. DScrape supports a special shorthand for files hosted in GitHub. Create a URL of the form `github://user/repository/path/to/file`, such as:

    <pre>dscrape http://www.reddit.com github://cts/dscrape/examples/reddit.cts</pre>

# <a id="contribute"> </a> Contributing a Scraper

To contribute a scraper to our repository, fork it on GitHub and add your tree
sheet to the `/examples` folder. You will also need to add an entry for your
scraper in the `/examples/directory.json` file. Then submit a pull request and
we will review and incorporate it.

<script>
$(function() {
  SelectPage("PageScraping");
});
</script>
