const cron = require("node-cron")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")
const { emitSocket, getRidePipeline, assignDriver } = require("./socket")
const Setting = require("../models/setting")

cron.schedule('*/10 * * * * *', async () => {
  getAssignedRide()
})

async function getAssignedRide() {
  const rides = await CreateRide.find({ status: 2 })
  if (!rides.length) console.log("No ride there")
  else rides.forEach((ride) => {
    checkDriver(ride)
  })
}

async function checkDriver(ride) {
  const driver = await Driver.findById(ride.driverID)
  const rideAssignTime = driver.rideAssignTime

  let maxTimeout = Math.floor(rideAssignTime / 1000) + 30

  let now = Math.floor(Date.now() / 1000)

  if (now >= maxTimeout) {
    try {
      console.log('Driver Timeout ' + driver.name)

      driver.set({ rideAssignTime: undefined })
      driver.set({ status: 0 })

      if (ride.assignSelected) {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { $unset: { assignSelected: 1, driverID: 1 }, status: 1 }, {
          new: true,
          runValidators: true,
        })
        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        await driver.save()
        emitSocket('driverTimeout', { ride: rideData[0], driver: driver.name })
      } else {
        const updatedRide = await CreateRide.findById(ride._id)
        updatedRide.timeoutDriverID.push(driver._id)
        updatedRide.driverID = undefined
        updatedRide.assignSelected = undefined
        updatedRide.status = 1

        await updatedRide.save()
        await driver.save()
        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        emitSocket('driverTimeout', { ride: rideData[0], driver: driver.name })
        assignDriver(updatedRide)
      }
    } catch (error) {
      emitSocket("error", error)
    }
  }
}
