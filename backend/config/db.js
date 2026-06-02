const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CLINIK';
const DB_NAME = 'CLINIK';

mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => console.log(`Connected to Master Database: ${DB_NAME}`))
  .catch(err => console.error('Master database connection error:', err));

const conn = mongoose.connection;

module.exports = {
  piConn: conn,
  spConn: conn,
  hubConn: conn,
  connection: conn
};

