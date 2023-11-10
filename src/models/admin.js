const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Entered email is invalid")
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 8) throw new Error("Password must be greater than 8 character")
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
})

// --------- Sometimes, we want to convert these documents to JSON format. For instance, we might want to send a admin's data as a response to an API request. When we do this, Mongoose automatically converts the document to JSON using a built-in method called toJSON. However, sometimes we want more control over how this conversion happens. whenever we call JSON.stringify(admin), it will first go through your custom toJSON method.   --------//

adminSchema.methods.toJSON = function () {
  const admin = this

  const adminObject = admin.toObject()

  delete adminObject.password
  delete adminObject.tokens

  return adminObject
}

// ------------------------ Generating token ------------------------ //

adminSchema.methods.genToken = async function () {
  const admin = this

  const token = jwt.sign({ _id: admin._id.toString() }, "nirbhay@cabzy")
  admin.tokens.push({ token })
  await admin.save()

  return token
}

adminSchema.statics.findByCredentials = async (email, password) => {
  const admin = await Admin.findOne({ email })
  if (!admin) {
    throw new Error("Please enter a valid credentials")
  }

  const isMatch = await bcrypt.compare(password, admin.password)

  if (!isMatch) {
    throw new Error("Please enter a valid credentials")
  }

  return admin
}

adminSchema.pre("save", async function (next) {
  const admin = this

  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8)
  }

  next()
})

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin
