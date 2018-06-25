require("dotenv").config();
let conn = require(`../conn`).conn;
let schema = require('../schema/wallet');
let Wallet = conn.model(process.env['SPARK_CHAIN_MODEL_WALLET'], schema);

module.exports = Wallet;