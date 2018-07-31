require('dotenv').config();

let defaults = {
  SPARK_REFRESHH_TOKEN: 1,
  SPARK_CHAIN_SAFE: 20,

  SPARK_CHAIN_HOST: '127.0.0.1',
  SPARK_CHAIN_PORT: 27017,
  SPARK_CHAIN_NAME: 'sparkchain-test',
  SPARK_CHAIN_USER: 'root',
  SPARK_CHAIN_PASS: '',

  SPARK_CHAIN_TEST_HOST: '127.0.0.1',
  SPARK_CHAIN_TEST_PORT: 27017,
  SPARK_CHAIN_TEST_NAME: 'sparkchain-test',
  SPARK_CHAIN_TEST_USER: 'root',
  SPARK_CHAIN_TEST_PASS: '',

  SPARK_CHAIN_MODEL_TEST: 'test',
  SPARK_CHAIN_MODEL_BIZ: 'biz',
  SPARK_CHAIN_MODEL_WALLET: 'wallet',
  SPARK_CHAIN_MODEL_MSG: 'msg',
  SPARK_CHAIN_MODEL_APP: 'app',
  SPARK_CHAIN_MODEL_ACCOUNT: 'account',

  SPARK_CHAIN_TRAN_KEY: 'userId',

  SPARK_CHAIN_LOG_LEVEL: 'debug',
  SPARK_CHAIN_LOG_DIR: 'logs',

  chainCode: 'jingtumTest',
  tokenCode: 'SWT',
  NODE_CACHE_TTD: 1
}

module.exports = exports = Object.assign(defaults, process.env);