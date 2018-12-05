const mongoose = require("mongoose");
let Schema = mongoose.Schema

let MsgSchema = new Schema({
  id: { type: String, required: true, index: {unique: true}},
  state: { type: Number, required: true, index: true},
  userid: { type: String, required: true, index: true},
  type: { type: String, required: true, index: true},
  msgs: String,
  appid: String,
  createtime: String,
  viewtime: String
});

module.exports = MsgSchema;