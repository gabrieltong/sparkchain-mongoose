require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("debug", false);

/**
 * @namespace Mongo
 * @memberOf Lib
 */

let conn_string;

if (process.env.SPARK_CHAIN_PASS) {
  conn_string = `mongodb://${process.env.SPARK_CHAIN_USER}:${process.env.SPARK_CHAIN_PASS}@${
    process.env.SPARK_CHAIN_HOST
  }:${process.env.SPARK_CHAIN_PORT}/${process.env.SPARK_CHAIN_NAME}`;
} else {
  conn_string = `mongodb://${process.env.SPARK_CHAIN_HOST}:${process.env.SPARK_CHAIN_PORT}/${
    process.env.SPARK_CHAIN_NAME
  }`;
}

let conn = mongoose.createConnection(conn_string);

module.exports = {
  conn, 
  conn_string
}