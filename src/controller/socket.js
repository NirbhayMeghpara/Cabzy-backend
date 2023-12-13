const mongoose = require("mongoose")
const CreateRide = require("../models/createRide")
const Admin = require('../models/admin')
const Driver = require("../models/driver")
const sendPushNotification = require('./sendPushNotification')
require('dotenv').config()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

let socketIo

async function handleSocket(io) {
  console.log("Handle socket start")
  socketIo = io
  io.on('connection', (socket) => {
    
    console.log(`Socket connected: ${socket.id}`)

    // Handle the 'disconnect' event
    socket.on('disconnect', () => {
      // Log when a socket is disconnected
      console.log(`Socket disconnected: ${socket.id}`)
    })

    socket.on('assignToSelectedDriver', async (data) => {
      try {
        const { ride, driver } = JSON.parse(data)
        
        if (driver.status === 0) {
          const updatedDriver = await Driver.findByIdAndUpdate(driver._id, { status: 1, rideAssignTime: Date.now() }, {
            new: true,
            runValidators: true,
          })

          const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { driverID: driver._id, status: 2, assignSelected: true }, {
            new: true,
            runValidators: true
          })

          const pipeline = getRidePipeline(updatedRide._id)

          const rideData = await CreateRide.aggregate(pipeline)

          if (rideData[0] && updatedDriver) {
            emitSocket("rideAssigned", rideData[0])
          } else {
            emitSocket("error", "Error occured while assigning driver")
          }
        }
      } catch (error) {
        console.log(error)
        emitSocket("error", error)
      }
    })

    socket.on('requestAcceptedByDriver', async (data) => {
      const { ride } = JSON.parse(data)

      try {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { status: 3, assignSelected: true }, {
          new: true,
          runValidators: true,
        })

        const updatedDriver = await Driver.findByIdAndUpdate(updatedRide.driverID, { status: 2 }, {
          new: true,
          runValidators: true,
        })

        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        if (rideData[0] && updatedDriver) {
          // await client.messages.create({
          //   body: `Good news! Your ride #${rideData[0].rideID} request has been accepted by a driver, please be ready at your pickup location. They'll be on their way shortly.`,
          //   from: process.env.TWILIO_PHONE_NUMBER,
          //   to: '+919664570980'
          // })

          emitSocket("rideAccepted", rideData[0])
        } else {
          emitSocket("error", "Error occured while accepting ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on('selectedDriverRejectRide', async (data) => {
      try {
        const { ride } = JSON.parse(data)

        const updatedDriver = await Driver.findByIdAndUpdate(ride.driverID, { $unset: { rideAssignTime: 1 }, status: 0 }, {
          new: true,
          runValidators: true,
        })

        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { $unset: { assignSelected: 1, driverID: 1 }, status: 1 }, {
          new: true,
          runValidators: true,
        })

        if (updatedRide && updatedDriver) {
          const pipeline = getRidePipeline(updatedRide._id)
          const rides = await CreateRide.aggregate(pipeline)
          emitSocket("rideRejected", { ride: rides[0], rideID: updatedRide.rideID, message: `${updatedDriver.name} rejected a ride :( ` })
        } else {
          emitSocket("error", "Error occured while rejecting a ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on('assignToNearestDriver', async (data) => { 
      const ride  = JSON.parse(data)

      try {
        const updatedRide = await CreateRide.findById(ride._id)
        updatedRide.rejectedDriverID = []
        updatedRide.timeoutDriverID = []
        await updatedRide.save()
        assignDriver(updatedRide)
      } catch (error) {
        console.log(error)
        emitSocket("error", error)
      }
    })

    socket.on('nearestDriverRejectRide', async (data) => {
      const { ride } = JSON.parse(data)
      try {
        const updatedDriver = await Driver.findByIdAndUpdate(ride.driverID, { $unset: { rideAssignTime: 1 }, status: 0 }, {
          new: true,
          runValidators: true,
        })

        const updatedRide = await CreateRide.findById(ride._id)
        updatedRide.rejectedDriverID.push(updatedDriver._id)
        updatedRide.driverID = undefined
        updatedRide.status = 0

        await updatedRide.save()

        if (updatedRide && updatedDriver) {
          const pipeline = getRidePipeline(updatedRide._id)
          const rides = await CreateRide.aggregate(pipeline)
          emitSocket("rideRejected", { ride: rides[0], rideID: updatedRide.rideID, message: `${updatedDriver.name} rejected a ride :( ` })
        } else {
          emitSocket("error", "Error occured while rejecting a ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on("updateRideStatus", async (data) => {
      try {
        const ride = JSON.parse(data)
        if (ride.status < 7) {
          const updatedRide = await CreateRide.findById(ride._id)
          updatedRide.status = ride.status + 1

          if (updatedRide.status === 6) {
            // await client.messages.create({
            //   body: `Exciting news! Your ride #${updatedRide.rideID} journey has begun. Driver is now en route to your destination. Sit back, relax, and enjoy the ride with us! Feel free to track the ride in real-time on the app..`,
            //   from: process.env.TWILIO_PHONE_NUMBER,
            //   to: '+919664570980'
            // })
          }

          if (updatedRide.status === 7) {
            await Driver.findByIdAndUpdate(ride.driverID, { $unset: { rideAssignTime: 1 }, status: 0 }, {
              new: true,
              runValidators: true,
            })

            // await client.messages.create({
            //   body: `You've reached your destination with ease. Your ride #${updatedRide.rideID} is now complete. We appreciate you choosing Cabzy for your journey. Your feedback is valuable to us. Please take a moment to share your thoughts about your experience. Safe travels!`,
            //   from: process.env.TWILIO_PHONE_NUMBER,
            //   to: '+919664570980'
            // })
          }
          await updatedRide.save()

          const pipeline = getRidePipeline(updatedRide._id)
          const rides = await CreateRide.aggregate(pipeline)
          emitSocket("statusUpdated", rides[0])
        }
      } catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on("cancelRide", async (data) => {
      try {
        const ride = JSON.parse(data)

        if (ride.status === 1) {
          const updatedRide = await CreateRide.findById(ride._id)
          updatedRide.status = -1
          await updatedRide.save()

          const pipeline = getRidePipeline(updatedRide._id)
          const rides = await CreateRide.aggregate(pipeline)
          emitSocket("rideCancelled", rides[0])
        } else {
          emitSocket("error", "Ride status must be pending !!")
        }

      } catch (error) {
        emitSocket("error", error)
      }
    })
  })
}

async function assignDriver(rideData) {
  const pipeline = getDriversPipeline(rideData._id)
  const ride = await CreateRide.aggregate(pipeline)

  if (ride[0].drivers.length === 0) {
    const updatedRide = await CreateRide.findByIdAndUpdate(rideData._id, { $unset: { assignSelected: 1, driverID: 1 }, status: 1 }, {
      new: true,
      runValidators: true,
    })
    const pipeline = getRidePipeline(updatedRide._id)
    const result = await CreateRide.aggregate(pipeline)
    emitSocket('rideTimeout', result[0])
    
    const admins = await Admin.find({})
    
    if(admins[0].deviceToken) {
      await sendPushNotification.sendToAndroid(admins[0].deviceToken, "Ride Timeout", `Ride: ${result[0].rideID} has been timed out :(`)
    }

    return
  }
  let updatedRide = rideData

  for (let i = 0; i < ride[0].drivers.length; i++) {
    const driver = ride[0].drivers[i]
    const selectedDriver = await Driver.findById(driver._id)

    if (selectedDriver.status === 0) {
      selectedDriver.status = 1
      selectedDriver.rideAssignTime = Date.now()
      await selectedDriver.save()

      updatedRide = await CreateRide.findByIdAndUpdate(ride[0]._id, { driverID: selectedDriver._id, status: 2, assignSelected: false }, {
        new: true,
        runValidators: true,
      })

      const pipeline = getRidePipeline(updatedRide._id)
      const rideData = await CreateRide.aggregate(pipeline)

      if (rideData[0] && selectedDriver) {
        emitSocket("rideAssigned", rideData[0])
      } else {
        emitSocket("error", "Error occured while assigning driver")
      }
      break
    }
  }

  if (updatedRide.status === 0) {
    const pipeline = getRidePipeline(updatedRide._id)
    const rideData = await CreateRide.aggregate(pipeline)

    if (rideData[0]) {
      emitSocket("rideHold", rideData[0])
    } else {
      emitSocket("error", "Error occured while assigning driver")
    }
  }
}

function emitSocket(event, data) {
  socketIo.emit(event, data)
}

function getDriversPipeline(rideID) {
  const pipeline = [
    {
      $match: { _id: new mongoose.Types.ObjectId(rideID) }
    },
    {
      $lookup: {
        from: "drivers",
        let: { serviceTypeID: "$serviceTypeID", cityID: "$cityID" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$serviceTypeID", "$$serviceTypeID"] },
                  { $eq: ["$cityID", "$$cityID"] },
                  { $in: ["$status", [0, 1]] },
                  { $eq: ["$isApproved", true] }
                ]
              }
            }
          },
          {
            $sort: { "updatedAt": 1 }
          },
          {
            $project: { _id: 1 }
          }
        ],
        as: "drivers"
      }
    },
    {
      $addFields: {
        drivers: {
          $setDifference: ["$drivers._id", "$rejectedDriverID"]
        }
      }
    },
    {
      $addFields: {
        drivers: {
          $setDifference: ["$drivers", "$timeoutDriverID"]
        }
      }
    }
  ]

  return pipeline
}

function getRidePipeline(rideID) {
  const pipeline = []

  pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(rideID) } })

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "userID",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: "cities",
        localField: "cityID",
        foreignField: "_id",
        as: "city"
      }
    },
    {
      $unwind: "$city"
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: "vehicleprices",
        localField: "serviceTypeID",
        foreignField: "_id",
        as: "serviceType"
      }
    },
    {
      $unwind: "$serviceType"
    }
  )

  pipeline.push(
    {
      $lookup: {
        from: "drivers",
        localField: "driverID",
        foreignField: "_id",
        as: "driver"
      }
    },
    {
      $unwind: {
        path: "$driver",
        preserveNullAndEmptyArrays: true
      }
    }
  )

  return pipeline
}

module.exports = {
  handleSocket,
  emitSocket,
  getRidePipeline,
  assignDriver
}