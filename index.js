
var bf = require('./brainfuck.js');

var helloWorld = `brainfuck hello world wikipedia:
++++++++++
[
>+++++++>++++++++++>+++>+<<<<-
] Na początek ustawiamy kilka przydatnych później wartości
>++.               drukuje 'H'
>+.                drukuje 'e'
+++++++.           drukuje 'l'
.                  drukuje 'l'
+++.               drukuje 'o'
>++.               spacja
<<+++++++++++++++. drukuje 'W'
>.                 drukuje 'o'
+++.               drukuje 'r'
------.            drukuje 'l'
--------.          drukuje 'd'
>+.                drukuje '!'
>.                 nowa linia
`;

var m = new Uint8Array(256);
var p = 0;
var o = function (num) {
  console.log(String.fromCharCode(num), num);
};

var bfJS = bf.toJS(helloWorld);
console.log(bfJS);

eval(bfJS);