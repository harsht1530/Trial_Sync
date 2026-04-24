const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Options for connections
const options = {
  // Add any specific mongoose options here
};

// Create connections for each module
const piConn = mongoose.createConnection(MONGO_URI, { ...options, dbName: process.env.DB_NAME_PI });
const spConn = mongoose.createConnection(MONGO_URI, { ...options, dbName: process.env.DB_NAME_SP });
const hubConn = mongoose.createConnection(MONGO_URI, { ...options, dbName: process.env.DB_NAME_TCH });

// Log connection status
piConn.on('connected', () => console.log(`Connected to PI Database: ${process.env.DB_NAME_PI}`));
spConn.on('connected', () => console.log(`Connected to Subject Panel Database: ${process.env.DB_NAME_SP}`));
hubConn.on('connected', () => console.log(`Connected to Hub Database: ${process.env.DB_NAME_TCH}`));

module.exports = {
  piConn,
  spConn,
  hubConn
};
