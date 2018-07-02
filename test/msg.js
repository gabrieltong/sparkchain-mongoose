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
    let fn = async function(){
      let instance = await Msg.findOne({});
      let accessToken = await App.getAccessToken({});  
      let newPassword = random.string(32);
      await instance.modifyPassword({accessToken, newPassword}).catch(err=>{
        assert.equal(err, null);
      })
      done();
    }
    fn();
  })
})