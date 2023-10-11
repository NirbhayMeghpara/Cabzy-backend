const express = require("express")
const auth = require("../middleware/auth")
const cityController = require('../controller/cityController')
const multer = require('multer')

const upload = multer()

const router = new express.Router()

// ----------------------------  Adding city to database  ---------------------------- // 
router.post('/city/add', auth, upload.none(), cityController.add)

// ---------------------  Fetching all city of specific country to database  --------------------- // 
router.get('/city/fetchAll/:country', auth, cityController.fetchAllCity)

// ---------------------  Fetching city of specific country to database  --------------------- // 
router.get('/city/fetch/:country', auth, cityController.fetchCity)

// ----------------------------  Updating city to database  ---------------------------- // 
router.patch('/city/edit', auth, upload.none(), cityController.edit)

// ----------------------------  Checking coordinate lies in zone  ---------------------------- // 
router.post('/city/check', auth, upload.none(), cityController.findCity)

module.exports = router