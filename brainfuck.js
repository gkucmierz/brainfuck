

var orders = ',.[]<>+-'.split('');
var regex = {
  clean: new RegExp('[^' + escapeRegExp(orders.join('')) + ']','g')
};

module.exports.toJS = function (bfSource) {
  var cleanedSource = (bfSource+'').replace(regex.clean, '').split('');
  var ordersMap = {
    ',': 'm[p]=i();',
    '.': 'o(m[p]);',
    '[': 'while(m[p]){',
    ']': '}',
    '<': 'if(--p<0)p=l;',
    '>': 'if(++p>=l)p=0;',
    '+': '++m[p];',
    '-': '--m[p];'
  };

  return cleanedSource.map(function (order) {
    return ordersMap[order];
  }).join('');
};


function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}