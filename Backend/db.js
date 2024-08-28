const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://indianshahishere:G3I9s6PpldEZsCnT@cluster0.dl9ak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {

    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;