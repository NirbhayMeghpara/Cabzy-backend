const mongoose = require('mongoose')


const citySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  country: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  location: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  coordinates: {
    type: Object,
    required: true,
  }
})

const City = mongoose.model('City', citySchema)

module.exports = City