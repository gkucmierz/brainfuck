
var _ = require('lodash-node');

var orders = ',.[]<>+-'.split('');
var regex = {
  clean: new RegExp('[^' + escapeRegExp(orders.join('')) + ']','g')
};

var config = {
  memorySize: 30000,
  bits: 8 // 8, 16, 32
};

module.exports.config = function (userConfig) {
  if (_.isUndefined(userConfig)) {
    return _.clone(config);
  }
  _.extend(config, userConfig);
};

module.exports.compile = function (bfSource, userConfig) {
  var actualConfig = _.extend(_.clone(config), userConfig);
  var cleanedSource = (bfSource+'').replace(regex.clean, '').split('');
  
  var ordersMap = { // m,p,o,i,l
    ',': 'm[p]=i();',
    '.': 'o(m[p]);',
    '[': 'while(m[p]){',
    ']': '}',
    '<': 'if(--p<0)p=l;',
    '>': 'if(++p>=l)p=0;',
    '+': '++m[p];',
    '-': '--m[p];'
  };
  var definitions = {
    // memory
    m: function (config) {
      var memConstructors = {
        '8': 'Uint8Array',
        '16': 'Uint16Array',
        '32': 'Uint32Array'
      };
      var constructorName = memConstructors[config.bits] || memConstructors[8];
      return ['var m=new ',constructorName,'(',+config.memorySize,');'].join('');
    },
    // pointer
    p: function () {
      return 'var p=0;';
    },
    // out
    o: function () {
      return 'var o=output||function(){};';
    },
    // in
    i: function () {
      return 'var i=input||function(){return 0;};';
    },
    // length
    l: function (config) {
      return ['var l=',+config.memorySize,';'].join('');
    }
  };
  var arguments = ['input', 'output'];

  var code = [];
  _.each(definitions, function (evaluate) {
    code.push(evaluate(actualConfig));
  });
  cleanedSource.map(function (order) {
    code.push(ordersMap[order]);
  });

  return new Function(arguments, code.join(''));
};


function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}