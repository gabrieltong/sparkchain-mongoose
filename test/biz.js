let conn = require(`./conn`).conn_main;
let schema = require('../schema/biz');
let Biz = conn.model("Biz", schema);
let random = require("random-js")();
var assert = require('chai').assert;
let async = require('async');

describe('Biz', function() {
  it('static.getInstance', function(done){
    Biz.getInstance({}).then(function(instance){
      assert.equal(!!instance, true);
      assert.equal(!!instance._id, true);
      done();
    })
  })
})
return;