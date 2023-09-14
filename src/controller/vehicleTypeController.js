const VehicleType = require('../models/vehicleType')
const fs = require("fs")
const path = require("path")

async function add(req, res) {
  try {
    let vehicleType = req.body.vehicleType
    vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)

    const vehicleData = {
      vehicleType,
      vehicleImage: 'vehicleType/' + req.file.filename
    }

    const vehicle = await new VehicleType(vehicleData)
    await vehicle.save()
    res.status(201).send({ msg: `${vehicleType} added successfully` })
  } catch (error) {
    if (error.keyValue) {
      error.message = `${error.keyValue.vehicleType} is already added !!`
    }
    res.status(409).send({ error: error.message })
  }
}

async function fetch(req, res) {
  try {
    const vehicleTypeData = await VehicleType.find({})
    if (!vehicleTypeData.length) {
      return res.send({ msg: 'No vehicle type is found' })
    }
    res.send(vehicleTypeData)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function edit(req, res) {
  try {
    let vehicleType = req.body.vehicleType
    vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)

    const vehicle = await VehicleType.findById(req.params.id)

    if (!vehicle) {
      return res.status(401).send('No such vehicle found !!')
    }
    vehicle.vehicleType = vehicleType

    if (req.file) {
      const uploadPath = path.join(__dirname, "../../uploads")
      fs.unlinkSync(`${uploadPath}/${vehicle.vehicleImage}`)
      vehicle.vehicleImage = `vehicleType/${req.file.filename}`
    }

    await vehicle.save()
    console.log(vehicle)
    res.status(200).send({ msg: `Vehicle edited successfully !!` })
  } catch (error) {
    if (error.keyValue) {
      error.message = `${error.keyValue.vehicleType} is already added !!`
    }
    res.status(409).send({ error: error.message })
  }
}

module.exports = { add, fetch, edit }