const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const {usersSchema, transaction} = require('./users-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const Transaction = mongoose.model('transactions', mongoose.Schema(transaction));

module.exports = {
  mongoose,
  User,
  Transaction,
};
