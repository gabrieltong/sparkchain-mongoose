let winston = require('winston');
let config = require('./config');
let {SPARK_CHAIN_LOG_LEVEL, SPARK_CHAIN_LOG_DIR} = config;
const logger = winston.createLogger({
  level: SPARK_CHAIN_LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${SPARK_CHAIN_LOG_DIR}/winston.sparkchain-mongoose.combined.log` }),
    new winston.transports.File({ filename: `${SPARK_CHAIN_LOG_DIR}/winston.sparkchain-mongoose.error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${SPARK_CHAIN_LOG_DIR}/winston.sparkchain-mongoose.debug.log`, level: 'debug' })
  ]
});

module.exports = exports = logger;