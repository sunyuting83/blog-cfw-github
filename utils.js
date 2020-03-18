const crypto = require('crypto')

makeMD5 = (str) => {
  var md5 = crypto.createHash('md5');
  let s = md5.update(str);
  s = md5.digest('hex');
  return s;
};

const n = Date.now()
console.log(n)
let x = makeMD5(String(n))
x = x.substr(0, 16)
console.log(x)