@html blog-post-widget relative(poll.html);

.blog-post                   :graft      blog-post-widget | #blog-post-widget ;

blog-post-widget | h1        :is          .blog-post .title  ;
blog-post-widget | section   :is         .blog-post .body  ;

blog-post-widget | ul   :are         .blog-post .tags  ;
blog-post-widget | li   :is         .blog-post .tag  ;
