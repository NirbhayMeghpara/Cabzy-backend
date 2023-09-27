const express = require("express")
const auth = require("../middleware/auth")
const cityController = require('../controller/cityController')
const multer = require('multer')

const upload = multer()

const router = new express.Router()

// ----------------------------  Adding city to database  ---------------------------- // 
router.post('/city/add', upload.none(), cityController.add)

// ---------------------  Fetching city of specific country to database  --------------------- // 
router.get('/city/fetch/:country', cityController.fetchCity)

// ----------------------------  Updating city to database  ---------------------------- // 
router.patch('/city/edit', upload.none(), cityController.edit)

module.exports = router