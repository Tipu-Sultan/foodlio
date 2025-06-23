// lib/server.ts
import mongoose, { connection } from 'mongoose';
import { Category, Restaurant } from './schema';

// Cached connection to avoid multiple connections
const MONGODB_URI = process.env.MONGODB_URI;

let isConnected: boolean = false;

export async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Close connection (optional, for cleanup in specific cases)
export async function disconnectDB() {
  if (isConnected) {
    await connection.close();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  }
}

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});