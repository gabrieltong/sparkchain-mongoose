let config = require('../config');
const mongoose = require("mongoose");
mongoose.set("debug", false);

let {GAME_BASE, SPARK_CHAIN_TEST_NAME, SPARK_CHAIN_TEST_USER, SPARK_CHAIN_TEST_PASS, SPARK_CHAIN_TEST_HOST, SPARK_CHAIN_TEST_PORT} = config;
/**
 * @namespace Mongo
 * @memberOf Lib
 */

let conn_main_string;

if (SPARK_CHAIN_TEST_PASS) {
  conn_main_string = `mongodb://${SPARK_CHAIN_TEST_USER}:${SPARK_CHAIN_TEST_PASS}@${
    SPARK_CHAIN_TEST_HOST
  }:${SPARK_CHAIN_TEST_PORT}/${SPARK_CHAIN_TEST_NAME}`;
} else {
  conn_main_string = `mongodb://${SPARK_CHAIN_TEST_HOST}:${SPARK_CHAIN_TEST_PORT}/${
    SPARK_CHAIN_TEST_NAME
  }`;
}

let conn_main = mongoose.createConnection(conn_main_string);


let {SPARK_CHAIN_TEST_LOG_NAME, SPARK_CHAIN_TEST_LOG_USER, SPARK_CHAIN_TEST_LOG_PASS, SPARK_CHAIN_TEST_LOG_HOST, SPARK_CHAIN_TEST_LOG_PORT} = config;

let conn_log_string;

if (SPARK_CHAIN_TEST_LOG_PASS) {
  conn_log_string = `mongodb://${SPARK_CHAIN_TEST_LOG_USER}:${
    SPARK_CHAIN_TEST_LOG_PASS
  }@${SPARK_CHAIN_TEST_LOG_HOST}:${SPARK_CHAIN_TEST_LOG_PORT}/${
    SPARK_CHAIN_TEST_LOG_NAME
  }`;
} else {
  conn_log_string = `mongodb://${SPARK_CHAIN_TEST_LOG_HOST}:${
    SPARK_CHAIN_TEST_LOG_PORT
  }/${SPARK_CHAIN_TEST_LOG_NAME}`;
}

let conn_log = mongoose.createConnection(conn_log_string);

function load(name){

};

function get_db(){
  return require(`${GAME_BASE}/app/lib/db`);
};

module.exports = {
  conn_main, 
  conn_main_string,
  conn_log,
  conn_log_string,
  load,
  get_db
}