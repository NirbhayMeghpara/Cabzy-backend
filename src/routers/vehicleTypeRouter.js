const express = require("express");
const VehicleType = require('../models/vehicleType')
const auth = require('../middleware/auth')
const vehicleController = require('../controller/vehicleTypeController')
const multer = require('multer')

const router = new express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads/vehicleType')
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop()

    let type = req.body.vehicleType
    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()

    return cb(null, `${type}_image.${extension}`)
  }
})

const upload = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload file with jpg, jpeg or png format"))
    }
    cb(null, true)
  },
  storage
})

// ----------------------------  Adding vehicleType to database  ---------------------------- // 

router.post('/vehicle/add', auth, upload.single("vehicleImage"), vehicleController.add, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})


// ----------------------------  Fetching vehicleType from database  ---------------------------- // 

router.get('/vehicle', auth, vehicleController.fetch)

// ----------------------------  Updating vehicleType from database  ---------------------------- // 

router.patch('/vehicle/edit/:id', auth, upload.single("vehicleImage"), vehicleController.edit, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})


module.exports = router