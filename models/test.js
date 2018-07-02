let config = require('../config');
let conn = require(`../conn`).conn;
let schema = require('../schema/test');
let Test = conn.model(config['SPARK_CHAIN_MODEL_MSG'], schema);

module.exports = Test;