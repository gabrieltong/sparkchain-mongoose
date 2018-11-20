let crypto = require('crypto')
//配置秘钥
let md5key=()=>"******";

// 加密
let encrypt = (data, key)=>{
  key = realKey(key);
  let crypted='';
  let cipher = crypto.createCipheriv('aes-128-ecb', key, "");
  crypted = cipher.update(data, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = new Buffer(crypted, 'binary').toString('base64');
  return crypted;
}


// 解密
let decrypt=(data, key)=>{
  key = realKey(key);
  let decipher = crypto.createDecipheriv('aes-128-ecb', key,"");
  const buf1 = new Buffer(data,"base64").toString('hex');
  let decrypted = decipher.update(buf1, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 获取key
let realKey=(key)=>{
  let keysha1 = crypto.createHash('sha1').update(key).digest('buffer');
  let realkey = crypto.createHash('sha1').update(keysha1).digest('hex').substring(0,32);
  return new Buffer(realkey,'hex');
}

let encryptmd5=(data)=>{
  let key = md5key();
  let str = data+"|"+key;
  let md5str = crypto.createHash('md5')
                .update(str)
                .digest('base64');
  return md5str;
}

module.exports = {
  encrypt, decrypt
}