const cron = require("node-cron")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")
const { emitSocket, getRidePipeline, assignDriver } = require("./socket")
const Setting = require("../models/setting")

let driverTime

cron.schedule('*/10 * * * * *', async () => {
  getAssignedRide()
})

async function checkSettings() {
  const data = await Setting.find({})
  driverTime = parseInt(data[0].driverTimeout)
}

async function getAssignedRide() {
  await checkSettings()
  const rides = await CreateRide.find({ status: { $in: [0, 2] } })
  if (!rides.length) console.log("No ride there")
  else {
    for (const ride of rides) {
      await checkDriver(ride)
    }
  }
}

async function checkDriver(ride) {
  if (ride.status === 0) {
    await assignDriver(ride)
    return
  }
  const driver = await Driver.findById(ride.driverID)
  const rideAssignTime = driver.rideAssignTime

  let maxTimeout = Math.floor(rideAssignTime / 1000) + driverTime

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
        await driver.save()
        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        emitSocket('driverTimeout', { ride: rideData[0], driver: driver.name })
      } else {
        const updatedRide = await CreateRide.findById(ride._id)
        updatedRide.timeoutDriverID.push(driver._id)
        // updatedRide.driverID = undefined
        // updatedRide.assignSelected = undefined
        updatedRide.status = 0

        await updatedRide.save()
        await driver.save()
        const pipeline = getRidePipeline(updatedRide._id)
        const rideData = await CreateRide.aggregate(pipeline)
        emitSocket('driverTimeout', { ride: rideData[0], driver: driver.name })
        await assignDriver(updatedRide)
      }
    } catch (error) {
      emitSocket("error", error)
    }
  }
}
