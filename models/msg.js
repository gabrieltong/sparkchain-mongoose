require("dotenv").config();
let conn = require(`../conn`).conn;
let schema = require('../schema/msg');
let Msg = conn.model(process.env['SPARK_CHAIN_MODEL_MSG'], schema);

module.exports = Msg;