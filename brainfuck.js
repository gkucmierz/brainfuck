
let _ = require('lodash-node');

let orders = ',.[]<>+-'.split('');
let regex = {
  clean: new RegExp('[^' + escapeRegExp(orders.join('')) + ']', 'g'),
  value: /[\+\-]+/g,
  pointer: /[\<\>]+/g,
  instruction: /[0-9]*./g
};

let config = {
  memorySize: 30000,
  bits: 8, // 8, 16, 32
  maxInstructions: 0 // limit execution to number of instructions, omit if 0
};

module.exports.config = function (userConfig) {
  if (_.isUndefined(userConfig)) {
    return _.clone(config);
  }
  _.extend(config, userConfig);
};

let getInstruction = function (count, orderLess, orderMore) {
  return ({
    '1': (count > 1) ? count + orderMore : orderMore,
    '0': '',
    '-1': (count < -1) ? (-count) + orderLess : orderLess
  })[Math.sign(count)];
};

module.exports.compile = function (bfSource, userConfig) {
  let actualConfig = _.extend(_.clone(config), userConfig);
  let cleanedSource = (bfSource+'').replace(regex.clean, '');
  let optimized = cleanedSource
    .replace(regex.value, function (m) {
      let map = { '+': 1, '-': -1 };
      let n = m.split('').reduce(function (acc, b) {
        return acc + map[b];
      }, 0);
      return getInstruction(n, '-', '+');
    })
    .replace(regex.pointer, function (m) {
      let map = { '>': 1, '<': -1 };
      let n = m.split('').reduce(function (acc, b) {
        return acc + map[b];
      }, 0);
      return getInstruction(n, '<', '>');
    })
  ;
  
  // let ordersMap = { // m,p,o,i,l
  //   ',': 'm[p]=i();',
  //   '.': 'o(m[p]);',
  //   '[': 'while(m[p]){',
  //   ']': '}',
  //   '<': 'if(--p<0)p=l;',
  //   '>': 'if(++p>=l)p=0;',
  //   '+': '++m[p];',
  //   '-': '--m[p];'
  // };
  let ordersMap = { // m,p,o,i,l
    ',': function () { return 'm[p]=i();'; },
    '.': function () { return 'o(m[p]);'; },
    '[': function () { return 'while(m[p]){'; },
    ']': function () { return '}'; },
    '<': function (count) { return 'p-='+count+';while(p<0)p+=l;'; },
    '>': function (count) { return 'p+='+count+';while(p>=l)p-=l;'; },
    '+': function (count) { return 'm[p]+='+count+';'; },
    '-': function (count) { return 'm[p]-='+count+';'; }
  };
  let createOrder = function (order, count) {
    let prefix = actualConfig.maxInstructions > 0 ? [
      'if(!--c)return;'
    ].join('') : '';
    return [prefix, ordersMap[order](count)].join('');
  };
  let definitions = {
    // count
    c: function (config) {
      return config.maxInstructions > 0 ? 'let c='+config.maxInstructions+';' : '';
    },
    // length
    l: function (config) {
      return ['let l=',config.memorySize,';'].join('');
    },
    // memory
    m: function (config) {
      let memConstructors = {
        '8': 'Uint8Array',
        '16': 'Uint16Array',
        '32': 'Uint32Array'
      };
      let constructorName = memConstructors[config.bits] || memConstructors[8];
      return ['let m=new ',constructorName,'(l);'].join('');
    },
    // pointer
    p: function () {
      return 'let p=0;';
    },
    // out
    o: function () {
      return 'let o=output||function(){};';
    },
    // in
    i: function () {
      return 'let i=input||function(){return 0;};';
    }
  };
  let arguments = ['input', 'output'];

  let code = [];
  _.each(definitions, function (evaluate) {
    code.push(evaluate(actualConfig));
  });

  // cleanedSource.split('').map(function (order) {
  //   code.push(ordersMap[order]);
  // });

  (optimized.match(regex.instruction) || []).map(function (instruction) {
    let count = +instruction.substr(0, instruction.length - 1) || 1;
    let order = instruction.substr(-1);
    code.push(createOrder(order, count));
  });

  let compiled = new Function(arguments, code.join(''));
  return {
    run: function (input, output) {
      let inp, out;
      let res = [];
      if (_.isString(input)) {
        input = input.split('');
        inp = function () {
          let ch = input.shift();
          return ch ? ch.charCodeAt(0) : 0;
        };
      } else if (_.isFunction(input)) {
        inp = input;
      }
      if (!_.isFunction(output)) {
        output = function () {};
      }
      out = function (num) {
        let ch = String.fromCharCode(num);
        output(num, ch);
        res.push(ch);
      };
      compiled(inp, out);
      return res.join('');
    },
    toString: function () {
      return compiled.toString();
    }
  };
};


function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
