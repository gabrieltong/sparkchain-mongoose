const mongoose = require("mongoose");
let Schema = mongoose.Schema
let sparkchain = require('sparkchain');
let moment = require('moment');
require('dotenv').config();
let async = require('async');

let AppSchema = new Schema({
  appcode: { type: String, required: true, index: true},
  appname: { type: String, required: true, index: true},
  appid: { type: String, required: true, index: {unique: true}},
  appsecret: { type: String, required: true, index: true},
  expired_at: Date,
  accessToken: { type: String}
});

AppSchema.statics.getAccessToken = async function(options, cb=null){
  let self = this;
  let {appcode, appname, appid, appsecret} = process.env;
  let {accessToken} = options;

  if(accessToken)
  {
    if(cb)
    {
      cb(null, accessToken);
      return;
    }else{
      return accessToken;
    }
  }
  
  let app = await self.findOne({appid});
  if(!app)
  {
    app = new self({appcode, appname, appid, appsecret});
    await app.save();
  }

  if(cb)
  {
    app.getAccessToken({}, cb);  
  }else{
    return new Promise(function(resolve, reject) {
      app.getAccessToken({}, function(err, accessToken){
        if(err)
        {
          reject(err) 
        }else{
          resolve(accessToken)
        }
      })
    });
  }
};

AppSchema.methods.getAccessToken = function(options, cb){
  let {refesh} = options;
  
  if(!refesh && moment(this.expired_at).isBefore(moment()))
  {
    refesh = true;
  }

  if(!this.accessToken || !this.expired_at)
  {
    refesh = true;
  }
  // console.log(refesh)
  if(refesh)
  {
    this.refreshAccessToken({}, function(err, result){
      if(err)
      {
        cb(err);
      }else{
        cb(null, result.accessToken);
      }
    })
  }else{
    cb(null, this.accessToken);
  }
};

AppSchema.methods.refreshAccessToken = function(options, cb){
  let {appid, appsecret} = this;
  let self = this;
  sparkchain.App.access({appid, appsecret}, function(err, response, body){
    // console.log(body);
    if(err)
    {
      cb(err)
    }else if(body.success)
    {
      self.accessToken = body.data.accessToken;
      self.expired_at = moment().add(1, 'hour');
      self.save(function(err){
        if(err)
        {
          cb(err)
        }else{
          cb(null, {accessToken: self.accessToken});
        }
      });
    }else{
      cb('refreshAccessToken.fail');
    }
  })
};


module.exports = AppSchema;