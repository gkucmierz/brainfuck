
var bf = require('./brainfuck.js');

var programs = [
  {
    name: 'helloWorld',
    body: `brainfuck hello world wikipedia:
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
`,
  },
  {
    name: 'echo',
    body: ',[.>,]',
    input: 'echo test'
  },
  {
    name: 'double',
    body: ',[..>,]',
    input: 'double characters test'
  },
  {
    name: 'infinite',
    body: '+[>-<]'
  }
];

bf.config({
  memorySize: 256,
  maxInstructions: 1e4
});

programs.map(function (program) {
  console.log('program name: ', program.name);
  console.log(' - input: ', program.input);
  console.log(' - result: ', bf.compile(program.body).run(program.input));
  console.log(' - compiled js: ', bf.compile(program.body)+'');
});
