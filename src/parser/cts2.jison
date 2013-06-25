/*
 * LEXICAL SCANNER
 * ================================
 * var parser = require("./cts2-parser.js").parser
 */

%lex

h    			[0-9a-fA-F]
nonascii	[\200-\377]
unicode		\\{h}{1,6}[ \t\r\n\f]?
escape		{unicode}|\\[ -~\200-\377]
nmstart		[a-zA-Z]|{nonascii}|{escape}
nmchar		[a-zA-Z0-9-]|{nonascii}|{escape}
safesym   [-_%$#\[\]\\.=~><]

identchar	{safesym}|{nmchar}
ident		{identchar}+
url			([!#$%&*-~]|{nonascii}|{escape})*
w  			[ \t\r\n\f]*
nl			\n|\r\n|\r|\f

az        [a-zA-Z]
variable  [a-zA-Z][a-zA-Z0-9_]*
cssClause (([#\.]?[a-zA-Z0-9-_][a-zA-Z0-9-_:\.]*){w}("["[^\]]+"]")?)|(>)
cssSel    {cssClause}({w}+{cssClause})*

%%

\/\/.*                                           /* ignore comments */
{w}*"/*"(.|\n|\r)*?"*/"{w}*                      /* ignore multiline comments */
[ \t\r\n\f]+                 {return 'S';}       /* Whitespace */

"@tree"			    			       {return 'TREE_SYM';}
"@css"	     					       {return 'CSS_SYM';}
"@js"     						       {return 'JS_SYM';}
"url("[^\)]*")"              {return 'URI';}
{w}+":"{az}+{w}+             {return "RELATION";}
{variable}{w}"|"{w}          {return "TREE_VAR";}
{cssSel}                     {return "SELECTOR";}
{ident}     	 							 {return 'IDENT';}
.    								         {return yytext;}

/lex

%start treesheet

%%

treesheet
  : header_list relation_list
    %{
      $$ = {
        headers: $1,
        relations: $2
      };
      return $$;
    %}
  | relation_list
    %{
      $$ = {
        relations: $1
      };
      return $$;
    %}
  | header_list 
    %{
      $$ = {
        headers: $1
      };
      return $$;
    %}
  ;

header_list
  : header_item
    %{
      $$ = [];
      if ($1 !== null)
        $$.push($1);
    %}
  | header_list header_item
    %{
      $$ = $1;
      if ($2 !== null)
        $$.push($2);
    %}
  ;

header_item
  : tree_item
  | css_item
  | js_item
  ;

tree_item
  : TREE_SYM S SELECTOR S SELECTOR S URI ';' wempty
    %{
      $$ = ['tree', $3, $5, $7];
    %}
  ;

css_item
  : CSS_SYM S URI ';' wempty
    %{
      $$ = ['css', $3];
    %}
  ;

js_item
  : JS_SYM S URI ';' wempty
    %{
      $$ = ['js', $3];
    %}
  ;

relation_list
  : relation_item
    %{
      $$ = [];
      if ($1 !== null)
        $$.push($1);
    %}
  | relation_list relation_item
    ${
      $$ = $1;
      if ($2 !== null)
        $$.push($2);
    $}
  ;

relation_item
  : selector relator selector ';' wempty
    %{
      $$ = [$1, $2, $3];
    %}
  ;

selector
  : SELECTOR 
    %{
      $$ = {
        selectorString: $1
      };
    %}
  | TREE_VAR wempty SELECTOR 
    %{
      $1 = $1.trim();
      $$ = {
        treeName: $1.substring(0, $1.length - 1),
        selectorString: $3
      };
    %}
  | SELECTOR props
    %{
      $$ = {
        selectorString: $1,
        props: $3
      };
    %}
  | TREE_VAR wempty SELECTOR props
    %{
      $1 = $1.trim();
      $$ = {
        treeName: $1.substring(0, $1.length - 1),
        selectorString: $3,
        props: $5
      };
    %}
  ;

relator
  : RELATION props
    %{
      $$ = {
        name: $1.substring(1).trim(),
        props: $3
      };
    %}
  | RELATION 
    %{
      $$ = {
        name: $1.substring(1).trim()
      };
    %}
  ;
/*
selectorstring
  : IDENT wempty
    %{
      $$ = $1;
    %}
  | IDENT wempty selectorstring 
    %{
      $$ = $1;
      if ($3 != null) {
        $$ = $1 + " " + $3;
      }
    %}
  ;
*/

props
  : '{' wempty proplist '}' wempty -> $3
  ;

proplist
  : SELECTOR -> $1
  ;

whitespace
  : S -> ' '
  | whitespace S -> ' '
  ;

wempty
  : whitespace -> $1
  | -> ""
  ;

