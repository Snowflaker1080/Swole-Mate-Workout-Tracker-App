// Import the mongoose library for schema and database interaction
import mongoose from "mongoose";

// Schema for a User document defined
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
});

// Compile the schema into a Mongoose model called 'User'- This creates a 'users' collection in MongoDB
const User = mongoose.model("User", userSchema);

// Export the model so it can be imported elsewhere in the app
export default User;
