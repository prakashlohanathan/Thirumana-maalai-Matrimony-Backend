import mongoose from 'mongoose';

export function dbConnection() {
  const BASE_URL =
    process.env.NODE_ENVIRONMENT === 'development'
      ? `mongodb://127.0.0.1:27017/${process.env.DEVELOPMENT_MONGO_DB_NAME}`
      : `mongodb+srv://${process.env.PRODUCTION_MONGO_DB_USER_NAME}:${process.env.PRODUCTION_MONGO_DB_PASSWORD}@matrimony.wroo2du.mongodb.net/${process.env.PRODUCTION_MONGO_DB_NAME}`;

  try {
    mongoose
      .connect(BASE_URL)
      .then(() => {
        console.log('DATABASE CONNECTION SUCCESSFUL');
      })
      .catch((err) => {
        console.error('ERROR CONNECTING TO DATABASE', err);
      });
  } catch (error) {
    console.error('SOMETHING WENT WRONG', error);
  }
}
