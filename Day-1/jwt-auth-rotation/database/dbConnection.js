import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://rohanmakvana90:Rohan%400012@cluster0.tv2ipc7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
// Rohan@0012
export default dbConnection;
