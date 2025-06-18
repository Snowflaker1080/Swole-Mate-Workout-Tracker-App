const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  Name: { type: String, required: true, unique: false },
  DisplayName: String,
  Manufacturer: String,
  Class: String,
  imageUrl: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // Only allow saving if a user is associated
  }
});

module.exports = mongoose.model("Car", carSchema);
