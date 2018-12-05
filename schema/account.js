let App = require('../models/app');
const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
const timestamps = require("mongoose-timestamp");

let AccountSchema = new Schema({
  accountId: String,
  chainCode: { type: String, required: true, index: true},
  account: { type: String, required: true, index: true}
});

AccountSchema.methods.balance = async function(options, cb){
  let {accessToken, tokenCode} = options;
  let self = this;
  
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    console.log(e);
    return Promise.reject(e);
  });
  
  let {chainCode, account} = self;
  let data = {accessToken, account, chainCode, tokenCode};
  
  if(cb)
  {
    sparkchain.Account.balance(data, function(err ,response, body){
      cb(err ,response, body);
    });
  }else{
    return new Promise(function(resolve, reject) {
      sparkchain.Account.balance(data, function(err ,response, body){
        resolve({err, response, body})
      });
    });
  }
};

AccountSchema.plugin(timestamps);

module.exports = AccountSchema;