const express = require('express')
const auth = require('../middleware/auth')
const settingController = require('../controller/settingController')
const multer = require('multer')

const router = new express.Router()

const upload = multer()

// ----------------------------  Editing setting to database  ---------------------------- // 
router.patch("/setting/edit", auth, upload.none(), auth, settingController.edit)

// ----------------------------  Fetching setting from database  ---------------------------- // 
router.get("/setting", auth, settingController.fetch)

module.exports = router