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
    const arr = file.originalname.split(".")
    const extension = arr[arr.length - 1]
    return cb(null, `${req.body.vehicleType}_image.${extension}`)
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

router.post('/vehicle/add', auth, upload.single("vehicleImage"), vehicleController.add, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

module.exports = router