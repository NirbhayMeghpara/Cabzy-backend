const mongoose = require("mongoose")
const validator = require("validator")
const City = require("./city")
const VehiclePrice = require("./vehiclePrice")

const driverSchema = new mongoose.Schema(
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
    driverID: {
      type: Number,
      unique: true
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
    cityID: {
      type: mongoose.Types.ObjectId,
      ref: City,
      required: true
    },
    serviceTypeID: {
      type: mongoose.Types.ObjectId,
      ref: VehiclePrice,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 0 // 0 for available and 1 for unavailable
    },
    rideAssignTime: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
)

const Driver = mongoose.model("Driver", driverSchema)

module.exports = Driver
