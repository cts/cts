@html widget relative(mockup.html);
@css relative(example.css);

.blog-post       :graft  widget | #post-widget ;

widget | h1      :is    .title ;

widget | section :is    .body ;

widget | ul      :are   .tags ;

widget | li      :is    .tags > span ;
