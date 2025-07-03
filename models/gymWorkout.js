
import mongoose from "mongoose";

const { Schema } = mongoose;

const gymWorkoutSchema = new mongoose.Schema({
  apiId: {
    type: String,
    required: true,
    unique: true, // Prevent duplicates if saving from API
  },
  name: {
    type: String,
    required: true,
  },
  bodyPart: {
    type: String,
    enum: ["Legs", "Back", "Chest", "Shoulders", "Arms", "Core"],
    required: true,
  },
  // Link the workout to a specific user (used for personalisation and CRUD control)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
   image: {
    type: String,
    validate: {
      validator: function (url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/.test(url);
      },
      message: (props) => `${props.value} is not a valid image URL.`,
    },
  },
  notes: String,
  // Allow user to favourite a workout
  isFavourite: { type: Boolean, default: false },
  tags: [String]
});

// Compile the schema into a Mongoose model called 'GymWorkout' - This automatically maps to the 'gymworkouts' collection in MongoDB
const GymWorkout = mongoose.models.GymWorkout || mongoose.model("GymWorkout", gymWorkoutSchema);

// Export the model using ESM syntax
export default GymWorkout;