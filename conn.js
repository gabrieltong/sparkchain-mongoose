const mongoose = require("mongoose");
mongoose.set("debug", false);
let config = require('./config');

let {SPARK_CHAIN_USER, SPARK_CHAIN_PASS, SPARK_CHAIN_HOST, SPARK_CHAIN_PORT, SPARK_CHAIN_NAME} = config;
/**
 * @namespace Mongo
 * @memberOf Lib
 */

let conn_string;

if (SPARK_CHAIN_PASS) {
  conn_string = `mongodb://${SPARK_CHAIN_USER}:${SPARK_CHAIN_PASS}@${
    SPARK_CHAIN_HOST
  }:${SPARK_CHAIN_PORT}/${SPARK_CHAIN_NAME}`;
} else {
  conn_string = `mongodb://${SPARK_CHAIN_HOST}:${SPARK_CHAIN_PORT}/${
    SPARK_CHAIN_NAME
  }`;
}

let conn = mongoose.createConnection(conn_string);

module.exports = {
  conn, 
  conn_string
}