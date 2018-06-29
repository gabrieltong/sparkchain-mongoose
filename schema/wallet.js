const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
let async = require('async');
let logger = require('../logger.js');
let accountSchema = require('./account');
let balanceSchema = require('./balance');
let Biz = require('../models/biz');
let App = require('../models/app');
let NodeCache = require('node-cache');
let cache = new NodeCache({stdTTL:process.env.NODE_CACHE_TTD});

let WalletSchema = new Schema({
  name: String,
  appId: { type: String, required: true, index: true},
  password: { type: String, required: false},
  payPassword: { type: String, required: false},
  userId: { type: String, required: true, index: { unique: true }},
  walletAddr: { type: String, required: true, index: { unique: true }},
  accounts: [accountSchema],
  balances: [balanceSchema]
});

WalletSchema.virtual("sum_balances").get(function() {
  this.balances
});

WalletSchema.virtual("tran_key").get(function() {
  return process.env['SPARK_CHAIN_TRAN_KEY'];
});

WalletSchema.virtual("tran_value").get(function() {
  return this[this.tran_key];
});

WalletSchema.virtual("src_json").get(function(){
  let hash = {};
});

WalletSchema.statics.getInstance = async function(options){
  let self = this;
  let {name, appId, userId, walletAddr} = options;
  let form = {appId};
  if(userId)
  {
    form.userId = userId;
  }else{
    form.walletAddr = walletAddr;
  }

  let wallet = this.findOne(form)
  if(wallet){
    return wallet;
  }
  wallet = new self({appId, userId, walletAddr});
  wallet.password = '123456';
  wallet.name = name;
  await wallet.save().catch(e=>{
    return Promise.reject(e);
  });
  return wallet;
};

WalletSchema.statics.sync = async function(options){
  let self = this;
  let {appId, userId, walletAddr} = options;
  let wallet = await this.getInstance(options).catch(e=>{
    return Promise.reject(e);
  });

  if(wallet)
  {
    await wallet.sync().catch(e=>{
      return Promise.reject(e);
    });;
    return wallet;
  }else{
    return Promise.reject('no.wallet');
  }
};

WalletSchema.methods.sync = async function(){
  try{
    console.log('getBalances')
    await this.getBalances()
    console.log('getAccounts')
    await this.getAccounts()
    console.log('resetPassword')
    await this.resetPassword()
    console.log('resetPayPassword')
    await this.resetPayPassword();
    console.log('this')
    return this;
  }catch(e)
  {
    return Promise.reject(e);
  }
};

WalletSchema.methods.cachedBalances = async function(options){
  let {accessToken} = options;
  let self = this;
  return new Promise(function(resolve, reject) {
    let cache_key = `getBalances-${self._id.toString}`;
    cache.get(cache_key, async function(err, value){
      if(value != undefined)
      {
        return resolve({balances: value, is_cache: true});
      }else{
        let result = await self.getBalances(options)
        let {balances} = result;  
        cache.set(cache_key, balances, function(){
          return resolve({balances, is_cache: false});
        });
      }
    });
  });
};

WalletSchema.methods.syncBalanceByAcount = async function(options){
  let {chainCode, tokenCode} = options;
  let self = this;
  let account = self.accounts.find(b=>b.chainCode == chainCode);
  let balance = self.balances.find(b=>b.chainCode == chainCode);

  if(account && balance)
  {
    let result = await account.balance({chainCode, tokenCode}).catch(e=>{
      return Promise.reject(e);
    });
    let {err, response, body} = result;

    if(body.success)
    {
      balance.balance = body.data.balance;
      balance.freezed = body.data.freezed;
      await self.save()
    }
    return {balances: self.balances};
  }else{
    return Promise.reject('no.account')
  }
};

WalletSchema.methods.syncBalance = async function(options){
  let {accessToken, chainCode, tokenCode} = options;
  let self = this;

  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
  let {userId} = self; 
  let data = {accessToken, userId, chainCode, tokenCode};

  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.syncBalance(data, async function(err ,response, body){
      let balance = self.balances.find(b=>b.tokenCode == body.data.tokenCode);
      if(body.success && balance)
      {
        balance.balance = body.data.balance;
        balance.freezed = body.data.freezed;
        await self.save();
      }
      resolve({balances: self.balances});
    });
  });
};

WalletSchema.methods.getBalances = async function(options={}){
  let {accessToken} = options;
  let self = this;
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
  let {userId} = this; 
  let data = {accessToken, userId};
  
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.balances(data, async function(err ,response, body){
      if(body.success)
      {
        self.balances = body.data.balances;
        await self.save()
        resolve({balances: self.balances});
      }else{
        reject(body);
      }
    });
  });
};

WalletSchema.methods.getAccounts = async function(options={}){
  let self = this;
  let {accessToken} = options;
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });

  let {userId} = self; 
  let data = {accessToken, userId};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.accounts(data, async function(err ,response, body){
      if(body.success)
      {
        accounts = body.data.accounts.map(a=>{
          return {
            accountId: a.accountId,
            chainCode: a.chainCode,
            account: a.accountAddr
          }
        })
        self.accounts = accounts;
        await self.save();
        resolve({accounts});
      }else{
        reject(body);
      }
    });
  });
};

WalletSchema.methods.safeBalance = async function(options){
  this.balance(options, function(err, sum){
    return sum - process.env['SPARK_CHAIN_SAFE'];
  });
};

WalletSchema.methods.balance = async function(options){
  let {chainCode} = options;
  if(this.balances)
  {
    let sum = this.balances.filter(b=>b.chainCode == chainCode).reduce((sum, b)=>{
      return sum + b.balance - b.freezed;
    },0)
    return sum;
  }else{
    return 0;
  }
};

WalletSchema.methods.safeTransfer = async function(options){
  let {other, accessToken, chainCode, tokenCode, amount, reload} = options;
  let self = this;

  let fromSafe = await self.safeBalance(options).catch(function(err){
    return Promise.reject(e);
  });

  if(fromSafe < amount){
    return Promise.reject(`from is not safe: no enough balance: ${safe} for ${amount}`);
  }

  let otherSafe = await other.balance(options)
  if(otherSafe + amount < process.env['SPARK_CHAIN_SAFE'])
  {
    return Promise.reject(`other is not safe`);
  }
  
  return self.transfer(options);
};

WalletSchema.methods.transferToAccount = async function(options){
  let {accessToken, account, chainCode, tokenCode, amount, memo} = options;
  let self = this;

  let biz = await Biz.getInstance({type: 2, chainCode, tokenCode, memo, amount, srcUserId: self.userId, destAccount: account}).catch(e=>{
    return Promise.reject(e);
  });

  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
  
  let data = {
    accessToken, chainCode, tokenCode, amount,
    bizId: biz._id.toString(),
    memo: biz.memo,
    srcUserId: self.userId,
    payPassword: self.payPassword,
    destAccount: account
  }

  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.transfer(data, async function(err, response, body){
      if(body.success)
      {
        biz.gasFee = body.data.gasFee;
        biz.hash = body.data.hash;
        await biz.save().catch(e=>{
          return reject(e)
        });
        resolve({err, response, body})
      }else{
        biz.body = JSON.stringify(body);
        await biz.save().catch(e=>{
          return reject(e)
        });
        resolve({err, response, body});
      }
    })
  })
};

WalletSchema.methods.transfer = async function(options){
  let {accessToken, other, chainCode, tokenCode, amount, memo} = options;
  let self = this;

  let biz = await Biz.getInstance({type: 1, chainCode, tokenCode, memo, amount, srcUserId: self.userId, destUserId: other.userId}).catch(e=>{
    return Promise.reject(e);
  });
    
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
    
  let data = {
    accessToken, chainCode, tokenCode, amount,
    bizId: biz._id.toString(),
    memo: biz.memo,
    srcUserId: self.userId,
    payPassword: self.payPassword,
    destUserId: other.userId
  }

  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.transfer(data, async function(err, response, body){
      if(body.success)
      {
        biz.gasFee = body.data.gasFee;
        biz.hash = body.data.hash;
        await biz.save().catch(e=>{
          return reject(e)
        });
        resolve({err, response, body})
      }else{
        biz.body = JSON.stringify(body);
        await biz.save().catch(e=>{
          return reject(e)
        });
        resolve({err, response, body});
      }
    })
  })
};

WalletSchema.methods.modifyPassword = async function(options){
  let {accessToken, newPassword} = options;
  let {userId,password} = this;
  let self = this;
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });

  data = {accessToken, userId, newPassword, oldPassword: password};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.modifyPassword(data, async function(err, response, body){
      if(body.success){
        self.password = newPassword;
        await self.save();
        resolve(self);
      }else{
        reject({err,response,body,data,action:'modifyPassword'});
      }
    });
  });
};

WalletSchema.methods.resetPassword = async function(options={}){
  let {accessToken} = options;
  let {userId} = this;
  let self = this;
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });

  options = {accessToken, userId};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.resetPassword(options, async function(err, response, body){
      if(err){
        reject(err);
      }else if(body.success){
        self.password = body.data.newPwd;
        await self.save();
        resolve(self);
      }else{
        reject('resetPassword.fail');
      }
    });
  });
};

WalletSchema.methods.validPassword = function(options){
  let {accessToken} = options;
  let {userId, password} = this;
  options = {accessToken, password, userId};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.validPassword(options, function(err, response, body){
      resolve({err, response, body})
    });
  });
};

WalletSchema.methods.updatePayPassword = async function(options){
  let self = this;
  let {accessToken, newPayPassword} = options;
  let {userId, payPassword} = this;
  
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });

  data = {accessToken, newPayPassword, userId, oldPayPassword: payPassword};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.updatePayPassword(data, async function(err, response, body){
      if(body.success){
        self.payPassword = body.data.newPwd;
        await self.save();
        resolve(self)
      }else{
        reject({err, response, body, data, action:'updatePayPassword'});
      }
    });
  });
};

WalletSchema.methods.validPayPassword = async function(options){
  let {accessToken} = options;
  let {userId, payPassword} = this;

  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });

  data = {accessToken, payPassword, userId};
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.validPayPassword(data, function(err, response, body){
      resolve({err, response, body});
    });
  });
};

WalletSchema.methods.resetPayPassword = async function(options={}){
  let {accessToken} = options;
  let {userId} = this;
  let self = this;
  
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
  options = {accessToken, userId};

  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.resetPayPassword(options, async function(err, response, body){
      if(err){
        reject(err);
      }else if(body.success){
        self.payPassword = body.data.newPwd;
        await self.save();
        resolve(self);
      }else{
        reject('resetPayPassword.fail');
      }
    });
  });
};

WalletSchema.methods.setPayPassword = async function(options){
  let {appId, accessToken, payPassword} = options;
  let {userId, password} = this;
  let self = this;
  options = {accessToken, payPassword, userId, password};
  
  accessToken = await App.getAccessToken({accessToken}).catch(e=>{
    return Promise.reject(e);
  });
  options.accessToken = accessToken;
  return new Promise(function(resolve, reject) {
    sparkchain.Wallet.setPayPassword(options, async function(err, response, body){
      if(err){
        reject(err);
      }else if(body.success){
        self.payPassword = payPassword;
        await self.save();
        resolve(self);
      }else{
        reject('setPayPassword.fail');
      }
    });
  });
};

WalletSchema.statics.newInstance = async function(options){
  let self = this;
  let {userId, walletAddr, appId, password, accessToken, name} = options;

  let wallet = await this.findOne({$or: [{userId}, {walletAddr}] });
  if(wallet) return wallet;
  
  accessToken = await App.getAccessToken({accessToken});
  options.accessToken = accessToken;

  return new Promise(function(resolve, reject) {
    sparkchain.App.createWallet(options, async function(err, response, body){

      if(err)
      {
        reject(err);
      }else if(body.success)
      {
        let wallet = new self(body.data);
        wallet.password = password;
        wallet.appId = appId;
        wallet.name = name;

        await wallet.save();

        await wallet.resetPayPassword({accessToken});
        // console.log(body)
        resolve(wallet);
      }else if(body.message.includes('SCCSERV3003')){
        sparkchain.Wallet.balances(options, async function(err, response, body){
          let wallet = new self(body.data);
          wallet.name = name;
          wallet.appId = appId;
          await wallet.save();
          await wallet.resetPayPassword({accessToken});
          resolve(wallet);
        })
      }else{
        reject('createWallet.fail');
      }
    });
  });
};

module.exports = WalletSchema;