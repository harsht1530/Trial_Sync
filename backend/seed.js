const mongoose = require('mongoose');
const Subject = require('./principle-investigator/models/Subject');
const dummyData = require('./dummy_data.json');

require('dotenv').config();
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log('Connected to MongoDB.');
    try {
      // Clear existing records
      await Subject.deleteMany({});
      console.log('Cleared existing subjects.');
      
      // Insert new dummy data
      await Subject.insertMany(dummyData);
      console.log('Successfully seeded database with dummy data.');
      process.exit(0);
    } catch (err) {
      console.error('Error seeding database:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
