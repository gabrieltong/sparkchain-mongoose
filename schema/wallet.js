const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
let async = require('async');
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
  // hash[]
});

WalletSchema.statics.getInstance = function(options, cb){
  let self = this;
  let {name, appId, userId, walletAddr} = options;
  let form = {appId};
  if(userId)
  {
    form.userId = userId;
  }else{
    form.walletAddr = walletAddr;
  }

  self.findOne(form).exec(function(err, wallet){
    if(wallet){
      cb(null, wallet);
    }else{
      wallet = new self({appId, userId, walletAddr});
      wallet.password = '123456';
      wallet.name = name;
      wallet.save(function(err){
        if(err)
        {
          cb(err)
        }else{
          cb(null, wallet);
        }
      })
    }
  })
};

WalletSchema.statics.sync = function(options, cb){
  let self = this;
  let {appId, userId, walletAddr} = options;
  async.waterfall([
    function(cb_w){
      self.getInstance(options, cb_w);
    },
    function(wallet, cb_w){
      wallet.sync({}, function(){
        cb_w(null, wallet)
      })
    }
  ], cb)
};

WalletSchema.methods.sync = function(options, cb){
  let self = this;
  async.waterfall([
    function(cb_w){
      self.getBalances({}, function(err){
        cb_w();
      });
    },
    function(cb_w){
      self.getAccounts({}, function(){
        cb_w();
      });
    },
    function(cb_w){
      self.resetPassword({}, function(){
        cb_w(null)
      })
    },
    function(cb_w){
      self.resetPayPassword({}, function(){
        cb_w(null)
      })
    }
  ], cb)
};

WalletSchema.methods.cachedBalances = function(options, cb){
  let {accessToken} = options;
  let self = this;
  let cache_key = `getBalances-${this._id.toString}`;
  cache.get(cache_key, function(err, value){
    if(value != undefined)
    {
      cb(null, {balances: value, is_cache: true});
    }else{
      self.getBalances(options, function(err, result){
        let {balances} = result;
        
        cache.set(cache_key, balances, function(){
          cb(null, result);  
        });
      })    
    }
  });
};

WalletSchema.methods.syncBalanceByAcount = function(options, cb){
  let {chainCode, tokenCode} = options;
  let self = this;
  let account = self.accounts.find(b=>b.chainCode = chainCode);
  let balance = self.balances.find(b=>b.chainCode = chainCode);
  if(account && balance)
  {
    account.balance({chainCode, tokenCode}, function(err, response, body){
      console.log(body)
      if(body.success)
      {
        balance.balance = body.data.balance;
        balance.freezed = body.data.freezed;
        self.save(function(){
          cb(null, {
            balances: self.balances
          })
        })
      }
    })
  }else{
    cb('no.account');
  }
};

WalletSchema.methods.syncBalance = function(options, cb){
  let {accessToken, chainCode, tokenCode} = options;
  let self = this;

  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)  
    }
  }, function(err, results){
    let {accessToken} = results;
    let {userId} = self; 
    let data = {accessToken, userId, chainCode, tokenCode};
    // console.log(data)
    // console.log(data)
    sparkchain.Wallet.syncBalance(data, function(err ,response, body){
      let balance = self.balances.find(b=>b.tokenCode == body.data.tokenCode);
      if(body.success && balance)
      {
        balance.balance = body.data.balance;
        balance.freezed = body.data.freezed;
        self.save(function(){
          cb(null, {balances: self.balances});
        });
      }else{
        cb(null, {balances: self.balances});
      }
    });
  });
};

WalletSchema.methods.getBalances = function(options, cb){
  let {accessToken} = options;
  let self = this;

  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)  
    }
  }, function(err, results){
    let {accessToken} = results;
    let {userId} = self; 
    let data = {accessToken, userId};
    
    sparkchain.Wallet.balances(data, function(err ,response, body){
      self.balances = body.data.balances;
      self.save(function(){
        cb(null, {balances: self.balances});
      });
    });
  });
};

WalletSchema.methods.getAccounts = function(options, cb){
  let self = this;
  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({}, cb_p)
    }
  }, function(err, results){
    let {accessToken} = results;
    let {userId} = self; 
    let data = {accessToken, userId};
    // console.log(data)
    sparkchain.Wallet.accounts(data, function(err ,response, body){
      accounts = body.data.accounts.map(a=>{
        return {
          accountId: a.accountId,
          chainCode: a.chainCode,
          account: a.accountAddr
        }
      })
      self.accounts = accounts;
      self.save(cb);
    });
  });
};

WalletSchema.methods.safeBalance = function(options, cb){
  this.balance(options, function(err, sum){
    cb(null, sum - process.env['SPARK_CHAIN_SAFE']);
  });
};

WalletSchema.methods.balance = function(options, cb){
  let {chainCode} = options;
  if(this.balances)
  {
    let sum = this.balances.filter(b=>b.chainCode == chainCode).reduce((sum, b)=>{
      return sum + b.balance - b.freezed;
    },0)
    cb(null, sum);
  }else{
    cb(null, 0);
  }
};

WalletSchema.methods.safeTransfer = function(options, cb){
  let {other, accessToken, chainCode, tokenCode, amount, reload} = options;
  let self = this;
  async.parallel({
    fromSafe: function(cb_p){
      self.safeBalance(options, function(err, safe){
        if(safe > amount)
        {
          cb_p(null, 1);
        }else{
          cb(`from is not safe: no enough balance: ${safe} for ${amount}`);
        }
      })
    },
    otherSafe: function(cb_p){
      other.balance(options, function(err, sum){
        if(sum + amount > process.env['SPARK_CHAIN_SAFE'])
        {
          cb_p(null, 1);
        }else{
          cb(`other is not safe`);
        }
      })
    }
  }, function(err){
    if(err)
    {
      cb(err)
    }else{
      self.transfer(options, cb);
    }
  })
};

WalletSchema.methods.transferToAccount = function(options, cb){
  // console.log(options)
  let {accessToken, account, chainCode, tokenCode, amount, memo} = options;
  let self = this;

  async.parallel({
    biz: function(cb_p){
      Biz.getInstance({type: 2, chainCode, tokenCode, memo, amount, srcUserId: self.userId, destAccount: account}, cb_p);
    },
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)
    }
  }, function(err, results){
    // console.log(err)
    // console.log(results)
    let {biz, accessToken} = results;
    let data = {
      accessToken, chainCode, tokenCode, amount,
      bizId: biz._id.toString(),
      memo: biz.memo,
      srcUserId: self.userId,
      payPassword: self.payPassword,
      destAccount: account
    }
    console.log(data)
    sparkchain.Wallet.transfer(data, function(err, response, body){
      // console.log(body)
      if(body.success)
      {
        biz.gasFee = body.data.gasFee;
        biz.hash = body.data.hash;
        biz.save(function(){
          cb(err, response, body);
        })
      }else{
        biz.body = body;
        biz.save(function(){
          cb(err, response, body);
        })
      }
    })
  })
};

WalletSchema.methods.transfer = function(options, cb){
  // console.log(options)
  let {accessToken, other, chainCode, tokenCode, amount, memo} = options;
  let self = this;

  async.parallel({
    biz: function(cb_p){
      Biz.getInstance({type: 1, chainCode, tokenCode, memo, amount, srcUserId: self.userId, destUserId: other.userId}, cb_p);
    },
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)
    }
  }, function(err, results){
    // console.log(err)
    // console.log(results)
    let {biz, accessToken} = results;
    let data = {
      accessToken, chainCode, tokenCode, amount,
      bizId: biz._id.toString(),
      memo: biz.memo,
      srcUserId: self.userId,
      payPassword: self.payPassword,
      destUserId: other.userId
    }
    // console.log(data)
    sparkchain.Wallet.transfer(data, function(err, response, body){
      // console.log(body)
      if(body.success)
      {
        biz.gasFee = body.data.gasFee;
        biz.hash = body.data.hash;
        biz.save(function(){
          cb(err, response, body);
        })
      }else{
        console.log('here ......');
        biz.body = JSON.stringify(body);
        biz.save(function(err){
          console.log(err)
          cb(err, response, body);
        })
      }
    })
  })
};

WalletSchema.methods.modifyPassword = function(options, cb){
  let {accessToken, newPassword} = options;
  let {userId,password} = this;
  let self = this;
  options = {accessToken, userId, newPassword, oldPassword: password};
  sparkchain.Wallet.modifyPassword(options, function(err, response, body){
    if(err){
      cb(err);
    }else if(body.success){
      self.password = newPassword;
      self.save(cb);
    }else{
      cb('modifyPassword.fail');
    }
  });
};

WalletSchema.methods.resetPassword = function(options, cb){
  let {accessToken} = options;
  let {userId} = this;
  let self = this;
  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)  
    }
  }, function(err, results){
    let {accessToken} = results;
    options = {accessToken, userId};
    sparkchain.Wallet.resetPassword(options, function(err, response, body){
      // console.log(body)
      if(err){
        cb(err);
      }else if(body.success){
        self.password = body.data.newPwd;
        self.save(cb);
      }else{
        cb('resetPassword.fail');
      }
    });
  });
};

WalletSchema.methods.validPassword = function(options, cb){
  let {accessToken} = options;
  let {userId, password} = this;
  options = {accessToken, password, userId};
  sparkchain.Wallet.validPassword(options, function(err, response, body){
    if(err){
      cb(err);
    }else{
      cb(null, body);
    }
  });
};

WalletSchema.methods.updatePayPassword = function(options, cb){
  let self = this;
  let {accessToken, newPayPassword} = options;
  let {userId, payPassword} = this;
  options = {accessToken, newPayPassword, userId, oldPayPassword: payPassword};
  // console.log(options)
  sparkchain.Wallet.updatePayPassword(options, function(err, response, body){
    // console.log(body)
    if(err){
      cb(err);
    }else if(body.success){
      self.payPassword = body.data.newPwd;
      self.save(cb);
    }else{
      cb('updatePayPassword.fail');
    }
  });
};

WalletSchema.methods.validPayPassword = function(options, cb){
  let {accessToken} = options;
  let {userId, payPassword} = this;
  options = {accessToken, payPassword, userId};
  sparkchain.Wallet.validPayPassword(options, function(err, response, body){
    if(err){
      cb(err);
    }else{
      cb(null, body);
    }
  });
};

WalletSchema.methods.resetPayPassword = function(options, cb){
  let {accessToken} = options;
  let {userId} = this;
  let self = this;
  async.parallel({
    accessToken: function(cb_p){
      App.getAccessToken({accessToken}, cb_p)  
    }
  }, function(err, results){
    let {accessToken} = results;
    options = {accessToken, userId};
    sparkchain.Wallet.resetPayPassword(options, function(err, response, body){
      // console.log(body)
      if(err){
        cb(err);
      }else if(body.success){
        self.payPassword = body.data.newPwd;
        self.save(cb);
      }else{
        cb('resetPayPassword.fail');
      }
    });
  });
};

WalletSchema.methods.setPayPassword = function(options, cb){
  let {appId, accessToken, payPassword} = options;
  let {userId, password} = this;
  let self = this;
  options = {accessToken, payPassword, userId, password};
  sparkchain.Wallet.setPayPassword(options, function(err, response, body){
    if(err){
      cb(err);
    }else if(body.success){
      self.payPassword = payPassword;
      self.save(cb);
    }else{
      cb('setPayPassword.fail');
    }
  });
};

WalletSchema.statics.newInstance = function(options, cb){
  let self = this;
  let {userId, walletAddr, appId, password, accessToken, name} = options;

  self.findOne({
    $or: [{userId}, {walletAddr}]
  }).exec(function(err, wallet){
    if(wallet)
    {
      cb(null, wallet);
    }else{
      async.waterfall([
        function(cb_p){
          App.getAccessToken({accessToken}, cb_p)  
        },
        function(accessToken, cb_w){
          options.accessToken = accessToken;
          console.log(options)
          sparkchain.App.createWallet(options, function(err, response, body){
            console.log(body)
            if(err)
            {
              cb_w(err);
            }else if(body.success)
            {
              let wallet = new self(body.data);
              wallet.password = password;
              wallet.appId = appId;
              wallet.name = name;
              wallet.save(function(err){
                if(err){
                  cb_w(err);
                }else{
                  cb_w(null, wallet);
                }
              });
            }else if(body.message.includes('SCCSERV3003')){
              sparkchain.Wallet.balances(options, function(err, response, body){
                let wallet = new self(body.data);
                wallet.name = name;
                wallet.appId = appId;
                wallet.save(function(err){

                  if(err){
                    cb_w(err);
                  }else{
                    cb_w(null, wallet);
                  }
                });
              })
            }else{
              cb_w('createWallet.fail');
            }
          });
        },
        function(wallet, cb_w){
          wallet.resetPayPassword({accessToken}, cb_w);
        }
      ], cb);
    }
  })
};

module.exports = WalletSchema;