const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  Name: {type: String, required: true, unique: false },
  DisplayName: String,
  Manufacturer: String,
  Class: String,
  imageUrl: String
});

module.exports = mongoose.model("Car", carSchema);
