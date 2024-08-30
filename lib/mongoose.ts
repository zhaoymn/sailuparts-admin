import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    throw console.log('Please define the MONGODB_URI environment variable inside .env.local')
  }

  if (isConnected) {
    return console.log('using existing database connection');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "sailuparts"
    })
    isConnected = true;
    // console.log('Database connected');
  } catch (error) {
    console.log('Error connecting to database: ', error);
  }


};