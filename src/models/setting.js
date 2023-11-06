const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
  driverTimeout: {
    type: String,
    trim: true,
    required: true,
    default: '30'
  },
  stops: {
    type: String,
    required: true,
    trim: true,
    default: '1'
  },
  stripeKey: {
    type: String,
    trim: true,
  }
})

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting