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

describe('wallet', function() {
  it('syncBalanceByAcount', function(done){
    this.timeout(10 * 1000);
    async.parallel({
      instance: function(cb_p){
        Wallet.findOne({userId: 'player-3'}).exec(cb_p);
      }
    }, function(err, result){
      let {instance} = result;
      let {chainCode, tokenCode} = process.env;
      instance.syncBalanceByAcount({chainCode, tokenCode}, function(err, result){
        // console.log(result)
        assert.equal(err, null);
        assert.equal(result.balances.length, 2);
        done();
      })
    })
  })
  // return;
  it('syncBalance', function(done){
    this.timeout(10 * 1000);
    async.parallel({
      instance: function(cb_p){
        Wallet.findOne({userId: 'player-1'}).exec(cb_p);
      }
    }, function(err, result){
      let {instance} = result;
      let {chainCode, tokenCode} = process.env;
      instance.syncBalance({chainCode, tokenCode}, function(err, result){
        assert.equal(err, null);
        assert.equal(!!instance, true);
        done();
      })
    })
  })
  // return; 
  it('cachedBalances', function(done){
    this.timeout(10 * 1000)
    async.waterfall([
      function(cb_w){
        Wallet.findOne({userId: process.env['appid']}).exec(function(err, wallet){
          wallet.cachedBalances({}, function(err, result){
            assert.equal(result.is_cache, undefined);
            cb_w(err, wallet)
          })
        });
      },
      function(wallet, cb_w){
        wallet.cachedBalances({}, function(err, result){
          assert.equal(result.is_cache, true);
          cb_w(err, wallet)
        })
      },
      function(wallet, cb_w){
        wallet.cachedBalances({}, function(err, result){
          assert.equal(result.is_cache, true);
          setTimeout(function(){
            cb_w(err, wallet)  
          }, process.env.NODE_CACHE_TTD * 1000)
          
        })
      },
      function(wallet, cb_w){
        wallet.cachedBalances({}, function(err, result){
          assert.equal(result.is_cache, undefined);
          cb_w(err, wallet)
        })
      }
    ], function(er){
      done();
    })
  });
});
return;
describe('Wallet', function() {
  // return;  
  it('newInstance', function(done){
    let userId = random.string(32);
    let password = random.string(32);
    let onlyWallet = false;
    let appId = process.env['appid'];
    Wallet.newInstance({appId, userId, password, onlyWallet}, function(err, instance){
      assert.equal(err, null);
      assert.equal(!!instance, true);
      done();
    })
  })
  // return;
  // this.timeout(3 * 1000)
  it('sync u1', function(done){
    let userId = process.env['u1.userId'];
    let walletAddr = process.env['u1.walletAddr'];
    let appId = process.env['u1.appId'];
    let name = 'u1';
    Wallet.sync({name, appId, userId, walletAddr}, function(err){
      done();
    })
  })
  // return;

  it('newInstance: exist sparkchain', function(done){
    let userId = process.env['ee.userId'];
    let password = random.string(32);
    let onlyWallet = false;
    let appId = process.env['ee.appId'];

    Wallet.newInstance({userId, appId, password, onlyWallet}, function(err, instance){
      assert.equal(err, null);
      assert.equal(!!instance, true);
      done();
    })
  })
  
  it('newInstance: exist sparkchain', function(done){
    let userId = process.env['ee.userId'];
    let password = random.string(32);
    let onlyWallet = false;
    let appId = process.env['appid'];

    Wallet.newInstance({userId, appId, password, onlyWallet}, function(err, instance){
      assert.equal(err, null);
      assert.equal(!!instance, true);
      done();
    })
  })
  // return;
  
  it('sync u2', function(done){
    let userId = process.env['u2.userId'];
    let walletAddr = process.env['u2.walletAddr'];
    let appId = process.env['appid'];
    let name = 'u2';
    Wallet.sync({name, appId, userId, walletAddr}, function(err){
      done();
    })
  })
  // return
  
  it('sync pr', function(done){
    let userId = process.env['pr.userId'];
    let walletAddr = process.env['pr.walletAddr'];
    let appId = process.env['pr.appId'];
    let name = 'pr';
    Wallet.sync({name, appId, userId, walletAddr}, function(err){
      done();
    })
  })
  
  it('sync e1', function(done){
    let userId = process.env['e1.userId'];
    let walletAddr = process.env['e1.walletAddr'];
    let appId = process.env['e1.appId'];
    let name = 'e1';
    Wallet.sync({name, appId, userId, walletAddr}, function(err){
      done();
    })
  })
  // return;
  it('sync ee', function(done){
    let userId = process.env['ee.userId'];
    let walletAddr = process.env['ee.walletAddr'];
    let appId = process.env['ee.appId'];
    let name = 'ee';
    Wallet.sync({name, appId, userId, walletAddr}, function(err){
      done();
    })
  })
  // return;  
})

// return;
// return;
describe('wallet', function() {   
  it('getBalances', function(done){
    async.parallel({
      instance: function(cb_p){
        Wallet.findOne({userId: process.env['e1.userId']}).exec(cb_p);
      }
    }, function(err, result){
      let {instance} = result;
      let {chainCode, tokenCode} = process.env;
      // chainCode = 'jingtum';
      instance.getBalances({chainCode, tokenCode}, function(err, instance){
        assert.equal(err, null);
        assert.equal(!!instance, true);
        done();
      })
    })
  })
  // return;
  it('getAccounts', function(done){
    async.parallel({
      instance: function(cb_p){
        Wallet.findOne({userId: 'root'}).exec(cb_p);
      }
    }, function(err, result){
      let {instance} = result;
      instance.getAccounts({}, function(err, instance){
        assert.equal(err, null);
        assert.equal(!!instance, true);
        done();
      })
    })
  })
})

describe('Wallet', function() {
  it('password', function(done){
    this.timeout(10 * 1000)
    async.parallel({
      instance: function(cb_w){
        Wallet.findOne({}).exec(cb_w);
      },
      accessToken: function(cb_p){
        App.getAccessToken({}, cb_p);
      }      
    }, function(err, result){
      let {instance, accessToken} = result;

      async.waterfall([
        function(cb_w){
          instance.resetPassword({accessToken}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          let newPassword = random.string(32);
          instance.modifyPassword({accessToken, newPassword}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          instance.validPassword({accessToken}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          instance.resetPayPassword({accessToken}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          let newPayPassword = random.string(32);
          instance.updatePayPassword({accessToken,newPayPassword}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          instance.validPayPassword({accessToken}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
        function(cb_w){
          let payPassword = random.string(32);
      
          instance.setPayPassword({accessToken, payPassword}, function(err, instance){
            assert.equal(err, null);
            assert.equal(!!instance, true);
            cb_w();
          })
        },
      ],function(){
        done();
      })
    })
  })
})
// return;

describe('wallet', function() {
  // it('transfer fail', function(done){
  //   async.parallel({
  //     accessToken: function(cb_p){
  //       App.getAccessToken({}, cb_p);
  //     },
  //     from: function(cb_p){
  //       Wallet.findOne({userId: 'player-1'}).exec(cb_p);
  //     },
  //     other: function(cb_p){
  //       Wallet.findOne({userId: 'player-2'}).exec(cb_p);
  //     }
  //   }, function(err, result){
  //     let {from, other ,accessToken} = result;
  //     let chainCode = process.env.chainCode;
  //     let tokenCode = process.env.tokenCode;
  //     let amount = Math.pow(10,10);
  //     let memo = '转账测试: from u1 to u2 : amount: 0.01';
  //     let form = {accessToken, other, chainCode, tokenCode, amount, memo};
  //     from.transfer(form, function(err, response, body){
  //       assert.equal(body.success, false);
  //       done();
  //     })
  //   })
  // })
  // return;
  it('transferToAccount', function(done){
    this.timeout(5 * 1000);
    async.parallel({
      accessToken: function(cb_p){
        App.getAccessToken({}, cb_p);
      },
      from: function(cb_p){
        Wallet.findOne({userId: 'player-2'}).exec(function(err, wallet){
          wallet.getBalances({}, function(err){
            cb_p(err, wallet)
          })
        });
      },
      other: function(cb_p){
        Wallet.findOne({userId: 'player-1'}).exec(function(err, wallet){
          wallet.getBalances({}, function(err){
            cb_p(err, wallet)
          })
        });
      }
    }, function(err, result){
      let {from, other ,accessToken} = result;
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from u2 to u1 : amount: 0.01';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      form.account = other.accounts.find(a=>a.chainCode == chainCode).account;
      from.transferToAccount(form, function(err, response, body){
        assert.equal(body.success, true);
        assert.equal(err, null);
        from.getBalances({}, function(){
          other.getBalances({}, function(){
            done();
          })  
        })
      })
    })
  })
  // return;
  it('safe transfer', function(done){
    this.timeout(5 * 1000);
    async.parallel({
      accessToken: function(cb_p){
        App.getAccessToken({}, cb_p);
      },
      from: function(cb_p){
        Wallet.findOne({userId: 'player-1'}).exec(function(err, wallet){
          wallet.getBalances({}, function(err){
            cb_p(err, wallet)
          })
        });
      },
      other: function(cb_p){
        Wallet.findOne({userId: 'player-2'}).exec(function(err, wallet){
          wallet.getBalances({}, function(err){
            cb_p(err, wallet)
          })
        });
      }
    }, function(err, result){
      let {from, other ,accessToken} = result;
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from u2 to u1 : amount: 0.01';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      from.safeTransfer(form, function(err, response, body){
        assert.equal(body.success, true);
        assert.equal(err, null);
        from.getBalances({}, function(){
          other.getBalances({}, function(){
            done();
          })  
        })
      })
    })
  })

  it('transfer', function(done){
    async.parallel({
      accessToken: function(cb_p){
        App.getAccessToken({}, cb_p);
      },
      from: function(cb_p){
        Wallet.findOne({userId: 'player-1'}).exec(cb_p);
      },
      other: function(cb_p){
        Wallet.findOne({userId: 'player-2'}).exec(cb_p);
      }
    }, function(err, result){
      let {from, other ,accessToken} = result;
      let chainCode = process.env.chainCode;
      let tokenCode = process.env.tokenCode;
      let amount = 0.01;
      let memo = '转账测试: from u1 to u2 : amount: 0.01';
      let form = {accessToken, other, chainCode, tokenCode, amount, memo};
      from.transfer(form, function(err, response, body){
        assert.equal(body.success, true);
        assert.equal(err, null);
        done();
      })
    })
  })
});
return;