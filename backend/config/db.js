const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CLINIK';
const DB_NAME = 'CLINIK';

console.log(`Connecting to Database with URI: ${MONGO_URI}`);

mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => console.log(`Connected to Master Database: ${DB_NAME} (URI: ${MONGO_URI})`))
  .catch(err => console.error(`Master database connection error for URI: ${MONGO_URI}:`, err));

const conn = mongoose.connection;

module.exports = {
  piConn: conn,
  spConn: conn,
  hubConn: conn,
  connection: conn
};

