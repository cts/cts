@css relative(blah.css);
@js relative(foo.js);
@html theme relative(ted.html);

body | .content :graft theme | .design

theme | .title :is body | h1