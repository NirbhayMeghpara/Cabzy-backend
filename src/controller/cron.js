const cron = require("node-cron")
const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")

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

  console.log("Current Time:", now)
  console.log("Max Time:", maxTimeout)

  if (now >= maxTimeout) {
    console.log('Driver Timeout')
    futureTimeInSeconds = now + 30
  }
}



// function driverTimeout() {
//   now = new Date()
//   currentTimeInSeconds = Math.floor(now.getTime() / 1000)
//   console.log("Start", currentTimeInSeconds)
//   if (currentTimeInSeconds >= futureTimeInSeconds) {
//     console.log('Driver Timeout')
//     futureTimeInSeconds = currentTimeInSeconds + 30
//   }
// }
