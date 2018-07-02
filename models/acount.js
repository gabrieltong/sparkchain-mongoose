let config = require('../config');
let conn = require(`../conn`).conn;
let schema = require('../schema/acount');
let Acount = conn.model(config['SPARK_CHAIN_MODEL_ACOUNT'], schema);

module.exports = Acount;