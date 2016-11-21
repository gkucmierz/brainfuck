
var brainfuckCompiler = (function (module){
'use strict';

var orders = ',.[]<>+-'.split('');
var regex = {
  clean: new RegExp('[^' + escapeRegExp(orders.join('')) + ']', 'g'),
  value: /[\+\-]+/g,
  pointer: /[\<\>]+/g,
  instruction: /[0-9]*./g
};

var config = {
  memorySize: 30000,
  bits: 8, // 8, 16, 32
  maxInstructions: 0 // limit execution to number of instructions, omit if 0
};

function getInstruction(count, orderLess, orderMore) {
  return {
    '1': count > 1 ? count + orderMore : orderMore,
    '0': '',
    '-1': count < -1 ? -count + orderLess : orderLess
  }[Math.sign(count)];
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function cloneObj(obj) {
  return Object.keys(obj).reduce(function (res, key) {
    return res[key] = obj[key], res;
  }, {});
}

function extendObj(obj, ext) {
  return Object.keys(ext || {}).reduce(function (res, key) {
    return res[key] = ext[key], res;
  }, obj);
}

module.exports.config = function (userConfig) {
  if (typeof userConfig === 'undefined') {
    return cloneObj(config);
  }
  extendObj(config, userConfig);
};

module.exports.compile = function (bfSource, userConfig) {
  var actualConfig = extendObj(cloneObj(config), userConfig);
  var cleanedSource = (bfSource + '').replace(regex.clean, '');
  var optimized = cleanedSource
  // add (z)ero instruction => it makes reseting cell much faster
  .replace(/\[\-\]/g, 'z')
  // optimze cell manipulating instructions
  // for example: '+++--' => '+'
  //              '+++++' => '5+'
  .replace(regex.value, function (m) {
    var map = { '+': 1, '-': -1 };
    var n = m.split('').reduce(function (acc, b) {
      return acc + map[b];
    }, 0);
    return getInstruction(n, '-', '+');
  })
  // optimze pointer manipulating instructions
  // for example: '>>><<' => '>'
  //              '>>>>>' => '5>'
  .replace(regex.pointer, function (m) {
    var map = { '>': 1, '<': -1 };
    var n = m.split('').reduce(function (acc, b) {
      return acc + map[b];
    }, 0);
    return getInstruction(n, '<', '>');
  });

  var ordersMap = { // m,p,o,i,l
    ',': function _() {
      return 'm[p]=i();';
    },
    '.': function _() {
      return 'o(m[p]);';
    },
    '[': function _() {
      return 'while(m[p]){';
    },
    ']': function _() {
      return '}';
    },
    '<': function _(count) {
      return 'p-=' + count + ';while(p<0)p+=l;';
    },
    '>': function _(count) {
      return 'p+=' + count + ';while(p>=l)p-=l;';
    },
    '+': function _(count) {
      return 'm[p]+=' + count + ';';
    },
    '-': function _(count) {
      return 'm[p]-=' + count + ';';
    },
    // optimizations:
    'z': function z() {
      return 'm[p]=0;';
    } // [-] => quick reset memory cell
  };

  var createOrder = function createOrder(order, count) {
    // if there is a instruction limit, add prefix check-instruction to every instruction
    var prefix = actualConfig.maxInstructions > 0 ? 'if(!--c)return;' : '';
    return [prefix, ordersMap[order](count)].join('');
  };

  var definitions = {
    // count
    c: function c(config) {
      return config.maxInstructions > 0 ? 'let c=' + config.maxInstructions + ';' : '';
    },
    // length
    l: function l(config) {
      return ['let l=', config.memorySize, ';'].join('');
    },
    // memory
    m: function m(config) {
      var constr = { '8': 'Uint8Array', '16': 'Uint16Array', '32': 'Uint32Array' };
      return ['let m=new ', constr[config.bits] || constr[8], '(l);'].join('');
    },
    // pointer
    p: function p() {
      return 'let p=0;';
    },
    // out
    o: function o() {
      return 'let o=output||(()=>0);';
    },
    // in
    i: function i() {
      return 'let i=input||(()=>0);';
    }
  };

  // create variables definitions
  var code = Object.keys(definitions).map(function (key) {
    return definitions[key](actualConfig);
  });

  // create rest code
  (optimized.match(regex.instruction) || []).map(function (instruction) {
    var count = +instruction.slice(0, -1) || 1;
    var order = instruction.slice(-1);
    code.push(createOrder(order, count));
  });

  var compiled = new Function(['input', 'output'], code.join(''));

  return {
    run: function run(input, output) {
      var inp = void 0,
          out = void 0;
      var res = [];
      if (typeof input === 'string') {
        input = input.split('');
        inp = function inp() {
          var ch = input.shift();
          return ch ? ch.charCodeAt(0) : 0;
        };
      } else if (typeof input === 'function') {
        inp = input;
      }
      if (typeof output !== 'function') {
        output = function output() {
          return 0;
        };
      }
      out = function out(num) {
        var ch = String.fromCharCode(num);
        output(num, ch);
        res.push(ch);
      };
      compiled(inp, out);
      return res.join('');
    },
    toString: function toString() {
      return compiled.toString();
    }
  };
};
  return module.exports;
})({exports: {}});
