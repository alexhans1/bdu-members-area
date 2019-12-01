// enables environment variables for development
const moment = require('moment');
const request = require('request-promise');

const transactionIdModelHelpers = require('./transactionIdModelHelpers');
const { logger } = require('./index');

const baseURL = process.env.finAPIBaseURL;
const CLIENT_ID = process.env.finApiClientID;
const CLIENT_SECRET = process.env.finApiClientSecret;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++ CONNECTING TO BANK TO GET TRANSACTIONS ++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const authenticateClient = async () => {
  const options = {
    method: 'post',
    url: `${baseURL}/oauth/token`,
    qs: {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    },
    json: true,
  };

  try {
    const parsedBody = await request(options);
    if (parsedBody.access_token) {
      logger.debug(`Access Token: ${parsedBody.access_token}`);
      return parsedBody.access_token;
    } else logger.error('No client token!');
  } catch (err) {
    logger.error('$$$ Error while getting client token.');
    logger.error(err.message);
    throw new Error('$$$ Error while getting client token.');
  }
};

const authenticateUser = async clientToken => {
  const options = {
    method: 'POST',
    url: `${baseURL}/oauth/token`,
    qs: {
      grant_type: 'password',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: process.env.finApiUsername,
      password: process.env.finApiUserPassword,
    },
    headers: {
      Authorization: `Bearer ${clientToken}`,
    },
    json: true,
  };

  try {
    const parsedBody = await request(options);
    if (parsedBody.access_token) {
      logger.debug(`User Token: ${parsedBody.access_token}`);
      return parsedBody.access_token;
    } else return logger.error('No user token!');
  } catch (err) {
    logger.error('$$$ Error while authenticating user.');
    logger.error(err.message);
    throw new Error('$$$ Error while authenticating user.');
  }
};

const updateBankConnection = async userToken => {
  const options = {
    method: 'POST',
    url: `${baseURL}/api/v1/bankConnections/update`,
    body: {
      bankConnectionId: process.env.finApiBankConnectionId,
    },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    json: true,
  };

  try {
    const parsedBody = await request(options);
    if (!parsedBody.errors) {
      return true;
    } else {
      logger.error(
        '$$$ Update bank connection failed. Error:\n',
        parsedBody.errors,
      );
      throw new Error('$$$ Update bank connection failed.');
    }
  } catch (err) {
    logger.error('$$$ Error while updating bank connection. Error:\n', err);
    throw new Error('$$$ Error while updating bank connection');
  }
};

async function getAllTransactions(db, userToken) {
  const options = {
    method: 'GET',
    url: `${baseURL}/api/v1/transactions`,
    qs: {
      view: 'userView',
      direction: 'income',
      includeChildCategories: true,
      perPage: 500,
      minBankBookingDate: moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    json: true,
  };

  try {
    const response = await request(options);
    if (response && response.transactions) {
      logger.debug(`Received ${response.transactions.length} transactions.`);
      const newTransactions = await transactionIdModelHelpers.removeProcessedTransactions(
        db,
        response.transactions,
      );
      logger.debug(`Of those ${newTransactions.length} are new transactions.`);
      return newTransactions;
    }
  } catch (ex) {
    logger.error('$$$ Error while getting all transactions. Error:\n', ex);
    throw new Error('$$$ Error while getting all transactions.');
  }
}

module.exports = {
  async getNewTransactions(db) {
    // get the access and user tokens
    const accessToken = await authenticateClient();
    if (!accessToken) throw new Error('Could not get accessToken');
    const userToken = await authenticateUser(accessToken);
    if (!userToken) throw new Error('Could not get userToken');

    // update the bank connection
    const success = await updateBankConnection(userToken);
    if (!success) throw new Error('Could not update bank connection.');
    // wait for more than enough time for the bank connection to be updated by finAPI
    await new Promise(resolve => setTimeout(resolve, 10000));

    // return the new transactions
    return getAllTransactions(db, userToken);
  },
};
