let config = require('../config');
let conn = require(`../conn`).conn;
let schema = require('../schema/app');
let App = conn.model(config['SPARK_CHAIN_MODEL_APP'], schema);

module.exports = App;