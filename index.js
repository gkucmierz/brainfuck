
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

var echo = ',[.>,]';

var input = 'echo test'.split('');

var o = function (num) {
  console.log(String.fromCharCode(num), num);
};
var i = function () {
  var ch = input.shift();
  if (ch) {
    // console.log('taken: ' + ch);
    return ch.charCodeAt(0);
  }
  // console.log('end input');
  return 0;
};


var compiled = bf.compile(echo, {memorySize: 256});
compiled(i, o);

