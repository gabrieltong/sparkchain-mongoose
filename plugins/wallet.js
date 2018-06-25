const mongoose = require("mongoose");
let Schema = mongoose.Schema
require("dotenv").config();
let Wallet = require('../models/wallet');
let random = require("random-js")();
let async = require('async');

module.exports = walletPlugin;

function walletPlugin(schema, options){
  // console.trace();
  schema.add({ walletUserId: String });
  schema.add({ wallet: { type: Schema.Types.ObjectId, ref: "Wallet", index: true } });
  
  schema.statics.getEE = function(cb){
    this.findOne({walletUserId: process.env.appid.toString()}, cb);
  };

  schema.methods.getWallet = function(cb){
    Wallet.findOne({_id: this.wallet}).exec(cb);
  };

  schema.methods.transferToAccount = function(options, cb){
    let {accessToken, account, chainCode, tokenCode, amount, memo} = options;
    let self = this;
    async.parallel({
      from: function(cb_p){
        self.getWallet(function(err, wallet){
          if(err)
          {
            cb_p(err);
          }else if(!wallet)
          {
            cb_p('no.wallet');
          }else{
            cb_p(null, wallet);
          }
        });
      }
    }, function(err, result){
      if(err)
      {
        cb(err);
      }else{
        let {from} = result;
        from.transferToAccount({account, chainCode, tokenCode, amount, memo, accessToken}, cb);
      }
    })
  };

  schema.methods.safeTransfer = function(options, cb){
    let {accessToken, other, chainCode, tokenCode, amount, memo} = options;
    let self = this;
    async.parallel({
      from: function(cb_p){
        self.getWallet(function(err, wallet){
          cb_p(null, wallet);
        });
      },
      other: function(cb_p){
        other.getWallet(function(err, wallet){
          cb_p(null, wallet);
        });
      }
    }, function(err, result){
      let {from, other} = result;
      if(from && other)
      {
        from.safeTransfer({other, chainCode, tokenCode, amount, memo, accessToken}, cb);  
      }else{
        cb('no wallet');
      }
    })
  };

  schema.methods.transfer = function(options, cb){
    let {accessToken, other, chainCode, tokenCode, amount, memo} = options;
    let self = this;
    async.parallel({
      from: function(cb_p){
        self.getWallet(function(err, wallet){
          wallet.sync({}, function(){
            cb_p(null, wallet);
          })
        });
      },
      other: function(cb_p){
        other.getWallet(function(err, wallet){
          wallet.sync({}, function(){
            cb_p(null, wallet);
          })
        });
      }
    }, function(err, result){
      let {from, other} = result;
      if(from && other)
      {
        from.transfer({other, chainCode, tokenCode, amount, memo, accessToken}, cb);
      }else{
        cb('no wallet');
      }
    })
  };

  schema.methods.createWallet = function(options, cb){
    let self = this;
    if(self.wallet)
    {
      cb();
    }else{
      // console.log('in...........')
      // console.log(self.wallet)
      // console.trace();
      let appId = process.env.appid;
      if(!self.walletUserId)
      {
        self.walletUserId = self._id.toString();
      }

      let userId = self.walletUserId;
      // let userId = random.string(32);
      
      let password = random.string(32);
      // console.log(Chain)
      // console.log('{appId, userId, password} >>>>')
      // console.log({appId, userId, password})
      Wallet.newInstance({appId, userId, password}, function(err, wallet){
        // console.log(arguments)
        // console.log(wallet)
        if(!err)
        {
          self.wallet = wallet;
          self.save(function(){
            cb();
          })
        }else{
          console.log(err);
          cb();
        }
      })
    }
  }
  // schema.post('init', function(self, next){
  //   self.createWallet({}, function(){
  //     next(); 
  //   });
  // });
};