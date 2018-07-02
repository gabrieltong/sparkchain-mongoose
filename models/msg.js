let config = require('../config');
let conn = require(`../conn`).conn;
let schema = require('../schema/msg');
let Msg = conn.model(config['SPARK_CHAIN_MODEL_MSG'], schema);

module.exports = Msg;