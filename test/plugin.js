let config = require(`../config`);
let conn = require(`../conn`).conn;

let Main = require('../main');
let Schema = require('../schema/test');
// console.log(Schema)
let async = require('async');
Schema.plugin(Main.Plugin.Wallet, {});
var assert = require('chai').assert;
// console.log(Schema)
// console.log(Biz);
let {SPARK_CHAIN_MODEL_TEST, chainCode, tokenCode,} = config;

let Test = conn.model(SPARK_CHAIN_MODEL_TEST, Schema);

describe('plugin#wallet', function() {
  it('create && safeTransfer', function(done){
    let fn = async function(){

      let from = await Test.findOne({name:'ee'});
      let other = new Test({});
      await other.save();
      await other.createWallet();

      let amount = 0.1;
      let memo = 'ssss'
      // consol
      await from.safeTransfer({other, chainCode, tokenCode, amount, memo}).catch(e=>{
        assert.equal(!!e, true);
      })
      done();
    }
    fn();
  })
  // return;
  
  it('createWallet', function(done){
    this.timeout(3 * 1000);

    let fn = async function(){
      let test = new Test();
      await test.save();
      
      test = await Test.findOne({_id: test._id});
      await test.createWallet();
      done();
    }
    fn();
  })
  // return;
  it('transfer', function(done){
    this.timeout(3 * 1000);
    let fn = async function(){
      from = await Test.findOne({name:'ee'});
      other = await Test.findOne({name:'p'});
      let amount = 30;
      let memo = 'ssss'
      
      await from.transfer({other, chainCode, tokenCode, amount, memo}).catch(e=>{
        assert.equal(!!e, true);
      })
      done();
    }
    fn();
  })
  // return;

  it('transferByPassword ok', function(done){
    this.timeout(3 * 1000);
    let fn = async function(){
      from = await Test.findOne({name:'player-1'});
      account = 'jUvcf9FehWDQ2TRbi731PPxa7TSVrvCUQZ';
      let amount = 1;
      let memo = 'ssss'
      let payPassword = '2222222';
      let result = await from.transferByPassword({account, chainCode, tokenCode, amount, payPassword, memo}).catch(e=>{
        assert.equal(e, null);
      })
      done();
    }
    fn();
  })
  return;
})
