const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require("bcryptjs")


const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Entered email is invalid")
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 8) throw new Error("Password must be greater than 8 character")
    }
  }
})


adminSchema.statics.findByCredentials = async (email, password) => {

  const admin = await Admin.findOne({ email })
  if (!admin) {
    throw "Please enter a valid credentials"
  }

  const isMatch = await bcrypt.compare(password, admin.password)

  if (!isMatch) {
    throw "Please enter a valid credentials"
  }

  return admin
}

adminSchema.pre('save', async function (next) {
  const admin = this

  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 8)
  }

  next()
})

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin