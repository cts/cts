@gsheet sheet 0Arj8lnBW4_tZdC1rVlAzQXFhWmFaLU1DY2RsMzVtUkE Todos;

ul             :are    sheet | items ;
li span        :is     sheet | .todo ;
.done          :is     sheet | .done ;

form          :graft  sheet | items {createNew: true};
sheet | .todo :is     form input;
