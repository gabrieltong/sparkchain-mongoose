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

AppSchema.statics.getAccessToken = async function(options={}, cb=null){
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
    return app.getAccessToken();
  }
};

AppSchema.methods.getAccessToken = async function(options={}){
  let {refesh} = options;
  
  if(!refesh && moment(this.expired_at).isBefore(moment()))
  {
    refesh = true;
  }

  if(!this.accessToken || !this.expired_at)
  {
    refesh = true;
  }
  
  if(refesh)
  {
    let result = await this.refreshAccessToken({}).catch(e=>{
      return Promise.reject(e);
    })
    return result.accessToken;
  }else{
    return this.accessToken;
  }
};

AppSchema.methods.refreshAccessToken = async function(options){
  let {appid, appsecret} = this;
  let self = this;
  return new Promise(function(resolve, reject) {
    sparkchain.App.access({appid, appsecret}, async function(err, response, body){
      if(err)
      {
        return reject(err)
      }else if(body.success)
      {
        self.accessToken = body.data.accessToken;
        self.expired_at = moment().add(1, 'hour');
        await self.save().catch(e=>{
          return reject(e)
        })
          
        return resolve({accessToken: self.accessToken});
      }else{
        return reject('refreshAccessToken.fail');
      }
    })
  })
};


module.exports = AppSchema;