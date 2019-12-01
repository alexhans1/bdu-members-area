const { logger } = require('./index');

module.exports = {
  async saveTransactionIds(db, transactions) {
    try {
      await db('transaction_ids').insert(
        transactions.map(({ id }) => ({
          transaction_id: id,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })),
      );
    } catch (error) {
      logger.error('Error while saving transaction ids. Error:\n', error);
    }
  },

  async removeProcessedTransactions(db, transactions) {
    // Step 1:
    // get all existing transaction ids
    const existingTransactionIds = (
      await db('transaction_ids').select('transaction_id')
    ).map(({ transaction_id }) => transaction_id);

    // Step 2:
    // filter out transactions that have previously been processed
    return transactions.filter(
      ({ id }) => !existingTransactionIds.includes(id.toString()),
    );
  },
};
