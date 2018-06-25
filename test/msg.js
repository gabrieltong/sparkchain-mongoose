let conn = require(`./conn`).conn_main;
let msgSchema = require('../schema/wallet');
let appSchema = require('../schema/app');
let Msg = conn.model("Msg", msgSchema);
let App = conn.model("App", appSchema);
let random = require("random-js")();
var assert = require('chai').assert;
let async = require('async');


describe('Msg', function() {
  it('modifyPassword', function(done){
    async.parallel({
      instance: function(cb_p){
        Msg.findOne({}).exec(cb_p);
      },
      accessToken: function(cb_p){
        App.getAccessToken({}, cb_p);
      }
    }, function(err, result){
      let {instance, accessToken} = result;
      
      let newPassword = random.string(32);
      instance.modifyPassword({accessToken, newPassword}, function(err, instance){
        assert.equal(err, null);
        assert.equal(!!instance, true);
        done();
      })
    })
  })
})