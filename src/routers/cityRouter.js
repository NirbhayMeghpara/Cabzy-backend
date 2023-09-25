const express = require("express")
const City = require('../models/city')
const auth = require("../middleware/auth")
const cityController = require('../controller/cityController')
const multer = require('multer')

const upload = multer()

const router = new express.Router()

router.post('/city/add', upload.none(), cityController.add)

module.exports = router