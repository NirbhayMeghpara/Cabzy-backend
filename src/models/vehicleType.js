const mongoose = require('mongoose')
const validator = require("validator")


const vehicleTypeSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  vehicleImage: {
    type: String,
    required: true,
  }
})

const VehicleType = mongoose.model('Vehicle', vehicleTypeSchema)

module.exports = VehicleType