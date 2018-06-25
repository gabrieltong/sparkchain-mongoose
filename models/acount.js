require("dotenv").config();
let conn = require(`../conn`).conn;
let schema = require('../schema/acount');
let Acount = conn.model(process.env['SPARK_CHAIN_MODEL_ACOUNT'], schema);

module.exports = Acount;