@html madden relative(foo.html);

content | .body                :graft       madden  | .body;

madden | .research            :is          content | .research;

/*
 * Contact Info
 */

madden | .name                :is {a:b}         content | .name;
madden | .jobtitle            :is          content | .jobtitle;
madden | .headshot { attribute: src } :is  content | .headshot { attribute: src };
madden | .contact-info        :is          content | .contact-info;

