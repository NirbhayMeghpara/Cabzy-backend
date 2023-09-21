const express = require('express')
const auth = require('../middleware/auth')
const Country = require('../models/country')
const countryController = require('../controller/countryController')

const router = new express.Router()

router.post("/country/add", auth, countryController.add)

router.get("/country", auth, countryController.fetch)

module.exports = router