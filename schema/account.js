let App = require('../models/app');
let async = require('async');
const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
const timestamps = require("mongoose-timestamp");

let AccountSchema = new Schema({
  accountId: String,
  chainCode: { type: String, required: true, index: true},
  account: { type: String, required: true, index: true}
});

AccountSchema.methods.balance = function(options, cb){
  let {accessToken, tokenCode} = options;
  let self = this;

  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)  
    }
  }, function(err, results){
    let {accessToken} = results;
    let {chainCode, account} = self;
    let data = {accessToken, account, chainCode, tokenCode};
    
    sparkchain.Account.balance(data, function(err ,response, body){
      cb(err ,response, body);
    });
  });
};

AccountSchema.plugin(timestamps);

module.exports = AccountSchema;