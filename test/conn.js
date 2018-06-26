require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("debug", false);

/**
 * @namespace Mongo
 * @memberOf Lib
 */

let conn_main_string;

if (process.env.SPARK_CHAIN_TEST_PASS) {
  conn_main_string = `mongodb://${process.env.SPARK_CHAIN_TEST_USER}:${process.env.SPARK_CHAIN_TEST_PASS}@${
    process.env.SPARK_CHAIN_TEST_HOST
  }:${process.env.SPARK_CHAIN_TEST_PORT}/${process.env.SPARK_CHAIN_TEST_NAME}`;
} else {
  conn_main_string = `mongodb://${process.env.SPARK_CHAIN_TEST_HOST}:${process.env.SPARK_CHAIN_TEST_PORT}/${
    process.env.SPARK_CHAIN_TEST_NAME
  }`;
}

let conn_main = mongoose.createConnection(conn_main_string);

let conn_log_string;

if (process.env.SPARK_CHAIN_TEST_PASS) {
  conn_log_string = `mongodb://${process.env.SPARK_CHAIN_TEST_LOG_USER}:${
    process.env.SPARK_CHAIN_TEST_LOG_PASS
  }@${process.env.SPARK_CHAIN_TEST_LOG_HOST}:${process.env.SPARK_CHAIN_TEST_LOG_PORT}/${
    process.env.SPARK_CHAIN_TEST_LOG_NAME
  }`;
} else {
  conn_log_string = `mongodb://${process.env.SPARK_CHAIN_TEST_LOG_HOST}:${
    process.env.SPARK_CHAIN_TEST_LOG_PORT
  }/${process.env.SPARK_CHAIN_TEST_LOG_NAME}`;
}

let conn_log = mongoose.createConnection(conn_log_string);

function load(name){

};

function get_db(){
  return require(`${process.env.GAME_BASE}/app/lib/db`);
};

module.exports = {
  conn_main, 
  conn_main_string,
  conn_log,
  conn_log_string,
  load,
  get_db
}