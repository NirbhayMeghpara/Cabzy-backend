const express = require("express")
const auth = require("../middleware/auth")
const vehiclePriceController = require('../controller/vehiclePriceController')
const multer = require('multer')

const upload = multer()

const router = new express.Router()

// ----------------------------  Adding city to database  ---------------------------- // 
router.post('/vehiclePrice/add', auth, upload.none(), vehiclePriceController.addPrice)

module.exports = router