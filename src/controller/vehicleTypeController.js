const VehicleType = require('../models/vehicleType')

async function add(req, res) {
  try {
    const vehicleData = {
      vehicleType: req.body.vehicleType,
      vehicleImage: '/vehicleType/' + req.file.filename
    }

    const vehicle = await new VehicleType(vehicleData)
    await vehicle.save()
    res.status(201).send({ msg: "Vehicle type added successfully" })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add }