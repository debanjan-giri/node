import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB);
    console.log(`DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`
        Error: ${error.message}`);
  }
};

export default connectDB;
