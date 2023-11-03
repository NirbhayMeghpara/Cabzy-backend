const mongoose = require("mongoose")
const User = require("../models/user")
const City = require("../models/city")
const VehicleType = require("../models/vehicleType")
const Driver = require("./driver")

const createRideSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true
    },
    cityID: {
      type: mongoose.Types.ObjectId,
      ref: City,
      required: true
    },
    serviceTypeID: {
      type: mongoose.Types.ObjectId,
      ref: VehicleType,
      required: true
    },
    rideID: {
      type: Number,
      unique: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    pickUp: {
      type: String,
      required: true,
      trim: true
    },
    stops: {
      type: Array,
      required: true
    },
    dropOff: {
      type: String,
      required: true,
      trim: true,
    },
    journeyDistance: {
      type: String,
      trim: true,
      required: true,
    },
    journeyTime: {
      type: String,
      trim: true,
      required: true,
    },
    totalFare: {
      type: String,
      required: true,
      trim: true,
    },
    paymentType: {
      type: String,
      default: "cash"
    },
    rideDate: {
      type: String,
      required: true,
      trim: true,
    },
    rideTime: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Number,
      default: 1
    },
    driverID: {
      type: mongoose.Types.ObjectId,
      ref: Driver,
    },
    rejectedDriverID: {
      type: Array,
    },
    timeoutDriverID: {
      type: Array,
    },
    assignSelected: {
      type: Boolean,
    },
    rating: {
      type: Number,
      trim: true
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
)

const CreateRide = mongoose.model("CreateRide", createRideSchema)

module.exports = CreateRide
