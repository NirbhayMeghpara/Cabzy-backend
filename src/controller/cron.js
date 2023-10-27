const cron = require("node-cron")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")
const { emitSocket, getRidePipeline } = require("./socket")

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

      const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { $unset: { assignSelected: 1, driverID: 1 }, status: 1 }, {
        new: true,
        runValidators: true,
      })
      const pipeline = getRidePipeline(updatedRide._id)
      const rideData = await CreateRide.aggregate(pipeline)
      await driver.save()
      emitSocket('driverTimeout', { ride: rideData[0], driver: driver.name })
    } catch (error) {
      emitSocket("error", error)
    }

  }
}
