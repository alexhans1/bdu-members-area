const { logger } = require('./index');

module.exports = {
  async processTransactions(db, transactions) {
    try {
      // Step 1:
      // filter for transactions that have 'Xu6F' in their purpose
      const relevantTransactions = transactions.filter(({ purpose }) => {
        return purpose && purpose.includes('Xu6F') && purpose.includes('gT7u');
      });

      logger.debug(
        `Of the new transactions ${relevantTransactions.length} have the correct signature.`,
      );

      if (!relevantTransactions.length) {
        logger.info(
          '$$$ There are no new incoming transactions with the correct signature.',
        );
        logger.info('$$$ Finished Checking Bank Transactions $$$');
        return;
      }

      const allRegistrationIds = relevantTransactions.reduce(
        (ids, { purpose }) => {
          const regIdString = purpose.substring(
            purpose.search('Xu6F') + 4,
            purpose.search('gT7u'),
          );
          ids.push(...regIdString.split('fP4x').map(id => parseInt(id, 10)));
          ids.pop();
          return ids;
        },
        [],
      );

      const allRegistrations = await db('tournaments_users').where(
        'id',
        'IN',
        allRegistrationIds,
      );

      // map registrations to transactions
      const transactionsWithRegistrations = relevantTransactions.map(
        transaction => {
          const { purpose } = transaction;
          const regIdString = purpose.substring(
            purpose.search('Xu6F') + 4,
            purpose.search('gT7u'),
          );
          const regIds = regIdString.split('fP4x').map(id => parseInt(id, 10));
          regIds.pop();
          return {
            ...transaction,
            registrations: allRegistrations.filter(({ id }) => {
              return regIds.includes(id);
            }),
          };
        },
      );

      const updateQueries = transactionsWithRegistrations.reduce(
        (queries, { registrations, ...transaction }) => {
          let transactionAmount = transaction.amount;
          queries.push(
            ...registrations.map((registration, i) => {
              logger.debug(
                `Process transaction for ${transaction.counterpartName} for their registration with id: ${registration.id}`,
              );

              const price_paid =
                i + 1 < registrations.length
                  ? Math.min(transactionAmount, registration.price_owed)
                  : transactionAmount;
              transactionAmount -= price_paid;
              return db('tournaments_users')
                .update({
                  price_paid,
                  transaction_date: transaction.bankBookingDate,
                  transaction_from: transaction.counterpartName.substring(
                    0,
                    45,
                  ),
                })
                .where({ id: registration.id });
            }),
          );
          return queries;
        },
        [],
      );

      await Promise.all(updateQueries);

      logger.info(
        `\n $$$ Processed transactions for${transactionsWithRegistrations.map(
          t => `\n  - ${t.counterpartName} (€${t.amount})`,
        )}\n $$$ \n`,
      );
    } catch (error) {
      console.error('Error while processing transactions. Error:\n', error);
    }

    logger.info('\n $$$ Finished Checking Bank Transactions $$$ \n');
  },
};
