require('dotenv').config({ path: '../.env' });

const knex = require('knex');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

exports.logger = logger;

const dbConnection = {
  client: 'mysql',
  connection: {
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'bb41eedfd379a8',
    password: process.env.clearDB_password,
    database: 'heroku_9b6f95eb7a9adf8',
    charset: 'utf8',
  },
  pool: {
    max: 10,
    min: 0,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};

const db = knex(dbConnection);

const finApiService = require('./finApiService');
const processTransactions = require('./processTransactions');
const transactionIdModelHelpers = require('./transactionIdModelHelpers');

async function execute() {
  logger.info('\n$$$ Starting bank service $$$\n');
  const newTransactions = await finApiService.getNewTransactions(db);
  if (!newTransactions || !newTransactions.length) {
    return logger.info('No new transaction to process');
  }

  await transactionIdModelHelpers.saveTransactionIds(db, newTransactions);
  await processTransactions.processTransactions(db, newTransactions);
}

exports.handler = execute;
