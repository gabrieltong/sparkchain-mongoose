const mongoose = require("mongoose");
let Schema = mongoose.Schema
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
  body: String,
  srcRemain: Number,
  descRemain: Number
});

BizSchema.statics.getInstance = async function(options){
  let {type, chainCode, tokenCode, memo, amount, destAccount, srcUserId, destUserId} = options;
  let self = this;
  let biz = new self({type, chainCode, tokenCode, destAccount, memo, amount, srcUserId, destUserId});
  await biz.save().catch(e=>{
    console.log(e);
    return Promise.reject(e);
  });
  return biz;
};

BizSchema.methods.s = function(options, cb){
  cb();
};

BizSchema.plugin(timestamps);
BizSchema.plugin(mongoosePaginate);

module.exports = BizSchema;