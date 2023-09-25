const mongoose = require('mongoose')


const citySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  coordinates: {
    type: Array,
    required: true,
  }
})

const City = mongoose.model('City', citySchema)

module.exports = City