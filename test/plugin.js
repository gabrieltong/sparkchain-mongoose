let conn = require(`../conn`).conn;

let Main = require('../main');
let Schema = require('../schema/test');
// console.log(Schema)
let async = require('async');
require('dotenv').config();
Schema.plugin(Main.Plugin.Wallet, {});
var assert = require('chai').assert;
// console.log(Schema)
let Test = conn.model(process.env['SPARK_CHAIN_MODEL_TEST'], Schema);
// console.log(Biz);

describe('plugin#wallet', function() {
  it('create && safeTransfer', function(done){
    let fn = async function(){

      let from = await Test.findOne({name:'ee'});
      let other = new Test({});
      await other.save();
      await other.createWallet();

      let amount = 0.1;
      let chainCode = process.env.chainCode
      let tokenCode = process.env.tokenCode
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
  return;
  it('transfer', function(done){
    this.timeout(3 * 1000);
    let fn = async function(){
      from = await Test.findOne({name:'ee'});
      other = await Test.findOne({name:'p'});
      let amount = 30;
      let chainCode = process.env.chainCode
      let tokenCode = process.env.tokenCode
      let memo = 'ssss'
      
      await from.transfer({other, chainCode, tokenCode, amount, memo}).catch(e=>{
        assert.equal(!!e, true);
      })
      done();
    }
    fn();
  })
  return;
})
