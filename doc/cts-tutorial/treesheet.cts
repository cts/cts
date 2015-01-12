@html theme relative(theme.html);
@css http://getbootstrap.com/dist/css/bootstrap.min.css;

/* THEME INVOCATION */
.cts-post  :graft theme | #cts-post;

/* THEME DETAILS */
theme | .cts-title :is    .cts-title;
theme | .cts-body  :is    .cts-body;

theme | .cts-tags  :are   .cts-tags;
theme | .cts-tag-text :is .cts-tag-text;

theme | .cts-tag-link {"attribute": "href"} :is .cts-tag-link {"attribute": "href"} ;
