/*
 * LEXICAL SCANNER
 * ================================
 * var parser = require("./cts2-parser.js").parser
 */

%lex

h			[0-9a-fA-F]
nonascii	[\200-\377]
unicode		\\{h}{1,6}[ \t\r\n\f]?
escape		{unicode}|\\[ -~\200-\377]
nmstart		[a-zA-Z]|{nonascii}|{escape}
nmchar		[a-zA-Z0-9-]|{nonascii}|{escape}
string1		\"([\t !#$%&(-~]|\\{nl}|\'|{nonascii}|{escape})*\"
string2		\'([\t !#$%&(-~]|\\{nl}|\"|{nonascii}|{escape})*\'

identchar	[_]|{nmchar}
ident		[-]?{nmstart}{identchar}*
name		{identchar}+
num			([0-9]+(\.[0-9]+)?)|(\.[0-9]+)
string		{string1}|{string2}
url			([!#$%&*-~]|{nonascii}|{escape})*
w			[ \t\r\n\f]*
nl			\n|\r\n|\r|\f
range		\?{1,6}|{h}(\?{0,5}|{h}(\?{0,4}|{h}(\?{0,3}|{h}(\?{0,2}|{h}(\??|{h})))))

/*
h                     [0-9a-fA-F]
nonascii              [\200-\377]
unicode               \\{h}{1,6}[ \t\r\n\f]?
alpha                 [a-zA-Z_-]+
escape                {unicode}|\\[ -~\200-\377]
nl                    \n|\r\n|\r|\f
string                {alpha}
uri             
*/

%%


[ \t\r\n\f]+						{return 'S';}
\/\*[^*]*\*+([^/][^*]*\*+)*\/		{}								/* ignore comment */

"<!--"								{return 'CDO';}					/* comment delimiter open */
"-->"								{return 'CDC';}					/* comment delimiter close */
"~="								{return 'INCLUDES';}			/* includes */
"|="								{return 'DASHMATCH';}			/* dash match */
"^="								{return 'PREFIXMATCH';}			/* prefix match */
"$="								{return 'SUFFIXMATCH';}			/* suffix match */
"*="								{return 'SUBSTRINGMATCH';}		/* substring match */

"!"{w}"important"					{return 'IMPORTANT_SYM';}

"url("{w}{string}{w}")"				{return 'URI';}
"url("{w}{url}{w}")"				{return 'URI';}
{ident}"("							{return "FUNCTION";}
{ident}{w}"|"           {return "TREE_VAR";}

{keyframes}							{return 'KEYFRAMES';}

{string}							{return 'STRING';}
{ident}								{return 'IDENT';}

"#"{name}							{return 'HASH';}

"@import"							{return 'IMPORT_SYM';}
"@page"								{return 'PAGE_SYM';}
"@media"							{return 'MEDIA_SYM';}
"@font-face"						{return 'FONT_FACE_SYM';}
"@charset"							{return 'CHARSET_SYM';}
"@namespace"						{return 'NAMESPACE_SYM';}
"@tree"						{return 'TREE_SYM';}

U\+{range}							{return 'UNICODERANGE';}
U\+{h}{1,6}-{h}{1,6}				{return 'UNICODERANGE';}

.									{return yytext;}

/lex

%start treesheet

%%

treesheet
  : tree_list relation_list
    %{
      $$ = {};
      if ($1)
        $$["trees"] = $1;
      if ($2)
        $$["relations"] = $2;
      return $$;
    %}
  ;

tree_list
  : tree_item
    %{
      $$ = [];
      if ($1 !== null)
        $$.push($1);
    %}
  | tree_list tree_item
    %{
      $$ = $1;
      if ($2 !== null)
        $$.push($2);
    %}
  | -> null
  ;

tree_item
  : tree_ref -> $1
  | space_cdata_list
  ;

tree_ref
  : TREE_SYM wempty IDENT whitespace IDENT whitespace string_or_uri ';' wempty
    %{
      $$ = [$3, $5, $7];
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
  : selector whitespace relator wempty selector wempty ';' wempty
    %{
      $$ = [$1, $3, $5];
    %}
  ;

selector
  : selectorstring wempty props 
    %{
      $$ = {
        selectorString: $1,
        props: $3
      };
    %}
  | TREE_VAR wempty selectorstring wempty props
    %{
      $$ = {
        treeName: $1,
        selectorString: $3,
        props: $5
      };
    %}
  | selectorstring wempty
    %{
      $$ = {
        selectorString: $1
      };
    %}
  | TREE_VAR wempty selectorstring wempty
    %{
      $$ = {
        treeName: $1,
        selectorString: $3
      };
    %}
  ;

treevar
  : TREE_VAR wempty -> $1
  | wempty -> ""
  ;

relator
  : relatorstring wempty props
    %{
      $$ = {
        name: $1,
        props: $3
      };
    %}
  | relatorstring wempty
    %{
      $$ = {
        name: $1
      };
    %}
  ;

maybetreeprefix
  : TREE_VAR -> $1
  | -> null
  ;

selectorstring
  : IDENT -> $1
  ;

relatorstring
  : IDENT -> $1
  ;

props
  : '{' wempty proplist '}' -> $3
  ;

proplist
  : IDENT -> $1
  ;

space_cdata_list
  : space_cdata                    -> null
  | space_cdata_list space_cdata   -> null
  |
  ;

space_cdata
  : S       -> null
  | CDO     -> null
  | CDC     -> null
  ;

whitespace
  : S -> ' '
  | whitespace S -> ' '
  ;

wempty
  : whitespace -> $1
  | -> ""
  ;

string_or_uri
  : STRING wempty -> $1
  | URI wempty -> $1
  ;

