const mongoose = require("mongoose");
let Schema = mongoose.Schema

let BalanceSchema = new Schema({
  tokenCode: String,
  balance: Number,
  freezed: Number,
  chainCode: { type: String, required: true, index: true}
});

module.exports = BalanceSchema;