const express = require("express")
const auth = require("../middleware/auth")
const createRideController = require('../controller/createRideController')
const multer = require('multer')

const router = new express.Router()
const upload = multer()

//------------------------------------ Creating ride data into database ------------------------------------ //
router.post('/ride/create', auth, upload.none(), createRideController.create)

//---------------------------------- Fetching ride from database ---------------------------------- //
router.get('/ride/fetchAll', auth, createRideController.fetchAll)

//---------------------------------- Fetching ride from database ---------------------------------- //
router.get('/ride', auth, createRideController.fetch)

//---------------------------------- Deleting ride data from database ----------------------------------//
router.delete('/ride/delete/:id', auth, createRideController.deleteRide)

//---------------------------------- ride feedback  ----------------------------------//
router.post('/ride/feedback', auth, upload.none(), createRideController.feedback)

module.exports = router
