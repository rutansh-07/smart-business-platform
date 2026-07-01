import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const count = await User.countDocuments();
    console.log(`\nTotal registered users: ${count}`);
    
    if (count > 0) {
      const users = await User.find().select('-password');
      console.log("\nUser Details:");
      console.table(users.map(u => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.status,
        Created: u.createdAt.toISOString().split('T')[0]
      })));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
