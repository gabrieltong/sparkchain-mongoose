let config = require('../config');
const mongoose = require("mongoose");
let Schema = mongoose.Schema
require("dotenv").config();
let Wallet = require('../models/wallet');
let random = require("random-js")();
let {appid} = config;
module.exports = walletPlugin;

function walletPlugin(schema, options){
  // console.trace();
  schema.add({ walletUserId: String });
  schema.add({ wallet: { type: Schema.Types.ObjectId, ref: "Wallet", index: true } });
  
  schema.statics.getEE = function(cb){
    return this.findOne({walletUserId: appid.toString()});
  };

  schema.methods.getWallet = function(){
    return Wallet.findOne({_id: this.wallet});
  };

  schema.methods.transferByPassword = async function(options){
    let {chainCode, tokenCode, amount, account, payPassword, memo} = options;
    let wallet = await this.getWallet();

    if(!wallet)
    {
      return Promise.reject('no.wallet');
    }

    if(wallet.payPassword != payPassword)
    {
      return Promise.reject('payPassword.wrong');
    }

    return this.transferToAccount({account, chainCode, tokenCode, amount, memo});
  };

  schema.methods.transferToAccount = async function(options){

    let {accessToken, account, chainCode, tokenCode, amount, memo} = options;
    let from = await this.getWallet().catch(e=>{
      return Promise.reject(e);
    });

    if(!from) return Promise.reject('no.wallet');

    return from.transferToAccount({account, chainCode, tokenCode, amount, memo, accessToken});
  };

  schema.methods.safeTransfer = async function(options){
    let {accessToken, other, chainCode, tokenCode, amount, memo, getBalances} = options;
    try{
      let from = await this.getWallet();
      other = await other.getWallet();
      
      if(from && other)
      {
        if(getBalances)
        {
          await from.getBalances({chainCode, tokenCode});
          await other.getBalances({chainCode, tokenCode});
        }
        return await from.safeTransfer({other, chainCode, tokenCode, amount, memo, accessToken});
      }else{
        return Promise.reject('no.wallet');
      }
    }catch(e)
    {
      return Promise.reject(e);
    }
  };

  schema.methods.transfer = async function(options){
    let {accessToken, other, chainCode, tokenCode, amount, memo} = options;
    try{
      let from = await this.getWallet();
      await from.sync({chainCode, tokenCode});
      other = await other.getWallet();
      await other.sync({chainCode, tokenCode});

      if(from && other)
      {
        return await from.transfer({other, chainCode, tokenCode, amount, memo, accessToken});
      }else{
        return Promise.reject('no.wallet');
      }
    }catch(e)
    {
      return Promise.reject(e);
    }
  };


  schema.methods.createWallet = async function(options){
    let {chainCode, tokenCode} = options;
    if(this.wallet) return this.wallet;
    
    let appId = appid;
    if(!this.walletUserId)
    {
      this.walletUserId = this._id.toString();
    }
    let userId = this.walletUserId;
    let password = random.string(32);

    try{
      let wallet = await Wallet.newInstance({appId, userId, password});
      this.wallet = wallet;
      await this.save();
      await wallet.sync({chainCode, tokenCode});
      return wallet;
    }catch(e)
    {
      return Promise.reject(e);
    }
  }
}