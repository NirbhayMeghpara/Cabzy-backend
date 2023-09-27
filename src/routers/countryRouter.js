const express = require('express')
const auth = require('../middleware/auth')
const Country = require('../models/country')
const countryController = require('../controller/countryController')
const multer = require('multer')

const router = new express.Router()

const upload = multer();

// ----------------------------  Adding country to database  ---------------------------- // 

router.post("/country/add", upload.none(), auth, countryController.add)

// ----------------------------  Fetching countries from database  ---------------------------- // 

router.get("/country", auth, countryController.fetch)

module.exports = router