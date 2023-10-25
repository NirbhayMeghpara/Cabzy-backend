const mongoose = require("mongoose")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")

async function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log("User connected")
    socket.on('assignToSelectedDriver', async ({ ride, driver }, callback) => {
      try {
        if (driver.status === 0) {
          const updatedDriver = await Driver.findByIdAndUpdate(driver._id, { status: 1 }, {
            new: true,
            runValidators: true,
          })

          const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { driverID: driver._id, status: 2, assignSelected: true }, {
            new: true,
            runValidators: true
          })

          const pipeline = getPipeline(updatedRide._id)

          const rideData = await CreateRide.aggregate(pipeline)

          if (rideData[0] && updatedDriver) {
            callback(null, rideData[0])
          }
          callback("Error occured while assigning driver", null)
        }
      } catch (error) {
        callback(error, null)
      }
    })

    socket.on('requestAcceptedByDriver', async ({ ride }, callback) => {
      try {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { status: 3, assignSelected: true }, {
          new: true,
          runValidators: true,
        })

        const updatedDriver = await Driver.findByIdAndUpdate(updatedRide.driverID, { status: 2 }, {
          new: true,
          runValidators: true,
        })

        const pipeline = getPipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        if (rideData[0] && updatedDriver) {
          callback(null, JSON.stringify(rideData[0]))
        }
        callback("Error occured while accepting a ride", null)

      } catch (error) {
        callback(error, null)
      }
    })

    socket.on('selectedDriverRejectRide', async ({ ride }, callback) => {
      try {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { status: 1, assignSelected: undefined, driverID: undefined }, {
          new: true,
          runValidators: true,
        })

        const updatedDriver = await Driver.findByIdAndUpdate(updatedRide.driverID, { status: 0 }, {
          new: true,
          runValidators: true,
        })

        if (updatedRide && updatedDriver) {
          callback(null, "Selected driver rejected a ride :( ")
        }
        callback("Error occured while rejecting a ride by driver", null)

      } catch (error) {
        callback(error, null)
      }
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

function getPipeline(rideID) {
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
  handleSocket
}