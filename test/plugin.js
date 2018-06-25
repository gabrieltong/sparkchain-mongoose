let conn = require(`../conn`).conn;

let Main = require('../main');
let Schema = require('../schema/test');
// console.log(Schema)
let async = require('async');
require('dotenv').config();
Schema.plugin(Main.Plugin.Wallet, {});

// console.log(Schema)
let Test = conn.model(process.env['SPARK_CHAIN_MODEL_TEST'], Schema);
// console.log(Biz);

describe('plugin#wallet', function() {
  it('create && safeTransfer', function(done){

    async.parallel({
      from: function(cb_p){
        Test.findOne({name:'ee'}).exec(cb_p)
      },
      other: function(cb_p){
        let t = new Test({});
        t.save(function(err){
          console.log(err)
          t.createWallet({}, function(){
            console.log(arguments)
            cb_p(null, t);
          })
        });
      }
    }, function(err, result){
      let {from, other} = result;
      let amount = 0.1;
      let chainCode = process.env.chainCode
      let tokenCode = process.env.tokenCode
      let memo = 'ssss'
      // consol
      from.safeTransfer({other, chainCode, tokenCode, amount, memo}, function(err){
        console.log(err);
        done();
      })
      // console.log(arguments);
      
      // done()
    })
  })
  return;
  
  it('createWallet', function(done){
    this.timeout(3 * 1000);

    async.waterfall([
      function(cb_w){
        let t = new Test();
        t.save(cb_w);
      }
    ], function(err, test){
      // console.log(arguments);
      Test.findOne({_id: test._id}).exec(function(err, test){
        test.createWallet({}, function(){
          console.log(arguments)
          done();
        })
      })
      // done()
    })
  })
  return;
  it('transfer', function(done){
    this.timeout(3 * 1000);

    async.parallel({
      from: function(cb_p){
        Test.findOne({name:'ee'}).exec(cb_p)
      },
      other: function(cb_p){
        Test.findOne({name:'p'}).exec(cb_p)
      }
    }, function(err, result){
      let {from, other} = result;
      let amount = 30;
      let chainCode = process.env.chainCode
      let tokenCode = process.env.tokenCode
      let memo = 'ssss'
      // consol
      from.transfer({other, chainCode, tokenCode, amount, memo}, function(err){
        console.log(err);
      })
      // console.log(arguments);
      
      // done()
    })
  })
  return;
})
