// enables environment variables for development
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' });

const moment = require('moment');
const schedule = require('node-schedule');

const request = require('request-promise');

const processTransactions = require('./processTransactions');
const transactionIdModelHelpers = require('./transactionIdModelHelpers');

const baseURL = process.env.finAPIBaseURL;

const CLIENT_ID = process.env.finApiClientID;
const CLIENT_SECRET = process.env.finApiClientSecret;

let USER_TOKEN;
let USER_REFRESH_TOKEN;
let USER_SESSION_EXPIRES_IN;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++ CONNECTING TO BANK TO GET TRANSACTIONS ++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const authenticateClient = () => {
  const options = {
    method: 'POST',
    url: `${baseURL}/oauth/token`,
    qs: {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    },
    json: true,
  };

  try {
    request(options)
      .then((parsedBody) => {
        if (parsedBody.access_token) {
          authenticateUser(parsedBody.access_token);
        } else throw { message: 'No client token!' };
      })
      .catch((err) => {
        console.error('$$$ Error while getting client token.');
        console.error(err.message);
      });
  } catch (err) {
    console.error('$$$ Error while getting client token.');
    console.error(err.message);
  }
};

const authenticateUser = (clientToken) => {
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
    request(options)
      .then((parsedBody) => {
        if (parsedBody.access_token) {
          USER_TOKEN = parsedBody.access_token;
          USER_REFRESH_TOKEN = parsedBody.refresh_token;
          USER_SESSION_EXPIRES_IN = parsedBody.expires_in;
          getAllTransactions(parsedBody.access_token);
        } else throw { message: 'No user token!' };
      })
      .catch((err) => {
        console.error('$$$ Error while authenticating user.');
        console.log(err.message);
      });
  } catch (err) {
    console.error('$$$ Error while authenticating user.');
    console.error(err.message);
  }
};

async function getAllTransactions(userToken) {
  const options = {
    method: 'GET',
    url: `${baseURL}/api/v1/transactions`,
    qs: {
      view: 'userView',
      direction: 'income',
      includeChildCategories: true,
      perPage: 500,
      minBankBookingDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    json: true,
  };

  try {
    const response = await request(options);
    if (response.transactions) {
      const newTransactions = await transactionIdModelHelpers.removeProcessedTransactions(response.transactions);
      processTransactions.processTransactions(newTransactions);
      transactionIdModelHelpers.saveTransactionIds(newTransactions);
    }
  } catch (ex) {
    console.error('$$$ Error while getting all transactions.');
    console.log(ex.message);
  }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++ PROCESS TRANSACTIONS IN DATABASE +++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// run banking service Mondays, Wednesdays and Fridays at 7pm German time (or 5pm iso time)
schedule.scheduleJob('0 17 * * *', () => {
  console.log('\n\n $$$ Starting to check Bank Transactions $$$ \n\n');
  authenticateClient();
});


// const test = async () => {
//   const transactions = JSON.parse('[{"id":99096446,"parentId":null,"accountId":917988,"valueDate":"2018-07-01 00:00:00.000","bankBookingDate":"2018-07-02 00:00:00.000","finapiBookingDate":"2018-07-02 00:00:00.000","amount":0,"purpose":"Kontoauszüge 3 x 0,25 0,75- Erstattung 3 x 0,25 0,75+ Porto 3 x 0,70 2,10-  Erstattung 3 x 0,70 2,10+  -------------- Abrechnung 30.06.2018 45,27- Kontostand/Rechnungsabschluss am 29.06.2018 5.529,80 +Rechnungsnummer. 20180702-BY111-00049603774","counterpartName":null,"counterpartAccountNumber":null,"counterpartIban":null,"counterpartBlz":null,"counterpartBic":null,"counterpartBankName":null,"counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"ENTGELTABSCHLUSS","typeCodeZka":"809","typeCodeSwift":"N024","primanota":"6666","category":{"id":320,"name":"Einnahmen","parentId":null,"parentName":null,"isCustom":false,"children":[323,324,325,326,327,330,1257]},"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096448,"parentId":null,"accountId":917988,"valueDate":"2018-07-02 00:00:00.000","bankBookingDate":"2018-07-02 00:00:00.000","finapiBookingDate":"2018-07-02 00:00:00.000","amount":35,"purpose":"Xu6F5052fP4gT7u Deutschsprachige Debattiermeisterschaft Luzia Surberg","counterpartName":"LUZIA SURBERG","counterpartAccountNumber":"0602178600","counterpartIban":"DE59492400960602178600","counterpartBlz":"49240096","counterpartBic":"COBADEFFXXX","counterpartBankName":"Commerzbank","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9249","category":null,"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096449,"parentId":null,"accountId":917988,"valueDate":"2018-07-02 00:00:00.000","bankBookingDate":"2018-07-02 00:00:00.000","finapiBookingDate":"2018-07-02 00:00:00.000","amount":40,"purpose":"Xu6F4762fP4gT7u Amsterdam Open 2018","counterpartName":"LENA ISABELL KOLLE","counterpartAccountNumber":"1904528953","counterpartIban":"DE32250501801904528953","counterpartBlz":"25050180","counterpartBic":"SPKHDE2HXXX","counterpartBankName":"Sparkasse Hannover","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9219","category":{"id":320,"name":"Einnahmen","parentId":null,"parentName":null,"isCustom":false,"children":[323,324,325,326,327,330,1257]},"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096450,"parentId":null,"accountId":917988,"valueDate":"2018-07-02 00:00:00.000","bankBookingDate":"2018-07-02 00:00:00.000","finapiBookingDate":"2018-07-02 00:00:00.000","amount":60,"purpose":"Rilling, Boiniwitz - Debating society Munich one Team, no judges","counterpartName":"Florens Rilling","counterpartAccountNumber":"7469023669","counterpartIban":"DE30600501017469023669","counterpartBlz":"60050101","counterpartBic":"SOLADEST600","counterpartBankName":"Landesbank Baden-Württemberg/Baden-Württembergische Bank (LBBW/BW-Bank)","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9227","category":{"id":320,"name":"Einnahmen","parentId":null,"parentName":null,"isCustom":false,"children":[323,324,325,326,327,330,1257]},"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096451,"parentId":null,"accountId":917988,"valueDate":"2018-07-03 00:00:00.000","bankBookingDate":"2018-07-03 00:00:00.000","finapiBookingDate":"2018-07-03 00:00:00.000","amount":75,"purpose":"Xu6F3862fP4x4562fP4x5022fP4x4312fP4gT7u ZEIT DEBATTE Munster, Hauptstadtdebatten 2, ZEIT DEBATTE Hannove, Deutschsprachige Deb","counterpartName":"Ela Marie Zahide Akay","counterpartAccountNumber":"0720447200","counterpartIban":"DE68100700240720447200","counterpartBlz":"10070024","counterpartBic":"DEUTDEDBBER","counterpartBankName":"Deutsche Bank Privat und Geschäftskunden F 700","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9249","category":null,"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096452,"parentId":null,"accountId":917988,"valueDate":"2018-07-03 00:00:00.000","bankBookingDate":"2018-07-03 00:00:00.000","finapiBookingDate":"2018-07-03 00:00:00.000","amount":30,"purpose":"Xu6F5622fP4gT7u Berlin Pro-Am 2018","counterpartName":"Zilmane, Ilze","counterpartAccountNumber":"1066105401","counterpartIban":"DE12100500001066105401","counterpartBlz":"10050000","counterpartBic":"BELADEBEXXX","counterpartBankName":"Landesbank Berlin - Berliner Sparkasse (auch ADAC, Amazon, airberlin Kreditkarten)","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9211","category":{"id":320,"name":"Einnahmen","parentId":null,"parentName":null,"isCustom":false,"children":[323,324,325,326,327,330,1257]},"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096453,"parentId":null,"accountId":917988,"valueDate":"2018-07-04 00:00:00.000","bankBookingDate":"2018-07-04 00:00:00.000","finapiBookingDate":"2018-07-04 00:00:00.000","amount":174.74,"purpose":"ZDB, TIV, NODM, SHIRTS, DDM","counterpartName":"Kebschull, Christof","counterpartAccountNumber":"0003254919","counterpartIban":"DE47120965970003254919","counterpartBlz":"12096597","counterpartBic":"GENODEF1S10","counterpartBankName":"Sparda-Bank Berlin","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9253","category":{"id":320,"name":"Einnahmen","parentId":null,"parentName":null,"isCustom":false,"children":[323,324,325,326,327,330,1257]},"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096455,"parentId":null,"accountId":917988,"valueDate":"2018-07-09 00:00:00.000","bankBookingDate":"2018-07-09 00:00:00.000","finapiBookingDate":"2018-07-09 00:00:00.000","amount":15,"purpose":"Xu6F5942fP4gT7u Hohenheimer Schlossc","counterpartName":"Constantin Ruhdorfer","counterpartAccountNumber":"0230456699","counterpartIban":"DE42760300800230456699","counterpartBlz":"76030080","counterpartBic":"CSDBDE71","counterpartBankName":"Consorsbank - BNP Paribas S.A. Niederlassung Deutschland","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9253","category":null,"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null},{"id":99096456,"parentId":null,"accountId":917988,"valueDate":"2018-07-11 00:00:00.000","bankBookingDate":"2018-07-11 00:00:00.000","finapiBookingDate":"2018-07-11 00:00:00.000","amount":20.49,"purpose":"Xu6F5722fP4gT7u Bestellung (Team-)T-","counterpartName":"Altner, Moritz","counterpartAccountNumber":"1021670037","counterpartIban":"DE59660501011021670037","counterpartBlz":"66050101","counterpartBic":"KARSDE66XXX","counterpartBankName":"Sparkasse Karlsruhe","counterpartMandateReference":null,"counterpartCustomerReference":null,"counterpartCreditorId":null,"type":"GUTSCHRIFT","typeCodeZka":"166","typeCodeSwift":"N062","primanota":"9227","category":null,"labels":[],"isPotentialDuplicate":false,"isAdjustingEntry":false,"isNew":true,"importDate":"2018-07-12 18:33:12.000","children":null,"paypalData":null}]');
//
//   const newTransactions = await transactionIdModelHelpers.removeProcessedTransactions(transactions);
//   await processTransactions.processTransactions(newTransactions);
//   transactionIdModelHelpers.saveTransactionIds(newTransactions);
// };
// test();
