/**
 * Database Connection Manager (MongoDB Atlas)
 * Lab 4 - Web Services & SOA Laboratory
 */

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️  [Database] No MONGODB_URI found in environment. Running in in-memory persistence mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`✅ [Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [Database] Could not connect to MongoDB Atlas (${err.message}). Falling back to local in-memory storage.`);
    isConnected = false;
    return false;
  }
}

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  getIsConnected
};
