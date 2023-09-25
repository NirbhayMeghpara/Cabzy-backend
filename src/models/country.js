const mongoose = require('mongoose')

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  flag: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    trim: true,
    required: true,
  },
  timezone: {
    type: String,
    trim: true,
    required: true,
  },
  code: {
    type: String,
    trim: true,
    required: true,
  },
  alphaCode: {
    type: String,
    required: true,
    trim: true
  },
  latLong: {
    type: Array,
    required: true
  }
})

const Country = mongoose.model('Country', countrySchema)

module.exports = Country