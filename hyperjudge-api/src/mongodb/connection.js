const mongoose = require('mongoose');
const config = require('../config/env');

const connectMongo = async () => {
  if (!config.mongodb.uri) {
    console.warn('MONGODB_URI is not set. Skipping MongoDB connection. (This is optional per architecture)');
    return;
  }

  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Depending on strictness, we might throw here. But since it's optional:
    if (config.env === 'production') {
      throw error;
    }
  }
};

const disconnectMongo = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

module.exports = {
  connectMongo,
  disconnectMongo
};
