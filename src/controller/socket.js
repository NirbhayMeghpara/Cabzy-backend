const mongoose = require("mongoose")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")

async function handleSocket(io) {
  io.on('connection', (socket) => {
    socket.on('assignToSelectedDriver', async ({ ride, driver }) => {
      try {
        if (driver.status === 0) {
          const updatedDriver = await Driver.findByIdAndUpdate(driver._id, { status: 1, rideAssignTime: Date.now() }, {
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
            console.log("ride assigned")
            io.emit("rideAssigned", rideData[0])
          } else {
            io.emit("error", "Error occured while assigning driver")
          }
        }
      } catch (error) {
        io.emit("error", error)
      }
    })

    socket.on('requestAcceptedByDriver', async ({ ride }) => {
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
          io.emit("rideAccepted", rideData[0])
        } else {
          io.emit("error", "Error occured while accepting ride by driver")
        }
      }
      catch (error) {
        io.emit("error", error)
      }
    })

    socket.on('selectedDriverRejectRide', async ({ ride }) => {
      try {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { status: 1, assignSelected: undefined, driverID: undefined }, {
          new: true,
          runValidators: true,
        })

        const updatedDriver = await Driver.findByIdAndUpdate(updatedRide.driverID, { status: 0, rideAssignTime: undefined }, {
          new: true,
          runValidators: true,
        })

        console.log(updatedDriver)

        if (updatedRide && updatedDriver) {
          io.emit("rideRejected", "Selected driver rejected a ride :( ")
        } else {
          io.emit("error", "Error occured while rejecting a ride by driver")
        }
      }
      catch (error) {
        io.emit("error", error)
      }
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