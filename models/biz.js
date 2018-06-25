require("dotenv").config();
let conn = require(`../conn`).conn;
let schema = require('../schema/biz');
let Biz = conn.model(process.env['SPARK_CHAIN_MODEL_BIZ'], schema);

module.exports = Biz;