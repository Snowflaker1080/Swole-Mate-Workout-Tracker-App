const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true },
  typeOfCar: {type: Boolean, default: false},
  //imageUrl: String
});

const Car = mongoose.model("Car", carSchema); // create model

module.exports = Car;

