const mongoose = require('mongoose');
// Remove: require('dotenv').config();

const MONGO_URI = 'mongodb+srv://buzzhelio2901:AQyCKRcagJOu2bBv@cluster0.aseghii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0s';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;