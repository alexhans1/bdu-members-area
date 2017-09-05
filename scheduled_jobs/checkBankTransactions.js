let dotenv = require('dotenv'); //enables environment variables for development
dotenv.config({path: '../.env'});
let _ = require('lodash');
let moment = require('moment');
let schedule = require('node-schedule');

let request = require('request-promise');

let conn = require('../knexfile.js'); //read out the DB Conn Data
let knex = require('knex')(conn[process.env.NODE_ENV || 'local']); //require knex query binder
let Bookshelf = require('bookshelf')(knex); //require Bookshelf ORM Framework

// DEFINE MODELS
let Models = require('../models/bookshelfModels.js')(Bookshelf);

let DEF_MODE = false;


let productionURL = 'https://sandbox.finapi.io';
let usedURL = productionURL;

const CLIENT_ID = process.env.finApiClientID;
const CLIENT_SECRET = process.env.finApiClientSecret;

let ACCESS_TOKEN;
let USER_TOKEN;
let USER_REFRESH_TOKEN;
let CONNECTION_ID;
let TRANSACTIONS;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++ CONNECTING TO BANK TO GET TRANSACTIONS ++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

async function authenticateClient () {

	let authenticateClientOptions = {
		method: 'POST',
		url: usedURL + '/oauth/token?grant_type=client_credentials&' +
		'client_id=' + CLIENT_ID +
		'&client_secret=' + CLIENT_SECRET,
		headers: [{
			name: 'content-type',
			value: 'application/json'
		}],
		json: true
	};

	await request(authenticateClientOptions)
	.then(function (parsedBody) {
		ACCESS_TOKEN = parsedBody.access_token
	})
	.catch(function () {
		console.error("$$$ Error while getting client token.");
	});

	if (DEF_MODE) console.log(ACCESS_TOKEN);

	// createUser(ACCESS_TOKEN,
	// 	process.env.finApiUsername,
	// 	process.env.finApiUserPassword,
	// 	process.env.finApiUserEmail,
	// 	process.env.finApiUserPhone
	// );
	authenticateUser(ACCESS_TOKEN, process.env.finApiUsername, process.env.finApiUserPassword);

}

async function createUser(clientToken, userID, userPassword, userEmail, userPhone) {

	let createUserOptions = {
		method: 'POST',
		url: usedURL + '/api/v1/users',
		body: {
			"id": userID,
			"password": userPassword,
			"email": userEmail,
			"phone": userPhone,
			"isAutoUpdateEnabled": false
		},
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + clientToken
		},
		json: true
	};

	try {
		await request(createUserOptions)
		.then(function (parsedBody) {
			console.log(parsedBody);
		})
		.catch(function (err) {
			console.error("$$$ Error while creating new user.");
			console.log(err.message);
		});
	} catch (ex) {
		console.error("$$$ Error while creating new user.");
		console.log(ex);
	}

}

async function authenticateUser(clientToken, userID, userPassword) {

	let authenticateUserOptions = {
		method: 'POST',
		url: usedURL + '/oauth/token?grant_type=password&' +
		'client_id=' + CLIENT_ID + '&' +
		'client_secret=' + CLIENT_SECRET + '&' +
		'username='	+ userID + '&password=' + userPassword,
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + clientToken
		},
		json: true
	};

	await request(authenticateUserOptions)
	.then(function (parsedBody) {
		USER_TOKEN = parsedBody.access_token;
		USER_REFRESH_TOKEN = parsedBody.refresh_token;
	})
	.catch(function (err) {
		console.error("$$$ Error while authenticating user.");
		console.log(err.message);
	});

	if (DEF_MODE) console.log(USER_TOKEN);

	getAllBankConnections(USER_TOKEN);
	// importBankConnection(USER_TOKEN, BANK_CREDENTIALS.username, BANK_CREDENTIALS.password, '24353')
}

async function importBankConnection(userToken, bankingUserId, bankingPIN, bankID) {

	console.log('$$$ Importing new Bank Connection.');

	let importBankConnectionOptions = {
		method: 'POST',
		url: usedURL + '/api/v1/bankConnections/import',
		body: {
			"bankId": bankID,
			"bankingUserId": bankingUserId,
			"bankingPin": bankingPIN,
			"storePin": true,
			"name": "BDU DKB Bank Account",
			"skipPositionsDownload": false,
			"maxDaysForDownload": 0
		},
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + userToken
		},
		json: true
	};

	try {
		await request(importBankConnectionOptions)
		.then(function (parsedBody) {
			CONNECTION_ID = parsedBody.id;
		})
		.catch(function (err) {
			console.error("$$$ Error while importing bank connections.");
			console.log(err.message);
		});
	} catch (ex) {
	    console.log(ex);
	}

	if (DEF_MODE) console.log(CONNECTION_ID);

	getConnectionStatus(USER_TOKEN, CONNECTION_ID)
}

async function updateBankConnection(userToken, bankConnectionId) {

	console.log('$$$ Updating Bank Connection.');

	let updateBankConnectionOptions = {
		method: 'POST',
		url: usedURL + '/api/v1/bankConnections/update',
		body: {
			"bankConnectionId": bankConnectionId,
			"importNewAccounts": false,
			"skipPositionsDownload": false,
		},
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + userToken
		},
		json: true
	};

	try {
		await request(updateBankConnectionOptions)
		.then(function (parsedBody) {
			CONNECTION_ID = parsedBody.id;
		})
		.catch(function (err) {
			console.error("$$$ Error while updating bank connections.");
			console.log(err.message);
		});
	} catch (ex) {
	    console.log(ex);
	}

	if (DEF_MODE) console.log(CONNECTION_ID);

	getConnectionStatus(USER_TOKEN, CONNECTION_ID)
}

async function getAllBankConnections(userToken) {

	let getAllBankConnectionsOptions = {
		method: 'GET',
		url: usedURL + '/api/v1/bankConnections/',
		headers: {
			'Authorization': 'Bearer ' + userToken
		},
		json: true
	};

	try {
		await request(getAllBankConnectionsOptions)
		.then(function (parsedBody) {
			if (parsedBody.connections.length) {
				CONNECTION_ID = parsedBody.connections[0].id;
				if (DEF_MODE) console.log(CONNECTION_ID);
				updateBankConnection(USER_TOKEN, CONNECTION_ID)
			} else {
				console.log('$$$ There is no bank connection. Please import one!');
				importBankConnection(USER_TOKEN, process.env.bankingID, process.env.bankingPin, '24353');
			}
		})
		.catch(function (err) {
			console.error("$$$ Error while getting bank connections.");
			console.log(err.message);
		});
	} catch (ex) {
	    console.log(ex);
	}

}

async function getConnectionStatus(userToken, connectionID) {

	let connStatus = null;

	let getConnectionStatusOptions = {
		method: 'GET',
		url: usedURL + '/api/v1/bankConnections/' + connectionID,
		headers: {
			'Authorization': 'Bearer ' + userToken
		},
		json: true
	};

	try {
		await request(getConnectionStatusOptions)
		.then(function (parsedBody) {
			connStatus = parsedBody.updateStatus;
			if (DEF_MODE) console.log(parsedBody.updateStatus);
		})
		.catch(function (err) {
			console.error("$$$ Error while getting connection status.");
			console.log(err.message);
		});
	} catch (ex) {
	    console.log(ex);
	}

	if (connStatus === 'READY') getAllTransactions(USER_TOKEN, 1);
	else {
		try {
			setTimeout(function(){
				getConnectionStatus(USER_TOKEN, CONNECTION_ID);
			}, 500);
		} catch (ex) {
		    console.log(ex);
		}
	}
}

async function getAllTransactions(userToken, page) {

	let getAllTransactionsOptions = {
		method: 'GET',
		url: usedURL + '/api/v1/transactions?view=userView&' +
		'direction=all&' +
		'includeChildCategories=true&' +
		'page=' + page + '&' +
		'perPage=100&' +
		'minBankBookingDate=' + moment().subtract(1, 'days').format('YYYY-MM-DD') + '&' +
		'order=bankBookingDate%2Cdesc',
		headers: {
			'Authorization': 'Bearer ' + userToken
		},
		json: true
	};

	try {
		await request(getAllTransactionsOptions)
		.then(function (parsedBody) {
			TRANSACTIONS = parsedBody;
		})
		.catch(function (err) {
			console.error("$$$ Error while getting all transactions.");
			console.log(err.message);
		});
	} catch (ex) {
	    console.log(ex);
	}

	if (DEF_MODE) console.log(TRANSACTIONS.transactions);
	
	// filter for only ingoing transactions that have '(?' in their purpose
	let positiveTransactions = _.filter(TRANSACTIONS.transactions, (transaction) => {
		return (transaction.amount >= 0 && transaction.purpose.search('\\(\\?') >= 0);
	});

	if (DEF_MODE) console.log(positiveTransactions);

	if (positiveTransactions.length) {
		processTransactions(positiveTransactions);
	} else {
		console.log('$$$ There are no new incoming transactions with the correct "(?" signature.');
		console.log('\n\n $$$ Finished Checking Bank Transactions $$$ \n\n');
	}

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++ PROCESS TRANSACTIONS IN DATABASE +++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

async function processTransactions(transactions) {

	for (let transaction of transactions) {
		let tmpAmount = transaction.amount;

		let reg_ids;

		// check if the transaction purpose includes squared brackets
		if (transaction.purpose.search('\\(\\?') >= 0 && transaction.purpose.search('\\?\\)') >= 0) {
			// if so, extract registration IDs
			let reg_id_string = transaction.purpose.substring(transaction.purpose.search('\\(\\?')
				+ 2, transaction.purpose.search('\\?\\)'));
			reg_ids = reg_id_string.split(',').map((id) => {
				return parseInt(id)
			});

			console.log('$$$ Process transaction(s) from ' + transaction.counterpartName);

			// Calculate total debt of all given registrations
			// and check if all the registrations exist
			let totalTransactionDebt = 0;
			for (let reg_id of reg_ids) {
				try {
					await Models.Registration.forge({id: reg_id}).fetch()
					.then((registration) => {
						if (registration) {
							totalTransactionDebt += (registration.toJSON().price_owed-registration.toJSON().price_paid);
						} else {
							// if the registration does not exist
							console.error('$$$ The registration named by ' + transaction.counterpartName + ' with the ID '
								+ reg_id + ' does not exist.');
							_.remove(reg_ids, (id) => {
								return (id === reg_id);
							});
						}
					});
				} catch (ex) {
				    console.log(ex);
				}
			}

			if (transaction.amount === totalTransactionDebt) {

				// set all price_paid to price_owed
				for (let reg_id of reg_ids) {
					try {
						await Models.Registration.forge({id: reg_id}).fetch()
						.then((registration) => {
							registration.save({
								price_paid: registration.toJSON().price_owed,
								transaction_date: transaction.bankBookingDate,
								transaction_from: transaction.counterpartName
							});
							console.log('$$$ Saved registration with ID ' + reg_id
								+ ' for user ' + transaction.counterpartName);
						})
					} catch (ex) {
						console.log(ex);
					}
				}

			} else if (transaction.amount > totalTransactionDebt) {

				// set all price_paid to price_owed
				for (let reg_id of reg_ids) {
					try {
						await Models.Registration.forge({id: reg_id}).fetch()
						.then((registration) => {
							registration.save({
								price_paid: registration.toJSON().price_owed,
								transaction_date: transaction.bankBookingDate,
								transaction_from: transaction.counterpartName
							});
							console.log('$$$ Saved registration with ID ' + reg_id
								+ ' for user ' + transaction.counterpartName);
						})
					} catch (ex) {
						console.log(ex);
					}
				}


				// add the overpaid amount to the price_paid of the first registration
				try {
					await Models.Registration.forge({id: reg_ids[0]}).fetch()
					.then((registration) => {
						registration.save({
							price_paid: registration.toJSON().price_paid + (transaction.amount - totalTransactionDebt),
							transaction_date: transaction.bankBookingDate,
							transaction_from: transaction.counterpartName
						});
						console.log('$$$ Added overpaid amount to registration with ID ' + reg_id
							+ ' for user ' + transaction.counterpartName);
					})
				} catch (ex) {
					console.log(ex);
				}

			} else {

				// first distribute potential credit
				for (let reg_id of reg_ids) {
					try {
						await Models.Registration.forge({id: reg_id}).fetch()
						.then((registration) => {
							reg = registration.toJSON();
							// if there is credit
							if (reg.price_paid > reg.price_owed) {
								// add the credit to the tmpAmount
								tmpAmount += reg.price_paid - reg.price_owed;

								// balance the registration
								registration.save({
									price_paid: reg.price_owed,
									transaction_date: transaction.bankBookingDate,
									transaction_from: transaction.counterpartName
								});

								// remove the registration from the reg_ids
								_.remove(reg_ids, (id) => {
									return (id === reg_id);
								});

								console.log('$$$ Balanced credit.', reg_id);

							}
						});
					} catch (ex) {
					    console.log(ex);
					}
				}

				for (let reg_id of reg_ids) {
					await Models.Registration.forge({id: reg_id}).fetch()
					.then((registration) => {
						if (registration) {
							let reg = registration.toJSON();
							// if registration exists, check if transaction amount covers the debt
							if (DEF_MODE) console.log(reg.price_owed-reg.price_paid, tmpAmount);
							if ((reg.price_owed - reg.price_paid) <= tmpAmount) {
								try {
									registration.save({
										price_paid: reg.price_owed,
										transaction_date: transaction.bankBookingDate,
										transaction_from: transaction.counterpartName
									})
									.then(() => {
										console.log('$$$ Successfully processed transaction for registration with ID: '
											+ reg_id + ' for ' + transaction.counterpartName);
										tmpAmount -= (reg.price_owed - reg.price_paid);
									})
								} catch (ex) {
									console.error(ex);
								}
							} else {
								// check if price_paid is already bigger than price_owed (Guthaben)
								if (reg.price_paid > reg.price_owed) {

								}

								// if tmpAmount is smaller than the debt for this registration, save the possible amount
								try {
									registration.save({
										price_paid: reg.price_paid + tmpAmount,
										transaction_date: transaction.bankBookingDate,
										transaction_from: transaction.counterpartName
									})
									.then(() => {
										console.log('$$$ Successfully updated rest amount for registration with ID: '
											+ reg_id + ' for ' + transaction.counterpartName);
										tmpAmount -= (reg.price_owed - reg.price_paid);
									})
								} catch (ex) {
									console.log(ex);
								}
							}

						} else {
							// if the registration does not exist
							console.error('$$$ The registration in the transaction purpose with the ID: '
								+ reg_id + ' does not exist for ' + transaction.counterpartName);
						}
					});
				}
			}
		} else {
			console.error('$$$ There were no correct registration IDs in the transaction purpose.');
		}
	}

	console.log('\n\n $$$ Finished Checking Bank Transactions $$$ \n\n');

}

// processTransactions([
// 	{
// 		purpose: 'bla sfte(?169?) TN Gebuehr Lund IV, Boddencup, Munich Open und Berlin IV',
// 		amount: 60,
// 		bankBookingDate: '2017-08-24 00:00:00.000',
// 		counterpartName: 'FLORIAN KINDERMANN',
// 	},
// 	{
// 		purpose: 'Geld für T (?176,302?)',
// 		amount: 150,
// 		bankBookingDate: '2017-08-24 00:00:00.000',
// 		counterpartName: 'Holzhey, Philippe Jurgen',
// 	},
// 	{
// 		purpose: 'Geld für T (?292,29,32?)',
// 		amount: 30,
// 		bankBookingDate: '2017-08-24 00:00:00.000',
// 		counterpartName: 'MORITZ ALTNER',
// 	},
// 	{
// 		purpose: 'Geld für T (?652,164,999?)',
// 		amount: 13.25,
// 		bankBookingDate: '2017-08-24 00:00:00.000',
// 		counterpartName: 'TIM SCHMIDTLEIN'
// 	}
// ]);


schedule.scheduleJob('0 2 * * *', function(){
	console.log('\n\n $$$ Starting to check Bank Transactions $$$ \n\n');
	authenticateClient();
});

if (DEF_MODE) authenticateClient();
