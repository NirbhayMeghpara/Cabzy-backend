const mongoose = require('mongoose')
const VehicleType = require('../models/vehicleType')
const fs = require("fs")
const path = require("path")


async function add(req, res) {
  try {
    let vehicleType = req.body.vehicleType
    vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase()

    const vehicleData = {
      vehicleType,
      vehicleImage: 'vehicleType/' + req.file.filename
    }

    const vehicle = await new VehicleType(vehicleData)
    await vehicle.save()
    res.status(201).send({ msg: `${vehicleType} added successfully` })
  }
  catch (error) {
    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/vehicleType/${req.file.filename}`)

    if (error.keyValue) {
      error.message = `${error.keyValue.vehicleType} is already added !!`
      return res.status(409).send({ error: error.message })
    }
    res.status(500).send({ error: error.message })
  }
}

async function fetch(req, res) {
  try {
    const vehicleTypeData = await VehicleType.find({})
    if (!vehicleTypeData.length) {
      return res.send({ msg: 'No vehicle types found' })
    }
    res.send(vehicleTypeData)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function edit(req, res) {
  try {
    let vehicleType = req.body.vehicleType
    vehicleType = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).toLowerCase()

    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const vehicle = await VehicleType.findById(objectId)

    if (!vehicle) {
      return res.status(401).send({ msg: 'No such vehicle found !!' })
    }
    const oldImage = vehicle.vehicleImage

    vehicle.vehicleType = vehicleType
    vehicle.vehicleImage = `vehicleType/${req.file.filename}`

    await vehicle.save()

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${oldImage}`)

    res.status(200).send({ msg: `Vehicle edited successfully !!` })
  } catch (error) {
    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/vehicleType/${req.file.filename}`)

    if (error.keyValue) {
      error.message = `${error.keyValue.vehicleType} is already exists !!`
    }
    res.status(409).send({ error: error.message })
  }
}

module.exports = { add, fetch, edit }