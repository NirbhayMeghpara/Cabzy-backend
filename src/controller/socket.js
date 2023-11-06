const mongoose = require("mongoose")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")

let socketIo

async function handleSocket(io) {
  console.log("Handle socket start")
  socketIo = io
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

          const pipeline = getRidePipeline(updatedRide._id)

          const rideData = await CreateRide.aggregate(pipeline)

          if (rideData[0] && updatedDriver) {
            emitSocket("rideAssigned", rideData[0])
          } else {
            emitSocket("error", "Error occured while assigning driver")
          }
        }
      } catch (error) {
        emitSocket("error", error)
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

        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        if (rideData[0] && updatedDriver) {
          emitSocket("rideAccepted", rideData[0])
        } else {
          emitSocket("error", "Error occured while accepting ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on('selectedDriverRejectRide', async ({ ride }) => {
      try {

        const updatedDriver = await Driver.findByIdAndUpdate(ride.driverID, { $unset: { rideAssignTime: 1 }, status: 0 }, {
          new: true,
          runValidators: true,
        })

        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { $unset: { assignSelected: 1, driverID: 1 }, status: 1 }, {
          new: true,
          runValidators: true,
        })

        if (updatedRide && updatedDriver) {
          emitSocket("rideRejected", { rideID: updatedRide.rideID, message: `${updatedDriver.name} rejected a ride :( ` })
        } else {
          emitSocket("error", "Error occured while rejecting a ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on('assignToNearestDriver', async (ride) => {
      try {
        const updatedRide = await CreateRide.findById(ride._id)
        updatedRide.rejectedDriverID = []
        updatedRide.timeoutDriverID = []
        await updatedRide.save()
        assignDriver(updatedRide)
      } catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on('nearestDriverRejectRide', async ({ ride }) => {
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
          emitSocket("rideRejected", { rideID: updatedRide.rideID, message: `${updatedDriver.name} rejected a ride :( ` })
        } else {
          emitSocket("error", "Error occured while rejecting a ride by driver")
        }
      }
      catch (error) {
        emitSocket("error", error)
      }
    })

    socket.on("updateRideStatus", async (ride) => {
      try {
        if (ride.status < 7) {
          const updatedRide = await CreateRide.findById(ride._id)
          updatedRide.status = ride.status + 1
          if (updatedRide.status + 1 === 7) {
            await Driver.findByIdAndUpdate(ride.driverID, { $unset: { rideAssignTime: 1 }, status: 0 }, {
              new: true,
              runValidators: true,
            })
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

    socket.on("cancelRide", async (ride) => {
      try {
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