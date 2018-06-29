let conn = require(`./conn`).conn_main;
let walletSchema = require('../schema/wallet');
let appSchema = require('../schema/app');
require("dotenv").config();
// let Wallet = conn.model("Wallet", walletSchema);
// let App = conn.model("App", appSchema);
let Wallet = require('../models/wallet');
let App = require('../models/app');

let random = require("random-js")();
var assert = require('chai').assert;
let async = require('async');
let userId = 'player-4';

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('wallet', function() {
  it('syncBalanceByAcount should ok', function(done){
    this.timeout(3 * 1000);
    let fn = async function abc(){
      let instance = await Wallet.findOne({userId});
      let {chainCode, tokenCode} = process.env;
      let result = await instance.syncBalanceByAcount({chainCode, tokenCode});
      assert.equal(result.balances.length, 2);
      done();
    }
    fn();
  })

  it('syncBalanceByAcount should not ok', function(done){
    this.timeout(10 * 1000);
    let fn = async function abc(){
      let instance = await Wallet.findOne({userId});
      let {chainCode, tokenCode} = process.env;
      try{
        let result = await instance.syncBalanceByAcount({chainCode:'sssdfsdfbac', tokenCode:'abc'});
        console.log(result)
        assert.equal(result.balances.length, 2);
        done();
      }catch(err)
      {
        assert.equal(err.toString(), 'no.account')
        done();
      }
    }
    fn();
  })
  // return;
  it('syncBalance', function(done){
    this.timeout(10 * 1000);
    let fn = async function(){
      let instance = await Wallet.findOne({userId: 'player-4'});
      assert.equal(!!instance, true);
      let {chainCode, tokenCode} = process.env;
      let result = await instance.syncBalance({chainCode, tokenCode}).catch(e=>{
        assert.equal(e, null);
        done();
        return;
      });
      assert.equal(result.balances.length, 2);
      done();
    }
    fn();
  })
  // return; 
  it('cachedBalances', function(done){
    this.timeout(10 * 1000)
    let fn = async function(){
      let wallet = await Wallet.findOne({userId: process.env['appid']});
      let result = await wallet.cachedBalances({});
      assert.equal(result.is_cache, false);
      result = await wallet.cachedBalances({});
      assert.equal(result.is_cache, true);
      await timeout(process.env.NODE_CACHE_TTD * 1000)
      result = await wallet.cachedBalances({});
      assert.equal(result.is_cache, false);    
      done();
    }
    fn();
  });
});
// return;
describe('Wallet', function() {
  it('newInstance', function(done){
    let fn = async function(){
      let userId = random.string(32);
      let password = random.string(32);
      let onlyWallet = false;
      let appId = process.env['appid'];
      let wallet = await Wallet.newInstance({appId, userId, password, onlyWallet});

      assert.equal(!!wallet, true);
      done();
    }
    fn();
  })
  // return;
  // this.timeout(3 * 1000)
  it('sync u1', function(done){
    let fn = async function(){
      let userId = process.env['u1.userId'];
      let walletAddr = process.env['u1.walletAddr'];
      let appId = process.env['u1.appId'];
      let name = 'u1';
      await Wallet.sync({name, appId, userId, walletAddr}).catch(function(err){
        assert.equal(err, null);
      })
      done();
    }
    fn();
  })
  // return;

  it('newInstance: exist sparkchain', function(done){
    let fn = async function(){
      let userId = process.env['ee.userId'];
      let password = random.string(32);
      let onlyWallet = false;
      let appId = process.env['ee.appId'];

      let instance = await Wallet.newInstance({userId, appId, password, onlyWallet}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!instance, true);
      done();
    }
    fn();
  })
  
  it('sync u2', function(done){
    let fn = async function(){
      let userId = 'player-4'
      let walletAddr = process.env['u2.walletAddr'];
      let appId = process.env['appid'];
      let name = 'u2';
      await Wallet.sync({name, appId, userId, walletAddr}).catch(function(err){
        assert.equal(err, null);
      })
      done();
    }
    fn();
  })
})

describe('wallet', function() {   
  it('getBalances', function(done){
    let fn = async function(){
      let instance = await Wallet.findOne({userId});
      assert.equal(!!instance, true);
      let {chainCode, tokenCode} = process.env;
      // chainCode = 'jingtum';
      let result = await instance.getBalances({chainCode, tokenCode}).catch(function(err){
        assert.equal(err, null);
      })
      done();
    }
    fn();
  })
  // return;
  it('getAccounts', function(done){
    let fn = async function(){
      let instance = await Wallet.findOne({userId});
      assert.equal(!!instance, true);
      let {chainCode, tokenCode} = process.env;
      // chainCode = 'jingtum';
      let result = await instance.getAccounts({chainCode, tokenCode}).catch(function(err){
        assert.equal(err, null);
      })
      done();
    }
    fn();
  })
})

describe('Wallet', function() {
  it('password', function(done){
    this.timeout(10 * 1000)
    let fn = async function(){

      let instance = await Wallet.findOne({userId:'player-4'});
      assert.equal(!!instance, true);

      let accessToken = await App.getAccessToken({});
      assert.equal(!!accessToken, true);

      let result = await instance.resetPassword({accessToken}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);
      
      let newPassword = random.string(32);
      result = await instance.modifyPassword({accessToken, newPassword}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);
      
      result = await instance.validPassword({accessToken}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);

      result = await instance.resetPayPassword({accessToken}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);

      let newPayPassword = random.string(32);
      result = await instance.updatePayPassword({accessToken,newPayPassword}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);
      
      result = await instance.validPayPassword({accessToken}).catch(function(err){
        assert.equal(err, null);
      })
      assert.equal(!!result, true);

      let payPassword = random.string(32);
      result = await instance.setPayPassword({accessToken,payPassword}).catch(function(err){
        assert.equal(err, null);
      })

      done();
    }
    fn();
  })
})
return;

describe('wallet', function() {
  this.timeout(10 * 1000)
  it('transfer fail', function(done){
    let fn = async function(){
      let accessToken = await App.getAccessToken({});
      let from = await Wallet.findOne({userId: process.env.appid});
      let other = await Wallet.findOne({userId});
        
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 10000 *10;
      let memo = '转账测试: from ee to player-4 : amount: 1';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      let result = await from.transfer(form)
      assert.equal(result.body.success, false);
      done();
    }
    fn();
  })

  it('transfer', function(done){
    let fn = async function(){
      let accessToken = await App.getAccessToken({});
      let from = await Wallet.findOne({userId: process.env.appid});
      let other = await Wallet.findOne({userId});
        
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from ee to player-4 : amount: 1';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      let result = await from.transfer(form)
      assert.equal(result.body.success, true);
      done();
    }
    fn();
  })  
  // return;
  it('transferToAccount', function(done){
    this.timeout(5 * 1000);
    let fn = async function(){
      let accessToken = await App.getAccessToken({});
      let from = await Wallet.findOne({userId: process.env.appid});
      let other = await Wallet.findOne({userId});

      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from u2 to u1 : amount: 0.01';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      form.account = other.accounts.find(a=>a.chainCode == chainCode).account;
      let result = await from.transferToAccount(form).catch(function(e){
        assert.equal(e, null);
      })
      console.log(result.body)
      assert.equal(result.body.success, true);
      done();
    }
    fn();
  })
  return;
  it('safe transfer', function(done){
    let fn = async function(){
      let accessToken = await App.getAccessToken({});
      let from = await Wallet.findOne({userId: process.env.appid});
      let other = await Wallet.findOne({userId});
        
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from u2 to u1 : amount: 0.01';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};

      let result = await from.safeTransfer(form).catch(function(e){
        assert.equal(!!e, true);
        done();
        return;
      })

      assert.equal(body.success, true);
      done();
    }    
    fn();
  })
});
return;