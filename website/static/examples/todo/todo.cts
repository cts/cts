@gsheet sheet 0Arj8lnBW4_tZdC1rVlAzQXFhWmFaLU1DY2RsMzVtUkE Todos;

#todo-items             :are sheet | items ;

.title                  :is sheet | .todo ;
.done                   :is sheet | .done ;

form {createOn: button} :is sheet | items {create: true};

---

@gsheet sheet 0Arj8lnBW4_tZdC1rVlAzQXFhWmFaLU1DY2RsMzVtUkE Todos;


with http://www.mit.edu {
  #todo-items             :are  items ;
  .title                  :is  .todo ;
  .done                   :is  .done ;
  form {createOn: button} :is  items {create: true};
}
