const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
const timestamps = require("mongoose-timestamp");
const mongoosePaginate = require("mongoose-paginate");

let BizSchema = new Schema({
  type: Number,
  srcWalletAddr: String,
  srcUserId: String,
  srcAccount: String,
  chainCode: String,
  tokenCode: String,
  destWalletAddr: String,
  destUserId: String,
  destAccount: String,
  amount: String,
  memo: String,
  gasFee: String,
  hash: String,
  body: String
});

BizSchema.statics.getInstance = function(options, cb){
  let {type, chainCode, tokenCode, memo, amount, destAccount, srcUserId, destUserId} = options;
  let self = this;
  let biz = new self({type, chainCode, tokenCode, destAccount, memo, amount, srcUserId, destUserId});
  biz.save(function(err){
    cb(err, biz)
  });
};

BizSchema.methods.s = function(options, cb){
  console.log(`debug s ++`)
  cb();
};

BizSchema.plugin(timestamps);
BizSchema.plugin(mongoosePaginate);

module.exports = BizSchema;