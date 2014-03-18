@html data alias(body) { receiveEvents: true };

/* TODO ITEMS */

#todo-items             :are data | #data ;
.title                  :is data | .data-item h2 ;
.done                   :is data | .data-item span ;

/* CREATION FORM */

form {createOn: button} :graft data | #data {createNew: true};
data | .data-item h2 :is .newItem ;
