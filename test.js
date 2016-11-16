const bf = require('./brainfuck');
const assert = require('assert');

let prog = '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.';

let compiled = bf.compile(prog);

// only one test, but for the time being its ok
assert.strictEqual(compiled.run(''), 'Hello World!\n', 'Test Failed');
