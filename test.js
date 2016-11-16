const bf = require('./brainfuck');
const assert = require('assert');

let run = (prog, input) => {
  return bf.compile(prog).run(input);
};


assert.strictEqual(run(
  '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.',
  ''
), 'Hello World!\n', 'Hello World!');

assert.strictEqual(run(
  '>,[->+>,]<[[+<-<]>[>>]>[.[>]>]<<]',
  'sort'
), 'orst', 'sort');
