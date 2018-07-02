let config = require('../config');
let conn = require(`../conn`).conn;
let schema = require('../schema/biz');
let Biz = conn.model(config['SPARK_CHAIN_MODEL_BIZ'], schema);

module.exports = Biz;