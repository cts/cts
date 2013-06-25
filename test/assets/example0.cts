@html html mockup url(mockup.html);

@css url(http://twitter.github.io/bootstrap/assets/css/bootstrap.css);
@css url(http://twitter.github.io/bootstrap/assets/css/bootstrap-responsive.css);
@css url(mockup.css);

/* Map the page content onto the mockup  
 * 
 * Note that relations are performed in Target <--- Source direction.
 *
 * (Target)                                <----      (Source)
 * Mockup Selectors                       Relation    Content Selectors
 * ------------------------------------   ---------   ------------------
 */

mockup | #catch h1                           is      body > h1;
mockup | #catch h2                           is      body > h2;
mockup | #home_links                         are     #links;
mockup | #home_links a                       is      #links a;
mockup | #articlecontainer                   are     #articles;
mockup | #articlecontainer article header h1 is      #articles article h1;
mockup | #articlecontainer article header h2 is      #articles article h2;
mockup | #articlecontainer article section   is      #articles article section;

/* And then graft the mockup into the current page
 *
 * (Target)                                 <----     (Source)
 * Content Selectors                      Relation    Mockup Selectors
 * ------------------------------------   ---------   ------------------
 */

body                                         graft   mockup | mockup.html;

