const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
  croneTime: {
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
  }
})

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting