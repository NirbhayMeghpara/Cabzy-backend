const express = require("express")
const auth = require("../middleware/auth")
const vehiclePriceController = require('../controller/vehiclePriceController')
const multer = require('multer')

const upload = multer()

const router = new express.Router()

// ----------------------------  Adding city to database  ---------------------------- // 
router.post('/vehiclePrice/add', auth, upload.none(), vehiclePriceController.addPrice)

// ---------------------  Fetching all vehicle pricing of specific city from database  --------------------- // 
router.get('/vehiclePrice/fetchAll/:city', auth, vehiclePriceController.fetchAllPrice)

// ---------------------  Fetching vehicle pricing of specific city from database  --------------------- // 
router.get('/vehiclePrice/fetch/:city', auth, vehiclePriceController.fetchPrice)

// ----------------------------  Updating city to database  ---------------------------- // 
router.patch('/vehiclePrice/edit', auth, upload.none(), vehiclePriceController.editPrice)

module.exports = router