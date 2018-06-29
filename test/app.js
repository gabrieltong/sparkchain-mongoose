let conn = require(`./conn`).conn_main;
let schema = require('../schema/app');
let App = conn.model("App", schema);
let random = require("random-js")();
var assert = require('chai').assert;
let async = require('async');
require('dotenv').config();

// describe('app', function() {
//   it('createInstance', function(done){
//     let {appcode, appname, appid, appsecret} = process.env;
//     let app = new App({appcode, appname, appid, appsecret});
//     app.save();
//   })
// })
// return;
describe('app#', function() {
  it('static.getAccessToken', function(done){
    let fn = async function(){
      let accessToken = await App.getAccessToken({}).catch(e=>{
        console.log(e)
      });
      console.log(accessToken)
      assert.equal(!!accessToken, true);
      done();
    }
    fn();
  })
})
// return;

describe('app', function() {
  this.timeout(3000)
  it('getAccessToken', function(done){
    let fn = async function(){
      let instance = await App.findOne();
      let accessToken = await instance.getAccessToken();
      console.log(accessToken)
      assert.equal(!!accessToken, true);
      done();
    }
    fn();
  })
})
// return;
describe('app', function() {
  it('refreshAccessToken', function(done){
    async.waterfall([
      function(cb_w){
        App.findOne({}).exec(cb_w);
      }
    ], function(err, instance){
      
      instance.refreshAccessToken({}).then(function(instance){
        assert.equal(err, null);
        assert.equal(!!instance, true);
        done();
      })
    })
  })
})
return;