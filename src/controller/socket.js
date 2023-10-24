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
        console.log(rideData)
        if (rideData[0] && updatedDriver) {
          callback(null, JSON.stringify(rideData[0]))
        }
        callback("Error occured while assigning driver", null)

      } catch (error) {
        callback(error, null)
      }
    })

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
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

  return pipeline
}

module.exports = {
  handleSocket
}