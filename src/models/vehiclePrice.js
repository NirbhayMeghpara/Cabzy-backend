const mongoose = require('mongoose')

const vehiclePriceSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    required: true,
    trim: true,
  },
  driverProfit: {
    type: Number,
    required: true,
    trim: true,
    min: 0,
    validate(value) {
      if (value > 80) throw new Error("Maximum allowed driver profit is 80%")
    },
  },
  minFare: {
    type: Number,
    required: true,
    trim: true,
    min: 0
  },
  basePriceDistance: {
    type: Number,
    required: true,
    trim: true,
    min: 0
  },
  basePrice: {
    type: Number,
    required: true,
    trim: true,
    min: 0
  },
  unitDistancePrice: {
    type: Number,
    required: true,
    trim: true,
    min: 0
  },
  unitTimePrice: {
    type: Number,
    required: true,
    trim: true,
    min: 0
  },
  maxSpace: {
    type: Number,
    required: true,
    trim: true,
    min: 0,
    validate(value) {
      if (value > 12) throw new Error("Maximum allowed space is 12 only")
    },
  },
})

const VehiclePrice = mongoose.model("VehiclePrice", vehiclePriceSchema)

module.exports = VehiclePrice