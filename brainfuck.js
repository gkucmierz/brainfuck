
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

function getInstruction(count, orderLess, orderMore) {
  return ({
    '1': (count > 1) ? count + orderMore : orderMore,
    '0': '',
    '-1': (count < -1) ? (-count) + orderLess : orderLess
  })[Math.sign(count)];
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function cloneObj(obj) {
  return Object.keys(obj).reduce((res, key) => (res[key] = obj[key], res), {});
}

function extendObj(obj, ext) {
  return Object.keys(ext || {}).reduce((res, key) => (res[key] = ext[key], res), obj);
}

module.exports.config = (userConfig) => {
  if (typeof userConfig === 'undefined') {
    return cloneObj(config);
  }
  extendObj(config, userConfig);
};

module.exports.compile = (bfSource, userConfig) => {
  let actualConfig = extendObj(cloneObj(config), userConfig);
  let cleanedSource = (bfSource+'').replace(regex.clean, '');
  let optimized = cleanedSource
    // add (z)ero instruction => it makes reseting cell much faster
    .replace(/\[\-\]/g, 'z')
    // optimze cell manipulating instructions
    // for example: '+++--' => '+'
    //              '+++++' => '5+'
    .replace(regex.value, (m) => {
      let map = { '+': 1, '-': -1 };
      let n = m.split('').reduce((acc, b) => acc + map[b], 0);
      return getInstruction(n, '-', '+');
    })
    // optimze pointer manipulating instructions
    // for example: '>>><<' => '>'
    //              '>>>>>' => '5>'
    .replace(regex.pointer, (m) => {
      let map = { '>': 1, '<': -1 };
      let n = m.split('').reduce((acc, b) => acc + map[b], 0);
      return getInstruction(n, '<', '>');
    });
  
  let ordersMap = { // m,p,o,i,l
    ',': () => 'm[p]=i();',
    '.': () => 'o(m[p]);',
    '[': () => 'while(m[p]){',
    ']': () => '}',
    '<': (count) => 'p-='+count+';while(p<0)p+=l;',
    '>': (count) => 'p+='+count+';while(p>=l)p-=l;',
    '+': (count) => 'm[p]+='+count+';',
    '-': (count) => 'm[p]-='+count+';',
    // optimizations:
    'z': () => 'm[p]=0;' // [-] => quick reset memory cell
  };

  let createOrder = (order, count) => {
    // if there is a instruction limit, add prefix check-instruction to every instruction
    let prefix = actualConfig.maxInstructions > 0 ? 'if(!--c)return;' : '';
    return [prefix, ordersMap[order](count)].join('');
  };

  let definitions = {
    // count
    c: (config) => config.maxInstructions > 0 ? 'let c='+config.maxInstructions+';' : '',
    // length
    l: (config) => ['let l=', config.memorySize, ';'].join(''),
    // memory
    m: (config) => {
      const constr = {'8': 'Uint8Array', '16': 'Uint16Array', '32': 'Uint32Array'};
      return ['let m=new ', constr[config.bits] || constr[8], '(l);'].join('');
    },
    // pointer
    p: () => 'let p=0;',
    // out
    o: () => 'let o=output||(()=>0);',
    // in
    i: () => 'let i=input||(()=>0);'
  };

  // create variables definitions
  let code = Object.keys(definitions).map(key => definitions[key](actualConfig));

  // create rest code
  (optimized.match(regex.instruction) || []).map((instruction) => {
    let count = +instruction.slice(0, -1) || 1;
    let order = instruction.slice(-1);
    code.push(createOrder(order, count));
  });

  let compiled = new Function(['input', 'output'], code.join(''));
  
  return {
    run: (input, output) => {
      let inp, out;
      let res = [];
      if (typeof input === 'string') {
        input = input.split('');
        inp = () => {
          let ch = input.shift();
          return ch ? ch.charCodeAt(0) : 0;
        };
      } else if (typeof input === 'function') {
        inp = input;
      }
      if (typeof output !== 'function') {
        output = () => 0;
      }
      out = (num) => {
        let ch = String.fromCharCode(num);
        output(num, ch);
        res.push(ch);
      };
      compiled(inp, out);
      return res.join('');
    },
    toString: () => compiled.toString()
  };
};
