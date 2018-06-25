const mongoose = require("mongoose");
let Schema = mongoose.Schema

let TestSchema = new Schema({
  name: String
});

module.exports = TestSchema;