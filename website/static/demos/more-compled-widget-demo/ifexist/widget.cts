@html widget relative(widget.html);
@css relative(bizcard.css);

.bizcard :graft widget | #bizcard ;

widget | .line1 :is .biz-name ;

widget | .phone :is .biz-phone ;
widget | .phone-container :if-exist .biz-phone ;

widget | .email :is .biz-email ;

widget | .email-container :if-exist .biz-email ;
