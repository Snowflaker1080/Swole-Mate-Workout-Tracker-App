const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: String,
  isReadyToEat: Boolean,
});

const Car = mongoose.model("Car", carSchema); // create model

module.exports = mongoose.model( "Car", carSchema);
module.exports = Car;

