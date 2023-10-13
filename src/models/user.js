const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!/^[a-zA-Z\s'-]+$/.test(value)) throw new Error("Please enter your name properly")
      },
    },

    profile: {
      type: String,
      required: true,
    },

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

    phoneCode: {
      type: String,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!/^[0-9]+$/.test(value) || value.length != 10)
          throw new Error("Enter a valid phone number")
      },
    },
    cards: {
      type: Array
    },
    stripeID: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User 