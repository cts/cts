/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

KeyString             [^\s;:\"\\{\\}]+
QuotedString          \"[^\"]*\"
UnquotedString        [^\";\\{\\}]+
%s                    block
%s                    blockval

%%

\s+                   /* skip whitespace */
":"                   return ':'
";"                   return ';'

/* Beginning a block */
"{"                   {this.begin('block'); return '{';}
"}"                   {this.popState(); return '{';}

/* Inside a Block */
<block>":"              { this.begin('blockval'); return ':';}
<block>{KeyString}      return 'KEYS'

/* Inside a block val */
<blockval>{QuotedString}        return 'QUOTEDS'
<blockval>{UnquotedString}      return 'UNQUOTEDS'
<blockval>";"                   { this.begin('block');  return ';';}

/lex

%start treesheet

%% /* language grammar */

treesheet
    : Block
    ;

Block
    : '{' Keyvalues '}'
    ;

KeyValues
    : KeyValue
    | KeyValue KeyValues
    ;

KeyValue
    : Key ':' Value ';'
    ;

Key
    : QUOTEDS
    | KEYS
    ;

Value
    : QUOTEDS
    | UNQUOTEDS
    ;
