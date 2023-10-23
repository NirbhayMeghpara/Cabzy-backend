const CreateRide = require("../models/createRide")
const Driver = require("../models/driver")


async function handleSocket(io) {
  io.on('connection', (socket) => {

    socket.on('assignToSelectedDriver', async ({ ride, driver }, callback) => {
      try {
        const updatedRide = await CreateRide.findByIdAndUpdate(ride._id, { driverID: driver._id, status: 2, assignSelected: true }, {
          new: true,  // Returns the updated document
          runValidators: true, // Ensures that validators are run
        })

        if (updatedRide) {
          const updatedDriver = await Driver.findByIdAndUpdate(driver._id, { status: 1 }, {
            new: true,
            runValidators: true,
          })

          if (updatedRide && updatedDriver) {
            callback(null, updatedRide)
          }
          callback("Error occured while updating driver", null)
        }
        callback("Error occured while updating ride", null)

      } catch (error) {
        callback(error)
      }
    })





    socket.on('assignRide', (data) => {
      // Logic to assign a ride to a selected driver
      // You might need to interact with a database here to track rides and available drivers
      // Once you have the ride and driver information, emit an event to notify the driver
      io.emit('rideAssigned', { rideRef: data.rideRef, driverRef: data.driverRef });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

module.exports = {
  handleSocket
}